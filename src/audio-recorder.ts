import { spawn, type ChildProcess } from "node:child_process"

export type RecorderHandle = {
  child: ChildProcess
  tmpFile: string
}

export function startRecording(tmpFile: string, pulseDevice: string): RecorderHandle {
  const child = spawn("ffmpeg", [
    "-f", "pulse",
    "-i", pulseDevice,
    "-y",
    tmpFile,
  ], {
    stdio: ["ignore", "ignore", "pipe"],
  })

  return { child, tmpFile }
}

export function stopRecordingGraceful(handle: RecorderHandle): Promise<void> {
  return new Promise((resolve) => {
    const { child } = handle

    child.once("exit", () => resolve())
    child.kill("SIGINT")

    setTimeout(() => {
      if (!child.killed) {
        child.kill("SIGTERM")
      }
    }, 500)
  })
}

export function killRecording(handle: RecorderHandle): void {
  handle.child.kill("SIGKILL")
}
