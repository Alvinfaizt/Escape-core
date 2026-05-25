/*
 * [TAG: ARCHITECTURE] ai-agent.js — Integrasi API AI (Fetch, async/await)
 *
 * Legenda:
 *   [TAG: AI-CORE]     Fungsi komunikasi ke backend AI
 *   [TAG: CONFIG]      Endpoint, timeout, tipe data payload
 *
 * Digunakan nanti oleh main.js menggantikan simulateAiResponse()
 * Saat ini chat masih simulasi setTimeout di main.js
 */

/* [TAG: CONFIG] URL default backend — sesuaikan saat deploy */
const DEFAULT_ENDPOINT = "/api/ai/consult";

/* [TAG: CONFIG] Batas waktu tunggu respons (ms) */
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * [TAG: CONFIG] Bentuk data yang dikirim ke server
 * @typedef {Object} ConsultPayload
 * @property {string} [action] - Mis. "analyze" | "estimate"
 * @property {string} [context] - Konteks halaman / sesi
 * @property {string} [prompt] - Pertanyaan pengguna dari #userInput
 */

/**
 * [TAG: CONFIG] Opsi override per panggilan
 * @typedef {Object} AgentOptions
 * @property {string} [endpoint]
 * @property {AbortSignal} [signal]
 * @property {Record<string, string>} [headers]
 */

/* ─────────────────────────────────────────────────────────────
 * [TAG: AI-CORE] consultAgent — POST JSON ke endpoint konsultasi
 * ───────────────────────────────────────────────────────────── */

// [TAG: AI-CORE]
export async function consultAgent(payload = {}, options = {}) {
  const { endpoint = DEFAULT_ENDPOINT, signal, headers = {} } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  const mergedSignal = signal ?? controller.signal;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
      body: JSON.stringify({
        action: payload.action ?? "analyze",
        context: payload.context ?? "syntax-core-landing",
        prompt: payload.prompt ?? "",
        timestamp: new Date().toISOString(),
      }),
      signal: mergedSignal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(
        `AI Agent error ${response.status}: ${errorBody || response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("AI Agent request timed out or was aborted.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/* ─────────────────────────────────────────────────────────────
 * [TAG: AI-CORE] pingAgent — cek ketersediaan API sebelum chat
 * ───────────────────────────────────────────────────────────── */

// [TAG: AI-CORE]
export async function pingAgent(options = {}) {
  const { endpoint = DEFAULT_ENDPOINT, headers = {} } = options;
  const url = endpoint.replace(/\/consult\/?$/, "/health");

  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", ...headers },
  });

  return response.ok;
}
