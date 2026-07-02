import type { FpgaRs422GoldenFrameDef } from './types';

const COMM_RX_COMMAND_EXECUTION_SOURCE =
  '待做任务/遥控遥测20260609v1(1)/指令与状态/遥控指令具体执行/comm_rx_block.md';

export const FPGA_RS422_20260609_GOLDEN_COMMAND_FRAMES: readonly FpgaRs422GoldenFrameDef[] = [
  {
    key: '20260609.comm_rx.map.zero',
    label: '通信接收链路 / 接收链路基础配置 / 默认全 0',
    moduleKey: 'comm_rx_block',
    groupKey: 'COMM_RX_CMD_GROUP_MAP_C',
    sourceRef: COMM_RX_COMMAND_EXECUTION_SOURCE,
    paramValues: {
      COMM_RX_PARAM_RATE_C: 0,
      COMM_RX_PARAM_DECODE_C: 0,
      COMM_RX_PARAM_DESCRAMBLE_C: 0,
      COMM_RX_PARAM_FILTER_C: 0,
      COMM_RX_PARAM_LOOP_BW_C: 0,
      COMM_RX_PARAM_TIMING_FILTER_C: 0,
      COMM_RX_PARAM_AUTO_RESET_C: 0,
      COMM_RX_PARAM_LOOP_ENABLE_C: 0,
    },
    bytes: [
      0x1a, 0xcf, 0xfc, 0x1d,
      0x00, 0x00, 0x00, 0x24,
      0x11, 0x81, 0x00, 0x80,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x2c, 0x50, 0xfc, 0xc1,
    ],
  },
  {
    key: '20260609.comm_rx.value.zero',
    label: '通信接收链路 / 接收链路门限配置 / 默认全 0',
    moduleKey: 'comm_rx_block',
    groupKey: 'COMM_RX_CMD_GROUP_VALUE_C',
    sourceRef: COMM_RX_COMMAND_EXECUTION_SOURCE,
    bytes: [
      0x1a, 0xcf, 0xfc, 0x1d,
      0x00, 0x00, 0x00, 0x10,
      0x11, 0x81, 0x10, 0x30,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x2c, 0x51, 0x0c, 0x5d,
    ],
  },
  {
    key: '20260609.comm_rx.range-reset',
    label: '通信接收链路 / 测距复位',
    moduleKey: 'comm_rx_block',
    groupKey: 'COMM_RX_CMD_GROUP_PULSE_RANGE_RST_C',
    sourceRef: COMM_RX_COMMAND_EXECUTION_SOURCE,
    bytes: [
      0x1a, 0xcf, 0xfc, 0x1d,
      0x00, 0x00, 0x00, 0x04,
      0x11, 0x81, 0x20, 0x10,
      0x2c, 0x51, 0x1c, 0x31,
    ],
  },
  {
    key: '20260609.comm_rx.count-clear',
    label: '通信接收链路 / 计数复位',
    moduleKey: 'comm_rx_block',
    groupKey: 'COMM_RX_CMD_GROUP_PULSE_COUNT_CLR_C',
    sourceRef: COMM_RX_COMMAND_EXECUTION_SOURCE,
    bytes: [
      0x1a, 0xcf, 0xfc, 0x1d,
      0x00, 0x00, 0x00, 0x04,
      0x11, 0x81, 0x30, 0x10,
      0x2c, 0x51, 0x2c, 0x31,
    ],
  },
  {
    key: '20260609.comm_rx.manual-reset',
    label: '通信接收链路 / 全体复位',
    moduleKey: 'comm_rx_block',
    groupKey: 'COMM_RX_CMD_GROUP_PULSE_MANUAL_RST_C',
    sourceRef: COMM_RX_COMMAND_EXECUTION_SOURCE,
    bytes: [
      0x1a, 0xcf, 0xfc, 0x1d,
      0x00, 0x00, 0x00, 0x04,
      0x11, 0x81, 0x40, 0x10,
      0x2c, 0x51, 0x3c, 0x31,
    ],
  },
];
