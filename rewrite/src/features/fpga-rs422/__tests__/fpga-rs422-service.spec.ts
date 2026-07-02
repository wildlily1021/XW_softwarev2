import { describe, expect, it } from 'vitest';
import {
  createFpgaRs422Service,
  getDefaultFpgaCommandParamValues,
  listFpgaCommandGroupOptions,
  listFpgaModuleOptions,
  mapFpgaHeaderExplanationRows,
  mapFpgaTelemetryFieldRows,
  mapFpgaWordRows,
} from '../services';
import type { FpgaTelemetryParseResult, FpgaTelemetryValueOptionDef } from '../core';
import type { FpgaRs422ConnectionWriter } from '../services';

function createFakeWriter(ok = true): FpgaRs422ConnectionWriter & { writes: { connectionId: string; bytes: readonly number[] }[] } {
  const writes: { connectionId: string; bytes: readonly number[] }[] = [];
  return {
    writes,
    async write(request) {
      writes.push({ connectionId: request.connectionId, bytes: request.bytes });
      return ok
        ? { ok: true }
        : { ok: false, error: { kind: 'write-failed', message: 'writer failed' } };
    },
  };
}

describe('fpga rs422 service helpers', () => {
  it('lists module and command group options for UI selectors', () => {
    const modules = listFpgaModuleOptions();
    expect(modules).toHaveLength(9);
    expect(modules[0]).toEqual({ label: 'ADC 接收', value: 'adc_rx_block' });

    expect(listFpgaCommandGroupOptions('adc_rx_block')).toEqual([
      { label: 'ADC 校准环路配置', value: 'ADC_RX_CMD_GROUP_MAP_C' },
      { label: 'ADC 接收复位', value: 'ADC_RX_CMD_GROUP_PULSE_RESET_C' },
    ]);
    expect(listFpgaCommandGroupOptions('comm_rx_block')[0]).toEqual({
      label: '接收链路基础配置',
      value: 'COMM_RX_CMD_GROUP_MAP_C',
    });
    expect(listFpgaCommandGroupOptions('comm_tx_block')).toEqual([
      { label: '正常工作参数配置', value: 'COMM_TX_CMD_GROUP_CFG_C' },
      { label: '异常注入参数配置', value: 'COMM_TX_CMD_GROUP_FAULT_C' },
      { label: '发送复位', value: 'COMM_TX_CMD_GROUP_PULSE_RESET_C' },
      { label: '业务发送计数清零', value: 'COMM_TX_CMD_GROUP_PULSE_CLEAR_C' },
    ]);
  });

  it('provides editable default values only for params that produce payload words', () => {
    expect(getDefaultFpgaCommandParamValues('adc_rx_block', 'ADC_RX_CMD_GROUP_MAP_C')).toEqual({
      ADC_RX_PARAM_CAL_LOOP_C: 0,
    });
    expect(getDefaultFpgaCommandParamValues('adc_rx_block', 'ADC_RX_CMD_GROUP_PULSE_RESET_C')).toEqual({});
    expect(getDefaultFpgaCommandParamValues('comm_rx_block', 'COMM_RX_CMD_GROUP_MAP_C')).toEqual({
      COMM_RX_PARAM_RATE_C: 0,
      COMM_RX_PARAM_DECODE_C: 0,
      COMM_RX_PARAM_DESCRAMBLE_C: 1,
      COMM_RX_PARAM_FILTER_C: 1,
      COMM_RX_PARAM_LOOP_BW_C: 0,
      COMM_RX_PARAM_TIMING_FILTER_C: 1,
      COMM_RX_PARAM_AUTO_RESET_C: 1,
      COMM_RX_PARAM_LOOP_ENABLE_C: 0,
    });
    expect(getDefaultFpgaCommandParamValues('comm_tx_block', 'COMM_TX_CMD_GROUP_FAULT_C')).toEqual({
      COMM_TX_PARAM_BER_INJECT_C: 0,
      COMM_TX_PARAM_CRC_ERROR_C: 0,
      COMM_TX_PARAM_HEADER_ERROR_C: 0,
      COMM_TX_PARAM_DATA_TYPE_ERROR_C: 0,
      COMM_TX_PARAM_FIELD_POS_ERROR_C: 0,
      COMM_TX_PARAM_ENCODE_ERROR_C: 0,
      COMM_TX_PARAM_DATA_LINK_BREAK_C: 0,
      COMM_TX_PARAM_FRAME_FAULT_SCOPE_C: 0,
      COMM_TX_PARAM_FRAME_COUNT_ERROR_C: 0,
      COMM_TX_PARAM_ENDIAN_ERROR_C: 0,
      COMM_TX_PARAM_OPTICAL_SIGNAL_INTERRUPT_C: 0,
      COMM_TX_PARAM_FRAME_CONTENT_REPEAT_C: 0,
    });
    expect(getDefaultFpgaCommandParamValues('comm_tx_block', 'COMM_TX_CMD_GROUP_CFG_C')).toEqual({
      COMM_TX_PARAM_RATE_C: 0,
      COMM_TX_PARAM_SCRAMBLE_C: 1,
      COMM_TX_PARAM_ENCODE_C: 0,
    });
    expect(getDefaultFpgaCommandParamValues('comm_tx_block', 'COMM_TX_CMD_GROUP_MAP_C')).toEqual({
      COMM_TX_PARAM_RATE_C: 0,
      COMM_TX_PARAM_SCRAMBLE_C: 1,
      COMM_TX_PARAM_ENCODE_C: 0,
    });
  });

  it('maps words and header explanations into UI rows', () => {
    expect(mapFpgaWordRows([0x1acffc1d, 0x00000008])).toEqual([
      { key: 'word-0', label: 'Word 0', value: '0x1ACFFC1D' },
      { key: 'word-1', label: 'Word 1', value: '0x00000008' },
    ]);

    const service = createFpgaRs422Service({ writer: createFakeWriter() });
    const build = service.buildCommand({
      moduleKey: 'adc_rx_block',
      groupKey: 'ADC_RX_CMD_GROUP_MAP_C',
      paramValues: { ADC_RX_PARAM_CAL_LOOP_C: 0 },
    });

    expect(mapFpgaHeaderExplanationRows(build.explanations.header)[0]).toEqual({
      key: 'version',
      label: '应用层版本',
      value: '0x1',
      detail: '31:28',
    });
  });

  it('maps runtime telemetry field values as decimal and keeps cfg values as words', () => {
    const runtimeResult = createTelemetryResult('runtime', 0x12345678);
    const cfgResult = createTelemetryResult('cfg', 0x12345678);
    const faultRuntimeResult = createTelemetryResult('fault-runtime', 0x12345678);
    const faultCfgResult = createTelemetryResult('fault-cfg', 0x12345678);

    expect(mapFpgaTelemetryFieldRows(runtimeResult)).toEqual([
      {
        key: 'sample',
        label: 'sample field',
        value: '305419896',
        detail: 'word 1 路 32 bit',
      },
    ]);
    expect(mapFpgaTelemetryFieldRows(cfgResult)[0]?.value).toBe('0x12345678');
    expect(mapFpgaTelemetryFieldRows(faultRuntimeResult)[0]?.value).toBe('305419896');
    expect(mapFpgaTelemetryFieldRows(faultCfgResult)[0]?.value).toBe('0x12345678');
  });

  it('merges split 64-bit runtime telemetry counters into a semantic [63:0] row', () => {
    const runtimeResult: FpgaTelemetryParseResult = {
      valid: true,
      rawBytes: [],
      frameWords: [],
      payloadWords: [],
      checksumExpected: 0,
      checksumActual: 0,
      moduleKey: 'comm_rx_block',
      groupKey: 'runtime',
      fields: [
        {
          key: 'pre_total_bit_count_sec[63:32]',
          label: '译码前总比特数',
          sourceExpression: 'stat_i.pre_total_bit_count_sec[63:32]',
          bitWidth: 32,
          bitRange: 'word[31:0] / 字段[63:32]',
          rawValue: 0x00000001,
          wordIndex: 9,
        },
        {
          key: 'pre_total_bit_count_sec[31:0]',
          label: '译码前总比特数',
          sourceExpression: 'stat_i.pre_total_bit_count_sec[31:0]',
          bitWidth: 32,
          bitRange: 'word[31:0] / 字段[31:0]',
          rawValue: 0x23456789,
          wordIndex: 10,
        },
      ],
      issues: [],
    };

    expect(mapFpgaTelemetryFieldRows(runtimeResult)).toEqual([
      {
        key: 'pre_total_bit_count_sec[63:0]',
        label: '译码前总比特数',
        value: '4886718345',
        detail: 'word[63:0] / 字段[63:0]',
      },
    ]);
  });

  it('renders telemetry status and enum values with Chinese labels when display options exist', () => {
    const faultRuntimeResult: FpgaTelemetryParseResult = {
      valid: true,
      rawBytes: [],
      frameWords: [],
      payloadWords: [],
      checksumExpected: 0,
      checksumActual: 0,
      moduleKey: 'comm_tx_block',
      groupKey: 'fault-runtime',
      fields: [
        createTelemetryFieldWithOptions(
          'data_link_break_status',
          '当前星间通信数据帧停发状态',
          1,
          6,
          [
            { label: '未停发', value: 0, note: '未处于 PPS 停发窗口' },
            { label: '停发中', value: 1, note: '每 5 s 中的 1 s 停发窗口正在生效' },
          ],
        ),
        createTelemetryFieldWithOptions(
          'encode_sel_status',
          '配置编码类型状态',
          1,
          12,
          [
            { label: 'RS', value: 0 },
            { label: 'LDPC', value: 1 },
          ],
        ),
        createTelemetryFieldWithOptions(
          'unknown_status',
          '未知状态',
          7,
          13,
          [
            { label: '零态', value: 0 },
          ],
        ),
      ],
      issues: [],
    };

    expect(mapFpgaTelemetryFieldRows(faultRuntimeResult)).toEqual([
      {
        key: 'data_link_break_status',
        label: '当前星间通信数据帧停发状态',
        value: '停发中',
        detail: 'word 6 路 32 bit · 原始值 1 · 每 5 s 中的 1 s 停发窗口正在生效',
      },
      {
        key: 'encode_sel_status',
        label: '配置编码类型状态',
        value: 'LDPC',
        detail: 'word 12 路 32 bit · 原始值 1',
      },
      {
        key: 'unknown_status',
        label: '未知状态',
        value: '7',
        detail: 'word 13 路 32 bit',
      },
    ]);
  });
});

describe('fpga rs422 service send flow', () => {
  it('rejects send without a selected serial connection', async () => {
    const writer = createFakeWriter();
    const service = createFpgaRs422Service({ writer });

    const result = await service.sendCommand({
      connectionId: '',
      moduleKey: 'adc_rx_block',
      groupKey: 'ADC_RX_CMD_GROUP_MAP_C',
      paramValues: { ADC_RX_PARAM_CAL_LOOP_C: 0 },
    });

    expect(result.kind).toBe('validation-error');
    expect(result.issues).toEqual([
      expect.objectContaining({ code: 'fpga.send.missingConnection' }),
    ]);
    expect(writer.writes).toEqual([]);
  });

  it('does not write when command build validation fails', async () => {
    const writer = createFakeWriter();
    const service = createFpgaRs422Service({ writer });

    const result = await service.sendCommand({
      connectionId: 'serial-main',
      moduleKey: 'adc_rx_block',
      groupKey: 'ADC_RX_CMD_GROUP_MAP_C',
      paramValues: { ADC_RX_PARAM_CAL_LOOP_C: 2 },
    });

    expect(result.kind).toBe('validation-error');
    expect(result.issues).toEqual([
      expect.objectContaining({ code: 'fpga.param.valueOutOfRange' }),
    ]);
    expect(writer.writes).toEqual([]);
  });

  it('writes built bytes through the provided connection writer', async () => {
    const writer = createFakeWriter();
    const service = createFpgaRs422Service({ writer });

    const result = await service.sendCommand({
      connectionId: 'serial-main',
      moduleKey: 'adc_rx_block',
      groupKey: 'ADC_RX_CMD_GROUP_PULSE_RESET_C',
      paramValues: {},
    });

    expect(result.kind).toBe('sent');
    expect(result.bytesSent).toBe(16);
    expect(writer.writes).toEqual([
      {
        connectionId: 'serial-main',
        bytes: [
          0x1a, 0xcf, 0xfc, 0x1d,
          0x00, 0x00, 0x00, 0x04,
          0x11, 0x11, 0x20, 0x10,
          0x2b, 0xe1, 0x1c, 0x31,
        ],
      },
    ]);
  });
});

function createTelemetryResult(
  groupKey: FpgaTelemetryParseResult['groupKey'],
  rawValue: number,
): FpgaTelemetryParseResult {
  return {
    valid: true,
    rawBytes: [],
    frameWords: [],
    payloadWords: [],
    checksumExpected: 0,
    checksumActual: 0,
    moduleKey: 'adc_rx_block',
    groupKey,
    fields: [{
      key: 'sample',
      label: 'sample field',
      sourceExpression: 'sample',
      bitWidth: 32,
      rawValue,
      wordIndex: 1,
    }],
    issues: [],
  };
}

function createTelemetryFieldWithOptions(
  key: string,
  label: string,
  rawValue: number,
  wordIndex: number,
  displayOptions: readonly FpgaTelemetryValueOptionDef[],
): FpgaTelemetryParseResult['fields'][number] {
  return {
    key,
    label,
    sourceExpression: key,
    bitWidth: 32,
    rawValue,
    wordIndex,
    displayOptions,
  };
}
