export const DEFAULT_OPTIONS: PluginOptions = {
  model: "whisper-large-v3-turbo",
  apiUrl: "https://api.groq.com/openai/v1/audio/transcriptions",
  autoSubmit: false,
  pulseDevice: "default",
  keybind: "<leader>space",
} as const

export type PluginOptions = {
  model?: unknown
  apiUrl?: unknown
  autoSubmit?: unknown
  pulseDevice?: unknown
  keybind?: unknown
}

export type ResolvedConfig = {
  model: string
  apiUrl: string
  autoSubmit: boolean
  pulseDevice: string
  keybind: string
}

export function resolveConfig(options: PluginOptions | undefined): ResolvedConfig {
  return {
    model: stringOption(options?.model, DEFAULT_OPTIONS.model as string),
    apiUrl: stringOption(options?.apiUrl, DEFAULT_OPTIONS.apiUrl as string),
    autoSubmit: boolOption(options?.autoSubmit, DEFAULT_OPTIONS.autoSubmit as boolean),
    pulseDevice: stringOption(options?.pulseDevice, DEFAULT_OPTIONS.pulseDevice as string),
    keybind: stringOption(options?.keybind, DEFAULT_OPTIONS.keybind as string),
  }
}

function stringOption(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback
}

function boolOption(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback
}
