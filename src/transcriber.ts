import { readFileSync } from "node:fs"

export type TranscriptionResult = {
  text: string
}

export async function transcribeAudio(
  tmpFile: string,
  apiUrl: string,
  model: string,
  apiKey: string,
): Promise<string> {
  const fileBuffer = readFileSync(tmpFile)
  const fileName = tmpFile.split("/").pop() ?? "recording.flac"

  const formData = new FormData()
  formData.append("file", new Blob([fileBuffer]), fileName)
  formData.append("model", model)
  formData.append("temperature", "0")
  formData.append("response_format", "verbose_json")
  // formData.append("language", "en") 

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => "")
    throw new Error(`Groq API error ${response.status}: ${errorText}`)
  }

  const json = await response.json() as { text?: string }
  return json.text ?? ""
}
