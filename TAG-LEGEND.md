# Legenda Tag Komentar Proyek

<!-- [TAG: ARCHITECTURE] -->

Gunakan tag ini untuk mencari bagian kode di editor (Ctrl+F).

| Tag | File | Fungsi |
|-----|------|--------|
| `[TAG: ARCHITECTURE]` | Semua | Penjelasan struktur file / folder |
| `[TAG: HTML-HEAD]` | index.html | Meta, title, font, CSS |
| `[TAG: NAVIGATION]` | index.html | Header, menu mobile, overlay |
| `[TAG: SECTION-*]` | index.html | Blok konten di `<main>` |
| `[TAG: FOOTER]` | index.html | Footer & sosial media |
| `[TAG: SCRIPT-LOAD]` | index.html | Muat `main.js` |
| `[TAG: DESIGN-SYSTEM]` | style.css, index.html | Tampilan visual & komponen UI |
| `[TAG: RESPONSIVE]` | style.css | Media query mobile/desktop |
| `[TAG: VANILLA-LOGIC]` | main.js | Interaksi UI (klik, scroll, chat, FAQ) |
| `[TAG: CONFIG]` | main.js, ai-agent.js | Konstanta & pengaturan |
| `[TAG: HELPER]` | main.js | Fungsi bantu internal |
| `[TAG: AI-CORE]` | ai-agent.js | Fetch API ke backend AI |

## Pemetaan Section HTML → ID

| Tag HTML | ID | File JS terkait |
|----------|-----|-----------------|
| `SECTION-HERO` | `#hero` | `initCtaScrollTargets` |
| `SECTION-VALUE-PROPS` | `#value-props` | `initSmoothScroll` |
| `SECTION-PORTFOLIO` | `#portfolio` | `initSmoothScroll` |
| `SECTION-PRICING` | `#pricing` | `initCtaScrollTargets` |
| `SECTION-AI-CONSULTANT` | `#ai-consultant` | `initChatbox`, `initCtaScrollTargets` |
| `SECTION-FAQ` | `#faq` | `initFaqAccordion` |
| `SECTION-CTA` | — | `initCtaScrollTargets` |
