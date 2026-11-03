/* MediClear — Meta Model API client (https://api.meta.ai/v1, OpenAI-compatible) */
(function () {
  "use strict";
  // Connection modes (Ken, 02/11/2026):
  //  - "auto" (default, recommended): app POSTs to the proxy below; no user key needed.
  //  - "byok": app calls Meta directly with the user's own key.
  // TODO: điều phối cấp URL thật sau khi deploy proxy trên Oracle — KHÔNG tự đoán URL.
  var PROXY_BASE_URL = "https://PROXY_URL_PLACEHOLDER";
  var META_BASE = "https://api.meta.ai/v1";
  var BASE = META_BASE;
  var CHAT_MODEL = "muse-spark-1.3";
  var STT_MODEL = "muse-voice-transcribe-1.0";

  function headers(apiKey, extra) {
    var h = {};
    // Auto (proxy) mode: no key — the proxy authenticates server-side.
    if (apiKey) h["Authorization"] = "Bearer " + apiKey;
    if (extra) for (var k in extra) h[k] = extra[k];
    return h;
  }

  // Live-test finding (2026-11-02): muse-spark-1.3 is a reasoning model and
  // reasoning tokens share the max_tokens budget — a 400-token budget returned
  // content:null. Always use reasoning_effort:"minimal" + a generous budget.
  async function fetchWithRetry(url, opts, retries) {
    var attempt = 0;
    for (;;) {
      try {
        var res = await fetch(url, opts);
        // Retry once on 5xx; never on 4xx (auth/validation errors won't heal).
        if (res.status >= 500 && attempt < retries) { attempt++; await wait(2000); continue; }
        return res;
      } catch (e) {
        // Network failure / timeout (flaky egress proxy): retry once.
        if (attempt < retries) { attempt++; await wait(2000); continue; }
        throw e;
      }
    }
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  async function chatCompletions(apiKey, body) {
    body.reasoning_effort = body.reasoning_effort || "minimal";
    var base = (window.MC_API && window.MC_API.connMode === "byok") ? META_BASE : PROXY_BASE_URL;
    var res = await fetchWithRetry(base + "/chat/completions", {
      method: "POST",
      headers: headers(apiKey, { "Content-Type": "application/json" }),
      body: JSON.stringify(body)
    }, 1);
    if (!res.ok) {
      var t = "";
      try { t = await res.text(); } catch (e) {}
      var err = new Error("API error " + res.status + ": " + t.slice(0, 300));
      err.status = res.status;
      throw err;
    }
    var data = await res.json();
    return data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content : "";
  }

  function extractJson(text) {
    text = (text || "").trim();
    // Strip markdown fences if present
    var m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (m) text = m[1].trim();
    // Find outermost JSON object
    var start = text.indexOf("{");
    var end = text.lastIndexOf("}");
    if (start >= 0 && end > start) text = text.slice(start, end + 1);
    return JSON.parse(text);
  }

  function analyzeSystemPrompt(langName) {
    return [
      "You are MediClear, a document explainer for ordinary people, including elderly and non-native English speakers.",
      "You receive photo(s) of a DOCUMENT. It may be a US medical bill, an EOB / insurance letter, a contract or agreement, a government letter, or another document. Medical bills are the most common case, but explain ANY document type well.",
      "First identify the document type. Then respond with ONLY a valid JSON object — no markdown, no commentary. All text values in " + langName + ".",
      "Write in plain, warm, simple language (8th-grade reading level). Short sentences. No jargon; if you must use a term like CPT or deductible, explain it in one short clause.",
      "JSON schema (use exactly these keys):",
      "{",
      '  "documentType": "medical_bill | insurance_letter | contract | government_letter | other",',
      '  "provider": "issuer name (hospital, insurer, company, agency)",',
      '  "billDate": "YYYY-MM-DD or best guess",',
      '  "currency": "USD",',
      '  "patientOwes": 123.45,   // amount the reader is asked to pay, if any; else 0',
      '  "summary": "2-4 sentence plain-language overview: what this document is and the bottom line",',
      '  "lineItems": [...],   // medical bill: charges; insurance letter: key decisions/amounts; contract: key clauses/terms; government letter: key requests or deadlines',
      '  "flags": [{"severity":"high|medium|low","title":"short","detail":"1-2 plain sentences: why it matters"}],',
      '  "nextSteps": ["concrete action 1", "..."],',
      '  "letter": {"subject":"...","body":"full draft reply/dispute/appeal letter with [Name], [Date], [Account] placeholders"},',
      '  "language": "' + langName + '"',
      "}",
      'lineItems entries: {"description":"...","cpt":"code or empty","date":"YYYY-MM-DD or empty","charge":0.0,"adjustment":0.0,"explanation":"one plain sentence","suspicious":false,"suspicionReason":""}',
      "Flags by type: (medical bill) duplicate line items, wrong/upcoded CPT codes, services possibly not received, excessive facility fees, balance billing that may violate the No Surprises Act; (insurance letter/EOB) denied claims, surprising patient responsibility, appeal deadlines; (contract) unusual fees, auto-renewal, arbitration/waiver clauses, penalties — explain each in plain words; (government letter) deadlines, required actions, missing information.",
      "nextSteps must be practical for THIS document type: (bill) wait for the EOB before paying; compare bill vs EOB; request an itemized bill; question duplicates/wrong codes; ask about prompt-pay cash discounts (often 20-40%); ask about financial assistance / charity care; interest-free payment plans; appeal insurance denials; never put an unverified bill on a credit card; (insurance) appeal deadlines and how to appeal; (contract) questions to ask before signing, get promises in writing; (government) what to do by when and where to get help.",
      "The letter draft should fit the strongest flag (dispute, appeal, or response letter). If no letter makes sense for this document, use empty strings.",
      "End-user safety: this is INFORMATIONAL ONLY, not medical, legal, or financial advice.",
      "If the images are not a readable document at all, return the same JSON shape with documentType 'other', summary explaining that, empty lineItems, and one low-severity flag noting it."
    ].join("\n");
  }

  async function analyzeBill(opts) {
    var urls = opts.imageDataUrls && opts.imageDataUrls.length ? opts.imageDataUrls : [opts.imageDataUrl];
    var parts = [{ type: "text", text: "Analyze this document (all pages shown in order). Return ONLY the JSON object." }];
    urls.forEach(function (u) { parts.push({ type: "image_url", image_url: { url: u } }); });
    var content = await chatCompletions(opts.apiKey, {
      model: CHAT_MODEL,
      reasoning_effort: "minimal",
      response_format: { type: "json_object" },
      max_completion_tokens: 6000,
      messages: [
        { role: "system", content: analyzeSystemPrompt(opts.langName) },
        { role: "user", content: parts }
      ]
    });
    var parsed = extractJson(content);
    parsed.language = opts.langCode;
    return parsed;
  }

  function qaSystemPrompt(langName) {
    return [
      "You are MediClear, a friendly document explainer. The user has a document already analyzed (JSON context below — it may be a medical bill, insurance letter, contract, or government letter).",
      "Answer their follow-up questions in " + langName + ", in plain warm simple language (8th-grade level), short sentences.",
      "Be concrete and practical. You may refer to the analysis's items, flags, and next steps.",
      "INFORMATIONAL ONLY — not medical, legal, or financial advice. Never invent numbers not in the document; if unsure, say so and suggest verifying with the issuer.",
      "Keep answers under 150 words unless the question needs more."
    ].join("\n");
  }

  async function askFollowUp(opts) {
    var msgs = [{ role: "system", content: qaSystemPrompt(opts.langName) }];
    msgs.push({ role: "user", content: "Bill analysis JSON:\n" + JSON.stringify(opts.billJson).slice(0, 12000) });
    (opts.history || []).forEach(function (m) {
      msgs.push({ role: m.role === "bot" ? "assistant" : "user", content: m.text });
    });
    msgs.push({ role: "user", content: opts.question });
    return chatCompletions(opts.apiKey, {
      model: CHAT_MODEL,
      reasoning_effort: "minimal",
      max_completion_tokens: 2000,
      messages: msgs
    });
  }

  // Speech-to-text via Meta Muse Voice Transcribe model.
  // NOTE: proxy covers chat completions only — STT always goes direct (BYOK mode).
  // In auto mode the app uses the browser's built-in speech recognition instead.
  async function transcribe(opts) {
    var fd = new FormData();
    fd.append("file", opts.audioBlob, "question.webm");
    fd.append("model", STT_MODEL);
    if (opts.langCode) fd.append("language", opts.langCode.split("-")[0]);
    var res = await fetchWithRetry(META_BASE + "/audio/transcriptions", {
      method: "POST",
      headers: headers(opts.apiKey),
      body: fd
    }, 1);
    if (!res.ok) {
      var t = "";
      try { t = await res.text(); } catch (e) {}
      var err = new Error("STT error " + res.status + ": " + t.slice(0, 200));
      err.status = res.status;
      throw err;
    }
    var data = await res.json();
    return data.text || "";
  }

  window.MC_API = {
    connMode: "auto", // "auto" | "byok" — set by app.js from user settings
    PROXY_BASE_URL: PROXY_BASE_URL,
    META_BASE: META_BASE,
    analyzeBill: analyzeBill,
    askFollowUp: askFollowUp,
    transcribe: transcribe,
    CHAT_MODEL: CHAT_MODEL,
    STT_MODEL: STT_MODEL
  };
})();
