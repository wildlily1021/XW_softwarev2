import { describe, expect, it } from 'vitest';
import { createCompositeAdapter } from '../adapters';
import type {
  ConnectionResourceCandidate,
  ConnectionTransportAdapter,
} from '../adapters';

function createAdapterWithResources(
  resources: readonly ConnectionResourceCandidate[],
): ConnectionTransportAdapter {
  return {
    connect: async () => ({ ok: true, events: [] }),
    disconnect: async () => ({ ok: true, events: [] }),
    write: async () => ({ ok: true, events: [] }),
    cleanup: async () => ({ ok: true, events: [] }),
    drainEvents: async () => [],
    discoverResources: async () => resources,
  };
}

describe('connection composite adapter', () => {
  it('exposes resource discovery from child adapters', async () => {
    const adapter = createCompositeAdapter({
      serialAdapter: createAdapterWithResources([
        { kind: 'serial', id: 'serial:COM3', label: 'COM3' },
      ]),
      networkAdapter: createAdapterWithResources([
        { kind: 'tcp-client', id: 'tcp-client:main', label: 'TCP main' },
      ]),
    });

    await expect(adapter.discoverResources?.()).resolves.toEqual([
      { kind: 'serial', id: 'serial:COM3', label: 'COM3' },
      { kind: 'tcp-client', id: 'tcp-client:main', label: 'TCP main' },
    ]);
  });
});
