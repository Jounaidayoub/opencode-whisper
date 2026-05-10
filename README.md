# OpenCode Voice (`opencode-whisper`)

A simple voice-to-prompt TUI plugin for OpenCode. It allows you to record your speech and transcribe it directly into the prompt using the Groq Whisper API, skipping the need to manually type.

## Prerequisites

Before using this plugin, make sure you have the following:
- **ffmpeg**: Must be installed on your system and accessible in your system's PATH.
- **Groq API Key**: You need a valid Groq API key exported as the `GROQ_API_KEY` environment variable. (get a free key from here [Groq Console](https://console.groq.com/keys))

## Installation

Install the plugin globally using the OpenCode plugin manager:

```bash
opencode plugin -g opencode-whisper
```

## Usage

1. Make sure your API key is exported in your environment:
   ```bash
   export GROQ_API_KEY="your-groq-api-key"
   ```
2. Start OpenCode.
3. Press `Alt+R` (or your configured `keybind`) to start recording.
4. Speak your prompt.
5. Press `Alt+R` again to stop recording and transcribe your speech.
6. (Optional) Press `Alt+C` to cancel an active recording.

## Configuration

The plugin works out of the box, but you can override its default settings if you wish. The configuration is stored in your OpenCode TUI config file, located at `~/.config/opencode/tui.json`.

You can pass an options object along with the plugin name. Here are the default options you can override:

```json
{
  "plugin": [
    ["opencode-whisper", {
      "model": "whisper-large-v3-turbo",
      "apiUrl": "https://api.groq.com/openai/v1/audio/transcriptions",
      "autoSubmit": false,
      "pulseDevice": "default",
      "keybind": "alt+r",
      "keybind_cancel": "alt+c",
      "showToast": true
    }]
  ]
}
```

### Options Breakdown:
- `model`: The Whisper model to use.
- `apiUrl`: The transcription API endpoint (default is Groq's).
- `autoSubmit`: Whether to automatically submit the prompt immediately after transcription.
- `pulseDevice`: The audio input device to record from.
- `keybind`: The shortcut key to start and stop the recording.
- `keybind_cancel`: The shortcut key to cancel an ongoing recording.
- `showToast`: Whether to show UI toast notifications for the recording/transcription state.
