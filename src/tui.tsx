/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginApi, TuiPluginModule } from "@opencode-ai/plugin/tui"
import { createSignal } from "solid-js"
import { unlinkSync, existsSync } from "node:fs"
import { resolveConfig } from "./config"
import { startRecording, stopRecordingGraceful, killRecording, type RecorderHandle } from "./audio-recorder"
import { transcribeAudio } from "./transcriber"
import { RecordingIndicator } from "./ui"  

const KV_AUTOSUBMIT = "open-voice.autoSubmit"

function tmpFile(): string {
  return `/tmp/opencode-voice-${process.pid}-${Date.now()}.flac`
}

const tui: TuiPlugin = async (api, options) => {
  const config = resolveConfig(options)

  const toast = (variant: "success" | "info" | "error" | "warning", message: string, duration = 3000) => {
    if (!config.showToast && ["success", "info"].includes(variant)) return
    api.ui.toast({ variant, title: "Open Voice", message, duration })
  }
  let apiKey = process.env.GROQ_API_KEY ?? ""

  if (!apiKey) {
    toast("warning", "GROQ_API_KEY not set — voice disabled", 5000)
  }

  let recorder: RecorderHandle | undefined
  let elapsedTimer: ReturnType<typeof setInterval> | undefined

  const [voiceState, setVoiceState] = createSignal<"idle" | "recording" | "transcribing" | "error">("idle")
  const [elapsed, setElapsed] = createSignal(0)
  const [autoSubmit] = createSignal(
    api.kv.get(KV_AUTOSUBMIT, config.autoSubmit),
  )

  const currentTmpFile = () => recorder?.tmpFile ?? ""

  const cleanup = () => {
    if (recorder) {
      killRecording(recorder)
      recorder = undefined
    }
    if (elapsedTimer) {
      clearInterval(elapsedTimer)
      elapsedTimer = undefined
    }
    const f = currentTmpFile()
    if (f && existsSync(f)) {
      try { unlinkSync(f) } catch { }
    }
  }

  const startElapsedTimer = () => {
    setElapsed(0)
    elapsedTimer = setInterval(() => {
      setElapsed((e) => e + 1)
    }, 1000)
  }

  const stopElapsedTimer = () => {
    if (elapsedTimer) {
      clearInterval(elapsedTimer)
      elapsedTimer = undefined
    }
  }

  const appendToPrompt = async (text: string) => {
    await api.client.tui.appendPrompt({ text: text.trim() })
    if (autoSubmit()) {
      api.client.tui.submitPrompt()
    }
  }

  const toggle = async () => {
    if (!apiKey) {
      toast("error", "Set GROQ_API_KEY to enable voice input")
      return
    }

    if (voiceState() === "idle") {
      const f = tmpFile()
      setVoiceState("recording")
      setElapsed(0)
      startElapsedTimer()
      toast("info", `Recording...\nPress ${config.keybind} to stop\nPress ${config.keybind_cancel} to cancel
        `, 3000)

      try {
        recorder = startRecording(f, config.pulseDevice)
      } catch (err) {
        stopElapsedTimer()
        setVoiceState("error")
        toast("error", `Failed to start ffmpeg: ${err instanceof Error ? err.message : String(err)}`)
        setTimeout(() => setVoiceState("idle"), 2000)
        return
      }

      recorder.child.once("error", (err) => {
        if (voiceState() === "recording") {
          killRecording(recorder!)
          recorder = undefined
          stopElapsedTimer()
          setVoiceState("error")
          toast("error", `ffmpeg error: ${err.message}`)
          setTimeout(() => setVoiceState("idle"), 2000)
        }
      })

      recorder.child.once("exit", (code) => {
        if (recorder && voiceState() === "recording") {
          setVoiceState("idle")
        }
      })
    } else if (voiceState() === "recording") {
      const handle = recorder
      const f = handle?.tmpFile ?? ""
      recorder = undefined
      stopElapsedTimer()
      setVoiceState("transcribing")
      toast("info", "Transcribing...", 2000)

      if (handle) {
        await stopRecordingGraceful(handle)
      }

      if (!f || !existsSync(f)) {
        setVoiceState("error")
        toast("error", "Recording file not found")
        setTimeout(() => setVoiceState("idle"), 2000)
        return
      }

      try {
        const text = await transcribeAudio(f, config.apiUrl, config.model, apiKey)
        if (text.trim()) {
          await appendToPrompt(text)
          const preview = text.trim().slice(0, 40)
          toast("success", `"${preview}${text.length > 40 ? "..." : ""}"`)
        } else {
          toast("info", "No speech detected")
        }
      } catch (err) {
        setVoiceState("error")
        toast("error", `Transcription failed: ${err instanceof Error ? err.message : String(err)}`)
        setTimeout(() => setVoiceState("idle"), 3000)
        return
      }

      try { unlinkSync(f) } catch { }
      setVoiceState("idle")
    } else if (voiceState() === "transcribing" || voiceState() === "error") {
      cleanup()
      setVoiceState("idle")
    }
  }

  const cancel = () => {
    if (voiceState() !== "recording") return
    cleanup()
    setVoiceState("idle")
    toast("info", "Recording cancelled")
  }



  api.keymap.registerLayer({
    commands: [
      {
        name: "voice.toggle",
        title: "Toggle voice input",
        category: "Plugin",
        namespace: "palette",
        slashName: "voice",
        run: toggle,
      },
      {
        name: "voice.cancel",
        title: "Cancel voice recording",
        category: "Plugin",
        namespace: "palette",
        slashName: "voice-cancel",
        run: cancel,
      },
    ],
    bindings: [
      { key: config.keybind, cmd: "voice.toggle", desc: "Toggle voice input" },
      { key: config.keybind_cancel, cmd: "voice.cancel", desc: "Cancel voice recording" },
    ],
  })

  api.slots.register({
    slots: {
      home_prompt_right() {
        return <RecordingIndicator api={api} state={voiceState} elapsed={elapsed} keybind={config.keybind} />
      },
      session_prompt_right() {
        return <RecordingIndicator api={api} state={voiceState} elapsed={elapsed} keybind={config.keybind} />
      }
    },
  })

  api.lifecycle.onDispose(() => {
    cleanup()
  })
}

const plugin: TuiPluginModule = {
  id: "opencode-whisper",
  tui,
}

export default plugin
