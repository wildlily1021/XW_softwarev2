import {
  cloneConnectionStateSnapshot,
  createEmptyConnectionSnapshot,
  removeConnectionConfig,
  reduceTransportEvent,
  upsertConnectionConfig,
  type ConnectionStateSnapshot,
  type NormalizedTransportEventInput,
  type ReadonlyConnectionStateSnapshot,
  type TransportConfig,
} from '../core';

export interface ConnectionStateInitialValue {
  readonly snapshot?: ReadonlyConnectionStateSnapshot;
}

export interface ConnectionStateContainer {
  getSnapshot(): ConnectionStateSnapshot;
  replaceSnapshot(snapshot: ReadonlyConnectionStateSnapshot): ConnectionStateSnapshot;
  upsertConfig(config: TransportConfig): ConnectionStateSnapshot;
  removeConfig(connectionId: string): ConnectionStateSnapshot;
  applyEvent(event: NormalizedTransportEventInput): ConnectionStateSnapshot;
  resetSnapshot(snapshot?: ReadonlyConnectionStateSnapshot): ConnectionStateSnapshot;
}

export function createConnectionState(
  initialValue: ConnectionStateInitialValue = {},
): ConnectionStateContainer {
  let snapshot = initialValue.snapshot
    ? cloneConnectionStateSnapshot(initialValue.snapshot)
    : createEmptyConnectionSnapshot();

  return {
    getSnapshot() {
      return cloneConnectionStateSnapshot(snapshot);
    },

    replaceSnapshot(nextSnapshot) {
      snapshot = cloneConnectionStateSnapshot(nextSnapshot);
      return cloneConnectionStateSnapshot(snapshot);
    },

    upsertConfig(config) {
      snapshot = upsertConnectionConfig(snapshot, config);
      return cloneConnectionStateSnapshot(snapshot);
    },

    removeConfig(connectionId) {
      snapshot = removeConnectionConfig(snapshot, connectionId);
      return cloneConnectionStateSnapshot(snapshot);
    },

    applyEvent(event) {
      snapshot = reduceTransportEvent(snapshot, event);
      return cloneConnectionStateSnapshot(snapshot);
    },

    resetSnapshot(nextSnapshot = createEmptyConnectionSnapshot()) {
      snapshot = cloneConnectionStateSnapshot(nextSnapshot);
      return cloneConnectionStateSnapshot(snapshot);
    },
  };
}
