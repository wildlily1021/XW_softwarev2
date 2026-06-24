import { ref } from 'vue';
import { getDefaultFpgaCommandParamValues } from '../services';

type CommandDraftValues = Record<string, number>;

const sessionDrafts = new Map<string, CommandDraftValues>();

export function useFpgaCommandDrafts() {
  const values = ref<CommandDraftValues>({});

  function loadDraft(moduleKey: string, groupKey: string): void {
    values.value = getDraftValues(moduleKey, groupKey);
  }

  function setDraftValue(
    moduleKey: string,
    groupKey: string,
    paramKey: string,
    value: string | number | null | boolean,
  ): void {
    const numericValue = coerceDraftValue(value);
    const nextValues = {
      ...values.value,
      [paramKey]: numericValue,
    };

    values.value = nextValues;
    saveDraftValues(moduleKey, groupKey, nextValues);
  }

  function replaceDraft(moduleKey: string, groupKey: string, nextValues: CommandDraftValues): void {
    values.value = { ...nextValues };
    saveDraftValues(moduleKey, groupKey, values.value);
  }

  return {
    values,
    loadDraft,
    setDraftValue,
    replaceDraft,
  };
}

function getDraftValues(moduleKey: string, groupKey: string): CommandDraftValues {
  if (!moduleKey || !groupKey) {
    return {};
  }

  return {
    ...getDefaultFpgaCommandParamValues(moduleKey, groupKey),
    ...(sessionDrafts.get(getDraftKey(moduleKey, groupKey)) ?? {}),
  } as CommandDraftValues;
}

function saveDraftValues(moduleKey: string, groupKey: string, values: CommandDraftValues): void {
  if (!moduleKey || !groupKey) {
    return;
  }

  sessionDrafts.set(getDraftKey(moduleKey, groupKey), { ...values });
}

function getDraftKey(moduleKey: string, groupKey: string): string {
  return `${moduleKey}::${groupKey}`;
}

function coerceDraftValue(value: string | number | null | boolean): number {
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  const numericValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}
