import { FPGA_RS422_CATALOG, resolveFpgaCommandGroupKey } from './catalog';
import type {
  BuildFpgaCommandFrameRequest,
  FpgaCommandBuildResult,
  FpgaCommandGroupDef,
  FpgaCommandParamDef,
  FpgaHeaderFieldExplanation,
  FpgaHeaderFields,
  FpgaParamExplanation,
  FpgaRs422Issue,
  FpgaRs422ModuleCatalog,
  FpgaRs422StreamFrame,
  FpgaRs422StreamSplitResult,
  FpgaTelemetryFieldExplanation,
  FpgaTelemetryParseResult,
} from './types';

export const FPGA_RS422_FRAME_HEADER = 0x1acffc1d;
export const FPGA_RS422_APPLICATION_VERSION = 0x1;
export const FPGA_RS422_COMMAND_MESSAGE_TYPE = 0x1;
export const FPGA_RS422_TELEMETRY_MESSAGE_TYPE = 0x2;

const FPGA_RS422_FRAME_HEADER_BYTES = [0x1a, 0xcf, 0xfc, 0x1d] as const;

const EMPTY_BUILD_EXPLANATIONS = {
  header: [] as readonly FpgaHeaderFieldExplanation[],
  params: [] as readonly FpgaParamExplanation[],
};

export function buildFpgaCommandFrame(request: BuildFpgaCommandFrameRequest): FpgaCommandBuildResult {
  const moduleDef = findModuleByKey(request.moduleKey);
  if (!moduleDef) {
    return invalidBuildResult([{
      code: 'fpga.catalog.unknownModule',
      message: `Unknown FPGA module: ${request.moduleKey}`,
      moduleKey: request.moduleKey,
    }]);
  }

  const resolvedGroupKey = resolveFpgaCommandGroupKey(request.moduleKey, request.groupKey);
  const group = moduleDef.commandGroups.find((item) => item.key === resolvedGroupKey);
  if (!group) {
    return invalidBuildResult([{
      code: 'fpga.catalog.unknownCommandGroup',
      message: `Unknown FPGA command group: ${request.groupKey}`,
      moduleKey: request.moduleKey,
      groupKey: request.groupKey,
    }]);
  }

  const dataWordOutcome = buildCommandDataWords(moduleDef, group, request.paramValues ?? {});
  if (dataWordOutcome.issues.length > 0) {
    return invalidBuildResult(dataWordOutcome.issues);
  }

  const appHeader = packApplicationHeader({
    version: FPGA_RS422_APPLICATION_VERSION,
    messageType: FPGA_RS422_COMMAND_MESSAGE_TYPE,
    moduleId: moduleDef.moduleId,
    groupId: group.groupId,
    count: group.params.length,
    reserved: 0,
  });
  const payloadWords = [appHeader, ...dataWordOutcome.words];
  const payloadLengthBytes = payloadWords.length * 4;
  const checksum = calculateFpgaRs422Checksum([
    FPGA_RS422_FRAME_HEADER,
    payloadLengthBytes,
    ...payloadWords,
  ]);
  const frameWords = [
    FPGA_RS422_FRAME_HEADER,
    payloadLengthBytes,
    ...payloadWords,
    checksum,
  ];

  return {
    valid: true,
    frameWords,
    payloadWords,
    bytes: wordsToBytes(frameWords),
    checksum,
    issues: [],
    explanations: {
      header: createHeaderExplanations(unpackApplicationHeader(appHeader), 'param_count'),
      params: dataWordOutcome.explanations,
    },
  };
}

export function parseFpgaTelemetryFrame(bytes: readonly number[]): FpgaTelemetryParseResult {
  const rawBytes = bytes.map(normalizeByte);
  const issues: FpgaRs422Issue[] = [];

  if (rawBytes.length < 12) {
    issues.push({
      code: 'fpga.frame.incomplete',
      message: 'RS422 frame is shorter than frame header, length, and checksum.',
    });
    return telemetryResult({ rawBytes, issues });
  }

  if (rawBytes.length % 4 !== 0) {
    issues.push({
      code: 'fpga.frame.nonAligned',
      message: 'RS422 frame byte length is not 4-byte aligned.',
    });
  }

  const allWords = bytesToWords(rawBytes);
  const frameHeader = allWords[0] ?? 0;
  const payloadLengthBytes = allWords[1] ?? 0;

  if (frameHeader !== FPGA_RS422_FRAME_HEADER) {
    issues.push({
      code: 'fpga.frame.badFrameHeader',
      message: `Unexpected RS422 frame header: ${formatWordHex(frameHeader)}`,
    });
  }

  if (payloadLengthBytes % 4 !== 0) {
    issues.push({
      code: 'fpga.frame.badPayloadLength',
      message: `Payload length is not word aligned: ${payloadLengthBytes}`,
    });
  }

  const payloadWordCount = Math.floor(payloadLengthBytes / 4);
  const expectedTotalBytes = payloadLengthBytes + 12;
  if (rawBytes.length < expectedTotalBytes) {
    issues.push({
      code: 'fpga.frame.incomplete',
      message: `RS422 frame needs ${expectedTotalBytes} bytes but only ${rawBytes.length} were provided.`,
    });
  }

  const checksumIndex = 2 + payloadWordCount;
  const frameWords = allWords.slice(0, checksumIndex + 1);
  const payloadWords = allWords.slice(2, checksumIndex);
  const checksumActual = allWords[checksumIndex] ?? 0;
  const checksumExpected = calculateFpgaRs422Checksum(allWords.slice(0, checksumIndex));

  if (rawBytes.length >= expectedTotalBytes && checksumActual !== checksumExpected) {
    issues.push({
      code: 'fpga.frame.badChecksum',
      message: `Checksum mismatch: expected ${formatWordHex(checksumExpected)}, got ${formatWordHex(checksumActual)}.`,
    });
  }

  const headerWord = payloadWords[0];
  if (headerWord === undefined) {
    issues.push({
      code: 'fpga.payload.missingHeader',
      message: 'Payload does not contain an application header word.',
    });
    return telemetryResult({
      rawBytes,
      frameWords,
      payloadWords,
      checksumExpected,
      checksumActual,
      issues,
    });
  }

  const header = unpackApplicationHeader(headerWord);
  if (header.messageType !== FPGA_RS422_TELEMETRY_MESSAGE_TYPE) {
    issues.push({
      code: 'fpga.payload.notTelemetry',
      message: `Application message type is ${header.messageType}, not telemetry.`,
    });
  }

  const telemetryWordCount = payloadWords.length - 1;
  if (header.count !== telemetryWordCount) {
    issues.push({
      code: 'fpga.payload.countMismatch',
      message: `Header telemetry count is ${header.count}, payload data word count is ${telemetryWordCount}.`,
    });
  }

  const moduleDef = FPGA_RS422_CATALOG.find((item) => item.moduleId === header.moduleId);
  if (!moduleDef) {
    issues.push({
      code: 'fpga.catalog.unknownModuleId',
      message: `Unknown FPGA module id: ${header.moduleId}`,
    });
    return telemetryResult({
      rawBytes,
      frameWords,
      payloadWords,
      checksumExpected,
      checksumActual,
      header,
      issues,
    });
  }

  const group = moduleDef.telemetryGroups.find((item) => item.groupId === header.groupId);
  if (!group) {
    issues.push({
      code: 'fpga.catalog.unknownTelemetryGroup',
      message: `Unknown telemetry group id ${formatByteHex(header.groupId)} for ${moduleDef.key}.`,
      moduleKey: moduleDef.key,
    });
    return telemetryResult({
      rawBytes,
      frameWords,
      payloadWords,
      checksumExpected,
      checksumActual,
      moduleKey: moduleDef.key,
      header,
      issues,
    });
  }

  const fields = group.fields.map<FpgaTelemetryFieldExplanation>((field) => {
    const rawWord = payloadWords[1 + field.wordIndex];
    if (rawWord === undefined) {
      issues.push({
        code: 'fpga.payload.missingTelemetryWord',
        message: `Telemetry field ${field.key} is missing payload word ${field.wordIndex}.`,
        moduleKey: moduleDef.key,
        groupKey: group.key,
      });
    }

    return {
      key: field.key,
      label: field.label,
      sourceExpression: field.sourceExpression,
      bitWidth: field.bitWidth,
      bitRange: field.bitRange,
      signed: field.signed,
      rawValue: rawWord === undefined ? undefined : extractTelemetryFieldValue(rawWord, field.bitRange, field.bitWidth, field.signed),
      wordIndex: field.wordIndex,
      ...(field.displayOptions ? { displayOptions: field.displayOptions } : {}),
    };
  });

  return telemetryResult({
    rawBytes,
    frameWords,
    payloadWords,
    checksumExpected,
    checksumActual,
    moduleKey: moduleDef.key,
    groupKey: group.key,
    header,
    fields,
    issues,
  });
}

export function splitFpgaRs422FramesFromStream(bytes: readonly number[]): FpgaRs422StreamSplitResult {
  const normalizedBytes = bytes.map(normalizeByte);
  const frames: FpgaRs422StreamFrame[] = [];
  const issues: FpgaRs422Issue[] = [];
  let cursor = 0;

  while (cursor < normalizedBytes.length) {
    const headerOffset = findFrameHeaderOffset(normalizedBytes, cursor);

    if (headerOffset < 0) {
      const suffixOffset = findHeaderCandidateSuffixOffset(normalizedBytes, cursor);
      if (suffixOffset > cursor) {
        issues.push({
          code: 'fpga.stream.discardedBytes',
          message: `Discarded ${suffixOffset - cursor} byte(s) before the next RS422 frame header.`,
        });
      }
      return {
        frames,
        remainingBytes: normalizedBytes.slice(suffixOffset),
        issues,
      };
    }

    if (headerOffset > cursor) {
      issues.push({
        code: 'fpga.stream.discardedBytes',
        message: `Discarded ${headerOffset - cursor} byte(s) before the next RS422 frame header.`,
      });
    }

    if (normalizedBytes.length - headerOffset < 8) {
      return {
        frames,
        remainingBytes: normalizedBytes.slice(headerOffset),
        issues,
      };
    }

    const payloadLengthBytes = readUint32BigEndian(normalizedBytes, headerOffset + 4);
    if (payloadLengthBytes < 4 || payloadLengthBytes % 4 !== 0) {
      issues.push({
        code: 'fpga.stream.invalidPayloadLength',
        message: `Invalid payload length ${payloadLengthBytes} at byte offset ${headerOffset}.`,
      });
      cursor = headerOffset + 1;
      continue;
    }

    const frameLengthBytes = payloadLengthBytes + 12;
    const frameEndOffset = headerOffset + frameLengthBytes;
    if (frameEndOffset > normalizedBytes.length) {
      return {
        frames,
        remainingBytes: normalizedBytes.slice(headerOffset),
        issues,
      };
    }

    frames.push({
      bytes: normalizedBytes.slice(headerOffset, frameEndOffset),
      startOffset: headerOffset,
      endOffset: frameEndOffset,
      payloadLengthBytes,
    });
    cursor = frameEndOffset;
  }

  return {
    frames,
    remainingBytes: [],
    issues,
  };
}

export function packApplicationHeader(fields: FpgaHeaderFields): number {
  return (
    ((fields.version & 0xf) << 28)
    | ((fields.messageType & 0xf) << 24)
    | ((fields.moduleId & 0xf) << 20)
    | ((fields.groupId & 0xff) << 12)
    | ((fields.count & 0xff) << 4)
    | (fields.reserved & 0xf)
  ) >>> 0;
}

export function unpackApplicationHeader(word: number): FpgaHeaderFields {
  return {
    version: (word >>> 28) & 0xf,
    messageType: (word >>> 24) & 0xf,
    moduleId: (word >>> 20) & 0xf,
    groupId: (word >>> 12) & 0xff,
    count: (word >>> 4) & 0xff,
    reserved: word & 0xf,
  };
}

export function calculateFpgaRs422Checksum(words: readonly number[]): number {
  return words.reduce((sum, word) => (sum + normalizeWord(word)) >>> 0, 0);
}

export function wordsToBytes(words: readonly number[]): number[] {
  return words.flatMap(wordToBytes);
}

export function bytesToWords(bytes: readonly number[]): number[] {
  const words: number[] = [];
  for (let index = 0; index + 3 < bytes.length; index += 4) {
    words.push(
      (
        (normalizeByte(bytes[index]!) << 24)
        | (normalizeByte(bytes[index + 1]!) << 16)
        | (normalizeByte(bytes[index + 2]!) << 8)
        | normalizeByte(bytes[index + 3]!)
      ) >>> 0,
    );
  }
  return words;
}

function readUint32BigEndian(bytes: readonly number[], offset: number): number {
  return (
    (normalizeByte(bytes[offset] ?? 0) << 24)
    | (normalizeByte(bytes[offset + 1] ?? 0) << 16)
    | (normalizeByte(bytes[offset + 2] ?? 0) << 8)
    | normalizeByte(bytes[offset + 3] ?? 0)
  ) >>> 0;
}

export function formatWordHex(word: number): string {
  return `0x${normalizeWord(word).toString(16).toUpperCase().padStart(8, '0')}`;
}

export function formatByteHex(byte: number): string {
  return `0x${normalizeByte(byte).toString(16).toUpperCase().padStart(2, '0')}`;
}

export function findModuleByKey(moduleKey: string): FpgaRs422ModuleCatalog | undefined {
  return FPGA_RS422_CATALOG.find((item) => item.key === moduleKey);
}

function buildCommandDataWords(
  moduleDef: FpgaRs422ModuleCatalog,
  group: FpgaCommandGroupDef,
  values: Readonly<Record<string, number | readonly number[]>>,
): {
  readonly words: readonly number[];
  readonly explanations: readonly FpgaParamExplanation[];
  readonly issues: readonly FpgaRs422Issue[];
} {
  const words: number[] = [];
  const explanations: FpgaParamExplanation[] = [];
  const issues: FpgaRs422Issue[] = [];

  for (const param of group.params) {
    const wordCount = getParamPayloadWordCount(param);
    if (wordCount === 0) {
      explanations.push(createParamExplanation(param));
      continue;
    }

    const normalizedValues = normalizeParamValue(param, values[param.key], wordCount);
    for (const value of normalizedValues) {
      const validationIssue = validateParamValue(moduleDef.key, group.key, param, value);
      if (validationIssue) {
        issues.push(validationIssue);
      }
    }

    for (const value of normalizedValues) {
      words.push(normalizeWord(value));
      explanations.push(createParamExplanation(param, value, words.length));
    }
  }

  return { words, explanations, issues };
}

function getParamPayloadWordCount(param: FpgaCommandParamDef): number {
  if (param.kind === 'pulse') {
    return 0;
  }
  return Math.max(param.wordCount, 1);
}

function normalizeParamValue(
  param: FpgaCommandParamDef,
  value: number | readonly number[] | undefined,
  wordCount: number,
): number[] {
  if (Array.isArray(value)) {
    return Array.from({ length: wordCount }, (_item, index) => value[index] ?? 0);
  }

  const resolvedValue = value ?? param.defaultValue ?? 0;
  return Array.from({ length: wordCount }, (_item, index) => (index === 0 ? resolvedValue : 0));
}

function validateParamValue(
  moduleKey: string,
  groupKey: string,
  param: FpgaCommandParamDef,
  value: number,
): FpgaRs422Issue | undefined {
  const effectiveBitWidth = param.finalBitWidth > 0 ? param.finalBitWidth : param.bitWidth;
  const maxValue = maxUnsignedValue(effectiveBitWidth);

  if (!Number.isInteger(value) || value < 0 || value > maxValue) {
    return {
      code: 'fpga.param.valueOutOfRange',
      message: `${param.key} must be an unsigned ${effectiveBitWidth}-bit value.`,
      moduleKey,
      groupKey,
      paramKey: param.key,
    };
  }

  return undefined;
}

function maxUnsignedValue(bitWidth: number): number {
  if (bitWidth >= 32) {
    return 0xffffffff;
  }
  if (bitWidth <= 0) {
    return 0;
  }
  return (2 ** bitWidth) - 1;
}

function extractTelemetryFieldValue(
  rawWord: number,
  bitRange: string | undefined,
  bitWidth: number,
  signed: boolean | undefined,
): number {
  const slice = parseWordBitRange(bitRange) ?? { lowBit: 0, bitWidth };
  const unsignedValue = sliceUnsignedBits(rawWord, slice.lowBit, slice.bitWidth);
  return signed ? toSignedInteger(unsignedValue, slice.bitWidth) : unsignedValue;
}

function parseWordBitRange(bitRange: string | undefined): { readonly lowBit: number; readonly bitWidth: number } | undefined {
  if (!bitRange) {
    return undefined;
  }

  const rangeMatch = /^word\[(\d+):(\d+)\]/.exec(bitRange);
  if (rangeMatch) {
    const highBit = Number(rangeMatch[1]);
    const lowBit = Number(rangeMatch[2]);
    if (Number.isInteger(highBit) && Number.isInteger(lowBit) && highBit >= lowBit) {
      return { lowBit, bitWidth: highBit - lowBit + 1 };
    }
  }

  const bitMatch = /^word\[(\d+)\]/.exec(bitRange);
  if (bitMatch) {
    const lowBit = Number(bitMatch[1]);
    if (Number.isInteger(lowBit)) {
      return { lowBit, bitWidth: 1 };
    }
  }

  return undefined;
}

function sliceUnsignedBits(rawWord: number, lowBit: number, bitWidth: number): number {
  const shifted = lowBit <= 0 ? rawWord >>> 0 : rawWord >>> lowBit;
  if (bitWidth >= 32) {
    return shifted >>> 0;
  }
  if (bitWidth <= 0) {
    return 0;
  }
  return shifted & maxUnsignedValue(bitWidth);
}

function toSignedInteger(value: number, bitWidth: number): number {
  if (bitWidth <= 0) {
    return 0;
  }
  if (bitWidth >= 32) {
    return value > 0x7fffffff ? value - 0x100000000 : value;
  }

  const signBit = 2 ** (bitWidth - 1);
  return value >= signBit ? value - (2 ** bitWidth) : value;
}

function createHeaderExplanations(
  fields: FpgaHeaderFields,
  countKey: 'param_count' | 'telemetry_word_count',
): FpgaHeaderFieldExplanation[] {
  return [
    { key: 'version', label: '应用层版本', value: fields.version, bitRange: '31:28' },
    { key: 'message_type', label: '消息类型', value: fields.messageType, bitRange: '27:24' },
    { key: 'module_id', label: '模块 ID', value: fields.moduleId, bitRange: '23:20' },
    { key: 'group_id', label: 'Group ID', value: fields.groupId, bitRange: '19:12' },
    { key: countKey, label: '计数字段', value: fields.count, bitRange: '11:4' },
    { key: 'reserved', label: '保留位', value: fields.reserved, bitRange: '3:0' },
  ];
}

function createParamExplanation(
  param: FpgaCommandParamDef,
  value?: number,
  wordIndex?: number,
): FpgaParamExplanation {
  return {
    paramKey: param.key,
    label: param.label,
    kind: param.kind,
    value,
    wordIndex,
    bitWidth: param.bitWidth,
    finalBitWidth: param.finalBitWidth,
  };
}

function wordToBytes(word: number): number[] {
  const normalized = normalizeWord(word);
  return [
    (normalized >>> 24) & 0xff,
    (normalized >>> 16) & 0xff,
    (normalized >>> 8) & 0xff,
    normalized & 0xff,
  ];
}

function findFrameHeaderOffset(bytes: readonly number[], startOffset: number): number {
  for (let offset = startOffset; offset <= bytes.length - FPGA_RS422_FRAME_HEADER_BYTES.length; offset += 1) {
    if (matchesFrameHeader(bytes, offset)) {
      return offset;
    }
  }
  return -1;
}

function matchesFrameHeader(bytes: readonly number[], offset: number): boolean {
  return FPGA_RS422_FRAME_HEADER_BYTES.every((byte, index) => bytes[offset + index] === byte);
}

function findHeaderCandidateSuffixOffset(bytes: readonly number[], startOffset: number): number {
  const maxCandidateLength = Math.min(FPGA_RS422_FRAME_HEADER_BYTES.length - 1, bytes.length - startOffset);

  for (let candidateLength = maxCandidateLength; candidateLength > 0; candidateLength -= 1) {
    const candidateOffset = bytes.length - candidateLength;
    const matchesPrefix = bytes
      .slice(candidateOffset)
      .every((byte, index) => byte === FPGA_RS422_FRAME_HEADER_BYTES[index]);

    if (matchesPrefix) {
      return candidateOffset;
    }
  }

  return bytes.length;
}

function normalizeWord(word: number): number {
  return word >>> 0;
}

function normalizeByte(byte: number): number {
  return byte & 0xff;
}

function invalidBuildResult(issues: readonly FpgaRs422Issue[]): FpgaCommandBuildResult {
  return {
    valid: false,
    frameWords: [],
    payloadWords: [],
    bytes: [],
    checksum: 0,
    issues,
    explanations: EMPTY_BUILD_EXPLANATIONS,
  };
}

function telemetryResult(input: {
  readonly rawBytes: readonly number[];
  readonly frameWords?: readonly number[];
  readonly payloadWords?: readonly number[];
  readonly checksumExpected?: number;
  readonly checksumActual?: number;
  readonly moduleKey?: string;
  readonly groupKey?: FpgaTelemetryParseResult['groupKey'];
  readonly header?: FpgaHeaderFields;
  readonly fields?: readonly FpgaTelemetryFieldExplanation[];
  readonly issues: readonly FpgaRs422Issue[];
}): FpgaTelemetryParseResult {
  return {
    valid: input.issues.length === 0,
    rawBytes: input.rawBytes,
    frameWords: input.frameWords ?? bytesToWords(input.rawBytes),
    payloadWords: input.payloadWords ?? [],
    checksumExpected: input.checksumExpected ?? 0,
    checksumActual: input.checksumActual ?? 0,
    moduleKey: input.moduleKey,
    groupKey: input.groupKey,
    header: input.header,
    fields: input.fields ?? [],
    issues: input.issues,
  };
}
