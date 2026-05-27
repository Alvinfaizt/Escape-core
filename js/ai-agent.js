// [TAG: AI-CORE]

/**
 * [TAG: CONFIG] Default server endpoint configuration.
 * Change this path when deploying to a live server.
 */
const DEFAULT_ENDPOINT = "/api/ai/consult";

/**
 * [TAG: CONFIG] Timeout limit for the network request (ms)
 */
const DEFAULT_TIMEOUT_MS = 20000;

/**
 * [TAG: AI-CORE] sendPayloadToAI
 * Sends user message to the AI Consultant backend endpoint with system prompt instructions.
 * 
 * @param {string} userMessage - Message sent by the user
 * @param {string} [endpoint=DEFAULT_ENDPOINT] - Target URL endpoint
 * @returns {Promise<string>} AI response text
 */
export async function sendPayloadToAI(userMessage, endpoint = DEFAULT_ENDPOINT) {
  // [TAG: CONFIG] System Instruction / Role definition for the AI agent
  const AI_SYSTEM_PROMPT = `Anda adalah 'DevStudio AI Consultant', Senior IT Business Analyst dan Customer Service profesional dari agensi pembuatan website premium. 
Tugas Anda: Analisis bisnis user, tentukan jenis web (Statis/Dinamis/E-Commerce), sebutkan 3-4 fitur wajib, berikan estimasi waktu & harga industri yang logis (Landing Page 3-7 hari, Company Profile 1-2 minggu, E-Commerce 2-4 minggu), dan berikan penolakan halus jika di luar topik web. Jawab dengan struktur poin yang rapi dan bahasa Indonesia yang ramah.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: AI_SYSTEM_PROMPT,
        prompt: userMessage,
        context: "escape-core-landing",
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`AI Agent error ${response.status}: ${errorText || response.statusText}`);
    }

    const data = await response.json();
    
    // Support multiple common API response structures (universal parser)
    if (data.reply) return data.reply;
    if (data.text) return data.text;
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      return data.candidates[0].content.parts[0].text;
    }
    
    // Fallback if structure is simple string or alternative text field
    return data.message || data.response || JSON.stringify(data);

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Koneksi ke asisten AI terputus (Timeout). Silakan coba lagi.");
    }
    throw error;
  }
}
