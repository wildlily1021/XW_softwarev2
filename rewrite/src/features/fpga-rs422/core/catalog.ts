import type {
  FpgaCommandGroupDef,
  FpgaCommandParamDef,
  FpgaCommandParamKind,
  FpgaRs422ModuleCatalog,
  FpgaRs422ModuleId,
  FpgaTelemetryFieldDef,
  FpgaTelemetryGroupDef,
  FpgaTelemetryGroupKey,
  FpgaTelemetryValueOptionDef,
  FpgaUiControlKind,
  FpgaValueOptionDef,
} from './types';

type CommandParamMetadataInput = Partial<Pick<
  FpgaCommandParamDef,
  'uiControl' | 'wordIndex' | 'bitRange' | 'signed' | 'options' | 'sourceRefs'
>>;

type TelemetryMetadataInput = Partial<Pick<
  FpgaTelemetryFieldDef,
  'signed' | 'displayOptions'
>>;

export const FPGA_RS422_REGISTRY_VERSION = '20260626v1';
export const FPGA_RS422_REGISTRY_SOURCE_ROOT = '待做任务/控制与状态系统20260626v1';

const moduleLabels: Readonly<Record<string, string>> = {
  adc_rx_block: 'ADC 接收',
  clock_manager_block: '时钟管理',
  comm_rx_block: '通信接收链路',
  comm_tx_block: '通信发送链路',
  cxp_yewu_block: 'CXP 业务接口',
  gt_tx_block: 'GT 发射',
  laser_ctrl_block: '激光控制',
  yewu_rx_block: '业务接收链路',
  yewu_tx_block: '业务发送链路',
};

const commandGroupLabels: Readonly<Record<string, string>> = {
  ADC_RX_CMD_GROUP_MAP_C: 'ADC 校准环路配置',
  ADC_RX_CMD_GROUP_PULSE_RESET_C: 'ADC 接收复位',
  CLOCK_MANAGER_CMD_GROUP_MAP_C: '时钟源配置',
  COMM_RX_CMD_GROUP_MAP_C: '接收链路基础配置',
  COMM_RX_CMD_GROUP_VALUE_C: '接收链路门限配置',
  COMM_RX_CMD_GROUP_PULSE_RANGE_RST_C: '测距复位',
  COMM_RX_CMD_GROUP_PULSE_COUNT_CLR_C: '计数复位',
  COMM_RX_CMD_GROUP_PULSE_MANUAL_RST_C: '全体复位',
  COMM_TX_CMD_GROUP_CFG_C: '正常工作参数配置',
  COMM_TX_CMD_GROUP_MAP_C: '正常工作参数配置',
  COMM_TX_CMD_GROUP_FAULT_C: '异常注入参数配置',
  COMM_TX_CMD_GROUP_PULSE_RESET_C: '发送复位',
  COMM_TX_CMD_GROUP_PULSE_CLEAR_C: '业务发送计数清零',
  CXP_CMD_GROUP_PULSE_RESET_C: '业务复位',
  GT_TX_CMD_GROUP_PULSE_RESET_C: 'GT 复位',
  LASER_CTRL_CMD_GROUP_TXM_ON_C: '发射激光器开关',
  LASER_CTRL_CMD_GROUP_LO_ON_C: '本振激光器开关',
  LASER_CTRL_CMD_GROUP_WAVE_SET_ON_C: '参数包/外部set请求',
  LASER_CTRL_CMD_GROUP_TEC_ON1_C: 'TEC1 开关',
  LASER_CTRL_CMD_GROUP_TEC_ON2_C: 'TEC2 开关',
  LASER_CTRL_CMD_GROUP_MODU_MODE_C: '调制模式',
  LASER_CTRL_CMD_GROUP_VOL_AUTO_C: '调制开始',
  LASER_CTRL_CMD_GROUP_FREQ_SCAN_EN_C: '本振扫频使能',
  LASER_CTRL_CMD_GROUP_FREQ_UNLOAD_EN_C: '本振卸载使能',
  BIZ_RX_CMD_GROUP_MAP_C: '业务接收使能配置',
  BIZ_RX_CMD_GROUP_PULSE_CLEAR_C: '业务接收计数复位',
  BIZ_RX_CMD_GROUP_PULSE_RESET_C: '业务接收复位',
  BIZ_TX_CMD_GROUP_MAP_C: '业务发送使能配置',
  BIZ_TX_CMD_GROUP_PULSE_CLEAR_C: '业务发送计数清零',
  BIZ_TX_CMD_GROUP_PULSE_RESET_C: '业务发送复位',
};

const telemetryGroupLabels: Readonly<Record<FpgaTelemetryGroupKey, string>> = {
  runtime: '运行遥测',
  cfg: '配置遥测',
  iq: 'IQ 采样遥测',
  'fault-runtime': '异常运行遥测',
  'fault-cfg': '异常配置遥测',
};

const commRxCommandSourceRefs = [
  `${FPGA_RS422_REGISTRY_SOURCE_ROOT}/UI字段定义/遥控字段定义/comm_rx_block.md`,
  `${FPGA_RS422_REGISTRY_SOURCE_ROOT}/指令与状态/遥控指令清单/comm_rx_block.md`,
  `${FPGA_RS422_REGISTRY_SOURCE_ROOT}/指令与状态/遥控指令具体执行/comm_rx_block.md`,
] as const;

const commTxCommandSourceRefs = [
  `${FPGA_RS422_REGISTRY_SOURCE_ROOT}/UI字段定义/遥控字段定义/comm_tx_block.md`,
  `${FPGA_RS422_REGISTRY_SOURCE_ROOT}/指令与状态/遥控指令清单/comm_tx_block.md`,
  `${FPGA_RS422_REGISTRY_SOURCE_ROOT}/指令与状态/遥控指令具体执行/comm_tx_block.md`,
] as const;

const laserCtrlCommandSourceRefs = [
  `${FPGA_RS422_REGISTRY_SOURCE_ROOT}/UI字段定义/遥控字段定义/laser_ctrl_block.md`,
  `${FPGA_RS422_REGISTRY_SOURCE_ROOT}/指令与状态/遥控指令清单/laser_ctrl_block.md`,
  `${FPGA_RS422_REGISTRY_SOURCE_ROOT}/指令与状态/遥控指令具体执行/laser_ctrl_block.md`,
] as const;

const commTxModuleSourceRefs = [
  `${FPGA_RS422_REGISTRY_SOURCE_ROOT}/UI字段定义/遥控字段定义/comm_tx_block.md`,
  `${FPGA_RS422_REGISTRY_SOURCE_ROOT}/UI字段定义/遥测字段定义/comm_tx_block.md`,
  `${FPGA_RS422_REGISTRY_SOURCE_ROOT}/指令与状态/遥控指令清单/comm_tx_block.md`,
  `${FPGA_RS422_REGISTRY_SOURCE_ROOT}/指令与状态/遥控指令具体执行/comm_tx_block.md`,
  `${FPGA_RS422_REGISTRY_SOURCE_ROOT}/指令与状态/遥测指令清单/comm_tx_block.md`,
  `${FPGA_RS422_REGISTRY_SOURCE_ROOT}/指令与状态/遥测状态具体执行/comm_tx_block.md`,
] as const;

const laserCtrlModuleSourceRefs = [
  `${FPGA_RS422_REGISTRY_SOURCE_ROOT}/UI字段定义/遥控字段定义/laser_ctrl_block.md`,
  `${FPGA_RS422_REGISTRY_SOURCE_ROOT}/UI字段定义/遥测字段定义/laser_ctrl_block.md`,
  `${FPGA_RS422_REGISTRY_SOURCE_ROOT}/指令与状态/遥控指令清单/laser_ctrl_block.md`,
  `${FPGA_RS422_REGISTRY_SOURCE_ROOT}/指令与状态/遥控指令具体执行/laser_ctrl_block.md`,
  `${FPGA_RS422_REGISTRY_SOURCE_ROOT}/指令与状态/遥测指令清单/laser_ctrl_block.md`,
  `${FPGA_RS422_REGISTRY_SOURCE_ROOT}/指令与状态/遥测状态具体执行/laser_ctrl_block.md`,
] as const;

const ENABLE_OPTIONS: readonly FpgaValueOptionDef[] = [
  { label: '关闭/禁用', value: 0 },
  { label: '开启/使能', value: 1 },
] as const;

const CLOCK_SOURCE_OPTIONS: readonly FpgaValueOptionDef[] = [
  { label: '内参考', value: 0 },
  { label: '外参考', value: 1 },
] as const;

const BASE_RATE_OPTIONS: readonly FpgaValueOptionDef[] = [
  { label: '312.5Mbps', value: 0x00, note: '速率选择 312.5Mbps' },
  { label: '625Mbps', value: 0x01, note: '速率选择 625Mbps' },
  { label: '1.25Gbps', value: 0x02, note: '速率选择 1.25Gbps' },
  { label: '2.5Gbps', value: 0x03, note: '速率选择 2.5Gbps' },
  { label: '5Gbps', value: 0x04, note: '速率选择 5Gbps' },
] as const;

const RX_RATE_OPTIONS: readonly FpgaValueOptionDef[] = [
  ...BASE_RATE_OPTIONS,
  { label: 'OOK 20Mbps', value: 0x80, note: 'OOK 接收已接入 20Mbps 判决链路' },
  { label: 'OOK 10Mbps', value: 0xa0, note: 'OOK 接收已接入 10Mbps 判决链路' },
  { label: 'OOK 1Mbpsk', value: 0xc0, note: 'OOK 1Mbps 速率编码预留，当前 RTL 未单独实现 1M 判决阈值' },
] as const;

const TX_RATE_OPTIONS: readonly FpgaValueOptionDef[] = [
  ...BASE_RATE_OPTIONS,
  { label: 'OOK 20Mbps', value: 0x80, note: '速率选择 OOK 20Mbps' },
  { label: 'OOK 10Mbps', value: 0xa0, note: '速率选择 OOK 10Mbps' },
  { label: 'OOK 1Mbpsk', value: 0xc0, note: '速率选择 OOK 1Mbps' },
] as const;

const RX_DECODE_OPTIONS: readonly FpgaValueOptionDef[] = [
  { label: 'RS', value: 0, note: '选择 RS 译码链路，上电默认' },
  { label: 'LDPC', value: 1, note: '选择 LDPC 译码链路；当前工程需确认 LDPC DCP/source 绑定和 LDPC_DeCode_EN 参数后才能实际生效' },
] as const;

const TX_ENCODE_OPTIONS: readonly FpgaValueOptionDef[] = [
  { label: 'RS', value: 0, note: '选择 RS 编码链路，上电默认' },
  { label: 'LDPC', value: 1, note: '选择 LDPC 编码链路；当前工程需确认 LDPC DCP/source 绑定和 LDPC_ENCODE_EN 参数后才能实际生效' },
] as const;

const LOOP_BW_OPTIONS: readonly FpgaValueOptionDef[] = [
  { label: '带宽编码 0', value: 0, note: '具体带宽值待确认' },
  { label: '带宽编码 1', value: 1, note: '具体带宽值待确认' },
  { label: '带宽编码 2', value: 2, note: '具体带宽值待确认' },
  { label: '带宽编码 3', value: 3, note: '具体带宽值待确认' },
  { label: '带宽编码 4', value: 4, note: '具体带宽值待确认' },
  { label: '带宽编码 5', value: 5, note: '具体带宽值待确认' },
  { label: '带宽编码 6', value: 6, note: '具体带宽值待确认' },
  { label: '带宽编码 7', value: 7, note: '具体带宽值待确认' },
] as const;

const COMM_TX_BER_INJECT_OPTIONS: readonly FpgaValueOptionDef[] = [
  { label: '不注入', value: 0, note: '不产生空口误码' },
  { label: '少量固定错误', value: 1, note: '每 16 帧命中 1 帧；帧内固定非连续偶数拍出错' },
  { label: '少量突发错误', value: 2, note: '每 16 帧命中 1 帧；帧内 PN 突发拍数小于 128' },
  { label: '少量连续错误', value: 3, note: '每 16 帧命中 1 帧；帧内前 100 拍连续出错' },
  { label: '大量固定错误', value: 4, note: '每 4 帧命中 3 帧；帧内固定非连续偶数拍出错' },
  { label: '大量突发错误', value: 5, note: '每 4 帧命中 3 帧；帧内 PN 突发拍数小于 128' },
  { label: '大量连续错误', value: 6, note: '每 4 帧命中 3 帧；帧内前 100 拍连续出错' },
  { label: '随机固定错误', value: 7, note: 'PN 随机命中帧；帧内固定非连续偶数拍出错' },
  { label: '随机突发错误', value: 8, note: 'PN 随机命中帧；帧内 PN 突发拍数小于 128' },
  { label: '随机连续错误', value: 9, note: 'PN 随机命中帧；帧内前 100 拍连续出错' },
] as const;

const COMM_TX_CRC_ERROR_OPTIONS: readonly FpgaValueOptionDef[] = [
  { label: '不注入', value: 0 },
  { label: 'CRC 取反', value: 1, note: '注入 CRC 取反错误' },
] as const;

const COMM_TX_HEADER_ERROR_OPTIONS: readonly FpgaValueOptionDef[] = [
  { label: '不注入', value: 0 },
  { label: '轻度 1bit', value: 1, note: '帧头轻度 1bit 错误' },
  { label: '中度 4bit', value: 2, note: '帧头中度 4bit 错误' },
  { label: '全反', value: 3, note: '帧头全反' },
  { label: '第 1/3 字节错误', value: 4, note: '帧头第 1/3 字节错误' },
  { label: '位反序', value: 5, note: '32 bit 位反序' },
] as const;

const COMM_TX_DATA_TYPE_ERROR_OPTIONS: readonly FpgaValueOptionDef[] = [
  { label: '不注入', value: 0 },
  { label: '字段交换', value: 1, note: '数据类型字段交换' },
] as const;

const COMM_TX_FIELD_POS_ERROR_OPTIONS: readonly FpgaValueOptionDef[] = [
  { label: '不注入', value: 0 },
  { label: '帧头后移', value: 1, note: '帧头插入到第二拍位置' },
] as const;

const COMM_TX_ENCODE_ERROR_OPTIONS: readonly FpgaValueOptionDef[] = [
  { label: '不注入', value: 0 },
  { label: '强制 RS', value: 1 },
  { label: '强制 LDPC', value: 2 },
  { label: '选择取反', value: 3, note: 'RS/LDPC 选择取反' },
] as const;

const COMM_TX_FRAME_FAULT_SCOPE_OPTIONS: readonly FpgaValueOptionDef[] = [
  { label: '不生效', value: 0 },
  { label: '全部帧', value: 1 },
  { label: '奇数帧', value: 2 },
  { label: '偶数帧', value: 3 },
  { label: '每 16 帧', value: 4 },
  { label: '前 16 帧', value: 5 },
] as const;

const COMM_TX_FRAME_COUNT_ERROR_OPTIONS: readonly FpgaValueOptionDef[] = [
  { label: '不注入', value: 0 },
  { label: '重复', value: 1, note: '帧计数重复' },
  { label: '跳 2 帧', value: 2, note: '帧计数跳 2 帧' },
  { label: '每 100 帧回退 1', value: 3, note: '每 100 帧回退 1' },
] as const;

const COMM_TX_ENDIAN_ERROR_OPTIONS: readonly FpgaValueOptionDef[] = [
  { label: '不注入', value: 0 },
  { label: 'GT 正序输出', value: 1, note: '取消 GT 16 bit 反序' },
  { label: '帧头位反序', value: 2, note: '仅帧头 1ACFFC1D 反序' },
  { label: '数据内容位反序', value: 3, note: '仅帧头前数据内容按 bit 反序' },
  { label: '帧头与数据位反序', value: 4, note: '帧头和数据内容同时位反序' },
] as const;

const COMM_TX_DATA_LINK_BREAK_OPTIONS: readonly FpgaValueOptionDef[] = [
  { label: '正常', value: 0 },
  { label: '星间通信数据帧时停时发', value: 1, note: '由 PPS 1 s 计时器控制，每 5 s 停发 1 s，停发窗内发送 5A5A_5A5A' },
] as const;

const COMM_TX_OPTICAL_SIGNAL_INTERRUPT_OPTIONS: readonly FpgaValueOptionDef[] = [
  { label: '正常', value: 0 },
  { label: '星间光信号中断', value: 1, note: '跨到激光控制 40 MHz 域后强制发送激光器 txm_on 选择为 0' },
] as const;

const COMM_TX_FRAME_CONTENT_REPEAT_OPTIONS: readonly FpgaValueOptionDef[] = [
  { label: '不注入', value: 0, note: '帧内容重复接口关闭' },
  { label: '预留使能', value: 1, note: '当前仅保留遥控/遥测接口，尚未接入数据路径' },
] as const;

const LASER_TXM_OPTIONS: readonly FpgaValueOptionDef[] = [
  { label: '关闭', value: 0, note: '1540.56/1563.05nm波长光 均关闭' },
  { label: '1540.56nm 开', value: 1 },
  { label: '1563.05nm 开', value: 2 },
] as const;

const LASER_LO_OPTIONS: readonly FpgaValueOptionDef[] = [
  { label: '关闭', value: 0, note: '1540.56/1563.05nm波长光 均关闭' },
  { label: '1563.05nm 开', value: 1 },
  { label: '1540.56nm 开', value: 2 },
] as const;

const LASER_WAVE_SET_OPTIONS: readonly FpgaValueOptionDef[] = [
  { label: '参数包', value: 0 },
  { label: '外部set', value: 1, note: '实际输出还受参数包恢复和 10s 温度稳定门控' },
] as const;

const LASER_MODU_MODE_OPTIONS: readonly FpgaValueOptionDef[] = [
  { label: 'OOK', value: 0 },
  { label: 'BPSK', value: 1 },
  { label: 'QPSK', value: 2 },
] as const;

const LASER_VOL_AUTO_OPTIONS: readonly FpgaValueOptionDef[] = [
  { label: '关闭/禁用', value: 0 },
  { label: '开启/使能', value: 1 },
] as const;

const BOOL_STATUS_OPTIONS: readonly FpgaTelemetryValueOptionDef[] = [
  { label: '否', value: 0 },
  { label: '是', value: 1 },
] as const;

const RESET_STATUS_OPTIONS: readonly FpgaTelemetryValueOptionDef[] = [
  { label: '空闲', value: 0, note: '未处于复位请求/忙状态' },
  { label: '复位中/已接受', value: 1, note: '复位请求已接受或复位忙' },
] as const;

const NORMAL_STATUS_OPTIONS: readonly FpgaTelemetryValueOptionDef[] = [
  { label: '异常', value: 0 },
  { label: '正常', value: 1 },
] as const;

const LOCK_STATUS_OPTIONS: readonly FpgaTelemetryValueOptionDef[] = [
  { label: '未锁定', value: 0 },
  { label: '锁定', value: 1 },
] as const;

const LOCK_LOSS_STATUS_OPTIONS: readonly FpgaTelemetryValueOptionDef[] = [
  { label: '失锁', value: 0 },
  { label: '锁定', value: 1 },
] as const;

const VALID_STATUS_OPTIONS: readonly FpgaTelemetryValueOptionDef[] = [
  { label: '无效', value: 0 },
  { label: '有效', value: 1 },
] as const;

const READY_STATUS_OPTIONS: readonly FpgaTelemetryValueOptionDef[] = [
  { label: '未就绪', value: 0 },
  { label: '就绪', value: 1 },
] as const;

const DONE_STATUS_OPTIONS: readonly FpgaTelemetryValueOptionDef[] = [
  { label: '未完成', value: 0 },
  { label: '完成', value: 1 },
] as const;

const POWER_STATUS_OPTIONS: readonly FpgaTelemetryValueOptionDef[] = [
  { label: '未上电', value: 0 },
  { label: '已上电', value: 1 },
] as const;

const ENABLE_STATUS_OPTIONS: readonly FpgaTelemetryValueOptionDef[] = [
  { label: '未使能', value: 0 },
  { label: '使能', value: 1 },
] as const;

const CLOCK_SOURCE_STATUS_OPTIONS: readonly FpgaTelemetryValueOptionDef[] = [
  { label: '内参考', value: 0 },
  { label: '外参考', value: 1 },
] as const;

const LASER_FREQ_SCAN_STATE_OPTIONS: readonly FpgaTelemetryValueOptionDef[] = [
  { label: '等待', value: 0 },
  { label: '扫频初始化', value: 1 },
  { label: '频率搜索', value: 2 },
  { label: '频率确定', value: 3 },
  { label: '扫频完成', value: 4 },
  { label: '卸载初始化', value: 5 },
  { label: '卸载跟踪', value: 6 },
  { label: '手动初始化', value: 7 },
  { label: '手动移动', value: 8 },
  { label: '手动完成', value: 9 },
] as const;

const LASER_LAST_FAULT_REASON_OPTIONS: readonly FpgaTelemetryValueOptionDef[] = [
  { label: '无故障', value: 0x00 },
  { label: '参数包基准未就绪', value: 0x01 },
  { label: '扫频完成/卸载阶段失锁', value: 0x02 },
  { label: '温度未稳定', value: 0x03 },
  { label: '非法边界预留', value: 0x04 },
  { label: '激光器选择变化', value: 0x05 },
  { label: '请求时帧同步未锁定', value: 0x06 },
] as const;


function p(
  key: string,
  label: string,
  paramId: number,
  kind: FpgaCommandParamKind,
  wordCount: number,
  bitWidth: number,
  finalBitWidth: number,
  optionCount: number,
  defaultValue?: number,
  metadata?: CommandParamMetadataInput,
): FpgaCommandParamDef {
  return defaultValue === undefined
    ? { key, label, paramId, kind, wordCount, bitWidth, finalBitWidth, optionCount, ...metadata }
    : { key, label, paramId, kind, wordCount, bitWidth, finalBitWidth, optionCount, defaultValue, ...metadata };
}

function cm(
  uiControl: FpgaUiControlKind,
  wordIndex: number | null,
  bitRange: string,
  options?: readonly FpgaValueOptionDef[],
  sourceRefs?: readonly string[],
): CommandParamMetadataInput {
  return {
    uiControl,
    wordIndex,
    bitRange,
    signed: false,
    ...(options ? { options } : {}),
    ...(sourceRefs ? { sourceRefs } : {}),
  };
}

function pulseMeta(sourceRefs?: readonly string[]): CommandParamMetadataInput {
  return cm('trigger', null, '无 payload', undefined, sourceRefs);
}

function cg(key: string, groupId: number, params: readonly FpgaCommandParamDef[]): FpgaCommandGroupDef {
  const sourceRefs = key.startsWith('COMM_RX_')
    ? commRxCommandSourceRefs
    : key.startsWith('COMM_TX_')
      ? commTxCommandSourceRefs
      : key.startsWith('LASER_CTRL_')
        ? laserCtrlCommandSourceRefs
        : undefined;
  return { key, label: commandGroupLabels[key] ?? key, groupId, params, ...(sourceRefs ? { sourceRefs } : {}) };
}

function tm(
  wordIndex: number,
  key: string,
  label: string,
  bitRange: string,
  signedOrMetadata: boolean | TelemetryMetadataInput = false,
  sourceExpression = key,
): FpgaTelemetryFieldDef {
  const metadata = typeof signedOrMetadata === 'boolean'
    ? { signed: signedOrMetadata }
    : signedOrMetadata;
  return {
    wordIndex,
    key,
    label,
    sourceExpression,
    bitWidth: inferBitWidthFromBitRange(bitRange),
    bitRange,
    signed: metadata.signed,
    ...(metadata.displayOptions ? { displayOptions: metadata.displayOptions } : {}),
  };
}

function tg(
  key: FpgaTelemetryGroupKey,
  groupId: number,
  fields: readonly FpgaTelemetryFieldDef[],
): FpgaTelemetryGroupDef {
  return {
    key,
    label: telemetryGroupLabels[key],
    groupId,
    fields,
  };
}

function m(
  key: string,
  moduleId: FpgaRs422ModuleId,
  commandGroups: readonly FpgaCommandGroupDef[],
  telemetryGroups: readonly FpgaTelemetryGroupDef[],
): FpgaRs422ModuleCatalog {
  const sourceRefs = key === 'comm_rx_block'
    ? commRxCommandSourceRefs
    : key === 'comm_tx_block'
      ? commTxModuleSourceRefs
      : key === 'laser_ctrl_block'
        ? laserCtrlModuleSourceRefs
        : undefined;
  return { key, label: moduleLabels[key] ?? key, moduleId, commandGroups, telemetryGroups, ...(sourceRefs ? { sourceRefs } : {}) };
}

export function resolveFpgaCommandGroupKey(moduleKey: string, groupKey: string): string {
  if (moduleKey === 'comm_tx_block' && groupKey === 'COMM_TX_CMD_GROUP_MAP_C') {
    return 'COMM_TX_CMD_GROUP_CFG_C';
  }
  return groupKey;
}

function inferBitWidthFromBitRange(bitRange: string): number {
  const rangeMatch = /^word\[(\d+):(\d+)\]/.exec(bitRange);
  if (rangeMatch) {
    return Number(rangeMatch[1]) - Number(rangeMatch[2]) + 1;
  }

  if (/^word\[\d+\]/.test(bitRange)) {
    return 1;
  }

  return 32;
}

export const FPGA_RS422_CATALOG: readonly FpgaRs422ModuleCatalog[] = [
  m('adc_rx_block', 1, [
    cg('ADC_RX_CMD_GROUP_MAP_C', 0x10, [
      p('ADC_RX_PARAM_CAL_LOOP_C', 'ADC 校准环路使能配置', 0, 'map', 1, 32, 1, 2, 0, cm('switch', 0, 'word[0]', ENABLE_OPTIONS)),
    ]),
    cg('ADC_RX_CMD_GROUP_PULSE_RESET_C', 0x12, [
      p('ADC_RX_PARAM_RESET_C', 'ADC复位', 1, 'pulse', 0, 0, 1, 0, undefined, pulseMeta()),
    ]),
  ], [
    tg('runtime', 0x80, [
      tm(0, 'reset_status', 'ADC 复位状态', 'word[0]', { displayOptions: RESET_STATUS_OPTIONS }, 'bool_to_u32(stat_i.reset_status)'),
      tm(1, 'power_good_status', '时钟/电源正常状态', 'word[0]', { displayOptions: NORMAL_STATUS_OPTIONS }, 'bool_to_u32(stat_i.power_good_status)'),
      tm(2, 'lmx_locked_status', 'LMX 锁定状态', 'word[0]', { displayOptions: LOCK_STATUS_OPTIONS }, 'bool_to_u32(stat_i.lmx_locked_status)'),
      tm(3, 'lmk_locked_status', 'LMK 锁定状态', 'word[0]', { displayOptions: LOCK_STATUS_OPTIONS }, 'bool_to_u32(stat_i.lmk_locked_status)'),
      tm(4, 'data_valid_status', '数据有效状态', 'word[0]', { displayOptions: VALID_STATUS_OPTIONS }, 'bool_to_u32(stat_i.data_valid_status)'),
      tm(5, 'board_status[4]', 'LMX1', 'word[0]', { displayOptions: READY_STATUS_OPTIONS }, 'bool_to_u32(stat_i.board_status[4])'),
      tm(6, 'board_status[3]', 'LMK12', 'word[0]', { displayOptions: READY_STATUS_OPTIONS }, 'bool_to_u32(stat_i.board_status[3])'),
      tm(7, 'board_status[2]', 'SPI完成', 'word[0]', { displayOptions: DONE_STATUS_OPTIONS }, 'bool_to_u32(stat_i.board_status[2])'),
      tm(8, 'board_status[1]', '采样有效', 'word[0]', { displayOptions: VALID_STATUS_OPTIONS }, 'bool_to_u32(stat_i.board_status[1])'),
      tm(9, 'board_status[0]', 'ADC上电', 'word[0]', { displayOptions: POWER_STATUS_OPTIONS }, 'bool_to_u32(stat_i.board_status[0])'),
      tm(10, 'rx_power_value', '接收功率测量值', 'word[31:0]', false, 'stat_i.rx_power_value'),
    ]),
    tg('cfg', 0x81, [
      tm(0, 'cal_loop_enable', 'ADC 校准环路使能配置', 'word[0]', { displayOptions: ENABLE_STATUS_OPTIONS }, 'bool_to_u32(cfg_i.cal_loop_enable)'),
    ]),
  ]),
  m('clock_manager_block', 0, [
    cg('CLOCK_MANAGER_CMD_GROUP_MAP_C', 0x10, [
      p('CLOCK_MANAGER_PARAM_PPS_SRC_C', 'PPS 来源选择', 0, 'value', 1, 32, 1, 2, 0, cm('select', 0, 'word[0]', CLOCK_SOURCE_OPTIONS)),
      p('CLOCK_MANAGER_PARAM_REF_SRC_C', '参考时钟来源选择', 1, 'value', 1, 32, 1, 2, 0, cm('select', 1, 'word[0]', CLOCK_SOURCE_OPTIONS)),
    ]),
  ], [
    tg('runtime', 0x80, [
      tm(0, 'clock_lock_status[2]', 'lmk100M锁定', 'word[0]', { displayOptions: LOCK_STATUS_OPTIONS }, 'bool_to_u32(stat_i.clock_lock_status[2])'),
      tm(1, 'clock_lock_status[1]', 'adc数据时钟锁定', 'word[0]', { displayOptions: LOCK_STATUS_OPTIONS }, 'bool_to_u32(stat_i.clock_lock_status[1])'),
      tm(2, 'clock_lock_status[0]', 'adc核时钟锁定', 'word[0]', { displayOptions: LOCK_STATUS_OPTIONS }, 'bool_to_u32(stat_i.clock_lock_status[0])'),
    ]),
    tg('cfg', 0x81, [
      tm(0, 'pps_source_sel', 'PPS 来源选择', 'word[0]', { displayOptions: CLOCK_SOURCE_STATUS_OPTIONS }, 'bool_to_u32(cfg_i.pps_source_sel)'),
      tm(1, 'ref_source_sel', '参考时钟来源选择', 'word[0]', { displayOptions: CLOCK_SOURCE_STATUS_OPTIONS }, 'bool_to_u32(cfg_i.ref_source_sel)'),
    ]),
  ]),
  m('comm_rx_block', 8, [
    cg('COMM_RX_CMD_GROUP_MAP_C', 0x10, [
      p('COMM_RX_PARAM_RATE_C', '接收链路速率选择', 0, 'value', 1, 32, 8, 8, 0, cm('select', 0, 'word[7:0]', RX_RATE_OPTIONS, commRxCommandSourceRefs)),
      p('COMM_RX_PARAM_DECODE_C', '解码选择，0=RS，1=LDPC', 1, 'value', 1, 32, 1, 2, 0, cm('select', 1, 'word[0]', RX_DECODE_OPTIONS, commRxCommandSourceRefs)),
      p('COMM_RX_PARAM_DESCRAMBLE_C', '接收解扰使能', 2, 'value', 1, 32, 1, 2, 1, cm('switch', 2, 'word[0]', ENABLE_OPTIONS, commRxCommandSourceRefs)),
      p('COMM_RX_PARAM_FILTER_C', '载波滤波使能', 3, 'value', 1, 32, 1, 2, 1, cm('switch', 3, 'word[0]', ENABLE_OPTIONS, commRxCommandSourceRefs)),
      p('COMM_RX_PARAM_LOOP_BW_C', '定时环路带宽选择', 4, 'value', 1, 32, 3, 8, 0, cm('select', 4, 'word[2:0]', LOOP_BW_OPTIONS, commRxCommandSourceRefs)),
      p('COMM_RX_PARAM_TIMING_FILTER_C', '定时滤波使能', 5, 'value', 1, 32, 1, 2, 1, cm('switch', 5, 'word[0]', ENABLE_OPTIONS, commRxCommandSourceRefs)),
      p('COMM_RX_PARAM_AUTO_RESET_C', '自动复位使能', 6, 'value', 1, 32, 1, 2, 1, cm('switch', 6, 'word[0]', ENABLE_OPTIONS, commRxCommandSourceRefs)),
      p('COMM_RX_PARAM_LOOP_ENABLE_C', '接收链路环回使能', 0xd, 'value', 1, 32, 1, 2, 0, cm('switch', 7, 'word[0]', ENABLE_OPTIONS, commRxCommandSourceRefs)),
    ]),
    cg('COMM_RX_CMD_GROUP_VALUE_C', 0x11, [
      p('COMM_RX_PARAM_SYNC_CORR_PEAK_TH_C', '帧同步相关峰阈值', 7, 'value', 1, 32, 7, 0, 0, cm('number', 0, 'word[6:0]', undefined, commRxCommandSourceRefs)),
      p('COMM_RX_PARAM_LOCK_TH_C', '帧锁定门限值', 8, 'value', 1, 32, 16, 0, 0, cm('number', 1, 'word[15:0]', undefined, commRxCommandSourceRefs)),
      p('COMM_RX_PARAM_UNLOCK_TH_C', '帧失锁门限值', 9, 'value', 1, 32, 16, 0, 0, cm('number', 2, 'word[15:0]', undefined, commRxCommandSourceRefs)),
    ]),
    cg('COMM_RX_CMD_GROUP_PULSE_RANGE_RST_C', 0x12, [
      p('COMM_RX_PARAM_RANGE_RESET_C', '测距复位', 0xa, 'pulse', 0, 0, 1, 0, undefined, pulseMeta(commRxCommandSourceRefs)),
    ]),
    cg('COMM_RX_CMD_GROUP_PULSE_COUNT_CLR_C', 0x13, [
      p('COMM_RX_PARAM_COUNT_CLEAR_C', '计数复位', 0xb, 'pulse', 0, 0, 1, 0, undefined, pulseMeta(commRxCommandSourceRefs)),
    ]),
    cg('COMM_RX_CMD_GROUP_PULSE_MANUAL_RST_C', 0x14, [
      p('COMM_RX_PARAM_MANUAL_RESET_C', '全体复位', 0xc, 'pulse', 0, 0, 1, 0, undefined, pulseMeta(commRxCommandSourceRefs)),
    ]),
  ], [
    tg('runtime', 0x80, [
      tm(0, 'signal_power', '接收信号功率测量值', 'word[15:0]', false, "{16'h0000, stat_i.signal_power}"),
      tm(1, 'carrier_freq_offset_est', '载波频偏粗估计值', 'word[31:0]', true, 'stat_i.carrier_freq_offset_est'),
      tm(2, 'carrier_lock_state', '载波锁定状态', 'word[0]', { displayOptions: LOCK_LOSS_STATUS_OPTIONS }, 'bool_to_u32(stat_i.carrier_lock_state)'),
      tm(3, 'symbol_lock_state', '符号锁定状态', 'word[0]', { displayOptions: LOCK_LOSS_STATUS_OPTIONS }, 'bool_to_u32(stat_i.symbol_lock_state)'),
      tm(4, 'frame_lock_state', '帧锁定状态', 'word[0]', { displayOptions: LOCK_LOSS_STATUS_OPTIONS }, 'bool_to_u32(stat_i.frame_lock_state)'),
      tm(5, 'frame_count_sec', '秒内帧总计数', 'word[31:0]', false, 'stat_i.frame_count_sec'),
      tm(6, 'error_frame_count_sec', '秒内错误帧计数', 'word[31:0]', false, 'stat_i.error_frame_count_sec'),
      tm(7, 'air_frame_count_sec', '秒内空口帧计数', 'word[31:0]', false, 'stat_i.air_frame_count_sec'),
      tm(8, 'biz_frame_count_sec', '秒内业务帧计数', 'word[31:0]', false, 'stat_i.biz_frame_count_sec'),
      tm(9, 'pre_total_bit_count_sec[63:32]', '秒内译码前总比特数', 'word[31:0] / 字段[63:32]', false, 'stat_i.pre_total_bit_count_sec[63:32]'),
      tm(10, 'pre_total_bit_count_sec[31:0]', '秒内译码前总比特数', 'word[31:0] / 字段[31:0]', false, 'stat_i.pre_total_bit_count_sec[31:0]'),
      tm(11, 'pre_dec_err_bits_sec[63:32]', '秒内译码前误比特数', 'word[31:0] / 字段[63:32]', false, 'stat_i.pre_dec_err_bits_sec[63:32]'),
      tm(12, 'pre_dec_err_bits_sec[31:0]', '秒内译码前误比特数', 'word[31:0] / 字段[31:0]', false, 'stat_i.pre_dec_err_bits_sec[31:0]'),
      tm(13, 'post_total_bit_count_sec[63:32]', '秒内译码后总比特数', 'word[31:0] / 字段[63:32]', false, 'stat_i.post_total_bit_count_sec[63:32]'),
      tm(14, 'post_total_bit_count_sec[31:0]', '秒内译码后总比特数', 'word[31:0] / 字段[31:0]', false, 'stat_i.post_total_bit_count_sec[31:0]'),
      tm(15, 'post_dec_err_bits_sec[63:32]', '秒内译码后误比特数', 'word[31:0] / 字段[63:32]', false, 'stat_i.post_dec_err_bits_sec[63:32]'),
      tm(16, 'post_dec_err_bits_sec[31:0]', '秒内译码后误比特数', 'word[31:0] / 字段[31:0]', false, 'stat_i.post_dec_err_bits_sec[31:0]'),
      tm(17, 'coarse_range_value', '粗测距值', 'word[31:0]', false, 'stat_i.coarse_range_value'),
      tm(18, 'fine_range_value', '细测距值', 'word[31:0]', false, 'stat_i.fine_range_value'),
      tm(19, 'ranging_reset_status', '测距复位接受/忙状态', 'word[0]', false, 'bool_to_u32(stat_i.ranging_reset_status)'),
      tm(20, 'manual_reset_status', '手动接收复位接受/忙状态', 'word[0]', false, 'bool_to_u32(stat_i.manual_reset_status)'),
      tm(21, 'ook_lock_state', 'OOK 判决锁定状态', 'word[0]', false, 'bool_to_u32(stat_i.ook_lock_state)'),
    ]),
    tg('cfg', 0x81, [
      tm(0, 'rate_sel', '接收链路速率选择寄存值', 'word[7:0]', false, "{24'h000000, cfg_i.rate_sel}"),
      tm(1, 'decode_sel', '解码选择，0=RS，1=LDPC', 'word[0]', false, 'bool_to_u32(cfg_i.decode_sel)'),
      tm(2, 'descramble_enable', '接收解扰使能位', 'word[0]', false, 'bool_to_u32(cfg_i.descramble_enable)'),
      tm(3, 'carrier_filter_enable', '载波滤波使能位', 'word[0]', false, 'bool_to_u32(cfg_i.carrier_filter_enable)'),
      tm(4, 'timing_loop_bw_sel', '定时环路带宽选择编码', 'word[2:0]', false, "{29'h0000_0000, cfg_i.timing_loop_bw_sel}"),
      tm(5, 'timing_filter_enable', '定时滤波使能位', 'word[0]', false, 'bool_to_u32(cfg_i.timing_filter_enable)'),
      tm(6, 'frame_sync_corr_peak_th', '帧同步相关峰阈值', 'word[6:0]', false, "{25'h0000_000, cfg_i.frame_sync_corr_peak_th}"),
      tm(7, 'frame_lock_threshold', '帧锁定门限值', 'word[15:0]', false, "{16'h0000, cfg_i.frame_lock_threshold}"),
      tm(8, 'frame_unlock_threshold', '帧失锁门限值', 'word[15:0]', false, "{16'h0000, cfg_i.frame_unlock_threshold}"),
      tm(9, 'auto_reset_enable', '自动复位使能位', 'word[0]', false, 'bool_to_u32(cfg_i.auto_reset_enable)'),
      tm(10, 'loop_enable', '接收链路环回使能位', 'word[0]', false, 'bool_to_u32(cfg_i.loop_enable)'),
    ]),
    tg('iq', 0x82, [
      tm(0, 'rx_iq_i_data[191:160]', 'I 路遥测采样组', 'word[31:0] / 字段[191:160]'),
      tm(1, 'rx_iq_i_data[159:128]', 'I 路遥测采样组', 'word[31:0] / 字段[159:128]'),
      tm(2, 'rx_iq_i_data[127:96]', 'I 路遥测采样组', 'word[31:0] / 字段[127:96]'),
      tm(3, 'rx_iq_i_data[95:64]', 'I 路遥测采样组', 'word[31:0] / 字段[95:64]'),
      tm(4, 'rx_iq_i_data[63:32]', 'I 路遥测采样组', 'word[31:0] / 字段[63:32]'),
      tm(5, 'rx_iq_i_data[31:0]', 'I 路遥测采样组', 'word[31:0] / 字段[31:0]'),
      tm(6, 'rx_iq_q_data[191:160]', 'Q 路遥测采样组', 'word[31:0] / 字段[191:160]'),
      tm(7, 'rx_iq_q_data[159:128]', 'Q 路遥测采样组', 'word[31:0] / 字段[159:128]'),
      tm(8, 'rx_iq_q_data[127:96]', 'Q 路遥测采样组', 'word[31:0] / 字段[127:96]'),
      tm(9, 'rx_iq_q_data[95:64]', 'Q 路遥测采样组', 'word[31:0] / 字段[95:64]'),
      tm(10, 'rx_iq_q_data[63:32]', 'Q 路遥测采样组', 'word[31:0] / 字段[63:32]'),
      tm(11, 'rx_iq_q_data[31:0]', 'Q 路遥测采样组', 'word[31:0] / 字段[31:0]'),
    ]),
  ]),
  m('comm_tx_block', 7, [
    cg('COMM_TX_CMD_GROUP_CFG_C', 0x10, [
      p('COMM_TX_PARAM_RATE_C', '发送速率选择', 0, 'value', 1, 32, 8, 8, 0, cm('select', 0, 'word[7:0]', TX_RATE_OPTIONS)),
      p('COMM_TX_PARAM_SCRAMBLE_C', '扰码使能', 1, 'value', 1, 32, 1, 2, 1, cm('switch', 1, 'word[0]', ENABLE_OPTIONS)),
      p('COMM_TX_PARAM_ENCODE_C', '编码类型选择', 2, 'value', 1, 32, 1, 2, 0, cm('select', 2, 'word[0]', TX_ENCODE_OPTIONS)),
    ]),
    cg('COMM_TX_CMD_GROUP_FAULT_C', 0x11, [
      p('COMM_TX_PARAM_BER_INJECT_C', '空口通信误码注入', 3, 'value', 1, 32, 4, 10, 0, cm('select', 0, 'word[3:0]', COMM_TX_BER_INJECT_OPTIONS)),
      p('COMM_TX_PARAM_CRC_ERROR_C', 'CRC 故障注入控制', 4, 'value', 1, 32, 4, 2, 0, cm('select', 1, 'word[3:0]', COMM_TX_CRC_ERROR_OPTIONS)),
      p('COMM_TX_PARAM_HEADER_ERROR_C', '帧头故障注入控制', 5, 'value', 1, 32, 4, 6, 0, cm('select', 2, 'word[3:0]', COMM_TX_HEADER_ERROR_OPTIONS)),
      p('COMM_TX_PARAM_DATA_TYPE_ERROR_C', '数据类型故障注入控制', 6, 'value', 1, 32, 4, 2, 0, cm('select', 3, 'word[3:0]', COMM_TX_DATA_TYPE_ERROR_OPTIONS)),
      p('COMM_TX_PARAM_FIELD_POS_ERROR_C', '字段位置故障注入控制', 7, 'value', 1, 32, 4, 2, 0, cm('select', 4, 'word[3:0]', COMM_TX_FIELD_POS_ERROR_OPTIONS)),
      p('COMM_TX_PARAM_ENCODE_ERROR_C', '编码故障注入控制', 8, 'value', 1, 32, 4, 4, 0, cm('select', 5, 'word[3:0]', COMM_TX_ENCODE_ERROR_OPTIONS)),
      p('COMM_TX_PARAM_DATA_LINK_BREAK_C', '星间通信数据帧停发检测', 9, 'value', 1, 32, 1, 2, 0, cm('switch', 6, 'word[0]', COMM_TX_DATA_LINK_BREAK_OPTIONS)),
      p('COMM_TX_PARAM_FRAME_FAULT_SCOPE_C', '帧类故障生效范围', 10, 'value', 1, 32, 4, 6, 0, cm('select', 7, 'word[3:0]', COMM_TX_FRAME_FAULT_SCOPE_OPTIONS)),
      p('COMM_TX_PARAM_FRAME_COUNT_ERROR_C', '帧计数故障注入控制', 11, 'value', 1, 32, 4, 4, 0, cm('select', 8, 'word[3:0]', COMM_TX_FRAME_COUNT_ERROR_OPTIONS)),
      p('COMM_TX_PARAM_ENDIAN_ERROR_C', '数据域大小端错误', 12, 'value', 1, 32, 4, 5, 0, cm('select', 9, 'word[3:0]', COMM_TX_ENDIAN_ERROR_OPTIONS)),
      p('COMM_TX_PARAM_OPTICAL_SIGNAL_INTERRUPT_C', '星间光信号中断', 13, 'value', 1, 32, 1, 2, 0, cm('switch', 10, 'word[0]', COMM_TX_OPTICAL_SIGNAL_INTERRUPT_OPTIONS)),
      p('COMM_TX_PARAM_FRAME_CONTENT_REPEAT_C', '帧内容重复', 16, 'value', 1, 32, 4, 2, 0, cm('select', 11, 'word[3:0]', COMM_TX_FRAME_CONTENT_REPEAT_OPTIONS)),
    ]),
    cg('COMM_TX_CMD_GROUP_PULSE_RESET_C', 0x12, [
      p('COMM_TX_PARAM_RESET_C', '发送复位', 14, 'pulse', 0, 0, 1, 0, undefined, pulseMeta()),
    ]),
    cg('COMM_TX_CMD_GROUP_PULSE_CLEAR_C', 0x13, [
      p('COMM_TX_PARAM_COUNT_CLEAR_C', '业务发送计数清零', 15, 'pulse', 0, 0, 1, 0, undefined, pulseMeta()),
    ]),
  ], [
    tg('runtime', 0x80, [
      tm(0, 'idle_frame_count_sec', '空闲帧每秒计数', 'word[31:0]', false, 'stat_i.idle_frame_count_sec'),
      tm(1, 'biz_frame_count_sec', '业务帧每秒计数', 'word[31:0]', false, 'stat_i.biz_frame_count_sec'),
      tm(2, 'biz_frame_count_total', '业务帧累计计数', 'word[31:0]', false, 'stat_i.biz_frame_count_total'),
      tm(3, 'reset_status', '复位状态', 'word[0]', false, 'bool_to_u32(stat_i.reset_status)'),
    ]),
    tg('cfg', 0x81, [
      tm(0, 'rate_sel', '发送速率选择', 'word[7:0]', { displayOptions: TX_RATE_OPTIONS }, "{24'h000000, cfg_i.rate_sel}"),
      tm(1, 'scramble_enable', '扰码使能', 'word[0]', { displayOptions: ENABLE_STATUS_OPTIONS }, 'bool_to_u32(cfg_i.scramble_enable)'),
      tm(2, 'encode_sel', '编码类型选择', 'word[0]', { displayOptions: TX_ENCODE_OPTIONS }, 'bool_to_u32(cfg_i.encode_sel)'),
    ]),
    tg('fault-runtime', 0x90, [
      tm(0, 'ber_inject_mode_status', '当前空口通信误码注入状态', 'word[3:0]', { displayOptions: COMM_TX_BER_INJECT_OPTIONS }, "{28'h0000_000, stat_i.ber_inject_mode_status}"),
      tm(1, 'crc_error_inject_status', '当前 CRC 故障注入状态', 'word[3:0]', { displayOptions: COMM_TX_CRC_ERROR_OPTIONS }, "{28'h0000_000, stat_i.crc_error_inject_status}"),
      tm(2, 'header_error_inject_status', '当前帧头故障注入状态', 'word[3:0]', { displayOptions: COMM_TX_HEADER_ERROR_OPTIONS }, "{28'h0000_000, stat_i.header_error_inject_status}"),
      tm(3, 'data_type_error_inject_status', '当前数据类型故障注入状态', 'word[3:0]', { displayOptions: COMM_TX_DATA_TYPE_ERROR_OPTIONS }, "{28'h0000_000, stat_i.data_type_error_inject_status}"),
      tm(4, 'field_pos_error_inject_status', '当前字段位置故障注入状态', 'word[3:0]', { displayOptions: COMM_TX_FIELD_POS_ERROR_OPTIONS }, "{28'h0000_000, stat_i.field_pos_error_inject_status}"),
      tm(5, 'encode_error_inject_status', '当前编码故障注入状态', 'word[3:0]', { displayOptions: COMM_TX_ENCODE_ERROR_OPTIONS }, "{28'h0000_000, stat_i.encode_error_inject_status}"),
      tm(6, 'data_link_break_status', '当前星间通信数据帧停发状态', 'word[0]', { displayOptions: [{ label: '未停发', value: 0, note: '未处于 PPS 停发窗口' }, { label: '停发中', value: 1, note: '每 5 s 中的 1 s 停发窗口正在生效' }] }, 'bool_to_u32(stat_i.data_link_break_status)'),
      tm(7, 'frame_fault_scope_status', '当前帧类故障生效范围状态', 'word[3:0]', { displayOptions: COMM_TX_FRAME_FAULT_SCOPE_OPTIONS }, "{28'h0000_000, stat_i.frame_fault_scope_status}"),
      tm(8, 'frame_count_error_inject_status', '当前帧计数故障注入状态', 'word[3:0]', { displayOptions: COMM_TX_FRAME_COUNT_ERROR_OPTIONS }, "{28'h0000_000, stat_i.frame_count_error_inject_status}"),
      tm(9, 'endian_error_inject_status', '当前字节序故障注入状态', 'word[3:0]', { displayOptions: COMM_TX_ENDIAN_ERROR_OPTIONS }, "{28'h0000_000, stat_i.endian_error_inject_status}"),
      tm(10, 'optical_signal_interrupt_status', '当前星间光信号中断状态', 'word[0]', { displayOptions: COMM_TX_OPTICAL_SIGNAL_INTERRUPT_OPTIONS }, 'bool_to_u32(stat_i.optical_signal_interrupt_status)'),
      tm(11, 'frame_content_repeat_status', '当前帧内容重复状态', 'word[3:0]', { displayOptions: [{ label: '未启用', value: 0, note: '帧内容重复接口未启用' }, { label: '预留/镜像', value: 1, note: '当前仅镜像遥控配置字' }] }, "{28'h0000_000, stat_i.frame_content_repeat_status}"),
      tm(12, 'encode_sel_status', '配置编码类型状态', 'word[3:0]', { displayOptions: TX_ENCODE_OPTIONS }, "{28'h0000_000, stat_i.encode_sel_status}"),
      tm(13, 'actual_encode_sel_status', '实际编码类型状态', 'word[3:0]', { displayOptions: TX_ENCODE_OPTIONS }, "{28'h0000_000, stat_i.actual_encode_sel_status}"),
    ]),
    tg('fault-cfg', 0x91, [
      tm(0, 'ber_inject_mode', '空口通信误码注入', 'word[3:0]', { displayOptions: COMM_TX_BER_INJECT_OPTIONS }, "{28'h0000_000, cfg_i.ber_inject_mode}"),
      tm(1, 'crc_error_inject', 'CRC 故障注入控制', 'word[3:0]', { displayOptions: COMM_TX_CRC_ERROR_OPTIONS }, "{28'h0000_000, cfg_i.crc_error_inject}"),
      tm(2, 'header_error_inject', '帧头故障注入控制', 'word[3:0]', { displayOptions: COMM_TX_HEADER_ERROR_OPTIONS }, "{28'h0000_000, cfg_i.header_error_inject}"),
      tm(3, 'data_type_error_inject', '数据类型故障注入控制', 'word[3:0]', { displayOptions: COMM_TX_DATA_TYPE_ERROR_OPTIONS }, "{28'h0000_000, cfg_i.data_type_error_inject}"),
      tm(4, 'field_pos_error_inject', '字段位置故障注入控制', 'word[3:0]', { displayOptions: COMM_TX_FIELD_POS_ERROR_OPTIONS }, "{28'h0000_000, cfg_i.field_pos_error_inject}"),
      tm(5, 'encode_error_inject', '编码故障注入控制', 'word[3:0]', { displayOptions: COMM_TX_ENCODE_ERROR_OPTIONS }, "{28'h0000_000, cfg_i.encode_error_inject}"),
      tm(6, 'data_link_break_inject', '星间通信数据帧停发检测', 'word[0]', { displayOptions: COMM_TX_DATA_LINK_BREAK_OPTIONS }, 'bool_to_u32(cfg_i.data_link_break_inject)'),
      tm(7, 'frame_fault_scope', '帧类故障生效范围', 'word[3:0]', { displayOptions: COMM_TX_FRAME_FAULT_SCOPE_OPTIONS }, "{28'h0000_000, cfg_i.frame_fault_scope}"),
      tm(8, 'frame_count_error_inject', '帧计数故障注入控制', 'word[3:0]', { displayOptions: COMM_TX_FRAME_COUNT_ERROR_OPTIONS }, "{28'h0000_000, cfg_i.frame_count_error_inject}"),
      tm(9, 'endian_error_inject', '数据域大小端错误', 'word[3:0]', { displayOptions: COMM_TX_ENDIAN_ERROR_OPTIONS }, "{28'h0000_000, cfg_i.endian_error_inject}"),
      tm(10, 'optical_signal_interrupt_inject', '星间光信号中断检测', 'word[0]', { displayOptions: COMM_TX_OPTICAL_SIGNAL_INTERRUPT_OPTIONS }, 'bool_to_u32(cfg_i.optical_signal_interrupt_inject)'),
      tm(11, 'frame_content_repeat_inject', '帧内容重复配置', 'word[3:0]', { displayOptions: [{ label: '未启用', value: 0, note: '帧内容重复接口未启用' }, { label: '预留/镜像', value: 1, note: '当前仅保留遥控/遥测接口，尚未接入数据路径' }] }, "{28'h0000_000, cfg_i.frame_content_repeat_inject}"),
    ]),
  ]),
  m('cxp_yewu_block', 3, [
    cg('CXP_CMD_GROUP_PULSE_RESET_C', 0x12, [
      p('CXP_PARAM_RESET_C', '业务复位', 0, 'pulse', 0, 0, 1, 0, undefined, pulseMeta()),
    ]),
  ], [
    tg('runtime', 0x80, [
      tm(0, 'reset_status', 'reset_status：复位状态', 'word[0]', false, 'bool_to_u32(stat_i.reset_status)'),
      tm(1, 'handshake_status', 'handshake_status：握手状态', 'word[0]', false, 'bool_to_u32(stat_i.handshake_status)'),
    ]),
  ]),
  m('gt_tx_block', 2, [
    cg('GT_TX_CMD_GROUP_PULSE_RESET_C', 0x12, [
      p('GT_TX_PARAM_RESET_C', 'gt复位', 0, 'pulse', 0, 0, 1, 0, undefined, pulseMeta()),
    ]),
  ], [
    tg('runtime', 0x80, [
      tm(0, 'reset_status', 'GT 复位状态', 'word[0]', false, 'bool_to_u32(stat_i.reset_status)'),
      tm(1, 'power_good_status', 'GT 电源/时钟正常状态', 'word[0]', false, 'bool_to_u32(stat_i.power_good_status)'),
    ]),
  ]),
  m('laser_ctrl_block', 4, [
    cg('LASER_CTRL_CMD_GROUP_TXM_ON_C', 0x10, [
      p('LASER_PARAM_TXM_ON_C', '发射激光器开关', 0, 'value', 1, 32, 2, 3, 0, cm('select', 0, 'word[1:0]', LASER_TXM_OPTIONS)),
    ]),
    cg('LASER_CTRL_CMD_GROUP_LO_ON_C', 0x11, [
      p('LASER_PARAM_LO_ON_C', '本振激光器开关', 1, 'value', 1, 32, 2, 3, 0, cm('select', 0, 'word[1:0]', LASER_LO_OPTIONS)),
    ]),
    cg('LASER_CTRL_CMD_GROUP_WAVE_SET_ON_C', 0x12, [
      p('LASER_PARAM_WAVE_SET_ON_C', '参数包/外部set请求', 2, 'value', 1, 32, 1, 2, 0, cm('select', 0, 'word[0]', LASER_WAVE_SET_OPTIONS)),
    ]),
    cg('LASER_CTRL_CMD_GROUP_TEC_ON1_C', 0x13, [
      p('LASER_PARAM_TEC_ON1_C', 'TEC1 开关', 3, 'value', 1, 32, 1, 2, 0, cm('switch', 0, 'word[0]', ENABLE_OPTIONS)),
    ]),
    cg('LASER_CTRL_CMD_GROUP_TEC_ON2_C', 0x14, [
      p('LASER_PARAM_TEC_ON2_C', 'TEC2 开关', 4, 'value', 1, 32, 1, 2, 0, cm('switch', 0, 'word[0]', ENABLE_OPTIONS)),
    ]),
    cg('LASER_CTRL_CMD_GROUP_MODU_MODE_C', 0x15, [
      p('LASER_PARAM_MODU_MODE_C', '调制模式', 5, 'value', 1, 32, 2, 3, 0, cm('select', 0, 'word[1:0]', LASER_MODU_MODE_OPTIONS)),
    ]),
    cg('LASER_CTRL_CMD_GROUP_VOL_AUTO_C', 0x16, [
      p('LASER_PARAM_VOL_AUTO_C', '调制开始', 6, 'value', 1, 32, 1, 2, 0, cm('switch', 0, 'word[0]', LASER_VOL_AUTO_OPTIONS)),
    ]),
    cg('LASER_CTRL_CMD_GROUP_FREQ_SCAN_EN_C', 0x30, [
      p('LASER_PARAM_FREQ_SCAN_EN_C', '本振扫频使能', 7, 'value', 1, 32, 1, 2, 0, cm('switch', 0, 'word[0]', ENABLE_OPTIONS)),
    ]),
    cg('LASER_CTRL_CMD_GROUP_FREQ_UNLOAD_EN_C', 0x31, [
      p('LASER_PARAM_FREQ_UNLOAD_EN_C', '本振卸载使能', 8, 'value', 1, 32, 1, 2, 0, cm('switch', 0, 'word[0]', ENABLE_OPTIONS)),
    ]),
  ], [
    tg('runtime', 0x80, [
      tm(0, 'txm1_t_m_out', '发射1温度', 'word[15:0]', false, "{16'h0000, stat_i.txm1_t_m_out}"),
      tm(1, 'txm1_c_m_out', '发射1状态参数', 'word[15:0]', false, "{16'h0000, stat_i.txm1_c_m_out}"),
      tm(2, 'lo1_t_m_out', '本振1温度', 'word[15:0]', false, "{16'h0000, stat_i.lo1_t_m_out}"),
      tm(3, 'lo1_c_m_out', '本振1状态参数', 'word[15:0]', false, "{16'h0000, stat_i.lo1_c_m_out}"),
      tm(4, 'tec1_t_m_out', 'TEC1温度', 'word[15:0]', false, "{16'h0000, stat_i.tec1_t_m_out}"),
      tm(5, 'tec1_c_2v5_m_out', 'TEC1状态参数', 'word[15:0]', false, "{16'h0000, stat_i.tec1_c_2v5_m_out}"),
      tm(6, 'mod_pd_yc_out', '调制器状态参数1', 'word[15:0]', false, "{16'h0000, stat_i.mod_pd_yc_out}"),
      tm(7, 'hmc_mod_pd_yc_out', '调制器状态参数2', 'word[15:0]', false, "{16'h0000, stat_i.hmc_mod_pd_yc_out}"),
      tm(8, 'txm2_t_m_out', '发射2温度', 'word[15:0]', false, "{16'h0000, stat_i.txm2_t_m_out}"),
      tm(9, 'txm2_c_m_out', '发射2状态参数', 'word[15:0]', false, "{16'h0000, stat_i.txm2_c_m_out}"),
      tm(10, 'lo2_t_m_out', '本振2温度', 'word[15:0]', false, "{16'h0000, stat_i.lo2_t_m_out}"),
      tm(11, 'lo2_c_m_out', '本振2状态参数', 'word[15:0]', false, "{16'h0000, stat_i.lo2_c_m_out}"),
      tm(12, 'tec2_t_m_out', 'TEC2温度', 'word[15:0]', false, "{16'h0000, stat_i.tec2_t_m_out}"),
      tm(13, 'tec2_c_2v5_m_out', 'TEC2状态参数', 'word[15:0]', false, "{16'h0000, stat_i.tec2_c_2v5_m_out}"),
      tm(14, 'yc_mod_i_set', 'I路调制设定回读', 'word[15:0]', false, "{16'h0000, stat_i.yc_mod_i_set}"),
      tm(15, 'yc_mod_q_set', 'Q路调制设定回读', 'word[15:0]', false, "{16'h0000, stat_i.yc_mod_q_set}"),
      tm(16, 'yc_mod_p_set', 'P路调制设定回读', 'word[15:0]', false, "{16'h0000, stat_i.yc_mod_p_set}"),
      tm(17, 'freq_param_ready', '参数基准就绪', 'word[0]', { displayOptions: READY_STATUS_OPTIONS }, 'bool_to_u32(stat_i.freq_param_ready)'),
      tm(18, 'freq_baseline_ready', '基准已捕获', 'word[0]', { displayOptions: READY_STATUS_OPTIONS }, 'bool_to_u32(stat_i.freq_baseline_ready)'),
      tm(19, 'laser_param_recover', '参数包恢复中', 'word[0]', { displayOptions: BOOL_STATUS_OPTIONS }, 'bool_to_u32(stat_i.laser_param_recover)'),
      tm(20, 'freq_scan_active', '扫频接管中', 'word[0]', { displayOptions: BOOL_STATUS_OPTIONS }, 'bool_to_u32(stat_i.freq_scan_active)'),
      tm(21, 'freq_scan_en_status', '扫频使能状态', 'word[0]', { displayOptions: ENABLE_STATUS_OPTIONS }, 'bool_to_u32(stat_i.freq_scan_en_status)'),
      tm(22, 'freq_unload_en_status', '卸载使能状态', 'word[0]', { displayOptions: ENABLE_STATUS_OPTIONS }, 'bool_to_u32(stat_i.freq_unload_en_status)'),
      tm(23, 'yc_m195_jz_ok', '参数包校验OK', 'word[0]', { displayOptions: DONE_STATUS_OPTIONS }, 'bool_to_u32(stat_i.yc_m195_jz_ok)'),
      tm(24, 'frame_lock_state', '帧同步锁定', 'word[0]', { displayOptions: LOCK_STATUS_OPTIONS }, 'bool_to_u32(stat_i.frame_lock_state)'),
      tm(25, 'freq_scan_state', '扫频状态机状态', 'word[3:0]', { displayOptions: LASER_FREQ_SCAN_STATE_OPTIONS }, "{28'd0, stat_i.freq_scan_state}"),
      tm(26, 'last_fault_reason', '最近禁止/退出原因', 'word[7:0]', { displayOptions: LASER_LAST_FAULT_REASON_OPTIONS }, "{24'd0, stat_i.last_fault_reason}"),
      tm(27, 'txm1_temp_1s_stable', 'TXM1 1s稳定', 'word[0]', { displayOptions: READY_STATUS_OPTIONS }, 'bool_to_u32(stat_i.txm1_temp_1s_stable)'),
      tm(28, 'txm2_temp_1s_stable', 'TXM2 1s稳定', 'word[0]', { displayOptions: READY_STATUS_OPTIONS }, 'bool_to_u32(stat_i.txm2_temp_1s_stable)'),
      tm(29, 'lo1_temp_1s_stable', 'LO1 1s稳定', 'word[0]', { displayOptions: READY_STATUS_OPTIONS }, 'bool_to_u32(stat_i.lo1_temp_1s_stable)'),
      tm(30, 'lo2_temp_1s_stable', 'LO2 1s稳定', 'word[0]', { displayOptions: READY_STATUS_OPTIONS }, 'bool_to_u32(stat_i.lo2_temp_1s_stable)'),
      tm(31, 'txm1_temp_10s_stable', 'TXM1 10s稳定', 'word[0]', { displayOptions: READY_STATUS_OPTIONS }, 'bool_to_u32(stat_i.txm1_temp_10s_stable)'),
      tm(32, 'txm2_temp_10s_stable', 'TXM2 10s稳定', 'word[0]', { displayOptions: READY_STATUS_OPTIONS }, 'bool_to_u32(stat_i.txm2_temp_10s_stable)'),
      tm(33, 'lo1_temp_10s_stable', 'LO1 10s稳定', 'word[0]', { displayOptions: READY_STATUS_OPTIONS }, 'bool_to_u32(stat_i.lo1_temp_10s_stable)'),
      tm(34, 'lo2_temp_10s_stable', 'LO2 10s稳定', 'word[0]', { displayOptions: READY_STATUS_OPTIONS }, 'bool_to_u32(stat_i.lo2_temp_10s_stable)'),
      tm(35, 'freq_scan_offset_code', '当前扫频偏移码值', 'word[15:0]', true, "{{16{stat_i.freq_scan_offset_code[15]}}, stat_i.freq_scan_offset_code}"),
    ]),
    tg('cfg', 0x81, [
      tm(0, 'txm_on', '发射激光器开关', 'word[1:0]', false, "{30'h0000_0000, cfg_i.txm_on}"),
      tm(1, 'lo_on', '本振激光器开关', 'word[1:0]', false, "{30'h0000_0000, cfg_i.lo_on}"),
      tm(2, 'wave_set_on', '实际外部set路径', 'word[0]', false, 'bool_to_u32(cfg_i.wave_set_on)'),
      tm(3, 'tec_on1', 'TEC1 开关', 'word[0]', false, 'bool_to_u32(cfg_i.tec_on1)'),
      tm(4, 'tec_on2', 'TEC2 开关', 'word[0]', false, 'bool_to_u32(cfg_i.tec_on2)'),
      tm(5, 'modu_mode', '调制模式', 'word[1:0]', false, "{30'h0000_0000, cfg_i.modu_mode}"),
      tm(6, 'vol_auto', '调制开始', 'word[0]', false, 'bool_to_u32(cfg_i.vol_auto)'),
      tm(7, 'freq_scan_en', '扫频使能配置', 'word[0]', false, 'bool_to_u32(cfg_i.freq_scan_en)'),
      tm(8, 'freq_unload_en', '卸载使能配置', 'word[0]', false, 'bool_to_u32(cfg_i.freq_unload_en)'),
    ]),
  ]),
  m('yewu_rx_block', 5, [
    cg('BIZ_RX_CMD_GROUP_MAP_C', 0x10, [
      p('BIZ_RX_PARAM_ENABLE_C', '业务接收使能配置', 0, 'map', 1, 32, 1, 2, 0, cm('switch', 0, 'word[0]', ENABLE_OPTIONS)),
    ]),
    cg('BIZ_RX_CMD_GROUP_PULSE_CLEAR_C', 0x12, [
      p('BIZ_RX_PARAM_COUNT_CLEAR_C', '计数复位', 1, 'pulse', 0, 0, 1, 0, undefined, pulseMeta()),
    ]),
    cg('BIZ_RX_CMD_GROUP_PULSE_RESET_C', 0x13, [
      p('BIZ_RX_PARAM_RESET_C', '业务接收复位', 2, 'pulse', 0, 0, 1, 0, undefined, pulseMeta()),
    ]),
  ], [
    tg('runtime', 0x80, [
      tm(0, 'total_count', '总接收帧计数', 'word[31:0]', false, 'stat_i.total_count'),
      tm(1, 'error_frame_count', '错误帧计数', 'word[31:0]', false, 'stat_i.error_frame_count'),
      tm(2, 'isl_frame_count', 'isl接收帧计数', 'word[31:0]', false, 'stat_i.isl_frame_count'),
      tm(3, 'pg_frame_count', 'pg接收帧计数', 'word[31:0]', false, 'stat_i.pg_frame_count'),
      tm(4, 'reset_status', '复位状态', 'word[0]', false, 'bool_to_u32(stat_i.reset_status)'),
      tm(5, 'flow_ctrl_status', '流控状态', 'word[0]', false, 'bool_to_u32(stat_i.flow_ctrl_status)'),
    ]),
    tg('cfg', 0x81, [
      tm(0, 'enable', '业务接收使能配置', 'word[0]', false, 'bool_to_u32(cfg_i.enable)'),
    ]),
  ]),
  m('yewu_tx_block', 6, [
    cg('BIZ_TX_CMD_GROUP_MAP_C', 0x10, [
      p('BIZ_TX_PARAM_ENABLE_C', '业务发送使能配置', 0, 'map', 1, 32, 1, 2, 0, cm('switch', 0, 'word[0]', ENABLE_OPTIONS)),
    ]),
    cg('BIZ_TX_CMD_GROUP_PULSE_CLEAR_C', 0x12, [
      p('BIZ_TX_PARAM_COUNT_CLEAR_C', '业务发送计数清零', 1, 'pulse', 0, 0, 1, 0, undefined, pulseMeta()),
    ]),
    cg('BIZ_TX_CMD_GROUP_PULSE_RESET_C', 0x13, [
      p('BIZ_TX_PARAM_RESET_C', '业务发送复位', 2, 'pulse', 0, 0, 1, 0, undefined, pulseMeta()),
    ]),
  ], [
    tg('runtime', 0x80, [
      tm(0, 'total_count', 'total_count：发送业务帧总计数', 'word[31:0]', false, 'stat_i.total_count'),
      tm(1, 'link_status_frame_count', 'link_status_frame_count：链路状态帧计数', 'word[31:0]', false, 'stat_i.link_status_frame_count'),
      tm(2, 'flow_ctrl_frame_count', 'flow_ctrl_frame_count：流控帧计数', 'word[31:0]', false, 'stat_i.flow_ctrl_frame_count'),
      tm(3, 'reset_status', 'reset_status：复位状态', 'word[0]', false, 'bool_to_u32(stat_i.reset_status)'),
    ]),
    tg('cfg', 0x81, [
      tm(0, 'enable', '业务发送使能配置', 'word[0]', false, 'bool_to_u32(cfg_i.enable)'),
    ]),
  ]),
];
