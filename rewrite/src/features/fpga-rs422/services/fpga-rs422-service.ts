import {
  FPGA_RS422_CATALOG,
  buildFpgaCommandFrame,
  findModuleByKey,
  formatWordHex,
  type BuildFpgaCommandFrameRequest,
  type FpgaCommandBuildResult,
  type FpgaCommandParamValues,
  type FpgaRs422Issue,
  type FpgaTelemetryParseResult,
} from '../core';

export interface FpgaRs422WriteRequest {
  readonly connectionId: string;
  readonly bytes: readonly number[];
}

export interface FpgaRs422WriteOutcome {
  readonly ok: boolean;
  readonly error?: {
    readonly kind: string;
    readonly message: string;
  };
}

export interface FpgaRs422ConnectionWriter {
  write(request: FpgaRs422WriteRequest): Promise<FpgaRs422WriteOutcome>;
}

export interface SendFpgaCommandRequest extends BuildFpgaCommandFrameRequest {
  readonly connectionId?: string;
}

export type SendFpgaCommandResult =
  | {
      readonly kind: 'sent';
      readonly connectionId: string;
      readonly bytesSent: number;
      readonly build: FpgaCommandBuildResult;
      readonly timestamp: string;
    }
  | {
      readonly kind: 'validation-error';
      readonly issues: readonly FpgaRs422Issue[];
      readonly build?: FpgaCommandBuildResult;
      readonly timestamp: string;
    }
  | {
      readonly kind: 'transport-error';
      readonly connectionId: string;
      readonly build: FpgaCommandBuildResult;
      readonly error: {
        readonly kind: string;
        readonly message: string;
      };
      readonly timestamp: string;
    };

export interface FpgaRs422Service {
  buildCommand(request: BuildFpgaCommandFrameRequest): FpgaCommandBuildResult;
  sendCommand(request: SendFpgaCommandRequest): Promise<SendFpgaCommandResult>;
}

export interface CreateFpgaRs422ServiceOptions {
  readonly writer: FpgaRs422ConnectionWriter;
  readonly now?: () => string;
}

export interface FpgaSelectOption {
  readonly label: string;
  readonly value: string;
}

export interface FpgaDisplayRow {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly detail?: string;
}

const MERGED_TELEMETRY_U64_BASE_KEYS = new Set([
  'pre_total_bit_count_sec',
  'pre_dec_err_bits_sec',
  'post_total_bit_count_sec',
  'post_dec_err_bits_sec',
]);

const DECIMAL_TELEMETRY_GROUP_KEYS = new Set([
  'runtime',
  'iq',
  'fault-runtime',
]);

type TelemetryFieldBitRange = '63:32' | '31:0';

export function createFpgaRs422Service(options: CreateFpgaRs422ServiceOptions): FpgaRs422Service {
  const now = options.now ?? (() => new Date().toISOString());

  return {
    buildCommand(request) {
      return buildFpgaCommandFrame(request);
    },

    async sendCommand(request) {
      const timestamp = now();
      const connectionId = request.connectionId?.trim();
      if (!connectionId) {
        return {
          kind: 'validation-error',
          issues: [{
            code: 'fpga.send.missingConnection',
            message: 'Select a serial connection before sending an FPGA command.',
          }],
          timestamp,
        };
      }

      const build = buildFpgaCommandFrame(request);
      if (!build.valid) {
        return {
          kind: 'validation-error',
          issues: build.issues,
          build,
          timestamp,
        };
      }

      const writeOutcome = await options.writer.write({
        connectionId,
        bytes: build.bytes,
      });

      if (!writeOutcome.ok) {
        return {
          kind: 'transport-error',
          connectionId,
          build,
          error: writeOutcome.error ?? {
            kind: 'write-failed',
            message: 'Connection writer rejected the FPGA command.',
          },
          timestamp,
        };
      }

      return {
        kind: 'sent',
        connectionId,
        bytesSent: build.bytes.length,
        build,
        timestamp,
      };
    },
  };
}

export function listFpgaModuleOptions(): FpgaSelectOption[] {
  return FPGA_RS422_CATALOG.map((moduleDef) => ({
    label: moduleDef.label,
    value: moduleDef.key,
  }));
}

export function listFpgaCommandGroupOptions(moduleKey: string): FpgaSelectOption[] {
  return findModuleByKey(moduleKey)?.commandGroups.map((group) => ({
    label: group.label,
    value: group.key,
  })) ?? [];
}

export function listFpgaTelemetryGroupOptions(moduleKey: string): FpgaSelectOption[] {
  return findModuleByKey(moduleKey)?.telemetryGroups.map((group) => ({
    label: group.label,
    value: group.key,
  })) ?? [];
}

export function getDefaultFpgaCommandParamValues(
  moduleKey: string,
  groupKey: string,
): FpgaCommandParamValues {
  const moduleDef = findModuleByKey(moduleKey);
  const group = moduleDef?.commandGroups.find((item) => item.key === groupKey);
  if (!group) {
    return {};
  }

  return Object.fromEntries(
    group.params
      .filter((param) => param.kind !== 'pulse')
      .map((param) => [param.key, param.defaultValue ?? 0]),
  );
}

export function mapFpgaWordRows(words: readonly number[]): FpgaDisplayRow[] {
  return words.map((word, index) => ({
    key: `word-${index}`,
    label: `Word ${index}`,
    value: formatWordHex(word),
  }));
}

export function mapFpgaByteRows(bytes: readonly number[]): FpgaDisplayRow[] {
  return bytes.map((byte, index) => ({
    key: `byte-${index}`,
    label: `Byte ${index}`,
    value: `0x${(byte & 0xff).toString(16).toUpperCase().padStart(2, '0')}`,
  }));
}

export function mapFpgaHeaderExplanationRows(
  rows: FpgaCommandBuildResult['explanations']['header'],
): FpgaDisplayRow[] {
  return rows.map((row) => ({
    key: row.key,
    label: row.label,
    value: `0x${row.value.toString(16).toUpperCase()}`,
    detail: row.bitRange,
  }));
}

export function mapFpgaParamExplanationRows(
  rows: FpgaCommandBuildResult['explanations']['params'],
): FpgaDisplayRow[] {
  return rows.map((row) => ({
    key: row.paramKey,
    label: row.label,
    value: row.value === undefined ? 'pulse' : formatWordHex(row.value),
    detail: row.wordIndex === undefined ? row.kind : `payload word ${row.wordIndex}`,
  }));
}

export function mapFpgaTelemetryFieldRows(result: FpgaTelemetryParseResult): FpgaDisplayRow[] {
  const rows: FpgaDisplayRow[] = [];

  for (let index = 0; index < result.fields.length; index += 1) {
    const field = result.fields[index];
    if (!field) {
      continue;
    }

    const mergedRow = createMergedTelemetryFieldRow(result, field, result.fields[index + 1]);
    if (mergedRow) {
      rows.push(mergedRow);
      index += 1;
      continue;
    }

    rows.push(createTelemetryFieldRow(result, field));
  }

  return rows;
}

function formatTelemetryFieldValue(result: FpgaTelemetryParseResult, value: number, signed: boolean | undefined): string {
  if (signed) {
    return String(value);
  }

  if (result.groupKey && DECIMAL_TELEMETRY_GROUP_KEYS.has(result.groupKey)) {
    return String(value >>> 0);
  }
  return formatWordHex(value);
}

function createTelemetryFieldRow(
  result: FpgaTelemetryParseResult,
  field: FpgaTelemetryParseResult['fields'][number],
): FpgaDisplayRow {
  return {
    key: field.key,
    label: field.label,
    value: field.rawValue === undefined ? '--' : formatTelemetryFieldValue(result, field.rawValue, field.signed),
    detail: `${field.bitRange ?? `word ${field.wordIndex}`} 路 ${field.bitWidth} bit${field.signed ? ' signed' : ''}`,
  };
}

function createMergedTelemetryFieldRow(
  result: FpgaTelemetryParseResult,
  highField: FpgaTelemetryParseResult['fields'][number],
  lowField: FpgaTelemetryParseResult['fields'][number] | undefined,
): FpgaDisplayRow | null {
  if (!lowField || highField.signed || lowField.signed) {
    return null;
  }

  const highKey = parseTelemetryWideFieldKey(highField.key);
  const lowKey = parseTelemetryWideFieldKey(lowField.key);
  if (!highKey || !lowKey) {
    return null;
  }

  if (
    highKey.baseKey !== lowKey.baseKey
    || highKey.bitRange !== '63:32'
    || lowKey.bitRange !== '31:0'
    || !MERGED_TELEMETRY_U64_BASE_KEYS.has(highKey.baseKey)
    || lowField.wordIndex !== highField.wordIndex + 1
  ) {
    return null;
  }

  return {
    key: `${highKey.baseKey}[63:0]`,
    label: highField.label,
    value: formatMergedTelemetryFieldValue(result, highField.rawValue, lowField.rawValue),
    detail: 'word[63:0] / 字段[63:0]',
  };
}

function parseTelemetryWideFieldKey(
  key: string,
): { readonly baseKey: string; readonly bitRange: TelemetryFieldBitRange } | null {
  const match = /^(.*)\[(63:32|31:0)\]$/.exec(key);
  if (!match) {
    return null;
  }

  return {
    baseKey: match[1] ?? key,
    bitRange: match[2] as TelemetryFieldBitRange,
  };
}

function formatMergedTelemetryFieldValue(
  result: FpgaTelemetryParseResult,
  highWord: number | undefined,
  lowWord: number | undefined,
): string {
  if (highWord === undefined || lowWord === undefined) {
    return '--';
  }

  const mergedValue = (BigInt(highWord >>> 0) << 32n) | BigInt(lowWord >>> 0);
  if (result.groupKey && DECIMAL_TELEMETRY_GROUP_KEYS.has(result.groupKey)) {
    return mergedValue.toString(10);
  }

  return `0x${mergedValue.toString(16).toUpperCase().padStart(16, '0')}`;
}
