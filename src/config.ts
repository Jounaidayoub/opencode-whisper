export const DEFAULT_OPTIONS = {
  model: "whisper-large-v3-turbo",
  apiUrl: "https://api.groq.com/openai/v1/audio/transcriptions",
  autoSubmit: false,
  pulseDevice: "default",
  keybind: "alt+r",
  keybind_cancel: "alt+c",
  showToast: true,
} as const;

export type PluginConfig = typeof DEFAULT_OPTIONS;


export function resolveConfig(userOptions: Partial<PluginConfig> = {}): PluginConfig {
  return { ...DEFAULT_OPTIONS, ...userOptions };
}