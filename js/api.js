/* MediClear — Meta Model API client (https://api.meta.ai/v1, OpenAI-compatible) */
(function () {
  "use strict";
  var BASE = "https://api.meta.ai/v1";
  var CHAT_MODEL = "muse-spark-1.3";
  var STT_MODEL = "muse-voice-transcribe-1.0";

  function headers(apiKey, extra) {
    var h = { "Authorization": "Bearer " + apiKey };
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
    var res = await fetchWithRetry(BASE + "/chat/completions", {
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
      "You are MediClear, a medical-bill explainer for ordinary people, including elderly and non-native English speakers.",
      "You receive ONE photo of a US medical bill, EOB, or insurance letter.",
      "Respond with ONLY a valid JSON object — no markdown, no commentary. All text values in " + langName + ".",
      "Write in plain, warm, simple language (8th-grade reading level). Short sentences. No jargon; if you must use a term like CPT or deductible, explain it in one short clause.",
      "JSON schema (use exactly these keys):",
      "{",
      '  "provider": "hospital/clinic name",',
      '  "billDate": "YYYY-MM-DD or best guess",',
      '  "currency": "USD",',
      '  "patientOwes": 123.45,',
      '  "summary": "2-4 sentence plain-language overview: what this bill is for and the bottom line",',
      '  "lineItems": [{"description":"...","cpt":"code or empty","date":"YYYY-MM-DD","charge":0.0,"adjustment":0.0,"explanation":"one plain sentence: what this charge means and whether it looks normal","suspicious":false,"suspicionReason":"plain reason or empty"}],',
      '  "flags": [{"severity":"high|medium|low","title":"short","detail":"1-2 plain sentences: why it matters"}],',
      '  "nextSteps": ["concrete action 1", "..."],',
      '  "letter": {"subject":"...","body":"full dispute/appeal letter draft with [Name], [Date], [Account] placeholders"},',
      '  "language": "' + langName + '"',
      "}",
      "Flag suspicious charges: duplicate line items, wrong or upcoded CPT codes, services the patient may not have received, facility fees that look excessive, balance billing that may violate the No Surprises Act.",
      "nextSteps must be practical: wait for the EOB before paying; compare bill vs EOB; request an itemized bill; question duplicates/wrong codes; ask about prompt-pay cash discounts (often 20-40%); ask about financial assistance / charity care; interest-free payment plans; appeal insurance denials; never put an unverified bill on a credit card.",
      "The letter draft should match the strongest flag (duplicate charge, balance billing, or denial appeal).",
      "End-user safety: this is INFORMATIONAL ONLY, not medical, legal, or financial advice.",
      "If the image is not a medical bill at all, return the same JSON shape with summary explaining that, empty lineItems, and one low-severity flag noting it."
    ].join("\n");
  }

  async function analyzeBill(opts) {
    var content = await chatCompletions(opts.apiKey, {
      model: CHAT_MODEL,
      reasoning_effort: "minimal",
      response_format: { type: "json_object" },
      max_completion_tokens: 6000,
      messages: [
        { role: "system", content: analyzeSystemPrompt(opts.langName) },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this medical bill photo. Return ONLY the JSON object." },
            { type: "image_url", image_url: { url: opts.imageDataUrl } }
          ]
        }
      ]
    });
    var parsed = extractJson(content);
    parsed.language = opts.langCode;
    return parsed;
  }

  function qaSystemPrompt(langName) {
    return [
      "You are MediClear, a friendly medical-bill explainer. The user has a bill already analyzed (JSON context below).",
      "Answer their follow-up questions in " + langName + ", in plain warm simple language (8th-grade level), short sentences.",
      "Be concrete and practical. You may refer to the bill's line items, flags, and next steps.",
      "INFORMATIONAL ONLY — not medical, legal, or financial advice. Never invent numbers not in the bill; if unsure, say so and suggest verifying with the provider or insurer.",
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
  // Tries the OpenAI-compatible audio endpoint; throws on failure so the
  // caller can fall back to the browser's built-in speech recognition.
  async function transcribe(opts) {
    var fd = new FormData();
    fd.append("file", opts.audioBlob, "question.webm");
    fd.append("model", STT_MODEL);
    if (opts.langCode) fd.append("language", opts.langCode.split("-")[0]);
    var res = await fetchWithRetry(BASE + "/audio/transcriptions", {
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
    analyzeBill: analyzeBill,
    askFollowUp: askFollowUp,
    transcribe: transcribe,
    CHAT_MODEL: CHAT_MODEL,
    STT_MODEL: STT_MODEL
  };
})();
