/** @jsxImportSource @opentui/solid */
import type { TuiPluginApi } from "@opencode-ai/plugin/tui"
import type { VoiceState } from "./state.js"
import type { Accessor } from "solid-js"

export function RecordingIndicator(props: {
  api: TuiPluginApi
  state: Accessor<VoiceState>
  elapsed: Accessor<number>
}) {
  const theme = () => props.api.theme.current

  return (
    <>
      {props.state() === "recording" && (
        <text fg={theme().error}>
          <b>[REC {formatElapsed(props.elapsed())}]</b>
        </text>
      )}
      {props.state() === "transcribing" && (
        <text fg={theme().textMuted}>[...]</text>
      )}
    </>
  )
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0")
  const s = (seconds % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}
