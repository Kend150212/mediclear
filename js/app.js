/* MediClear — main app controller (vanilla JS, no build step) */
(function () {
  "use strict";

  var MC_LANGS = [
    { code: "en", name: "English", speech: "en-US", dir: "ltr" },
    { code: "es", name: "Español", speech: "es-ES", dir: "ltr" },
    { code: "zh", name: "中文 (简体)", speech: "zh-CN", dir: "ltr" },
    { code: "vi", name: "Tiếng Việt", speech: "vi-VN", dir: "ltr" },
    { code: "ko", name: "한국어", speech: "ko-KR", dir: "ltr" },
    { code: "tl", name: "Tagalog", speech: "fil-PH", dir: "ltr" },
    { code: "ar", name: "العربية", speech: "ar-SA", dir: "rtl" },
    { code: "ru", name: "Русский", speech: "ru-RU", dir: "ltr" },
    { code: "fr", name: "Français", speech: "fr-FR", dir: "ltr" },
    { code: "ht", name: "Kreyòl Ayisyen", speech: "fr-FR", dir: "ltr" },
    { code: "pt", name: "Português", speech: "pt-BR", dir: "ltr" },
    { code: "pl", name: "Polski", speech: "pl-PL", dir: "ltr" },
    { code: "ja", name: "日本語", speech: "ja-JP", dir: "ltr" }
  ];

  var S = {
    uiLang: "en",
    billLang: "en",
    apiKey: "",
    mockMode: true,
    connMode: "auto", // "auto" (proxy, recommended) | "byok" (direct Meta with own key)
    imageDataUrl: null,
    imageDataUrls: null, // all pages (photo = 1 page, PDF = N pages); imageDataUrl is page 1 for preview/history
    billData: null,
    analysis: null,
    caseId: null,
    qa: [],
    mockQaIdx: 0,
    speaking: false,
    letterLang: (function () { try { return localStorage.getItem("mc_letterLang") || "en"; } catch (e) { return "en"; } })(),
    letterCache: {} // per-analysis {langCode: {subject, body}}
  };

  // TODO: coordinator cung cấp URL lấy key Meta — KHÔNG tự đoán URL.
  // Khi có URL thật, điền vào đây thì nút "Lấy key miễn phí" sẽ mở tab mới.
  var META_KEY_URL = "";

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }
  function money(n) {
    var v = Number(n);
    if (!isFinite(v)) return "—";
    return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // ---------- i18n ----------
  function langMeta(code) {
    for (var i = 0; i < MC_LANGS.length; i++) if (MC_LANGS[i].code === code) return MC_LANGS[i];
    return MC_LANGS[0];
  }
  function s(key) {
    var L = (window.MC_STRINGS || {}).en || {};
    var U = (window.MC_STRINGS || {})[S.uiLang] || {};
    return U[key] || L[key] || key;
  }

  function applyStrings() {
    var meta = langMeta(S.uiLang);
    document.documentElement.lang = S.uiLang;
    document.documentElement.dir = meta.dir || "ltr";
    var map = {
      appTitle: "appName", appTagline: "tagline",
      consentTitle: "consentTitle", consentBody: "consentP1", consentP2: "consentP2",
      btnAgree: "btnAgree", btnDecline: "btnDecline",
      scanTitle: "scanTitle", scanSubtitle: "scanSubtitle", cameraHint: "cameraHint", privacyTip: "privacyTip",
      btnUpload: "btnUpload", btnPdf: "btnPdf", btnSample: "btnSample", btnSamplePdf: "btnSamplePdf",
      sampleNote: "sampleNote", btnRetake: "btnRetake",
      analyzingTitle: "analyzingMsg", analyzingNote: "analyzingNote",
      letterLangLabel: "letterLang",
      langLabel: "langLabel", btnAnalyze: "btnAnalyze", btnRetry: "btnRetry",
      resTitle: "resTitle", resSummaryH: "resSummary", resItemsH: "resItems",
      resFlagsH: "resFlags", resNextH: "resNextSteps", resLetterH: "resLetter",
      btnPlayVoice: "btnPlayVoice", btnAskMore: "btnAskMore", btnNewScan: "btnNewScan",
      savedNote: "savedNote",
      letterFrom: "letterFrom", btnCopyLetter: "btnCopy",
      qaTitle: "qaTitle", btnQaSend: "btnSend", micHint: "micHint",
      histTitle: "histTitle", btnHistCta: "histEmptyCta",
      btnReplayVoice: "btnReplayVoice", btnDetailAsk: "btnAskMore",
      btnDeleteCase: "btnDelete", confirmDeleteTitle: "confirmDeleteTitle",
      confirmDeleteBody: "confirmDeleteBody", btnKeep: "btnKeep", btnConfirmDelete: "btnConfirmDelete",
      setTitle: "setTitle", setApiKeyH: "setApiKey", setApiKeyHint: "setApiKeyHint",
      btnSaveKey: "btnSaveKey", setMockH: "setMockMode", mockDesc: "mockDesc",
      setGetKeyTitle: "setGetKeyTitle", setGetKeyBody: "setGetKeyBody", btnGetKey: "btnGetKey",
      setGetKeyStep1: "setGetKeyStep1", setGetKeyStep2: "setGetKeyStep2", setGetKeyStep3: "setGetKeyStep3",
      setConnTitle: "setConnTitle", setConnAuto: "setConnAuto", setConnAutoDesc: "setConnAutoDesc",
      setConnByok: "setConnByok", setConnByokDesc: "setConnByokDesc",
      setUiLangH: "setUiLang", setPrivacyH: "setPrivacyTitle", privacyBody: "privacyBody",
      aboutH: "setTitle", aboutText: "aboutText", btnClearHistory: "btnClearHistory",
      tabScanL: "tabScan", tabHistoryL: "tabHistory", tabSettingsL: "tabSettings",
      disclaimerR: "disclaimer",
      lblProviderR: "lblProvider", lblDateR: "lblDate", lblAmountR: "lblAmount"
    };
    Object.keys(map).forEach(function (id) {
      var el = $(id);
      if (el) el.textContent = s(map[id]);
    });
    $("btnShutter").setAttribute("aria-label", s("btnShutter"));
    $("qaInput").placeholder = s("qaPlaceholder");
    $("apiKeyInput").placeholder = s("setApiKeyPh");
    // wizard step indicators (Ken 04/11/2026: each step is its own screen)
    var stepOf = function (n) { return s("stepOf").replace("{n}", String(n)); };
    if ($("stepScan")) $("stepScan").textContent = stepOf(1);
    if ($("stepReview")) $("stepReview").textContent = stepOf(2);
    if ($("stepAnalyzing")) $("stepAnalyzing").textContent = stepOf(2);
    if ($("stepResults")) $("stepResults").textContent = stepOf(3);
    buildLangGrid();
    buildUiLangSelect();
  }

  // ---------- views ----------
  var VIEWS = ["view-scan", "view-review", "view-analyzing", "view-history", "view-settings", "view-results", "view-qa", "view-detail"];
  function showView(id) {
    VIEWS.forEach(function (v) { $(v).hidden = (v !== id); });
    document.querySelectorAll(".tab").forEach(function (t) {
      t.classList.toggle("active", t.dataset.tab === id.replace("view-", ""));
    });
    window.scrollTo(0, 0);
    if (id === "view-history") renderHistory();
  }

  // ---------- consent ----------
  function checkConsent() {
    if (localStorage.getItem("mc_consent") === "yes") return;
    $("consentModal").hidden = false;
  }

  // ---------- scan ----------
  function buildLangGrid() {
    var g = $("langGrid");
    g.innerHTML = "";
    MC_LANGS.forEach(function (L) {
      var b = document.createElement("button");
      b.className = "lang-btn" + (L.code === S.billLang ? " selected" : "");
      b.textContent = L.name;
      b.setAttribute("role", "option");
      b.setAttribute("aria-selected", L.code === S.billLang ? "true" : "false");
      b.onclick = function () {
        S.billLang = L.code;
        localStorage.setItem("mc_billLang", L.code);
        buildLangGrid();
      };
      g.appendChild(b);
    });
  }

  function downscaleImage(dataUrl, maxDim) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () {
        var w = img.width, h = img.height;
        var k = Math.min(1, maxDim / Math.max(w, h));
        var cv = document.createElement("canvas");
        cv.width = Math.round(w * k); cv.height = Math.round(h * k);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        resolve(cv.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = function () { resolve(dataUrl); };
      img.src = dataUrl;
    });
  }

  function setPhoto(dataUrl, billData) {
    S.imageDataUrl = dataUrl;
    S.imageDataUrls = [dataUrl];
    S.billData = billData || null;
    $("previewImg").src = dataUrl;
    $("retryRow").hidden = true;
    setStatus("", false);
    // wizard step 2: review screen (photo + language + analyze)
    showView("view-review");
  }

  function setPhotoMulti(urls, billData) {
    if (!urls || !urls.length) return;
    S.imageDataUrls = urls;
    setPhoto(urls[0], billData); // preview shows page 1
  }

  var PDF_PAGE_LIMIT = 10;

  // PDF.js is vendored locally (js/vendor/pdfjs/pdf.js) so this works offline.
  async function handlePdfBuffer(buf) {
    if (!window.pdfjsLib) throw new Error("pdf.js missing");
    var pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
    if (pdf.numPages > PDF_PAGE_LIMIT) {
      setStatus(s("pdfTooMany"), true);
      return;
    }
    setStatus(s("pdfReading"), false);
    var urls = [];
    for (var p = 1; p <= pdf.numPages; p++) {
      var page = await pdf.getPage(p);
      var viewport = page.getViewport({ scale: 1.5 });
      var cv = document.createElement("canvas");
      cv.width = viewport.width;
      cv.height = viewport.height;
      await page.render({ canvasContext: cv.getContext("2d"), viewport: viewport }).promise;
      urls.push(cv.toDataURL("image/jpeg", 0.85));
    }
    setPhotoMulti(urls, null);
  }

  function handlePdfFile(file) {
    if (!file) return;
    var r = new FileReader();
    r.onload = function () {
      handlePdfBuffer(r.result).catch(function (e) {
        console.error(e);
        setStatus(s("analyzeFail"), true);
      });
    };
    r.readAsArrayBuffer(file);
  }

  // Sample PDF (no PII) so mock mode can test the PDF pipeline end to end.
  function useSamplePdf() {
    setStatus(s("pdfReading"), false);
    fetch("assets/sample-eob.pdf").then(function (res) {
      if (!res.ok) throw new Error("sample PDF missing");
      return res.arrayBuffer();
    }).then(handlePdfBuffer).catch(function (e) {
      console.error(e);
      setStatus(s("analyzeFail"), true);
    });
  }

  function handleFile(file) {
    if (!file) return;
    var r = new FileReader();
    r.onload = function () { downscaleImage(r.result, 1600).then(function (d) { setPhoto(d, null); }); };
    r.readAsDataURL(file);
  }

  function useSampleBill() {
    var bills = (window.MC_FIXTURES && window.MC_FIXTURES.bills) || [];
    if (!bills.length) { setStatus("fixtures missing", true); return; }
    var bill = bills[Math.floor(Math.random() * bills.length)];
    var url = window.MC_billDataUrl(bill);
    setPhoto(url, bill);
  }

  function setStatus(msg, isError) {
    var el = $("analyzeStatus");
    el.textContent = msg;
    el.classList.toggle("error", !!isError);
  }

  // Connection mode: null = mock, "needkey" = BYOK chosen but no key saved,
  // "auto" = proxy (no key), "byok" = direct Meta with key.
  function liveMode() {
    if (S.mockMode) return null;
    if (S.connMode === "byok" && !S.apiKey) return "needkey";
    return S.connMode;
  }

  function renderConnMode() {
    $("connAuto").classList.toggle("selected", S.connMode === "auto");
    $("connByok").classList.toggle("selected", S.connMode === "byok");
    $("connAuto").setAttribute("aria-pressed", S.connMode === "auto" ? "true" : "false");
    $("connByok").setAttribute("aria-pressed", S.connMode === "byok" ? "true" : "false");
    // In Automatic mode no key is needed — hide the whole key section.
    $("byokCard").hidden = (S.connMode !== "byok");
    if (window.MC_API) window.MC_API.connMode = S.connMode;
  }
  function setConnMode(m) {
    S.connMode = m;
    localStorage.setItem("mc_connMode", m);
    renderConnMode();
  }

  async function analyze() {
    if (!S.imageDataUrl) return;
    var btn = $("btnAnalyze");
    btn.disabled = true;
    $("retryRow").hidden = true;
    var mode = liveMode();
    if (mode === "needkey") {
      // stay on the review screen for this error (user must add a key)
      setStatus(s("needKeyMsg"), true);
      btn.disabled = false;
      return;
    }
    // wizard: analyzing is its own screen between step 2 and step 3
    showView("view-analyzing");
    try {
      var analysis;
      var langMeta_ = langMeta(S.billLang);
      if (mode === null) {
        var bd = S.billData || {
          id: "photo-" + Date.now(), title: "Uploaded photo",
          provider: "", providerAddress: "", billDate: "", dueDate: "",
          accountLast4: "XXXX", currency: "USD", lineItems: [],
          insurance: { payer: "", paid: 0 }, patientOwes: 0
        };
        // small delay so the progress state is visible
        await new Promise(function (r) { setTimeout(r, 900); });
        analysis = window.MC_mockAnalyze(bd, S.billLang);
      } else {
        analysis = await window.MC_API.analyzeBill({
          apiKey: mode === "byok" ? S.apiKey : "",
          imageDataUrl: S.imageDataUrl,
          imageDataUrls: (S.imageDataUrls && S.imageDataUrls.length) ? S.imageDataUrls : [S.imageDataUrl],
          langName: langMeta_.name,
          langCode: S.billLang
        });
      }
      S.analysis = analysis;
      var rec = {
        billData: S.billData, imageDataUrl: S.imageDataUrl,
        analysis: analysis, lang: S.billLang, qa: []
      };
      S.caseId = await window.MC_DB.addCase(rec);
      S.qa = [];
      S.letterCache = {};
      $("savedNote").textContent = s("savedNote");
      renderResults();
      showView("view-results");
    } catch (e) {
      console.error(e);
      // back to the review screen; the photo is kept for retry
      showView("view-review");
      setStatus(s("commonError"), true);
      $("retryRow").hidden = false;
    } finally {
      btn.disabled = false;
    }
  }

  // ---------- results ----------
  var DOC_TYPE_KEYS = {
    medical_bill: "docTypeBill",
    insurance_letter: "docTypeInsurance",
    contract: "docTypeContract",
    government_letter: "docTypeGov",
    other: "docTypeOther"
  };

  function renderResults() {
    var a = S.analysis;
    if (!a) return;
    // Document type pill (AI auto-detects the document kind).
    var dtKey = DOC_TYPE_KEYS[a.documentType] || "docTypeOther";
    var dtPill = $("resDocType");
    dtPill.textContent = s(dtKey);
    dtPill.hidden = false;
    $("resProvider").textContent = a.provider || "—";
    $("resDate").textContent = a.billDate || "—";
    // Amount-due only makes sense when there is an amount (bills always show).
    var showAmt = Number(a.patientOwes) > 0 ||
      a.documentType === "medical_bill" || a.documentType === "insurance_letter";
    $("resAmountRow").hidden = !showAmt;
    if (showAmt) $("resAmount").textContent = money(a.patientOwes);
    $("resSummary").textContent = a.summary || "";
    // Items header adapts: contracts show "key terms" instead of "charges".
    $("resItemsH").textContent = a.documentType === "contract" ? s("resClauses") : s("resItems");

    var items = $("resItems");
    items.innerHTML = "";
    (a.lineItems || []).forEach(function (it) {
      var d = document.createElement("div");
      d.className = "item";
      d.innerHTML =
        '<div class="item-top"><strong>' + esc(it.description) + '</strong>' +
        '<span class="money">' + esc(money(it.charge)) + '</span></div>' +
        (it.cpt ? '<div class="cpt">CPT ' + esc(it.cpt) + (it.date ? " · " + esc(it.date) : "") + '</div>' : "") +
        '<p class="expl">' + esc(it.explanation || "") + '</p>' +
        (it.suspicious && it.suspicionReason ? '<p class="expl suspicion"><svg class="ic ic-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><strong>' + esc(it.suspicionReason) + '</strong></p>' : "");
      items.appendChild(d);
    });

    var flags = $("resFlags");
    flags.innerHTML = "";
    if (!(a.flags || []).length) {
      flags.innerHTML = '<p class="muted">' + esc(s("noFlagsMsg")) + '</p>';
    }
    (a.flags || []).forEach(function (f) {
      var sev = (f.severity || "low").toLowerCase();
      var sevLabel = sev === "high" ? s("sevHigh") : sev === "medium" ? s("sevMedium") : s("sevLow");
      var d = document.createElement("div");
      d.className = "flag " + sev;
      // Dose voice: severity as a double-ringed stamp, never red, sentence case untracked.
      d.innerHTML = '<div class="sev"><span class="stamp' + (sev === "high" ? "" : " stamp--grey") + '">' +
        esc(sevLabel) + '</span></div><h4>' +
        esc(f.title) + '</h4><p>' + esc(f.detail) + '</p>';
      flags.appendChild(d);
    });

    var next = $("resNext");
    next.innerHTML = "";
    (a.nextSteps || []).forEach(function (n) {
      var li = document.createElement("li");
      li.textContent = n;
      next.appendChild(li);
    });

    $("letterSubject").textContent = (a.letter && a.letter.subject) || "";
    $("letterBody").textContent = (a.letter && a.letter.body) || "";
    setupLetterPicker($("view-results"), a);
    updatePlayButton();
  }

  // ---------- dispute letter language (Ken 04/11/2026) ----------
  // The letter goes to a US entity: it defaults to English, independent of the
  // app UI language. The user can switch it to any of the 13 languages.
  function buildLetterLangOptions(sel) {
    sel.innerHTML = "";
    MC_LANGS.forEach(function (L) {
      var o = document.createElement("option");
      o.value = L.code;
      o.textContent = L.name;
      if (L.code === S.letterLang) o.selected = true;
      sel.appendChild(o);
    });
  }
  function paintLetter(root, L) {
    var q = function (id) { return root.querySelector("#" + id); };
    var subj = q("letterSubject"), body = q("letterBody");
    if (subj) subj.textContent = (L && L.subject) || "";
    if (body) body.textContent = (L && L.body) || "";
  }
  function letterStatus(root, msg, isError) {
    var el = root.querySelector("#letterStatus");
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("error", !!isError);
  }
  function mockLetterFor(target) {
    // demo mode: reuse the fixture letters (en/vi/es per sample bill)
    var bd = S.billData || {};
    var A = (window.MC_FIXTURES && window.MC_FIXTURES.analyses) || {};
    if (bd.id && A[bd.id] && A[bd.id][target] && A[bd.id][target].letter) {
      return A[bd.id][target].letter;
    }
    if (bd.id && A[bd.id] && A[bd.id].en && A[bd.id].en.letter) {
      return A[bd.id].en.letter;
    }
    return (S.analysis && S.analysis.letter) || { subject: "", body: "" };
  }
  async function getLetter(analysis, target) {
    if (S.letterCache[target]) return S.letterCache[target];
    var base = (analysis && analysis.letter) || { subject: "", body: "" };
    if (target === analysis.language) {
      S.letterCache[target] = base;
      return base;
    }
    var mode = liveMode();
    var out;
    if (mode === null) {
      out = mockLetterFor(target);
    } else {
      var lm = langMeta(target);
      out = await window.MC_API.translateLetter({
        apiKey: mode === "byok" ? S.apiKey : "",
        letter: base,
        langName: lm.name,
        langCode: target
      });
    }
    S.letterCache[target] = out;
    return out;
  }
  function setupLetterPicker(root, analysis) {
    var sel = root.querySelector("#letterLangSel");
    if (!sel || !analysis) return;
    buildLetterLangOptions(sel);
    var load = function () {
      var target = sel.value;
      S.letterLang = target;
      try { localStorage.setItem("mc_letterLang", target); } catch (e) {}
      letterStatus(root, "", false);
      // instant path: requested language == analysis language, or cached
      if (target === analysis.language || S.letterCache[target]) {
        paintLetter(root, S.letterCache[target] || analysis.letter);
        return;
      }
      letterStatus(root, s("letterTranslating"), false);
      getLetter(analysis, target).then(function (L) {
        if (sel.value !== target) return; // user switched again meanwhile
        paintLetter(root, L);
        letterStatus(root, "", false);
      }).catch(function (e) {
        console.error(e);
        paintLetter(root, analysis.letter); // fall back to the original letter
        letterStatus(root, s("commonError"), true);
      });
    };
    sel.onchange = load;
    load();
  }

  // ---------- voice output (Web Speech API; Meta has no TTS) ----------
  function pickVoice(speechLocale) {
    var vs = speechSynthesis.getVoices();
    if (!vs.length) return null;
    var prefix = speechLocale.split("-")[0].toLowerCase();
    for (var i = 0; i < vs.length; i++) {
      if (vs[i].lang && vs[i].lang.toLowerCase().indexOf(prefix) === 0) return vs[i];
    }
    return null;
  }
  function speakText(text, langCode) {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    var meta = langMeta(langCode || S.billLang);
    u.lang = meta.speech;
    var v = pickVoice(meta.speech);
    if (v) u.voice = v;
    u.rate = 0.95;
    u.onend = u.onerror = function () { S.speaking = false; updatePlayButton(); };
    S.speaking = true;
    updatePlayButton();
    speechSynthesis.speak(u);
  }
  function stopSpeak() {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    S.speaking = false;
    updatePlayButton();
  }
  function analysisSpeechText() {
    // UX checklist: summary → amount → flags → next steps, in the chosen language.
    var a = S.analysis;
    if (!a) return "";
    var parts = [a.summary || ""];
    if (Number(a.patientOwes) > 0) parts.push(s("lblAmount") + ": " + money(a.patientOwes) + ".");
    (a.flags || []).forEach(function (f) { parts.push(f.title + ". " + f.detail); });
    (a.nextSteps || []).slice(0, 4).forEach(function (n) { parts.push(n); });
    return parts.join(" ");
  }
  function updatePlayButton() {
    var b = $("btnPlayVoice");
    if (b) b.textContent = S.speaking ? s("btnStopVoice") : s("btnPlayVoice");
    var r = $("btnReplayVoice");
    if (r) r.textContent = S.speaking ? s("btnStopVoice") : s("btnReplayVoice");
  }
  function togglePlay() {
    if (S.speaking) { stopSpeak(); return; }
    var t = analysisSpeechText();
    if (t) speakText(t, (S.analysis && S.analysis.language) || S.billLang);
  }

  // ---------- history ----------
  async function renderHistory() {
    var list = $("histList");
    list.innerHTML = "";
    var cases = null;
    try { cases = await window.MC_DB.listCases(); }
    catch (e) { cases = null; }
    if (cases === null) {
      // Database error — NEVER pretend the history is empty (QA bug 2026-11-02).
      $("histEmpty").hidden = true;
      $("histCtaRow").hidden = true;
      list.innerHTML = '<div class="card"><p>' + esc(s("histError")) +
        '</p><div class="row"><button class="btn btn-secondary" id="btnHistRetry">' +
        esc(s("btnRetry")) + '</button></div></div>';
      $("btnHistRetry").onclick = renderHistory;
      return;
    }
    $("histEmpty").hidden = cases.length > 0;
    $("histCtaRow").hidden = cases.length > 0;
    if (!cases.length) $("histEmpty").textContent = s("histEmpty");
    cases.forEach(function (c) {
      var a = c.analysis || {};
      var b = document.createElement("button");
      b.className = "card hist-card btn";
      var d = new Date(c.ts);
      b.innerHTML =
        '<div class="prov">' + esc(a.provider || "—") + '</div>' +
        '<div class="meta">' + esc(d.toLocaleDateString()) + ' · ' + esc(langMeta(c.lang).name) + '</div>' +
        '<div class="amt">' + esc(money(a.patientOwes)) + '</div>';
      b.onclick = function () { openCase(c.id); };
      list.appendChild(b);
    });
  }

  async function openCase(id) {
    var c = await window.MC_DB.getCase(id);
    if (!c) return;
    S.caseId = id;
    S.analysis = c.analysis;
    S.billLang = c.lang || S.billLang;
    S.qa = c.qa || [];
    S.imageDataUrl = c.imageDataUrl || null;
    S.letterCache = {};
    $("deleteConfirm").hidden = true;
    renderResults();
    // detail view reuses results markup
    $("detailBody").innerHTML = '<div id="detailClone"></div>';
    $("detailClone").innerHTML = $("resultsInner").innerHTML;
    // the cloned letter picker needs its own binding for this saved case
    setupLetterPicker($("detailClone"), c.analysis);
    showView("view-detail");
  }

  // ---------- Q&A ----------
  function openQA() {
    renderQa();
    showView("view-qa");
    setTimeout(function () { $("qaInput").focus(); }, 300);
  }
  function renderQa() {
    var box = $("qaMessages");
    box.innerHTML = "";
    S.qa.forEach(function (m) {
      var d = document.createElement("div");
      d.className = "msg " + (m.role === "user" ? "user" : "bot");
      d.textContent = m.text;
      box.appendChild(d);
    });
    box.scrollTop = box.scrollHeight;
  }
  function qaStatus(msg, isError) {
    var el = $("qaStatus");
    el.textContent = msg || "";
    el.classList.toggle("error", !!isError);
  }

  async function sendQuestion(text) {
    text = (text || "").trim();
    if (!text) return;
    S.qa.push({ role: "user", text: text });
    renderQa();
    $("qaInput").value = "";
    var typing = document.createElement("div");
    typing.className = "msg bot typing";
    typing.textContent = s("loading") + "…";
    $("qaMessages").appendChild(typing);
    $("qaMessages").scrollTop = $("qaMessages").scrollHeight;
    try {
      var answer;
      var langMeta_ = langMeta(S.billLang);
      var qmode = liveMode();
      if (qmode === null) {
        await new Promise(function (r) { setTimeout(r, 700); });
        // BUGFIX 04/11/2026 (Ken): mock Q&A must interpolate the fallback template
        // with the current case's provider/amount — never show raw {{provider}}.
        var billInfo = {
          provider: (S.analysis && S.analysis.provider) || (S.billData && S.billData.provider) || "",
          patientOwes: (S.analysis && S.analysis.patientOwes != null) ? S.analysis.patientOwes
            : (S.billData && S.billData.patientOwes)
        };
        answer = window.MC_qaFallbackReply(S.billLang, S.mockQaIdx, billInfo);
        S.mockQaIdx++;
      } else if (qmode === "needkey") {
        answer = s("needKeyMsg");
      } else {
        answer = await window.MC_API.askFollowUp({
          apiKey: qmode === "byok" ? S.apiKey : "",
          billJson: S.analysis,
          history: S.qa.slice(0, -1),
          question: text,
          langName: langMeta_.name
        });
      }
      S.qa.push({ role: "bot", text: answer });
      if (S.caseId) {
        var c = await window.MC_DB.getCase(S.caseId);
        if (c) { c.qa = S.qa; await window.MC_DB.updateCase(c); }
      }
    } catch (e) {
      console.error(e);
      S.qa.push({ role: "bot", text: s("qaFail") });
    }
    renderQa();
  }

  // Voice input: Meta STT when key present; else browser speech recognition.
  var mediaRecorder = null, audioChunks = [];
  function micAvailable() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
  async function onMic() {
    if (S.recording) { stopRecording(); return; }
    qaStatus(s("micListening"), false);
    // Meta STT only in BYOK mode with a key (proxy covers chat completions only).
    // In auto/mock mode the browser's built-in speech recognition is used.
    if (!S.mockMode && S.connMode === "byok" && S.apiKey && micAvailable()) {
      try {
        var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        mediaRecorder.ondataavailable = function (e) { if (e.data.size) audioChunks.push(e.data); };
        mediaRecorder.onstop = async function () {
          stream.getTracks().forEach(function (t) { t.stop(); });
          S.recording = false;
          $("btnQaMic").classList.remove("recording");
          qaStatus(s("loading") + "…", false);
          try {
            var blob = new Blob(audioChunks, { type: mediaRecorder.mimeType || "audio/webm" });
            var text = await window.MC_API.transcribe({ apiKey: S.apiKey, audioBlob: blob, langCode: S.billLang });
            qaStatus("", false);
            if (text.trim()) sendQuestion(text.trim());
            else qaStatus(s("qaFail"), true);
          } catch (e) {
            console.error(e);
            qaStatus("", false);
            browserStt(); // fall back
          }
        };
        S.recording = true;
        $("btnQaMic").classList.add("recording");
        mediaRecorder.start();
        return;
      } catch (e) { console.error(e); }
    }
    browserStt();
  }
  function stopRecording() {
    if (mediaRecorder && S.recording) mediaRecorder.stop();
  }
  function browserStt() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { qaStatus(s("qaFail"), true); return; }
    try {
      var rec = new SR();
      rec.lang = langMeta(S.billLang).speech;
      rec.interimResults = false;
      rec.onresult = function (e) {
        var t = e.results[0][0].transcript;
        qaStatus("", false);
        if (t.trim()) sendQuestion(t.trim());
      };
      rec.onerror = function () { qaStatus(s("qaFail"), true); };
      rec.onend = function () { qaStatus("", false); };
      rec.start();
    } catch (e) { qaStatus(s("qaFail"), true); }
  }

  // ---------- settings ----------
  function buildUiLangSelect() {
    var sel = $("uiLangSelect");
    if (!sel.options.length) {
      MC_LANGS.forEach(function (L) {
        var o = document.createElement("option");
        o.value = L.code; o.textContent = L.name;
        sel.appendChild(o);
      });
    }
    sel.value = S.uiLang;
  }

  // ---------- boot ----------
  function loadPrefs() {
    // ENGLISH-FIRST (Ken, 02/11/2026): first launch is ALWAYS English.
    // Language only changes when the user picks another one (saved to localStorage).
    var savedUi = localStorage.getItem("mc_uiLang");
    S.uiLang = (savedUi && window.MC_STRINGS && window.MC_STRINGS[savedUi]) ? savedUi : "en";
    var savedBill = localStorage.getItem("mc_billLang");
    var billOk = MC_LANGS.some(function (L) { return L.code === savedBill; });
    S.billLang = billOk ? savedBill : S.uiLang;
    S.apiKey = localStorage.getItem("mc_apiKey") || "";
    S.mockMode = localStorage.getItem("mc_mock") !== "off";
    var cm = localStorage.getItem("mc_connMode");
    S.connMode = (cm === "byok" || cm === "auto") ? cm : "auto";
  }

  function wire() {
    document.querySelectorAll(".tab").forEach(function (t) {
      t.onclick = function () { stopSpeak(); showView("view-" + t.dataset.tab); };
    });
    $("btnAgree").onclick = function () {
      localStorage.setItem("mc_consent", "yes");
      $("consentModal").hidden = true;
    };
    $("btnDecline").onclick = function () {
      $("consentBody").textContent = s("declineMsg");
    };

    $("btnShutter").onclick = function () { $("fileInput").click(); };
    $("fileInput").onchange = function (e) { handleFile(e.target.files[0]); e.target.value = ""; };
    var uploadInput = document.createElement("input");
    uploadInput.type = "file"; uploadInput.accept = "image/*"; uploadInput.hidden = true;
    document.body.appendChild(uploadInput);
    $("btnUpload").onclick = function () { uploadInput.click(); };
    uploadInput.onchange = function (e) { handleFile(e.target.files[0]); e.target.value = ""; };
    $("btnSample").onclick = useSampleBill;
    // PDF upload (vendored PDF.js) + sample PDF for mock-mode testing.
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "js/vendor/pdfjs/pdf.worker.js";
    }
    $("btnPdf").onclick = function () { $("filePdf").click(); };
    $("filePdf").onchange = function (e) { handlePdfFile(e.target.files[0]); e.target.value = ""; };
    $("btnSamplePdf").onclick = useSamplePdf;

    $("btnAnalyze").onclick = analyze;
    $("btnRetry").onclick = analyze;
    $("btnRetake").onclick = function () {
      // wizard: retake goes back to step 1 (capture)
      S.imageDataUrl = null; S.imageDataUrls = null; S.billData = null;
      $("previewImg").removeAttribute("src");
      setStatus("", false);
      showView("view-scan");
    };
    $("btnBackReview").onclick = function () { showView("view-scan"); };

    $("btnPlayVoice").onclick = togglePlay;
    $("btnBackResults").onclick = function () { stopSpeak(); showView("view-scan"); };
    $("btnNewScan").onclick = function () {
      stopSpeak();
      S.imageDataUrl = null; S.imageDataUrls = null; S.billData = null; S.analysis = null;
      $("previewWrap").hidden = true; $("analyzePanel").hidden = true;
      showView("view-scan");
    };
    $("btnAskMore").onclick = openQA;
    $("btnCopyLetter").onclick = function () {
      var txt = $("letterSubject").textContent + "\n\n" + $("letterBody").textContent;
      function done() {
        var b = $("btnCopyLetter");
        b.textContent = s("copiedMsg");
        setTimeout(function () { b.textContent = s("btnCopy"); }, 1500);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(done, done);
      } else {
        var ta = document.createElement("textarea");
        ta.value = txt; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta); done();
      }
    };

    $("btnBackQa").onclick = function () { showView("view-results"); };
    $("btnQaSend").onclick = function () { sendQuestion($("qaInput").value); };
    $("qaInput").addEventListener("keydown", function (e) {
      if (e.key === "Enter") sendQuestion($("qaInput").value);
    });
    $("btnQaMic").onclick = onMic;
    $("btnQaMic").setAttribute("aria-label", s("detailMic"));

    // Settings is a push screen (UX: 2 tabs only), opened from the gear on Scan.
    $("btnOpenSettings").onclick = function () { showView("view-settings"); };
    $("btnBackSettings").onclick = function () { showView("view-scan"); };

    // History empty-state CTA → Scan tab.
    $("btnHistCta").onclick = function () { showView("view-scan"); };

    // Per-case delete with inline confirm (UX: no swipe for elderly).
    $("btnDeleteCase").onclick = function () { $("deleteConfirm").hidden = false; };
    $("btnKeep").onclick = function () { $("deleteConfirm").hidden = true; };
    $("btnConfirmDelete").onclick = async function () {
      try {
        if (S.caseId) await window.MC_DB.deleteCase(S.caseId);
      } catch (e) { console.error(e); }
      $("deleteConfirm").hidden = true;
      S.caseId = null;
      showView("view-history");
    };

    $("btnBackDetail").onclick = function () { stopSpeak(); showView("view-history"); };
    $("btnReplayVoice").onclick = togglePlay;
    $("btnDetailAsk").onclick = openQA;

    $("btnSaveKey").onclick = function () {
      S.apiKey = $("apiKeyInput").value.trim();
      if (S.apiKey) localStorage.setItem("mc_apiKey", S.apiKey);
      else localStorage.removeItem("mc_apiKey");
      $("keyStatus").textContent = s("keySaved");
      setTimeout(function () { $("keyStatus").textContent = ""; }, 2500);
    };
    $("btnGetKey").onclick = function () {
      if (META_KEY_URL) {
        window.open(META_KEY_URL, "_blank", "noopener");
        $("keyUrlStatus").textContent = "";
      } else {
        $("keyUrlStatus").textContent = s("keyUrlSoon");
      }
    };
    $("mockToggle").onchange = function (e) {
      S.mockMode = e.target.checked;
      localStorage.setItem("mc_mock", S.mockMode ? "on" : "off");
    };
    $("connAuto").onclick = function () { setConnMode("auto"); };
    $("connByok").onclick = function () { setConnMode("byok"); };
    $("uiLangSelect").onchange = function (e) {
      S.uiLang = e.target.value;
      localStorage.setItem("mc_uiLang", S.uiLang);
      applyStrings();
    };
    $("btnClearHistory").onclick = async function () {
      if (!confirm(s("confirmClear"))) return;
      await window.MC_DB.clearAll();
      alert(s("historyCleared"));
      renderHistory();
    };

    if ("speechSynthesis" in window) {
      speechSynthesis.getVoices();
      speechSynthesis.onvoiceschanged = function () {};
    }
  }

  function init() {
    loadPrefs();
    applyStrings();
    renderConnMode();
    $("apiKeyInput").value = S.apiKey;
    $("mockToggle").checked = S.mockMode;
    wire();
    checkConsent();
    showView("view-scan");
  }

  // Wait briefly for i18n/fixtures scripts (local, should be instant)
  var tries = 0;
  (function boot() {
    tries++;
    if (window.MC_STRINGS && window.MC_FIXTURES) { init(); return; }
    if (tries > 50) {
      document.body.innerHTML = "<p style='padding:40px;font-size:20px'>Failed to load app files. Please reload.</p>";
      return;
    }
    setTimeout(boot, 100);
  })();
})();
