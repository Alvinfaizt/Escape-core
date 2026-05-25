/* [TAG: AI-CORE] Async Fetch API — integrasi AI Agent (boilerplate) */

const DEFAULT_ENDPOINT = "/api/ai/consult";
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * @typedef {Object} ConsultPayload
 * @property {string} [action] - Mis. "analyze" | "estimate"
 * @property {string} [context] - Konteks halaman / sesi
 * @property {string} [prompt] - Pertanyaan pengguna
 */

/**
 * @typedef {Object} AgentOptions
 * @property {string} [endpoint]
 * @property {AbortSignal} [signal]
 * @property {Record<string, string>} [headers]
 */

/**
 * Kirim permintaan ke AI Agent backend.
 * Ganti `DEFAULT_ENDPOINT` dan body sesuai kontrak API Anda.
 *
 * @param {ConsultPayload} payload
 * @param {AgentOptions} [options]
 * @returns {Promise<unknown>}
 */
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

/**
 * Health check ringan — opsional sebelum membuka panel chat.
 * @param {AgentOptions} [options]
 */
export async function pingAgent(options = {}) {
  const { endpoint = DEFAULT_ENDPOINT, headers = {} } = options;
  const url = endpoint.replace(/\/consult\/?$/, "/health");

  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", ...headers },
  });

  return response.ok;
}
