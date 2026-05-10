/** @jsxImportSource @opentui/solid */
import type { TuiPluginApi } from "@opencode-ai/plugin/tui"
import type { VoiceState } from "./state.js"
import { type Accessor, createSignal, onCleanup } from "solid-js"

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]

function Spinner() {
  const [frame, setFrame] = createSignal(0)
  
  const timer = setInterval(() => {
    setFrame((f) => (f + 1) % SPINNER_FRAMES.length)
  }, 80)
  
  onCleanup(() => clearInterval(timer))
  
  return <>{SPINNER_FRAMES[frame()]}</>
}

function BlinkingDot() {
  const [visible, setVisible] = createSignal(true)
  
  const timer = setInterval(() => {
    setVisible((v) => !v)
  }, 500)
  
  onCleanup(() => clearInterval(timer))
  
  // Nerd Font circle: 
  return <>{visible() ? " " : "  "}</>
}

export function RecordingIndicator(props: {
  api: TuiPluginApi
  state: Accessor<VoiceState>
  elapsed: Accessor<number>
  keybind: string
}) {
  const theme = () => props.api.theme.current
  const toggle = () => props.api.keymap.dispatchCommand("voice.toggle")

  return (
    <>
      {props.state() === "idle" && (
        <text fg={theme().textMuted} onMouseUp={toggle}>
           {props.keybind}
        </text>
      )}
      {props.state() === "recording" && (
        <text fg={theme().error} onMouseUp={toggle}>
          <BlinkingDot />
          <b>[REC {formatElapsed(props.elapsed())}]</b>
        </text>
      )}
      {props.state() === "transcribing" && (
        <text fg={theme().accent} onMouseUp={toggle}>
          <Spinner /> Transcribing...
        </text>
      )}
    </>
  )
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0")
  const s = (seconds % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}
