import { describe, expect, it, vi } from 'vitest';
import { createRealSerialAdapter } from '../adapters';
import type { TransportFacade } from '@/platform';

function createMockTransport(overrides: Partial<TransportFacade> = {}): TransportFacade {
  return {
    enumerateSerialPorts: vi.fn(async () => [{ path: 'COM3' }]),
    connect: vi.fn(async () => ({ ok: true, events: [] })),
    disconnect: vi.fn(async () => ({ ok: true, events: [] })),
    write: vi.fn(async () => ({ ok: true, events: [] })),
    cleanup: vi.fn(async () => ({ ok: true, events: [] })),
    drainEvents: vi.fn(() => []),
    onEvent: vi.fn(() => () => {}),
    ...overrides,
  };
}

describe('real serial adapter resource discovery', () => {
  it('uses the raw serial path as candidate id for the connection form', async () => {
    const adapter = createRealSerialAdapter({ transport: createMockTransport() });

    await expect(adapter.discoverResources()).resolves.toEqual([
      { kind: 'serial', id: 'COM3', label: 'COM3' },
    ]);
  });
});
