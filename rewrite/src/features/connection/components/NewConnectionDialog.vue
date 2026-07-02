<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type {
  ConnectionResourceCandidate,
  TransportConfig,
  TransportKind,
} from '@/features/connection';

const TRANSPORT_KIND_ORDER = ['serial', 'tcp-client', 'tcp-server', 'udp'] as const satisfies readonly TransportKind[];
const BAUD_RATES = [9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600, 1000000] as const;

const KIND_META: Record<TransportKind, { label: string; subLabel: string; icon: string }> = {
  serial: { label: '串口', subLabel: 'Serial', icon: 'cable' },
  'tcp-client': { label: 'TCP 客户端', subLabel: 'TCP Client', icon: 'lan' },
  'tcp-server': { label: 'TCP 服务端', subLabel: 'TCP Server', icon: 'dns' },
  udp: { label: 'UDP', subLabel: 'UDP', icon: 'hub' },
};

type Step = 'type' | 'form';

const props = withDefaults(defineProps<{
  readonly modelValue: boolean;
  readonly resources: readonly ConnectionResourceCandidate[];
  readonly allowedKinds?: readonly TransportKind[];
}>(), {
  allowedKinds: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  create: [config: TransportConfig];
  'refresh-resources': [];
}>();

const step = ref<Step>('type');
const selectedKind = ref<TransportKind>('serial');
const submitting = ref(false);
const serialRefreshing = ref(false);

const label = ref('');
const portPath = ref('');
const baudRate = ref<number>(1000000);

const tcpClientHost = ref('');
const tcpClientPort = ref(8080);

const tcpServerHost = ref('0.0.0.0');
const tcpServerPort = ref(8080);

const udpLocalHost = ref('0.0.0.0');
const udpLocalPort = ref(9090);
const udpRemoteHost = ref('');
const udpRemotePort = ref<number | undefined>(undefined);

const autoConnect = ref(false);

const show = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const allowedKinds = computed<readonly TransportKind[]>(() => {
  if (props.allowedKinds && props.allowedKinds.length > 0) {
    return props.allowedKinds;
  }
  return TRANSPORT_KIND_ORDER;
});

const showTypeStep = computed(() => allowedKinds.value.length > 1);

const availableKindCards = computed(() =>
  TRANSPORT_KIND_ORDER
    .filter((kind) => allowedKinds.value.includes(kind))
    .map((kind) => ({
      kind,
      ...KIND_META[kind],
    })),
);

const serialPortOptions = computed(() =>
  props.resources
    .filter((resource) => resource.kind === 'serial')
    .map((resource) => ({
      label: resource.label,
      value: resource.id,
    })),
);

const dialogTitle = computed(() => {
  if (showTypeStep.value && step.value === 'type') {
    return '新建连接';
  }
  return `新建${KIND_META[selectedKind.value].label}连接`;
});

function resetForm(): void {
  selectedKind.value = allowedKinds.value[0] ?? 'serial';
  step.value = showTypeStep.value ? 'type' : 'form';
  label.value = '';
  portPath.value = '';
  baudRate.value = 1000000;
  tcpClientHost.value = '';
  tcpClientPort.value = 8080;
  tcpServerHost.value = '0.0.0.0';
  tcpServerPort.value = 8080;
  udpLocalHost.value = '0.0.0.0';
  udpLocalPort.value = 9090;
  udpRemoteHost.value = '';
  udpRemotePort.value = undefined;
  autoConnect.value = false;
  submitting.value = false;
}

function selectKind(kind: TransportKind): void {
  selectedKind.value = kind;
  step.value = 'form';
}

function refreshSerialPorts(): void {
  serialRefreshing.value = true;
  emit('refresh-resources');
  setTimeout(() => {
    serialRefreshing.value = false;
  }, 500);
}

function onCancel(): void {
  resetForm();
  emit('update:modelValue', false);
}

function buildTransportConfig(): TransportConfig {
  const base = {
    id: crypto.randomUUID(),
    label: label.value || undefined,
    autoConnect: autoConnect.value || undefined,
  };

  switch (selectedKind.value) {
    case 'serial':
      return {
        ...base,
        kind: 'serial',
        portPath: portPath.value,
        baudRate: baudRate.value,
      };
    case 'tcp-client':
      return {
        ...base,
        kind: 'tcp-client',
        host: tcpClientHost.value,
        port: tcpClientPort.value,
      };
    case 'tcp-server':
      return {
        ...base,
        kind: 'tcp-server',
        host: tcpServerHost.value,
        port: tcpServerPort.value,
      };
    case 'udp':
      return {
        ...base,
        kind: 'udp',
        localHost: udpLocalHost.value,
        localPort: udpLocalPort.value,
        ...(udpRemoteHost.value ? { remoteHost: udpRemoteHost.value } : {}),
        ...(udpRemotePort.value ? { remotePort: udpRemotePort.value } : {}),
      };
  }
}

function onSubmit(): void {
  submitting.value = true;
  try {
    emit('create', buildTransportConfig());
    resetForm();
    emit('update:modelValue', false);
  } finally {
    submitting.value = false;
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      resetForm();
    }
  },
);
</script>

<template>
  <q-dialog v-model="show" @hide="resetForm">
    <q-card class="rw-dialog-md">
      <q-card-section class="new-connection-dialog__header py-3 px-4">
        <div class="text-h6">{{ dialogTitle }}</div>
        <q-btn flat round dense icon="close" @click="onCancel" />
      </q-card-section>

      <q-separator />

      <q-card-section v-if="showTypeStep && step === 'type'" class="new-connection-dialog__types p-4">
        <div class="new-connection-dialog__type-grid gap-3">
          <q-card
            v-for="kind in availableKindCards"
            :key="kind.kind"
            flat
            bordered
            clickable
            class="new-connection-dialog__type-card"
            @click="selectKind(kind.kind)"
          >
            <q-card-section class="text-center">
              <q-icon :name="kind.icon" size="32px" color="primary" />
              <div class="new-connection-dialog__type-label mt-2">{{ kind.label }}</div>
              <div class="new-connection-dialog__type-sub">{{ kind.subLabel }}</div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>

      <q-card-section v-else class="new-connection-dialog__form gap-3 p-4">
        <q-form @submit.prevent="onSubmit">
          <q-input
            v-model="label"
            label="连接名称"
            dense
            outlined
          />

          <template v-if="selectedKind === 'serial'">
            <q-select
              v-model="portPath"
              :options="serialPortOptions"
              label="串口"
              dense
              outlined
              use-input
              use-chips
              input-debounce="0"
              emit-value
              map-options
              :loading="serialRefreshing"
              :rules="[(value: string) => !!value || '请选择串口路径']"
            >
              <template #append>
                <q-btn
                  flat
                  round
                  dense
                  icon="o_refresh"
                  size="sm"
                  :loading="serialRefreshing"
                  @click.stop="refreshSerialPorts"
                >
                  <q-tooltip>刷新串口列表</q-tooltip>
                </q-btn>
              </template>
              <template #no-option>
                <q-item dense>
                  <q-item-section class="text-caption rw-text-desc">
                    未检测到串口设备，请连接设备后点击刷新。
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-select
              v-model="baudRate"
              :options="BAUD_RATES"
              label="波特率"
              dense
              outlined
              emit-value
            />
          </template>

          <template v-if="selectedKind === 'tcp-client'">
            <q-input
              v-model="tcpClientHost"
              label="主机地址"
              dense
              outlined
              :rules="[(value: string) => !!value || '请输入主机地址']"
            />
            <q-input
              v-model.number="tcpClientPort"
              label="端口"
              type="number"
              dense
              outlined
              :rules="[(value: number) => (value > 0 && value <= 65535) || '端口范围 1-65535']"
            />
          </template>

          <template v-if="selectedKind === 'tcp-server'">
            <q-input
              v-model="tcpServerHost"
              label="监听地址"
              dense
              outlined
            />
            <q-input
              v-model.number="tcpServerPort"
              label="监听端口"
              type="number"
              dense
              outlined
              :rules="[(value: number) => (value > 0 && value <= 65535) || '端口范围 1-65535']"
            />
          </template>

          <template v-if="selectedKind === 'udp'">
            <q-input
              v-model="udpLocalHost"
              label="本地地址"
              dense
              outlined
            />
            <q-input
              v-model.number="udpLocalPort"
              label="本地端口"
              type="number"
              dense
              outlined
              :rules="[(value: number) => (value > 0 && value <= 65535) || '端口范围 1-65535']"
            />
            <q-input
              v-model="udpRemoteHost"
              label="远端地址（可选）"
              dense
              outlined
            />
            <q-input
              v-model.number="udpRemotePort"
              label="远端端口（可选）"
              type="number"
              dense
              outlined
            />
          </template>

          <q-toggle
            v-model="autoConnect"
            label="自动连接"
            class="mt-2"
          />

          <div class="new-connection-dialog__form-actions gap-2 pt-3">
            <q-btn flat label="取消" @click="onCancel" />
            <q-btn
              unelevated
              color="primary"
              label="连接"
              type="submit"
              :loading="submitting"
            />
          </div>
        </q-form>
      </q-card-section>

      <q-card-section v-if="showTypeStep && step === 'type'" class="new-connection-dialog__footer py-2 px-4">
        <q-btn flat label="取消" @click="onCancel" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.new-connection-dialog__header {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.new-connection-dialog__type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}

.new-connection-dialog__type-card {
  border-color: var(--rw-color-border-subtle);
  border-radius: var(--rw-radius-control);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    background: var(--rw-color-surface-selected);
    border-color: var(--rw-color-action-primary);
  }
}

.new-connection-dialog__type-label {
  color: var(--rw-color-text-primary);
  font-size: var(--rw-font-size-body);
  font-weight: var(--rw-font-weight-semibold);
}

.new-connection-dialog__type-sub {
  color: var(--rw-color-text-muted);
  font-size: var(--rw-font-size-caption);
}

.new-connection-dialog__form {
  display: flex;
  flex-direction: column;
}

.new-connection-dialog__form-actions {
  display: flex;
  justify-content: flex-end;
}

.new-connection-dialog__footer {
  display: flex;
  justify-content: flex-end;
}
</style>
