import type { AiProviderOption, AiSettings, UpdateAiSettingsInput } from './api/ai.ts';

/**
 * Decisions behind the "AI providers" set-up flow (set up, test, turn on), kept out of the component so they can be tested.
 * `form` is what is typed on screen, `saved` is what the server has.
 */
export interface SetupState {
  /** Provider, model or endpoint differs from what is saved (the test result no longer applies). */
  connectionChanged: boolean;
  /** Saving would remove the saved API key (different provider, or a different custom endpoint). */
  keyWouldBeDiscarded: boolean;
  /** A key was typed that has not been sent yet. */
  hasUnsavedKey: boolean;
  /** Anything that must be saved before the connection can be tested or AI turned on. */
  hasUnsavedChanges: boolean;
}

export function setupState(
  saved: AiSettings,
  form: UpdateAiSettingsInput,
  providers: readonly AiProviderOption[],
  typedKey: string,
): SetupState {
  const provider = providers.find(p => p.id === form.provider) ?? null;
  const providerChanged = form.provider !== saved.provider;
  // The endpoint only matters for the custom provider; built-in providers are pinned to their official host.
  const endpointChanged = Boolean(provider?.requiresBaseUrl) && form.baseUrl.trim() !== (saved.baseUrl ?? '');
  const modelChanged = form.model.trim() !== (saved.model ?? '');
  const connectionChanged = providerChanged || endpointChanged || modelChanged;
  const hasUnsavedKey = typedKey.trim().length > 0;
  return {
    connectionChanged,
    keyWouldBeDiscarded: saved.apiKeyConfigured && (providerChanged || endpointChanged),
    hasUnsavedKey,
    hasUnsavedChanges: connectionChanged || hasUnsavedKey,
  };
}

/** The three steps: what the admin can do next, and why not when they can't. */
export function nextStep(saved: AiSettings, state: SetupState): { canTest: boolean; canTurnOn: boolean; hint: string | null } {
  if (state.hasUnsavedChanges) {
    return { canTest: false, canTurnOn: false, hint: 'Save your changes first.' };
  }
  if (!saved.provider || !saved.model) {
    return { canTest: false, canTurnOn: false, hint: 'Choose a provider and model, then save.' };
  }
  if (!saved.encryptionConfigured) {
    return { canTest: false, canTurnOn: false, hint: 'The server needs AI_CREDENTIALS_ENCRYPTION_KEY before a key can be saved.' };
  }
  if (saved.keyUnreadable) {
    return { canTest: false, canTurnOn: false, hint: 'Enter the API key again: the saved one can’t be read.' };
  }
  if (!saved.apiKeyConfigured) {
    return { canTest: false, canTurnOn: false, hint: 'Paste your API key and save.' };
  }
  if (saved.status !== 'CONNECTED') {
    return { canTest: true, canTurnOn: false, hint: 'Test the connection before turning AI on.' };
  }
  return { canTest: true, canTurnOn: true, hint: null };
}

/** Where to find model names for each provider. Names themselves are not listed here because they change often. */
export const MODEL_HINT: Record<string, string> = {
  GEMINI: 'Copy the model name from Google AI Studio.',
  OPENAI: 'Copy the model name from your OpenAI dashboard.',
  ANTHROPIC: 'Copy the model name from the Anthropic console.',
  MISTRAL: 'Copy the model name from the Mistral console.',
  DEEPSEEK: 'Copy the model name from the DeepSeek platform.',
  OPENAI_COMPATIBLE: 'Use the model name your endpoint expects.',
};
