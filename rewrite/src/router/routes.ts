import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../app/AppShell.vue'),
    children: [
      { path: '', redirect: '/automation' },
      { path: 'automation', component: () => import('../pages/AutomationWorkbenchPage.vue') },
      { path: 'automation/tasks', redirect: { path: '/automation', query: { tab: 'tasks' } } },
      { path: 'automation/command-ingress', redirect: { path: '/automation', query: { tab: 'command-ingress' } } },
      { path: 'connection', redirect: { path: '/automation', query: { tab: 'connections' } } },
      { path: 'frames', redirect: { path: '/automation', query: { tab: 'frames' } } },
      { path: 'frames/editor/:frameId?', redirect: { path: '/automation', query: { tab: 'frames' } } },
      { path: 'send', redirect: { path: '/automation', query: { tab: 'send' } } },
      { path: 'tasks', redirect: { path: '/automation', query: { tab: 'tasks' } } },
      { path: 'command-ingress', redirect: { path: '/automation', query: { tab: 'command-ingress' } } },
      { path: 'telemetry-telecommand', component: () => import('../pages/FpgaRs422TelemetryPage.vue') },
      { path: 'debug-assistant', component: () => import('../pages/FpgaRs422DebugAssistantPage.vue') },
      { path: 'fpga-rs422', redirect: '/telemetry-telecommand' },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/automation',
  },
];

export default routes;
