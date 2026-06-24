import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../app/AppShell.vue'),
    children: [
      { path: '', redirect: '/telemetry-telecommand' },
      { path: 'telemetry-telecommand', component: () => import('../pages/FpgaRs422TelemetryPage.vue') },
      { path: 'debug-assistant', component: () => import('../pages/FpgaRs422DebugAssistantPage.vue') },
      { path: 'fpga-rs422', redirect: '/telemetry-telecommand' },
      { path: 'connection', redirect: '/telemetry-telecommand' },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/telemetry-telecommand',
  },
];

export default routes;
