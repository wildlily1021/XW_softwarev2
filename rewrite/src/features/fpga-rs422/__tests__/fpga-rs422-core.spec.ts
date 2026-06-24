import { describe, expect, it } from 'vitest';
import {
  FPGA_RS422_CATALOG,
  FPGA_RS422_20260609_GOLDEN_COMMAND_FRAMES,
  FPGA_RS422_APPLICATION_VERSION,
  FPGA_RS422_FRAME_HEADER,
  FPGA_RS422_TELEMETRY_MESSAGE_TYPE,
  buildFpgaCommandFrame,
  calculateFpgaRs422Checksum,
  packApplicationHeader,
  parseFpgaTelemetryFrame,
  splitFpgaRs422FramesFromStream,
  wordsToBytes,
} from '../core';
import type { FpgaHeaderFields } from '../core';

function parseHexStream(hex: string): number[] {
  return hex.trim().split(/\s+/).map((byte) => Number.parseInt(byte, 16));
}

describe('fpga rs422 core: catalog coverage', () => {
  it('represents every supplied module, command group, command param, telemetry group, and telemetry field', () => {
    expect(FPGA_RS422_CATALOG.map((moduleDef) => moduleDef.key)).toEqual([
      'adc_rx_block',
      'clock_manager_block',
      'comm_rx_block',
      'comm_tx_block',
      'cxp_yewu_block',
      'gt_tx_block',
      'laser_ctrl_block',
      'yewu_rx_block',
      'yewu_tx_block',
    ]);

    expect(FPGA_RS422_CATALOG.reduce((sum, moduleDef) => sum + moduleDef.commandGroups.length, 0)).toBe(28);
    expect(
      FPGA_RS422_CATALOG.reduce(
        (sum, moduleDef) => sum + moduleDef.commandGroups.reduce((inner, group) => inner + group.params.length, 0),
        0,
      ),
    ).toBe(51);
    expect(FPGA_RS422_CATALOG.reduce((sum, moduleDef) => sum + moduleDef.telemetryGroups.length, 0)).toBe(19);
    expect(
      FPGA_RS422_CATALOG.reduce(
        (sum, moduleDef) => sum + moduleDef.telemetryGroups.reduce((inner, group) => inner + group.fields.length, 0),
        0,
      ),
    ).toBe(140);
  });

  it('uses explicit Chinese labels and 20260609 UI metadata for comm_rx commands', () => {
    const commRx = FPGA_RS422_CATALOG.find((moduleDef) => moduleDef.key === 'comm_rx_block');
    expect(commRx).toEqual(expect.objectContaining({
      label: '通信接收链路',
      sourceRefs: expect.arrayContaining([
        expect.stringContaining('遥控指令具体执行/comm_rx_block.md'),
      ]),
    }));

    const mapGroup = commRx?.commandGroups.find((group) => group.key === 'COMM_RX_CMD_GROUP_MAP_C');
    expect(mapGroup).toEqual(expect.objectContaining({
      label: '接收链路基础配置',
      groupId: 0x10,
    }));
    expect(mapGroup?.params.map((param) => param.key)).toEqual([
      'COMM_RX_PARAM_RATE_C',
      'COMM_RX_PARAM_DECODE_C',
      'COMM_RX_PARAM_DESCRAMBLE_C',
      'COMM_RX_PARAM_FILTER_C',
      'COMM_RX_PARAM_LOOP_BW_C',
      'COMM_RX_PARAM_TIMING_FILTER_C',
      'COMM_RX_PARAM_AUTO_RESET_C',
      'COMM_RX_PARAM_LOOP_ENABLE_C',
    ]);
    expect(mapGroup?.params[0]).toEqual(expect.objectContaining({
      label: '接收链路速率选择',
      uiControl: 'select',
      bitRange: 'word[7:0]',
      defaultValue: 0,
      options: expect.arrayContaining([
        expect.objectContaining({ label: 'OOK 20M', value: 0x80, note: 'OOK 接收已接入 20M 判决链路' }),
      ]),
    }));
    expect(mapGroup?.params[1]).toEqual(expect.objectContaining({
      optionCount: 2,
      options: expect.arrayContaining([
        expect.objectContaining({
          label: 'LDPC',
          value: 1,
          note: expect.stringContaining('LDPC_DeCode_EN'),
        }),
      ]),
    }));
    expect(mapGroup?.params[7]).toEqual(expect.objectContaining({
      paramId: 0xd,
      label: '接收链路环回使能',
      uiControl: 'switch',
      wordIndex: 7,
      defaultValue: 0,
    }));

    const runtimeGroup = commRx?.telemetryGroups.find((group) => group.key === 'runtime');
    expect(runtimeGroup?.fields.at(-1)).toEqual(expect.objectContaining({
      key: 'ook_lock_state',
      label: 'OOK 判决锁定状态',
      wordIndex: 21,
      bitRange: 'word[0]',
    }));
  });
});

describe('fpga rs422 core: command frame build', () => {
  it('builds adc map command from the reference golden frame', () => {
    const result = buildFpgaCommandFrame({
      moduleKey: 'adc_rx_block',
      groupKey: 'ADC_RX_CMD_GROUP_MAP_C',
      paramValues: { ADC_RX_PARAM_CAL_LOOP_C: 0 },
    });

    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
    expect(result.payloadWords).toEqual([0x11110010, 0x00000000]);
    expect(result.bytes).toEqual([
      0x1a, 0xcf, 0xfc, 0x1d,
      0x00, 0x00, 0x00, 0x08,
      0x11, 0x11, 0x00, 0x10,
      0x00, 0x00, 0x00, 0x00,
      0x2b, 0xe0, 0xfc, 0x35,
    ]);
    expect(result.checksum).toBe(0x2be0fc35);
    expect(result.explanations.header).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'module_id', value: 0x1 }),
        expect.objectContaining({ key: 'message_type', value: 0x1 }),
        expect.objectContaining({ key: 'group_id', value: 0x10 }),
        expect.objectContaining({ key: 'param_count', value: 1 }),
      ]),
    );
    expect(result.explanations.params).toEqual([
      expect.objectContaining({
        paramKey: 'ADC_RX_PARAM_CAL_LOOP_C',
        value: 0,
        wordIndex: 1,
      }),
    ]);
  });

  it('builds adc pulse command with only the application header payload word', () => {
    const result = buildFpgaCommandFrame({
      moduleKey: 'adc_rx_block',
      groupKey: 'ADC_RX_CMD_GROUP_PULSE_RESET_C',
      paramValues: {},
    });

    expect(result.valid).toBe(true);
    expect(result.payloadWords).toEqual([0x11112010]);
    expect(result.bytes).toEqual([
      0x1a, 0xcf, 0xfc, 0x1d,
      0x00, 0x00, 0x00, 0x04,
      0x11, 0x11, 0x20, 0x10,
      0x2b, 0xe1, 0x1c, 0x31,
    ]);
    expect(result.checksum).toBe(0x2be11c31);
  });

  it('uses parameter count rather than payload data word count for multi-parameter groups', () => {
    const result = buildFpgaCommandFrame({
      moduleKey: 'clock_manager_block',
      groupKey: 'CLOCK_MANAGER_CMD_GROUP_MAP_C',
      paramValues: {
        CLOCK_MANAGER_PARAM_PPS_SRC_C: 0,
        CLOCK_MANAGER_PARAM_REF_SRC_C: 0,
      },
    });

    expect(result.valid).toBe(true);
    expect(result.payloadWords).toEqual([0x11010020, 0x00000000, 0x00000000]);
    expect(result.bytes).toEqual([
      0x1a, 0xcf, 0xfc, 0x1d,
      0x00, 0x00, 0x00, 0x0c,
      0x11, 0x01, 0x00, 0x20,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x2b, 0xd0, 0xfc, 0x49,
    ]);
    expect(result.explanations.header).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'param_count', value: 2 }),
      ]),
    );
  });

  it.each(FPGA_RS422_20260609_GOLDEN_COMMAND_FRAMES)(
    'builds 20260609 golden frame $key',
    (fixture) => {
      const result = buildFpgaCommandFrame({
        moduleKey: fixture.moduleKey,
        groupKey: fixture.groupKey,
        paramValues: fixture.paramValues,
      });

      expect(result.valid).toBe(true);
      expect(result.issues).toEqual([]);
      expect(result.bytes).toEqual(fixture.bytes);
    },
  );

  it('rejects values outside the declared parameter bit width before bytes are built', () => {
    const result = buildFpgaCommandFrame({
      moduleKey: 'adc_rx_block',
      groupKey: 'ADC_RX_CMD_GROUP_MAP_C',
      paramValues: { ADC_RX_PARAM_CAL_LOOP_C: 2 },
    });

    expect(result.valid).toBe(false);
    expect(result.bytes).toEqual([]);
    expect(result.payloadWords).toEqual([]);
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: 'fpga.param.valueOutOfRange',
        paramKey: 'ADC_RX_PARAM_CAL_LOOP_C',
      }),
    ]);
  });
});

describe('fpga rs422 core: telemetry parse', () => {
  it('parses adc runtime telemetry with checksum and field explanations', () => {
    const result = parseFpgaTelemetryFrame([
      0x1a, 0xcf, 0xfc, 0x1d,
      0x00, 0x00, 0x00, 0x20,
      0x12, 0x18, 0x00, 0x70,
      0x00, 0x00, 0x00, 0x01,
      0x00, 0x00, 0x00, 0x01,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x01,
      0x00, 0x00, 0x00, 0x1f,
      0x12, 0x34, 0x56, 0x78,
      0x3f, 0x1c, 0x53, 0x47,
    ]);

    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
    expect(result.moduleKey).toBe('adc_rx_block');
    expect(result.groupKey).toBe('runtime');
    expect(result.payloadWords).toEqual([
      0x12180070,
      0x00000001,
      0x00000001,
      0x00000000,
      0x00000000,
      0x00000001,
      0x0000001f,
      0x12345678,
    ]);
    expect(result.checksumExpected).toBe(0x3f1c5347);
    expect(result.checksumActual).toBe(0x3f1c5347);
    expect(result.fields.map((field) => field.key)).toEqual([
      'reset_status',
      'power_good_status',
      'lmx_locked_status',
      'lmk_locked_status',
      'data_valid_status',
      'board_status[4]',
      'board_status[3]',
      'board_status[2]',
      'board_status[1]',
      'board_status[0]',
      'rx_power_value',
    ]);
    expect(result.fields[10]).toEqual(
      expect.objectContaining({
        key: 'rx_power_value',
        rawValue: 0x12345678,
        wordIndex: 6,
      }),
    );
  });

  it('parses the 20260609v2 comm_rx runtime telemetry with OOK lock status', () => {
    const result = parseFpgaTelemetryFrame([
      ...parseHexStream('1A CF FC 1D 00 00 00 5C 12 88 01 60'),
      ...Array.from({ length: 22 * 4 }, () => 0),
      ...parseHexStream('2D 57 FD D9'),
    ]);

    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
    expect(result.moduleKey).toBe('comm_rx_block');
    expect(result.groupKey).toBe('runtime');
    expect(result.payloadWords).toHaveLength(23);
    expect(result.fields).toHaveLength(22);
    expect(result.checksumExpected).toBe(0x2d57fdd9);
    expect(result.checksumActual).toBe(0x2d57fdd9);
    expect(result.fields.at(-1)).toEqual(expect.objectContaining({
      key: 'ook_lock_state',
      rawValue: 0,
      wordIndex: 21,
      bitWidth: 1,
    }));
  });

  it('splits comm_tx telemetry into runtime/cfg/fault-runtime/fault-cfg groups', () => {
    const commTx = FPGA_RS422_CATALOG.find((moduleDef) => moduleDef.key === 'comm_tx_block');
    expect(commTx?.commandGroups.map((group) => group.key)).toEqual([
      'COMM_TX_CMD_GROUP_MAP_C',
      'COMM_TX_CMD_GROUP_FAULT_C',
      'COMM_TX_CMD_GROUP_PULSE_RESET_C',
      'COMM_TX_CMD_GROUP_PULSE_CLEAR_C',
    ]);
    expect(commTx?.telemetryGroups.map((group) => `${group.key}:${group.groupId}`)).toEqual([
      'runtime:128',
      'cfg:129',
      'fault-runtime:144',
      'fault-cfg:145',
    ]);
    expect(commTx?.commandGroups.find((group) => group.key === 'COMM_TX_CMD_GROUP_FAULT_C')?.params.map((param) => param.key)).toEqual([
      'COMM_TX_PARAM_BER_INJECT_C',
      'COMM_TX_PARAM_CRC_ERROR_C',
      'COMM_TX_PARAM_HEADER_ERROR_C',
      'COMM_TX_PARAM_DATA_TYPE_ERROR_C',
      'COMM_TX_PARAM_FIELD_POS_ERROR_C',
      'COMM_TX_PARAM_ENCODE_ERROR_C',
      'COMM_TX_PARAM_DATA_LINK_BREAK_C',
      'COMM_TX_PARAM_FRAME_FAULT_SCOPE_C',
      'COMM_TX_PARAM_FRAME_COUNT_ERROR_C',
      'COMM_TX_PARAM_ENDIAN_ERROR_C',
      'COMM_TX_PARAM_OPTICAL_SIGNAL_INTERRUPT_C',
    ]);
  });

  it('exposes laser_ctrl scan and unload commands plus trimmed cfg telemetry', () => {
    const laser = FPGA_RS422_CATALOG.find((moduleDef) => moduleDef.key === 'laser_ctrl_block');
    expect(laser?.commandGroups.map((group) => group.key)).toEqual([
      'LASER_CTRL_CMD_GROUP_TXM_ON_C',
      'LASER_CTRL_CMD_GROUP_LO_ON_C',
      'LASER_CTRL_CMD_GROUP_WAVE_SET_ON_C',
      'LASER_CTRL_CMD_GROUP_TEC_ON1_C',
      'LASER_CTRL_CMD_GROUP_TEC_ON2_C',
      'LASER_CTRL_CMD_GROUP_MODU_MODE_C',
      'LASER_CTRL_CMD_GROUP_VOL_AUTO_C',
      'LASER_CTRL_CMD_GROUP_FREQ_SCAN_EN_C',
      'LASER_CTRL_CMD_GROUP_FREQ_UNLOAD_EN_C',
    ]);
    expect(laser?.telemetryGroups.find((group) => group.key === 'runtime')?.fields).toHaveLength(23);
    expect(laser?.telemetryGroups.find((group) => group.key === 'cfg')?.fields.map((field) => field.key)).toEqual([
      'txm_on',
      'lo_on',
      'wave_set_on',
      'tec_on1',
      'tec_on2',
      'modu_mode',
      'vol_auto',
      'freq_scan_en',
      'freq_unload_en',
    ]);
  });

  it('parses laser runtime and cfg telemetry from the updated reference frames', () => {
    const runtime = parseFpgaTelemetryFrame(buildZeroTelemetryFrame({
      moduleId: 0x4,
      groupId: 0x80,
      count: 23,
    }));
    const cfg = parseFpgaTelemetryFrame(buildZeroTelemetryFrame({
      moduleId: 0x4,
      groupId: 0x81,
      count: 9,
    }));

    expect(runtime.valid).toBe(true);
    expect(runtime.moduleKey).toBe('laser_ctrl_block');
    expect(runtime.groupKey).toBe('runtime');
    expect(runtime.payloadWords).toHaveLength(24);
    expect(runtime.fields).toHaveLength(23);
    expect(runtime.fields.at(-1)).toEqual(expect.objectContaining({
      key: 'temp_stable_status_flags',
      wordIndex: 22,
    }));

    expect(cfg.valid).toBe(true);
    expect(cfg.moduleKey).toBe('laser_ctrl_block');
    expect(cfg.groupKey).toBe('cfg');
    expect(cfg.payloadWords).toHaveLength(10);
    expect(cfg.fields).toHaveLength(9);
    expect(cfg.fields.map((field) => field.key)).toEqual([
      'txm_on',
      'lo_on',
      'wave_set_on',
      'tec_on1',
      'tec_on2',
      'modu_mode',
      'vol_auto',
      'freq_scan_en',
      'freq_unload_en',
    ]);
    expect(cfg.fields.every((field) => field.rawValue === 0)).toBe(true);
  });

  it('parses comm_tx fault runtime and fault cfg telemetry groups from their dedicated ids', () => {
    const faultRuntime = parseFpgaTelemetryFrame(buildZeroTelemetryFrame({
      moduleId: 0x7,
      groupId: 0x90,
      count: 5,
    }));
    const faultCfg = parseFpgaTelemetryFrame(buildZeroTelemetryFrame({
      moduleId: 0x7,
      groupId: 0x91,
      count: 11,
    }));

    expect(faultRuntime.valid).toBe(true);
    expect(faultRuntime.groupKey).toBe('fault-runtime');
    expect(faultRuntime.fields.map((field) => field.key)).toEqual([
      'ber_inject_mode_status',
      'crc_error_inject_status',
      'header_error_inject_status',
      'data_type_error_inject_status',
      'field_pos_error_inject_status',
      'encode_error_inject_status',
      'encode_sel_status',
      'actual_encode_sel_status',
      'frame_fault_scope_status',
      'frame_count_error_inject_status',
      'endian_error_inject_status',
      'optical_signal_interrupt_status',
    ]);

    expect(faultCfg.valid).toBe(true);
    expect(faultCfg.groupKey).toBe('fault-cfg');
    expect(faultCfg.fields.map((field) => field.key)).toEqual([
      'ber_inject_mode',
      'crc_error_inject',
      'header_error_inject',
      'data_type_error_inject',
      'field_pos_error_inject',
      'encode_error_inject',
      'data_link_break_inject',
      'frame_fault_scope',
      'frame_count_error_inject',
      'endian_error_inject',
      'optical_signal_interrupt_inject',
    ]);
  });

  it('parses laser cfg telemetry values for scan-related fields', () => {
    const cfg = parseFpgaTelemetryFrame(buildTelemetryFrame({
      moduleId: 0x4,
      groupId: 0x81,
      words: [0, 0, 1, 0, 0, 2, 1, 1, 0],
    }));

    expect(cfg.valid).toBe(true);
    expect(cfg.moduleKey).toBe('laser_ctrl_block');
    expect(cfg.groupKey).toBe('cfg');
    expect(cfg.fields).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: 'wave_set_on', rawValue: 1, wordIndex: 2 }),
      expect.objectContaining({ key: 'modu_mode', rawValue: 2, wordIndex: 5 }),
      expect.objectContaining({ key: 'vol_auto', rawValue: 1, wordIndex: 6 }),
      expect.objectContaining({ key: 'freq_scan_en', rawValue: 1, wordIndex: 7 }),
      expect.objectContaining({ key: 'freq_unload_en', rawValue: 0, wordIndex: 8 }),
    ]));
  });

  it('keeps raw words visible for bad checksums', () => {
    const result = parseFpgaTelemetryFrame([
      0x1a, 0xcf, 0xfc, 0x1d,
      0x00, 0x00, 0x00, 0x04,
      0x12, 0x18, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
    ]);

    expect(result.valid).toBe(false);
    expect(result.payloadWords).toEqual([0x12180000]);
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'fpga.frame.badChecksum' }),
    ]));
  });

  it('reports incomplete telemetry frames without hiding raw bytes', () => {
    const result = parseFpgaTelemetryFrame([0x1a, 0xcf, 0xfc, 0x1d]);

    expect(result.valid).toBe(false);
    expect(result.rawBytes).toEqual([0x1a, 0xcf, 0xfc, 0x1d]);
    expect(result.issues).toEqual([
      expect.objectContaining({ code: 'fpga.frame.incomplete' }),
    ]);
  });

  it('reports unknown telemetry module and group while keeping payload words', () => {
    const unknownModuleHeader = packApplicationHeader({
      version: FPGA_RS422_APPLICATION_VERSION,
      messageType: FPGA_RS422_TELEMETRY_MESSAGE_TYPE,
      moduleId: 0xf,
      groupId: 0x80,
      count: 0,
      reserved: 0,
    });
    const unknownModuleWords = [
      FPGA_RS422_FRAME_HEADER,
      0x00000004,
      unknownModuleHeader,
    ];
    const unknownModule = parseFpgaTelemetryFrame(wordsToBytes([
      ...unknownModuleWords,
      calculateFpgaRs422Checksum(unknownModuleWords),
    ]));

    expect(unknownModule.valid).toBe(false);
    expect(unknownModule.payloadWords).toEqual([0x12f80000]);
    expect(unknownModule.issues).toEqual([
      expect.objectContaining({ code: 'fpga.catalog.unknownModuleId' }),
    ]);

    const unknownGroupHeader = packApplicationHeader({
      version: FPGA_RS422_APPLICATION_VERSION,
      messageType: FPGA_RS422_TELEMETRY_MESSAGE_TYPE,
      moduleId: 0x1,
      groupId: 0x99,
      count: 0,
      reserved: 0,
    });
    const unknownGroupWords = [
      FPGA_RS422_FRAME_HEADER,
      0x00000004,
      unknownGroupHeader,
    ];
    const unknownGroup = parseFpgaTelemetryFrame(wordsToBytes([
      ...unknownGroupWords,
      calculateFpgaRs422Checksum(unknownGroupWords),
    ]));

    expect(unknownGroup.valid).toBe(false);
    expect(unknownGroup.moduleKey).toBe('adc_rx_block');
    expect(unknownGroup.payloadWords).toEqual([0x12199000]);
    expect(unknownGroup.issues).toEqual([
      expect.objectContaining({ code: 'fpga.catalog.unknownTelemetryGroup' }),
    ]);
  });
});

function buildZeroTelemetryFrame(input: {
  moduleId: number;
  groupId: number;
  count: number;
}): number[] {
  return buildTelemetryFrame({
    moduleId: input.moduleId,
    groupId: input.groupId,
    words: Array.from({ length: input.count }, () => 0),
  });
}

function buildTelemetryFrame(input: {
  moduleId: number;
  groupId: number;
  words: readonly number[];
}): number[] {
  const headerFields: FpgaHeaderFields = {
    version: FPGA_RS422_APPLICATION_VERSION,
    messageType: FPGA_RS422_TELEMETRY_MESSAGE_TYPE,
    moduleId: input.moduleId,
    groupId: input.groupId,
    count: input.words.length,
    reserved: 0,
  };
  const headerWord = packApplicationHeader(headerFields);
  const payloadWords = [headerWord, ...input.words];
  const frameWords = [
    FPGA_RS422_FRAME_HEADER,
    payloadWords.length * 4,
    ...payloadWords,
  ];
  return wordsToBytes([
    ...frameWords,
    calculateFpgaRs422Checksum(frameWords),
  ]);
}

describe('fpga rs422 core: stream frame split', () => {
  it('splits a fast concatenated byte stream by frame header and payload length', () => {
    const stream = parseHexStream(`
      1A CF FC 1D 00 00 00 24 12 78 00 80 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 2D 47 FC C1
      1A CF FC 1D 00 00 00 28 12 78 10 90 00 00 00 03 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 2D 48 0C D9
      1A CF FC 1D 00 00 00 3C 12 48 00 E0 00 00 73 8B 00 00 00 70 00 00 72 E3 00 00 00 6F 00 00 6E 6B 00 00 44 60 00 00 01 CE 00 00 C3 13 00 00 75 AE 00 00 00 61 00 00 75 86 00 00 00 C5 00 00 6B DF 00 00 44 4F 2D 1B F8 BA
      1A CF FC 1D 00 00 00 58 12 48 11 50 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 01 00 00 00 00 00 00 80 00 00 00 80 00 00 00 80 00 00 00 80 00 00 00 80 00 00 00 80 00 00 00 80 00 00 00 00 00 00 00 00 00 2D 1B 8D C6
      1A CF FC 1D 00 00 00 0C 12 08 10 20 00 00 00 00 00 00 00 00 2C D8 0C 49
      1A CF FC 1D 00 00 00 1C 12 18 00 60 00 00 00 00 00 00 00 01 00 00 00 01 00 00 00 01 00 00 00 00 00 00 00 00 2C E7 FC 9C
      1A CF FC 1D 00 00 00 08 12 18 10 10 00 00 00 00 2C E8 0C 35
      1A CF FC 1D 00 00 00 0C 12 28 00 20 00 00 00 00 00 00 00 01 2C F7 FC 4A
      1A CF FC 1D 00 00 00 0C 12 38 00 20 00 00 00 00 00 00 00 00 2D 07 FC 49
      1A CF FC 1D 00 00 00 3C 12 88 00 E0 00 00 00 00 FF FB 57 E8 00 00 00 01 00 00 00 01 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 2D 53 55 23
      1A CF FC 1D 00 00 00 2C 12 88 10 A0 00 00 00 03 00 00 00 00 00 00 00 01 00 00 00 01 00 00 00 03 00 00 00 00 00 00 00 20 00 00 00 20 00 00 00 04 00 00 00 01 2D 58 0D 36
    `);

    const split = splitFpgaRs422FramesFromStream(stream);

    expect(split.remainingBytes).toEqual([]);
    expect(split.issues).toEqual([]);
    expect(split.frames.map((frame) => frame.startOffset)).toEqual([0, 48, 100, 172, 272, 296, 336, 356, 380, 404, 476]);
    expect(split.frames.map((frame) => frame.payloadLengthBytes)).toEqual([36, 40, 60, 88, 12, 28, 8, 12, 12, 60, 44]);

    const parsedFrames = split.frames.map((frame) => parseFpgaTelemetryFrame(frame.bytes));
    expect(parsedFrames).toHaveLength(11);
    expect(parsedFrames.map((frame) => frame.valid)).toEqual([
      true,
      true,
      false,
      true,
      true,
      false,
      true,
      true,
      true,
      false,
      false,
    ]);
    expect(parsedFrames.filter((frame) => !frame.valid).flatMap((frame) => frame.issues.map((issue) => issue.code))).toEqual([
      'fpga.payload.missingTelemetryWord',
      'fpga.payload.missingTelemetryWord',
      'fpga.payload.missingTelemetryWord',
      'fpga.payload.missingTelemetryWord',
      'fpga.payload.missingTelemetryWord',
      'fpga.payload.missingTelemetryWord',
      'fpga.payload.missingTelemetryWord',
      'fpga.payload.missingTelemetryWord',
      'fpga.payload.missingTelemetryWord',
      'fpga.payload.missingTelemetryWord',
      'fpga.payload.missingTelemetryWord',
      'fpga.payload.missingTelemetryWord',
      'fpga.payload.missingTelemetryWord',
      'fpga.payload.missingTelemetryWord',
      'fpga.payload.missingTelemetryWord',
      'fpga.payload.missingTelemetryWord',
      'fpga.payload.missingTelemetryWord',
      'fpga.payload.missingTelemetryWord',
      'fpga.payload.missingTelemetryWord',
    ]);
    expect(parsedFrames.map((frame) => frame.moduleKey)).toEqual([
      'comm_tx_block',
      'comm_tx_block',
      'laser_ctrl_block',
      'laser_ctrl_block',
      'clock_manager_block',
      'adc_rx_block',
      'adc_rx_block',
      'gt_tx_block',
      'cxp_yewu_block',
      'comm_rx_block',
      'comm_rx_block',
    ]);
    expect(parsedFrames.map((frame) => frame.groupKey)).toEqual([
      'runtime',
      'cfg',
      'runtime',
      'cfg',
      'cfg',
      'runtime',
      'cfg',
      'runtime',
      'runtime',
      'runtime',
      'cfg',
    ]);
  });

  it('preserves partial frames so the next data event can complete them', () => {
    const frameA = parseHexStream('1A CF FC 1D 00 00 00 08 12 18 10 10 00 00 00 00 2C E8 0C 35');
    const frameB = parseHexStream('1A CF FC 1D 00 00 00 0C 12 28 00 20 00 00 00 00 00 00 00 01 2C F7 FC 4A');
    const firstPart = frameA.slice(0, 7);
    const secondPart = [...frameA.slice(7), ...frameB];

    const firstSplit = splitFpgaRs422FramesFromStream(firstPart);
    expect(firstSplit.frames).toEqual([]);
    expect(firstSplit.remainingBytes).toEqual(firstPart);

    const secondSplit = splitFpgaRs422FramesFromStream([...firstSplit.remainingBytes, ...secondPart]);
    expect(secondSplit.remainingBytes).toEqual([]);
    expect(secondSplit.frames.map((frame) => frame.bytes.length)).toEqual([20, 24]);
  });
});
