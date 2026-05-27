/*
 * [TAG: ARCHITECTURE] main.js — Entry point interaksi UI (Vanilla JS, ES Module)
 *
 * Legenda:
 *   [TAG: VANILLA-LOGIC]  Fungsi yang dijalankan di browser (DOM, event, scroll)
 *   [TAG: CONFIG]         Konstanta teks & state aplikasi
 *   [TAG: HELPER]         Utilitas internal (scroll, fokus chat)
 *
 * Alur boot: DOMContentLoaded → init() → semua init*()
 */

/* [TAG: CONFIG] Brand — satu sumber nama untuk seluruh UI */
const BRAND_NAME = "Escape Core";

/* [TAG: CONFIG] Class CSS untuk efek tekan tombol/link */
const PRESS_CLASS = "is-pressed";

/* [TAG: CONFIG] Offset scroll agar tidak tertutup header tetap */
const HEADER_SCROLL_OFFSET = 80;

/* [TAG: CONFIG] Rotasi teks status di area AI (elemen .status-ticker) */
const STATUS_MESSAGES = [
  `${BRAND_NAME} online — siap membantu Anda`,
  "Rata-rata balasan chat di bawah 1 menit",
  "Konsultasi pertama gratis",
  "Paket harga transparan · tanpa biaya tersembunyi",
];

/* [TAG: CONFIG] Cegah double-submit saat AI memproses */
let isChatBusy = false;

/* [TAG: CONFIG] Balasan simulasi AI — diganti API nyata via ai-agent.js nanti */
const AI_SIMULATED_REPLIES = [
  "Terima kasih sudah menghubungi kami! Ceritakan sedikit tentang bisnis Anda — misalnya jualan apa dan di kota mana — supaya kami bisa kasih saran yang pas.",
  "Untuk website sederhana (profil usaha + kontak + galeri), biasanya selesai sekitar 2–4 minggu. Harga menyesuaikan fitur yang Anda butuhkan.",
  "Kalau Anda punya toko atau warung, kami sarankan mulai dari halaman menu/produk dan nomor WhatsApp yang mudah diklik pelanggan.",
  "Langkah berikutnya: tim kami akan hubungi Anda untuk penawaran resmi. Boleh lanjut tulis pertanyaan lain di sini.",
];

/* [TAG: CONFIG] Indeks rotasi balasan simulasi */
let aiReplyIndex = 0;

/* ─────────────────────────────────────────────────────────────
 * [TAG: HELPER] Utilitas scroll & fokus chat
 * ───────────────────────────────────────────────────────────── */

// [TAG: HELPER] Scroll halus ke section dengan offset header
function scrollToTarget(selector, options = {}) {
  const target = document.querySelector(selector);
  if (!target) return false;

  const top =
    target.getBoundingClientRect().top + window.scrollY - HEADER_SCROLL_OFFSET;

  window.scrollTo({
    top: Math.max(0, top),
    behavior: "smooth",
    ...options,
  });
  return true;
}

// [TAG: HELPER] Fokus kursor ke input chat setelah scroll ke #ai-consultant
function focusChatInput(delayMs = 400) {
  const input = document.getElementById("userInput");
  if (!input) return;

  window.setTimeout(() => {
    input.focus();
  }, delayMs);
}

// [TAG: HELPER] Auto-scroll chatbox ke pesan terbaru
function scrollChatToBottom() {
  const chatBox = document.getElementById("chatBox");
  if (!chatBox) return;
  chatBox.scrollTop = chatBox.scrollHeight;
}

/* ─────────────────────────────────────────────────────────────
 * [TAG: VANILLA-LOGIC] Micro-interactions — feedback klik tombol/link
 * ───────────────────────────────────────────────────────────── */

// [TAG: VANILLA-LOGIC]
export function initMicroInteractions(root = document) {
  const interactive = root.querySelectorAll(
    'button, a, [role="button"][tabindex="0"]'
  );

  interactive.forEach((el) => {
    el.addEventListener("mousedown", () => {
      el.classList.add(PRESS_CLASS);
    });
    el.addEventListener("mouseup", () => {
      el.classList.remove(PRESS_CLASS);
    });
    el.addEventListener("mouseleave", () => {
      el.classList.remove(PRESS_CLASS);
    });
  });
}

/* ─────────────────────────────────────────────────────────────
 * [TAG: VANILLA-LOGIC] Status ticker — teks berganti di panel AI
 * ───────────────────────────────────────────────────────────── */

// [TAG: VANILLA-LOGIC]
export function initStatusTicker(intervalMs = 3000) {
  const statusEl = document.querySelector(".status-ticker");
  if (!statusEl) return;

  let index = 0;
  setInterval(() => {
    index = (index + 1) % STATUS_MESSAGES.length;
    statusEl.textContent = STATUS_MESSAGES[index];
  }, intervalMs);
}

/* ─────────────────────────────────────────────────────────────
 * [TAG: VANILLA-LOGIC] Smooth scroll — semua link anchor href="#..."
 * ───────────────────────────────────────────────────────────── */

// [TAG: VANILLA-LOGIC]
export function initSmoothScroll() {
  document.documentElement.style.scrollBehavior = "smooth";

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;

      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      scrollToTarget(hash);

      if (link.hasAttribute("data-focus-chat")) {
        focusChatInput();
      }

      closeMobileMenu();
      updateActiveNavLink(hash);
    });
  });
}

// [TAG: HELPER] Sorot link nav header yang sesuai section aktif
function updateActiveNavLink(hash) {
  const navLinks = document.querySelectorAll(".site-header__nav a[href^='#']");
  navLinks.forEach((link) => {
    const isMatch = link.getAttribute("href") === hash;
    link.classList.toggle("is-active", isMatch);
  });
}

/* ─────────────────────────────────────────────────────────────
 * [TAG: VANILLA-LOGIC] Menu mobile — hamburger #menu-toggle
 * ───────────────────────────────────────────────────────────── */

// [TAG: VANILLA-LOGIC]
export function initMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const drawer = document.getElementById("mobile-menu");
  const overlay = document.getElementById("menu-overlay");

  if (!toggle || !drawer || !overlay) return;

  const openMenu = () => {
    drawer.classList.add("is-open");
    overlay.hidden = false;
    overlay.setAttribute("aria-hidden", "false");
    overlay.classList.add("is-visible");
    document.body.classList.add("menu-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.querySelector(".material-symbols-outlined").textContent = "close";
  };

  const closeMenu = () => {
    drawer.classList.remove("is-open");
    overlay.classList.remove("is-visible");
    document.body.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.querySelector(".material-symbols-outlined").textContent = "menu";

    window.setTimeout(() => {
      if (!drawer.classList.contains("is-open")) {
        overlay.hidden = true;
        overlay.setAttribute("aria-hidden", "true");
      }
    }, 300);
  };

  window.closeMobileMenu = closeMenu;

  toggle.addEventListener("click", () => {
    if (drawer.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  overlay.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && drawer.classList.contains("is-open")) {
      closeMenu();
    }
  });
}

// [TAG: HELPER] Dipanggil dari smooth scroll agar drawer tertutup
function closeMobileMenu() {
  if (typeof window.closeMobileMenu === "function") {
    window.closeMobileMenu();
  }
}

/* ─────────────────────────────────────────────────────────────
 * [TAG: VANILLA-LOGIC] Tombol CTA — atribut data-scroll-target
 * Hero, pricing, paket: scroll + prefill + focus #userInput
 * ───────────────────────────────────────────────────────────── */

// [TAG: VANILLA-LOGIC]
export function initCtaScrollTargets() {
  const triggers = document.querySelectorAll("[data-scroll-target]");

  triggers.forEach((el) => {
    const handler = (event) => {
      const target = el.getAttribute("data-scroll-target");
      if (!target) return;

      if (el.tagName === "A") return;

      event.preventDefault();
      scrollToTarget(target);

      const prefill = el.getAttribute("data-chat-prefill");
      if (prefill) {
        const input = document.getElementById("userInput");
        if (input) input.value = prefill;
      }

      if (el.hasAttribute("data-focus-chat") || target === "#ai-consultant") {
        focusChatInput();
      }

      closeMobileMenu();
    };

    el.addEventListener("click", handler);

    if (el.getAttribute("role") === "button") {
      el.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handler(event);
        }
      });
    }
  });
}

/* ─────────────────────────────────────────────────────────────
 * [TAG: VANILLA-LOGIC] Tombol pintasan AI — data-ai-action (opsional)
 * ───────────────────────────────────────────────────────────── */

// [TAG: VANILLA-LOGIC]
export function initAiConsultantTriggers() {
  document.querySelectorAll("[data-ai-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const prefill = btn.getAttribute("data-chat-prefill");
      if (prefill) {
        const input = document.getElementById("userInput");
        if (input) input.value = prefill;
      }
      scrollToTarget("#ai-consultant");
      focusChatInput();
    });
  });
}

/* ─────────────────────────────────────────────────────────────
 * [TAG: VANILLA-LOGIC] Chatbox — #sendBtn, #userInput, #chatBox
 * Validasi → bubble user → loading → simulasi jawaban AI
 * ───────────────────────────────────────────────────────────── */

// [TAG: VANILLA-LOGIC] Membuat elemen bubble pesan di DOM
function createChatBubble(text, variant) {
  const bubble = document.createElement("div");
  bubble.className = `chat-message chat-message--${variant}`;
  bubble.textContent = text;
  return bubble;
}

// [TAG: VANILLA-LOGIC] Indikator "AI sedang menganalisis..."
function showTypingIndicator() {
  const chatBox = document.getElementById("chatBox");
  if (!chatBox) return null;

  const typing = createChatBubble("AI sedang menganalisis...", "typing");
  typing.setAttribute("data-typing", "true");
  chatBox.appendChild(typing);
  scrollChatToBottom();
  return typing;
}

// [TAG: VANILLA-LOGIC] Hapus indikator loading sebelum tampilkan jawaban
function removeTypingIndicator() {
  const typing = document.querySelector("#chatBox [data-typing='true']");
  if (typing) typing.remove();
}

// [TAG: VANILLA-LOGIC] Rule-based keyword matching chatbot for offline simulation (excellent for learning)
function simulateAiResponse(userQuery) {
  return new Promise((resolve) => {
    const query = userQuery.toLowerCase();
    let reply = "";

    if (query.includes("harga") || query.includes("biaya") || query.includes("paket") || query.includes("bayar")) {
      reply = "Kami memiliki 3 paket utama: Paket Landing Page (Rp 2,5 jt), Paket Company Profile (Rp 5 jt), dan Paket Custom E-Commerce (Rp 12 jt+). Anda bisa melihat detailnya di bagian 'Harga' di atas.";
    } else if (query.includes("lama") || query.includes("waktu") || query.includes("durasi") || query.includes("hari") || query.includes("minggu")) {
      reply = "Untuk Landing Page pengerjaannya sekitar 3-7 hari. Company Profile dinamis memakan waktu 1-2 minggu, dan E-Commerce/Custom Web Apps memakan waktu 2-4 minggu atau lebih tergantung kompleksitas.";
    } else if (query.includes("portfolio") || query.includes("portofolio") || query.includes("contoh") || query.includes("karya")) {
      reply = "Kami telah mengerjakan beberapa jenis web seperti website UMKM (Kopi Nusantara), website korporat (Solusi Digital Indonesia), dan e-commerce (Fashion Hub Store). Cek bagian 'Portofolio' untuk melihat demonya.";
    } else if (query.includes("hosting") || query.includes("domain") || query.includes("server")) {
      reply = "Semua paket website yang kami buat sudah termasuk gratis domain (.com atau .id) dan cloud hosting berkecepatan tinggi untuk tahun pertama.";
    } else if (query.includes("booking") || query.includes("reservasi") || query.includes("jadwal") || query.includes("konsultasi")) {
      reply = "Untuk menjadwalkan konsultasi atau reservasi, Anda bisa menekan tombol 'Hubungi Tim Developer via WhatsApp' di footer atau langsung mengisi form pemesanan resmi kami.";
    } else {
      // Fallback to rotation of standard tips
      reply = AI_SIMULATED_REPLIES[aiReplyIndex % AI_SIMULATED_REPLIES.length];
      aiReplyIndex += 1;
    }

    window.setTimeout(() => {
      resolve(reply);
    }, 1200);
  });
}

// [TAG: HELPER] Aktif/nonaktif form chat saat AI memproses
function setChatBusy(busy) {
  isChatBusy = busy;
  const input = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  if (input) input.disabled = busy;
  if (sendBtn) {
    sendBtn.disabled = busy;
    sendBtn.setAttribute("aria-busy", busy ? "true" : "false");
  }
}

// [TAG: VANILLA-LOGIC] Alur kirim pesan: validasi → user bubble → AI reply
async function handleSendMessage() {
  const input = document.getElementById("userInput");
  const chatBox = document.getElementById("chatBox");
  if (!input || !chatBox || isChatBusy) return;

  const text = input.value.trim();
  if (!text) {
    input.focus();
    input.classList.add("chat-input--error");
    window.setTimeout(() => input.classList.remove("chat-input--error"), 600);
    return;
  }

  setChatBusy(true);
  chatBox.appendChild(createChatBubble(text, "user"));
  input.value = "";
  scrollChatToBottom();

  showTypingIndicator();

  try {
    const reply = await simulateAiResponse(text);
    removeTypingIndicator();
    chatBox.appendChild(createChatBubble(reply, "ai"));
  } catch {
    removeTypingIndicator();
    chatBox.appendChild(
      createChatBubble("Maaf, ada gangguan sementara. Silakan coba kirim pesan lagi.", "ai")
    );
  } finally {
    scrollChatToBottom();
    setChatBusy(false);
    input.focus();
  }
}

// [TAG: VANILLA-LOGIC] Pasang event Kirim + Enter pada input chat
export function initChatbox() {
  const sendBtn = document.getElementById("sendBtn");
  const userInput = document.getElementById("userInput");
  const chatBox = document.getElementById("chatBox");

  if (!sendBtn || !userInput || !chatBox) return;

  if (!chatBox.children.length) {
    chatBox.appendChild(
      createChatBubble(
        `Halo! Saya asisten digital ${BRAND_NAME}. Silakan tanya apa saja tentang pembuatan website — misalnya biaya, waktu pengerjaan, atau jenis website yang cocok untuk bisnis Anda.`,
        "ai"
      )
    );
  }

  sendBtn.addEventListener("click", () => {
    handleSendMessage();
  });

  userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  });
}

/* ─────────────────────────────────────────────────────────────
 * [TAG: VANILLA-LOGIC] FAQ accordion — section #faq
 * Klik pertanyaan → buka/tutup jawaban (satu terbuka)
 * ───────────────────────────────────────────────────────────── */

// [TAG: VANILLA-LOGIC]
export function initFaqAccordion() {
  const items = document.querySelectorAll(".faq-item");

  items.forEach((item) => {
    const trigger = item.querySelector(".faq-item__trigger");
    const content = item.querySelector(".faq-item__content");
    const icon = item.querySelector(".faq-item__icon");

    if (!trigger || !content) return;

    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      items.forEach((other) => {
        if (other === item) return;
        other.classList.remove("is-open");
        const otherTrigger = other.querySelector(".faq-item__trigger");
        const otherIcon = other.querySelector(".faq-item__icon");
        if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
        if (otherIcon) otherIcon.textContent = "expand_more";
      });

      if (isOpen) {
        item.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }

      if (icon) {
        icon.textContent = item.classList.contains("is-open") ? "expand_less" : "expand_more";
      }
    });
  });
}

/* ─────────────────────────────────────────────────────────────
 * [TAG: VANILLA-LOGIC] Boot — inisialisasi semua modul UI
 * ───────────────────────────────────────────────────────────── */

// [TAG: VANILLA-LOGIC] Active Nav Highlight on Scroll using IntersectionObserver (excellent performance)
export function initActiveNavOnScroll() {
  const sections = document.querySelectorAll("section[id], header[id], footer[id]");
  const navLinks = document.querySelectorAll(".site-header__nav a[href^='#']");
  const mobileLinks = document.querySelectorAll(".mobile-drawer__nav a[href^='#']");

  const observerOptions = {
    root: null,
    rootMargin: "-40% 0px -50% 0px", // Trigger when section occupies the active viewing area
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        
        // Update desktop links
        navLinks.forEach((link) => {
          const isMatch = link.getAttribute("href") === `#${id}`;
          link.classList.toggle("is-active", isMatch);
        });

        // Update mobile links
        mobileLinks.forEach((link) => {
          const isMatch = link.getAttribute("href") === `#${id}`;
          link.classList.toggle("mobile-drawer__link--active", isMatch);
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));
}

// [TAG: VANILLA-LOGIC]
function init() {
  initMicroInteractions();
  initStatusTicker();
  initSmoothScroll();
  initMobileMenu();
  initCtaScrollTargets();
  initAiConsultantTriggers();
  initChatbox();
  initFaqAccordion();
  initActiveNavOnScroll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
