<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRewriteRuntime } from '@/app/rewriteRuntime';
import { useAsyncAction, useNotify, usePolling } from '@/shared/composables';
import type {
  ConnectionResourceCandidate,
  ConnectionSummary,
  TransportConfig,
} from '@/features/connection';
import ConnectionCard from '@/features/connection/components/ConnectionCard.vue';
import NewConnectionDialog from '@/features/connection/components/NewConnectionDialog.vue';

const $q = useQuasar();
const notify = useNotify();
const runtime = useRewriteRuntime();
const service = runtime.features.connectionService;

const summaries = ref<readonly ConnectionSummary[]>([]);
const resources = ref<readonly ConnectionResourceCandidate[]>([]);
const showNewDialog = ref(false);

const { execute, isOperating } = useAsyncAction();

const serialSummaries = computed(() =>
  summaries.value.filter((summary) => summary.kind === 'serial'),
);

const networkSummaries = computed(() =>
  summaries.value.filter((summary) => summary.kind !== 'serial'),
);

function getAutoConnect(connectionId: string): boolean {
  return service.getConnectionFact(connectionId)?.config?.autoConnect ?? false;
}

function refreshSummaries(): void {
  summaries.value = service.listConnectionSummaries();
}

const polling = usePolling(refreshSummaries, 1000);

async function handleConnect(summary: ConnectionSummary): Promise<void> {
  await execute(summary.connectionId, async () => {
    const fact = service.getConnectionFact(summary.connectionId);
    if (!fact) {
      notify.error('连接失败', '未找到对应的连接配置');
      return;
    }

    const result = await service.connect(fact.config);
    if (result.ok) {
      notify.success(`${summary.label} 已连接`);
      return;
    }

    notify.error('连接失败', result.error?.message ?? '连接失败');
  });

  refreshSummaries();
}

async function handleDisconnect(summary: ConnectionSummary): Promise<void> {
  await execute(summary.connectionId, async () => {
    const result = await service.disconnect(summary.connectionId);
    if (result.ok) {
      notify.success(`${summary.label} 已断开`);
      return;
    }

    notify.error('断开失败', result.error?.message ?? '断开失败');
  });

  refreshSummaries();
}

function handleRemove(summary: ConnectionSummary): void {
  $q.dialog({
    title: '确认删除',
    message: `确定要删除连接“${summary.label}”吗？`,
    cancel: true,
    persistent: false,
  }).onOk(async () => {
    await execute(`remove-${summary.connectionId}`, async () => {
      const result = await service.removeConnection(summary.connectionId);
      if (result.ok) {
        await runtime.persistence.saveConnections();
        notify.success(`${summary.label} 已删除`);
        return;
      }

      const fallbackMessage = result.validation.issues
        .map((issue) => issue.message)
        .join('; ');
      notify.error('删除失败', result.error?.message ?? fallbackMessage);
    });

    refreshSummaries();
  });
}

function handleToggleAutoConnect(summary: ConnectionSummary): void {
  const fact = service.getConnectionFact(summary.connectionId);
  if (fact?.config) {
    fact.config.autoConnect = !fact.config.autoConnect;
    notify.info(
      `${summary.label} 自动连接已${fact.config.autoConnect ? '开启' : '关闭'}`,
    );
  }
}

async function handleCreate(config: TransportConfig): Promise<void> {
  const result = await service.connect(config);
  if (result.ok) {
    notify.success('连接已创建');
  } else {
    notify.error('创建连接失败', result.error?.message ?? '创建连接失败');
  }

  refreshSummaries();
}

async function refreshResources(): Promise<void> {
  try {
    resources.value = await service.discoverResources();
  } catch (error: unknown) {
    notify.error(
      '刷新端口失败',
      error instanceof Error ? error.message : String(error),
    );
  }
}

onMounted(() => {
  refreshResources();
  refreshSummaries();
  polling.start();
});
</script>

<template>
  <q-page class="connection-page p-6 min-h-full">
    <section class="connection-page__content gap-4 mx-auto">
      <div class="connection-page__header">
        <h1 class="connection-page__title">连接管理</h1>
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="新建连接"
          @click="showNewDialog = true"
        />
      </div>

      <section v-if="serialSummaries.length > 0" class="connection-page__section gap-2">
        <h2 class="connection-page__section-title pb-1">串口连接</h2>
        <div class="connection-page__list gap-2">
          <ConnectionCard
            v-for="summary in serialSummaries"
            :key="summary.connectionId"
            :summary="summary"
            :operating="isOperating(summary.connectionId) || isOperating(`remove-${summary.connectionId}`)"
            :auto-connect="getAutoConnect(summary.connectionId)"
            @connect="handleConnect(summary)"
            @disconnect="handleDisconnect(summary)"
            @remove="handleRemove(summary)"
            @toggle-autoconnect="handleToggleAutoConnect(summary)"
          />
        </div>
      </section>

      <section v-if="networkSummaries.length > 0" class="connection-page__section gap-2">
        <h2 class="connection-page__section-title pb-1">网络连接</h2>
        <div class="connection-page__list gap-2">
          <ConnectionCard
            v-for="summary in networkSummaries"
            :key="summary.connectionId"
            :summary="summary"
            :operating="isOperating(summary.connectionId) || isOperating(`remove-${summary.connectionId}`)"
            :auto-connect="getAutoConnect(summary.connectionId)"
            @connect="handleConnect(summary)"
            @disconnect="handleDisconnect(summary)"
            @remove="handleRemove(summary)"
            @toggle-autoconnect="handleToggleAutoConnect(summary)"
          />
        </div>
      </section>

      <div
        v-if="summaries.length === 0"
        class="connection-page__empty gap-3 py-6"
      >
        <q-icon name="link_off" size="48px" color="grey" />
        <p>暂无连接，点击“新建连接”开始。</p>
      </div>
    </section>

    <NewConnectionDialog
      v-model="showNewDialog"
      :resources="resources"
      @create="handleCreate"
      @refresh-resources="refreshResources"
    />
  </q-page>
</template>

<style scoped lang="scss">
@use '../css/tokens' as tokens;

.connection-page {
  background: var(--rw-color-surface-app);
}

.connection-page__content {
  display: grid;
  margin: 0 auto;
  max-width: var(--rw-size-content-wide);
}

.connection-page__header {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.connection-page__title {
  color: var(--rw-color-text-primary);
  font-size: var(--rw-font-size-title-lg);
  font-weight: var(--rw-font-weight-semibold);
  line-height: var(--rw-line-height-title-lg);
  margin: 0;
}

.connection-page__section {
  display: grid;
}

.connection-page__section-title {
  border-bottom: var(--rw-border-width-subtle) solid var(--rw-color-border-subtle);
  color: var(--rw-color-text-secondary);
  font-size: var(--rw-font-size-label);
  font-weight: var(--rw-font-weight-semibold);
  line-height: var(--rw-line-height-body);
  margin: 0;
}

.connection-page__list {
  display: grid;
}

.connection-page__empty {
  align-items: center;
  color: var(--rw-color-text-muted);
  display: flex;
  flex-direction: column;
  font-size: var(--rw-font-size-body);
}

@media (max-width: tokens.rw-breakpoint('page-compact')) {
  .connection-page {
    padding: var(--rw-space-4);
  }
}
</style>
