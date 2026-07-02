export type FpgaRs422ModuleId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type FpgaCommandParamKind = 'value' | 'map' | 'pulse' | 'stream';

export type FpgaTelemetryGroupKey = 'runtime' | 'cfg' | 'iq' | 'fault-runtime' | 'fault-cfg';

export type FpgaUiControlKind = 'select' | 'switch' | 'number' | 'trigger';

export interface FpgaValueOptionDef {
  readonly label: string;
  readonly value: number;
  readonly note?: string;
}

export interface FpgaTelemetryValueOptionDef {
  readonly label: string;
  readonly value: number;
  readonly note?: string;
}

export interface FpgaCommandParamDef {
  readonly key: string;
  readonly label: string;
  readonly paramId: number;
  readonly kind: FpgaCommandParamKind;
  readonly wordCount: number;
  readonly bitWidth: number;
  readonly finalBitWidth: number;
  readonly optionCount: number;
  readonly defaultValue?: number;
  readonly uiControl?: FpgaUiControlKind;
  readonly wordIndex?: number | null;
  readonly bitRange?: string;
  readonly signed?: boolean;
  readonly options?: readonly FpgaValueOptionDef[];
  readonly sourceRefs?: readonly string[];
}

export interface FpgaCommandGroupDef {
  readonly key: string;
  readonly label: string;
  readonly groupId: number;
  readonly params: readonly FpgaCommandParamDef[];
  readonly sourceRefs?: readonly string[];
}

export interface FpgaTelemetryFieldDef {
  readonly wordIndex: number;
  readonly key: string;
  readonly label: string;
  readonly sourceExpression: string;
  readonly bitWidth: number;
  readonly bitRange?: string;
  readonly signed?: boolean;
  readonly displayOptions?: readonly FpgaTelemetryValueOptionDef[];
}

export interface FpgaTelemetryGroupDef {
  readonly key: FpgaTelemetryGroupKey;
  readonly label: string;
  readonly groupId: number;
  readonly fields: readonly FpgaTelemetryFieldDef[];
}

export interface FpgaRs422ModuleCatalog {
  readonly key: string;
  readonly label: string;
  readonly moduleId: FpgaRs422ModuleId;
  readonly commandGroups: readonly FpgaCommandGroupDef[];
  readonly telemetryGroups: readonly FpgaTelemetryGroupDef[];
  readonly sourceRefs?: readonly string[];
}

export interface FpgaRs422GoldenFrameDef {
  readonly key: string;
  readonly label: string;
  readonly moduleKey: string;
  readonly groupKey: string;
  readonly sourceRef: string;
  readonly bytes: readonly number[];
  readonly paramValues?: FpgaCommandParamValues;
}

export interface FpgaHeaderFields {
  readonly version: number;
  readonly messageType: number;
  readonly moduleId: number;
  readonly groupId: number;
  readonly count: number;
  readonly reserved: number;
}

export interface FpgaHeaderFieldExplanation {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly bitRange: string;
}

export interface FpgaParamExplanation {
  readonly paramKey: string;
  readonly label: string;
  readonly kind: FpgaCommandParamKind;
  readonly value?: number;
  readonly wordIndex?: number;
  readonly bitWidth: number;
  readonly finalBitWidth: number;
}

export interface FpgaTelemetryFieldExplanation {
  readonly key: string;
  readonly label: string;
  readonly sourceExpression: string;
  readonly bitWidth: number;
  readonly bitRange?: string;
  readonly signed?: boolean;
  readonly rawValue?: number;
  readonly wordIndex: number;
  readonly displayOptions?: readonly FpgaTelemetryValueOptionDef[];
}

export interface FpgaRs422Issue {
  readonly code: string;
  readonly message: string;
  readonly moduleKey?: string;
  readonly groupKey?: string;
  readonly paramKey?: string;
}

export type FpgaCommandParamValues = Readonly<Record<string, number | readonly number[]>>;

export interface BuildFpgaCommandFrameRequest {
  readonly moduleKey: string;
  readonly groupKey: string;
  readonly paramValues?: FpgaCommandParamValues;
}

export interface FpgaCommandBuildResult {
  readonly valid: boolean;
  readonly frameWords: readonly number[];
  readonly payloadWords: readonly number[];
  readonly bytes: readonly number[];
  readonly checksum: number;
  readonly issues: readonly FpgaRs422Issue[];
  readonly explanations: {
    readonly header: readonly FpgaHeaderFieldExplanation[];
    readonly params: readonly FpgaParamExplanation[];
  };
}

export interface FpgaTelemetryParseResult {
  readonly valid: boolean;
  readonly rawBytes: readonly number[];
  readonly frameWords: readonly number[];
  readonly payloadWords: readonly number[];
  readonly checksumExpected: number;
  readonly checksumActual: number;
  readonly moduleKey?: string;
  readonly groupKey?: FpgaTelemetryGroupKey;
  readonly header?: FpgaHeaderFields;
  readonly fields: readonly FpgaTelemetryFieldExplanation[];
  readonly issues: readonly FpgaRs422Issue[];
}

export interface FpgaRs422StreamFrame {
  readonly bytes: readonly number[];
  readonly startOffset: number;
  readonly endOffset: number;
  readonly payloadLengthBytes: number;
}

export interface FpgaRs422StreamSplitResult {
  readonly frames: readonly FpgaRs422StreamFrame[];
  readonly remainingBytes: readonly number[];
  readonly issues: readonly FpgaRs422Issue[];
}
