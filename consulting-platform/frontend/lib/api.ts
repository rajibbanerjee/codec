import { BACKEND_URL } from "./utils"

export async function interpretScript(userText: string) {
  const res = await fetch(`${BACKEND_URL}/api/interpret-script`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_text: userText }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function calculateChannels(payload: unknown) {
  const res = await fetch(`${BACKEND_URL}/api/calculate-channel-decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(JSON.stringify(err.detail || err))
  }
  return res.json()
}

export async function generateReport(payload: unknown) {
  const res = await fetch(`${BACKEND_URL}/api/generate-report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export function getReportDownloadUrl(filename: string) {
  return `${BACKEND_URL}/api/download-report/${filename}`
}

export async function getHelp() {
  const res = await fetch(`${BACKEND_URL}/api/help/short-run-decision`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
