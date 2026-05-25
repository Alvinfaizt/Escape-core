/* [TAG: VANILLA-LOGIC] Entry point — UI interactions & DOM */

const PRESS_CLASS = "is-pressed";

const STATUS_MESSAGES = [
  "Layanan online — siap membantu Anda",
  "Rata-rata balasan chat di bawah 1 menit",
  "Konsultasi pertama gratis",
  "Sudah membantu banyak UMKM & bisnis lokal",
];

const AI_SIMULATED_REPLIES = [
  "Terima kasih sudah menghubungi kami! Ceritakan sedikit tentang bisnis Anda — misalnya jualan apa dan di kota mana — supaya kami bisa kasih saran yang pas.",
  "Untuk website sederhana (profil usaha + kontak + galeri), biasanya selesai sekitar 2–4 minggu. Harga menyesuaikan fitur yang Anda butuhkan.",
  "Kalau Anda punya toko atau warung, kami sarankan mulai dari halaman menu/produk dan nomor WhatsApp yang mudah diklik pelanggan.",
  "Langkah berikutnya: tim kami akan hubungi Anda untuk penawaran resmi. Boleh lanjut tulis pertanyaan lain di sini.",
];

let aiReplyIndex = 0;

// —— Shared helpers ——

/**
 * Scroll ke elemen target dengan smooth behavior native.
 * @param {string} selector
 * @param {ScrollIntoViewOptions} [options]
 */
function scrollToTarget(selector, options = {}) {
  const target = document.querySelector(selector);
  if (!target) return false;

  target.scrollIntoView({
    behavior: "smooth",
    block: "start",
    ...options,
  });
  return true;
}

/**
 * Fokus ke input chat setelah scroll selesai.
 */
function focusChatInput(delayMs = 400) {
  const input = document.getElementById("userInput");
  if (!input) return;

  window.setTimeout(() => {
    input.focus();
  }, delayMs);
}

/**
 * Gulir chatbox ke pesan terbaru.
 */
function scrollChatToBottom() {
  const chatBox = document.getElementById("chatBox");
  if (!chatBox) return;
  chatBox.scrollTop = chatBox.scrollHeight;
}

// —— 1. Micro-interactions ——

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

// —— 2. Smooth scroll & anchor navigation ——

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

/**
 * Sorot link nav desktop yang sesuai hash aktif.
 * @param {string} hash
 */
function updateActiveNavLink(hash) {
  const navLinks = document.querySelectorAll(".site-header__nav a[href^='#']");
  navLinks.forEach((link) => {
    const isMatch = link.getAttribute("href") === hash;
    link.classList.toggle("is-active", isMatch);
  });
}

// —— 3. Mobile menu ——

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

function closeMobileMenu() {
  if (typeof window.closeMobileMenu === "function") {
    window.closeMobileMenu();
  }
}

// —— 4. CTA & scroll-to-AI ——

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

// —— 5. AI Consultant quick actions ——

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

// —— 6. Chatbox ——

// [TAG: VANILLA-LOGIC]
function createChatBubble(text, variant) {
  const bubble = document.createElement("div");
  bubble.className = `chat-message chat-message--${variant}`;
  bubble.textContent = text;
  return bubble;
}

// [TAG: VANILLA-LOGIC]
function showTypingIndicator() {
  const chatBox = document.getElementById("chatBox");
  if (!chatBox) return null;

  const typing = createChatBubble("AI sedang menganalisis...", "typing");
  typing.setAttribute("data-typing", "true");
  chatBox.appendChild(typing);
  scrollChatToBottom();
  return typing;
}

// [TAG: VANILLA-LOGIC]
function removeTypingIndicator() {
  const typing = document.querySelector("#chatBox [data-typing='true']");
  if (typing) typing.remove();
}

// [TAG: VANILLA-LOGIC]
function simulateAiResponse() {
  return new Promise((resolve) => {
    const reply = AI_SIMULATED_REPLIES[aiReplyIndex % AI_SIMULATED_REPLIES.length];
    aiReplyIndex += 1;

    window.setTimeout(() => {
      resolve(reply);
    }, 1500);
  });
}

// [TAG: VANILLA-LOGIC]
async function handleSendMessage() {
  const input = document.getElementById("userInput");
  const chatBox = document.getElementById("chatBox");
  if (!input || !chatBox) return;

  const text = input.value.trim();
  if (!text) return;

  chatBox.appendChild(createChatBubble(text, "user"));
  input.value = "";
  scrollChatToBottom();

  const typingEl = showTypingIndicator();

  try {
    const reply = await simulateAiResponse();
    removeTypingIndicator();
    chatBox.appendChild(createChatBubble(reply, "ai"));
  } catch {
    removeTypingIndicator();
    chatBox.appendChild(
      createChatBubble("Maaf, ada gangguan sementara. Silakan coba kirim pesan lagi.", "ai")
    );
  } finally {
    scrollChatToBottom();
  }
}

// [TAG: VANILLA-LOGIC]
export function initChatbox() {
  const sendBtn = document.getElementById("sendBtn");
  const userInput = document.getElementById("userInput");
  const chatBox = document.getElementById("chatBox");

  if (!sendBtn || !userInput || !chatBox) return;

  if (!chatBox.children.length) {
    chatBox.appendChild(
      createChatBubble(
        "Halo! Saya asisten digital Syntax Core. Silakan tanya apa saja tentang pembuatan website — misalnya biaya, waktu pengerjaan, atau jenis website yang cocok untuk bisnis Anda.",
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

// —— 7. FAQ Accordion ——

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

// —— Boot ——

function init() {
  initMicroInteractions();
  initStatusTicker();
  initSmoothScroll();
  initMobileMenu();
  initCtaScrollTargets();
  initAiConsultantTriggers();
  initChatbox();
  initFaqAccordion();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
