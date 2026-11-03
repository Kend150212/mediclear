# MediClear — Understand any medical bill, in your language

Snap a photo of a medical bill, EOB, or insurance letter → plain-language explanation in your language (text + voice) → suspicious charges flagged → concrete next steps to lower the bill → a ready-to-send dispute/appeal letter draft → follow-up Q&A by text or voice, per case.

Built for the **Meta Global AI Developer Hackathon** (with Cerebral Valley).

**Live demo:** https://kend150212.github.io/mediclear/ (PWA — installable, works offline for the app shell)

## Why

Medical billing confusion is one of the top US consumer pain points. Immigrants, the elderly, and non-English speakers are hit hardest. MediClear is elderly-first: white, ultra-simple UI, minimum 18px text, 48px touch targets, max 3 steps per flow.

## Features

- **📷 Scan tab** — take a photo (or try a sample bill), pick from 13 languages, get a full analysis
- **Plain-language results** — summary, every line item explained, flagged charges (duplicates, upcoding, balance billing…), next steps (EOB check, itemized bill, prompt-pay discounts, financial assistance, appeals), dispute-letter draft with copy button
- **🔊 Voice** — hear the results read aloud in your language (Web Speech API — Meta has no TTS API)
- **🗂️ History tab** — every case saved on-device (IndexedDB): re-read analyses, replay voice re-synthesized from saved text
- **💬 Follow-up Q&A** — ask more about any case by text or voice mic
- **⚙️ Settings** — BYOK API key field (stored in localStorage, never leaves your device), mock mode for keyless testing, UI language, privacy info

## AI — 100% Meta Model API

Base URL `https://api.meta.ai/v1` (OpenAI-compatible). Bring your own key — paste it in Settings.

| Model | Used for |
|---|---|
| `muse-spark-1.3` | One structured-JSON call per bill: vision extraction + analysis + flags + next steps + dispute letter, in the user's language |
| `muse-spark-1.3` | Follow-up Q&A per case (bill JSON sent as context) |
| `muse-voice-transcribe-1.0` | Streaming speech-to-text for voice questions (70+ languages) |
| Web Speech API (browser) | Voice *output* — Meta offers no TTS |

No backend. No analytics. Bill photos are sent to the API for analysis only and are never stored server-side. History lives in IndexedDB on the device.

**Mock mode** (on by default): realistic fixtures + a mock-bill generator so QA, design, and the demo flow work with no API key. Flip it off in Settings and add your key for live AI.

## Run it locally

```bash
# any static server; e.g.
python3 -m http.server 8080
# open http://localhost:8080
```

No build step — vanilla HTML/CSS/JS.

## Project structure

```
index.html          app shell
manifest.json       PWA manifest
sw.js               offline app-shell cache
css/style.css       elderly-first styles
js/app.js           controller: capture → analyze → results → history → Q&A → voice
js/api.js           Meta Model API client
js/db.js            IndexedDB history store
js/i18n.js          UI strings, 13 languages
js/fixtures.js      mock bills, canned analyses, mock-bill generator
js/bill-art.js      canvas renderer for sample-bill images
icons/              PWA icons
```

## Privacy & legal

- Informational only — **not medical, legal, or financial advice**. Users must verify with their provider/insurer.
- Tip shown in-app: cover member ID / SSN / account numbers before photographing.
- Not a HIPAA covered entity; all bill data still treated as sensitive.
- Full Terms + Privacy consent on first launch (EN + VI).

## License

MIT — see [LICENSE](LICENSE).

## Documents beyond medical bills
MediClear auto-detects the document type (medical bill, insurance letter/EOB, contract, government letter, other) and adapts its explanation, flags, next steps, and letter draft to that type. The AI schema stays the same frame (`summary`, `items`, `flags`, `nextSteps`, `letter`) with semantics flexed per type (e.g. contracts → key clauses).

## PDF upload
The Scan tab accepts PDF uploads (limit 10 pages/file). PDF.js 3.4.120 is vendored locally at `js/vendor/pdfjs/` (Mozilla, Apache-2.0) so the PWA works fully offline — no CDN. Each page renders to an image and goes through the same vision pipeline as a photo. `assets/sample-eob.pdf` is a hand-made sample EOB (no PII) for testing the PDF flow in mock mode.
