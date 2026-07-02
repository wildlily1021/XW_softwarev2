<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useRewriteRuntime } from '@/app/rewriteRuntime';
import { useAsyncAction, useNotify, usePolling } from '@/shared/composables';
import StatusBadge from '@/widgets/StatusBadge.vue';
import { TASK_STATUS_MAP, resolveDisplayStatus } from '@/features/task/components/taskStatusMap';
import { createTaskDefinition, createSendStep, validateTaskDefinition, type TaskDefinition } from '@/features/task/core';

const ui = {
  title: '自动化任务',
  subtitle: '面向现有 XW 程序的稳定版任务编排页面，先支撑自动化测试发送链路。',
  quickCreate: '快速创建任务',
  createAndStart: '创建并启动',
  taskName: '任务名称',
  frame: '发送帧',
  target: '发送目标',
  activeTasks: '活动任务',
  historyTasks: '历史记录',
  emptyActive: '当前没有活动任务',
  emptyHistory: '当前没有历史任务',
  stopAll: '全部停止',
  clearHistory: '清空历史',
  retry: '重试',
  remove: '删除',
  stop: '停止',
  start: '启动',
  refresh: '刷新',
  created: '任务已创建并启动',
  invalid: '请补齐任务名称、发送帧和发送目标',
  missingFrame: '还没有可用发送帧，请先到“帧定义”里创建或导入帧。',
  missingTarget: '还没有可用发送目标，请先到“连接管理”里创建并连接目标。',
  goFrames: '去定义帧',
  goConnections: '去配置连接',
  clearHistoryConfirm: '确认清空所有历史任务记录？',
  stopAllConfirm: '确认停止全部运行中的任务？',
} as const;

const $q = useQuasar();
const router = useRouter();
const notify = useNotify();
const { execute, isOperating } = useAsyncAction();
const runtime = useRewriteRuntime();

const taskService = runtime.features.taskService;
const frameService = runtime.features.frameService;
const connectionService = runtime.features.connectionService;

const form = ref({
  name: '自动化测试任务',
  frameId: '',
  targetId: '',
});

const snapshot = ref(taskService.getSnapshot());

const frameOptions = computed(() =>
  frameService.listFrames().map((frame) => ({
    label: `${frame.name} (${frame.id})`,
    value: frame.id,
  })),
);

const targetOptions = computed(() =>
  connectionService.listTransportTargets({ availableOnly: true }).map((target) => ({
    label: `${target.label} · ${target.routeLabel}`,
    value: target.targetId,
  })),
);

const hasFrameOptions = computed(() => frameOptions.value.length > 0);
const hasTargetOptions = computed(() => targetOptions.value.length > 0);

const activeTasks = computed(() =>
  snapshot.value.instances.filter((task) =>
    task.lifecycle === 'created' || task.lifecycle === 'running' || task.lifecycle === 'paused',
  ),
);

const historyTasks = computed(() =>
  snapshot.value.instances.filter((task) =>
    task.lifecycle === 'completed' || task.lifecycle === 'failed' || task.lifecycle === 'stopped',
  ),
);

function refreshData(): void {
  snapshot.value = taskService.getSnapshot();
}

const polling = usePolling(refreshData, 1000);

async function createAndStart(): Promise<void> {
  if (!form.value.name.trim() || !form.value.frameId || !form.value.targetId) {
    notify.warning(ui.invalid);
    return;
  }

  const definition: TaskDefinition = createTaskDefinition({
    id: `automation-task-${Date.now()}`,
    name: form.value.name.trim(),
    schedule: { kind: 'immediate' },
    steps: [
      createSendStep({
        frameId: form.value.frameId,
        targetId: form.value.targetId,
      }),
    ],
    errorPolicy: { onFailure: 'stop' },
    stopCondition: { maxIterations: 1 },
  });

  const issues = validateTaskDefinition(definition);
  const errors = issues.filter((issue) => issue.severity === 'error');
  if (errors.length > 0) {
    notify.error('任务校验失败', errors.map((issue) => issue.message).join('; '));
    return;
  }

  await execute('automation-task-create', async () => {
    const instance = taskService.createTask(definition);
    taskService.startTask(instance.instanceId);
    refreshData();
    notify.success(ui.created);
  });
}

async function startTask(instanceId: string): Promise<void> {
  await execute(`task-start-${instanceId}`, async () => {
    taskService.startTask(instanceId);
    refreshData();
  });
}

function stopTask(instanceId: string): void {
  $q.dialog({
    title: ui.stop,
    message: `确认停止任务 ${instanceId}？`,
    cancel: true,
    persistent: false,
  }).onOk(async () => {
    await execute(`task-stop-${instanceId}`, async () => {
      taskService.stopTask(instanceId);
      refreshData();
    });
  });
}

async function retryTask(instanceId: string): Promise<void> {
  await execute(`task-retry-${instanceId}`, async () => {
    taskService.retryTask(instanceId);
    refreshData();
  });
}

async function removeTask(instanceId: string): Promise<void> {
  await execute(`task-remove-${instanceId}`, async () => {
    taskService.removeTask(instanceId);
    refreshData();
  });
}

function stopAll(): void {
  $q.dialog({
    title: ui.stopAll,
    message: ui.stopAllConfirm,
    cancel: true,
    persistent: false,
  }).onOk(async () => {
    await execute('task-stop-all', async () => {
      taskService.stopAll();
      refreshData();
    });
  });
}

function clearHistory(): void {
  $q.dialog({
    title: ui.clearHistory,
    message: ui.clearHistoryConfirm,
    cancel: true,
    persistent: false,
  }).onOk(() => {
    const terminalIds = historyTasks.value.map((task) => task.instanceId);
    for (const instanceId of terminalIds) {
      taskService.removeTask(instanceId);
    }
    refreshData();
  });
}

function goToFrames(): void {
  void router.push({ path: '/automation', query: { tab: 'frames' } });
}

function goToConnections(): void {
  void router.push({ path: '/automation', query: { tab: 'connections' } });
}

onMounted(() => {
  refreshData();
  polling.start();
});
</script>

<template>
  <q-page class="automation-tasks-page">
    <div class="automation-tasks-page__content">
      <section class="automation-tasks-page__hero">
        <div>
          <h1 class="automation-tasks-page__title">{{ ui.title }}</h1>
          <p class="automation-tasks-page__subtitle">{{ ui.subtitle }}</p>
        </div>
        <div class="automation-tasks-page__hero-actions">
          <q-btn flat icon="refresh" :label="ui.refresh" @click="refreshData" />
          <q-btn flat color="negative" :label="ui.stopAll" @click="stopAll" />
        </div>
      </section>

      <q-card flat bordered class="automation-tasks-panel">
        <q-card-section class="automation-tasks-panel__section">
          <div class="automation-tasks-panel__title">{{ ui.quickCreate }}</div>
          <div class="automation-tasks-form">
            <q-input v-model="form.name" dense outlined :label="ui.taskName" />
            <q-select
              v-model="form.frameId"
              dense
              outlined
              emit-value
              map-options
              :options="frameOptions"
              :label="ui.frame"
            />
            <div v-if="!hasFrameOptions" class="automation-tasks-hint">
              <span>{{ ui.missingFrame }}</span>
              <q-btn flat dense color="primary" :label="ui.goFrames" @click="goToFrames" />
            </div>
            <q-select
              v-model="form.targetId"
              dense
              outlined
              emit-value
              map-options
              :options="targetOptions"
              :label="ui.target"
            />
            <div v-if="!hasTargetOptions" class="automation-tasks-hint">
              <span>{{ ui.missingTarget }}</span>
              <q-btn flat dense color="primary" :label="ui.goConnections" @click="goToConnections" />
            </div>
            <q-btn
              unelevated
              color="primary"
              :label="ui.createAndStart"
              :loading="isOperating('automation-task-create')"
              :disable="!hasFrameOptions || !hasTargetOptions"
              @click="createAndStart"
            />
          </div>
        </q-card-section>
      </q-card>

      <section class="automation-tasks-grid">
        <q-card flat bordered class="automation-tasks-panel">
          <q-card-section class="automation-tasks-panel__section">
            <div class="automation-tasks-panel__header">
              <div class="automation-tasks-panel__title">{{ ui.activeTasks }}</div>
            </div>
            <div v-if="activeTasks.length > 0" class="automation-task-list">
              <div v-for="task in activeTasks" :key="task.instanceId" class="automation-task-list__item">
                <div class="automation-task-list__main">
                  <div class="automation-task-list__name">{{ task.definitionRef.name }}</div>
                  <div class="automation-task-list__meta">
                    <span>{{ task.instanceId }}</span>
                    <span>{{ task.definitionRef.steps.length }} steps</span>
                  </div>
                </div>
                <StatusBadge :status="resolveDisplayStatus(task.lifecycle, task.definitionRef)" :status-map="TASK_STATUS_MAP" />
                <div class="automation-task-list__actions">
                  <q-btn
                    v-if="task.lifecycle === 'created'"
                    flat dense color="primary" :label="ui.start"
                    :loading="isOperating(`task-start-${task.instanceId}`)"
                    @click="startTask(task.instanceId)"
                  />
                  <q-btn
                    v-else
                    flat dense color="negative" :label="ui.stop"
                    :loading="isOperating(`task-stop-${task.instanceId}`)"
                    @click="stopTask(task.instanceId)"
                  />
                </div>
              </div>
            </div>
            <div v-else class="automation-task-list__empty">{{ ui.emptyActive }}</div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="automation-tasks-panel">
          <q-card-section class="automation-tasks-panel__section">
            <div class="automation-tasks-panel__header">
              <div class="automation-tasks-panel__title">{{ ui.historyTasks }}</div>
              <q-btn flat dense color="negative" :label="ui.clearHistory" @click="clearHistory" />
            </div>
            <div v-if="historyTasks.length > 0" class="automation-task-list">
              <div v-for="task in historyTasks" :key="task.instanceId" class="automation-task-list__item">
                <div class="automation-task-list__main">
                  <div class="automation-task-list__name">{{ task.definitionRef.name }}</div>
                  <div class="automation-task-list__meta">
                    <span>{{ task.instanceId }}</span>
                    <span>{{ task.error ?? '已结束' }}</span>
                  </div>
                </div>
                <StatusBadge :status="resolveDisplayStatus(task.lifecycle, task.definitionRef)" :status-map="TASK_STATUS_MAP" />
                <div class="automation-task-list__actions">
                  <q-btn
                    flat dense color="primary" :label="ui.retry"
                    :loading="isOperating(`task-retry-${task.instanceId}`)"
                    @click="retryTask(task.instanceId)"
                  />
                  <q-btn
                    flat dense color="negative" :label="ui.remove"
                    :loading="isOperating(`task-remove-${task.instanceId}`)"
                    @click="removeTask(task.instanceId)"
                  />
                </div>
              </div>
            </div>
            <div v-else class="automation-task-list__empty">{{ ui.emptyHistory }}</div>
          </q-card-section>
        </q-card>
      </section>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
@use '../css/tokens' as tokens;

.automation-tasks-page {
  background: var(--rw-color-surface-app);
  min-height: 100%;
  padding: var(--rw-space-6);
}

.automation-tasks-page__content {
  display: grid;
  gap: var(--rw-space-4);
  margin: 0 auto;
  max-width: 1360px;
}

.automation-tasks-page__hero {
  align-items: start;
  display: flex;
  justify-content: space-between;
  gap: var(--rw-space-4);
}

.automation-tasks-page__title {
  color: var(--rw-color-text-primary);
  font-size: var(--rw-font-size-title-lg);
  font-weight: var(--rw-font-weight-semibold);
  margin: 0;
}

.automation-tasks-page__subtitle {
  color: var(--rw-color-text-secondary);
  margin: var(--rw-space-2) 0 0;
}

.automation-tasks-page__hero-actions {
  display: flex;
  gap: var(--rw-space-2);
}

.automation-tasks-grid {
  display: grid;
  gap: var(--rw-space-4);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.automation-tasks-panel {
  border-radius: var(--rw-radius-panel);
}

.automation-tasks-panel__section {
  display: grid;
  gap: var(--rw-space-3);
}

.automation-tasks-panel__header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: var(--rw-space-2);
}

.automation-tasks-panel__title {
  color: var(--rw-color-text-primary);
  font-size: var(--rw-font-size-title-sm);
  font-weight: var(--rw-font-weight-semibold);
}

.automation-tasks-form,
.automation-task-list {
  display: grid;
  gap: var(--rw-space-2);
}

.automation-tasks-hint {
  align-items: center;
  background: var(--rw-color-surface-selected);
  border: 1px dashed var(--rw-color-border-subtle);
  border-radius: var(--rw-radius-control);
  color: var(--rw-color-text-secondary);
  display: flex;
  font-size: var(--rw-font-size-caption);
  justify-content: space-between;
  gap: var(--rw-space-2);
  padding: var(--rw-space-2) var(--rw-space-3);
}

.automation-task-list__item {
  align-items: center;
  border: 1px solid var(--rw-color-border-subtle);
  border-radius: var(--rw-radius-control);
  display: grid;
  gap: var(--rw-space-2);
  grid-template-columns: minmax(0, 1fr) auto auto;
  padding: var(--rw-space-3);
}

.automation-task-list__main {
  min-width: 0;
}

.automation-task-list__name {
  color: var(--rw-color-text-primary);
  font-weight: var(--rw-font-weight-medium);
}

.automation-task-list__meta,
.automation-task-list__empty {
  color: var(--rw-color-text-secondary);
  font-size: var(--rw-font-size-caption);
}

.automation-task-list__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--rw-space-2);
  margin-top: 4px;
}

.automation-task-list__actions {
  display: flex;
  gap: var(--rw-space-1);
}

.automation-task-list__empty {
  align-items: center;
  border: 1px dashed var(--rw-color-border-subtle);
  border-radius: var(--rw-radius-control);
  display: flex;
  justify-content: center;
  min-height: 96px;
}

@media (max-width: tokens.rw-breakpoint('page-stack')) {
  .automation-tasks-page {
    padding: var(--rw-space-4);
  }

  .automation-tasks-page__hero,
  .automation-tasks-grid {
    display: grid;
  }

  .automation-task-list__item {
    grid-template-columns: 1fr;
  }

  .automation-tasks-hint {
    align-items: start;
    display: grid;
  }
}
</style>
