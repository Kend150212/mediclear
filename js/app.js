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
    imageDataUrl: null,
    billData: null,
    analysis: null,
    caseId: null,
    qa: [],
    mockQaIdx: 0,
    speaking: false
  };

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
      consentTitle: "consentTitle", consentBody: "consentBody",
      btnAgree: "btnAgree", btnDecline: "btnDecline",
      scanTitle: "scanTitle", privacyTip: "privacyTip",
      btnUpload: "btnUpload", btnSample: "btnSample", sampleNote: "sampleNote",
      langLabel: "langLabel", btnAnalyze: "btnAnalyze", btnRetry: "btnRetry",
      resTitle: "scanTitle", resSummaryH: "resSummary", resItemsH: "resItems",
      resFlagsH: "resFlags", resNextH: "resNextSteps", resLetterH: "resLetter",
      btnPlayVoice: "btnPlayVoice", btnAskMore: "btnAskMore", btnNewScan: "btnNewScan",
      letterFrom: "letterFrom", btnCopyLetter: "btnCopy",
      qaTitle: "qaTitle", btnQaSend: "btnSend", micHint: "micHint",
      histTitle: "histTitle",
      btnReplayVoice: "btnPlayVoice", btnDetailAsk: "btnAskMore",
      setTitle: "setTitle", setApiKeyH: "setApiKey", setApiKeyHint: "setApiKeyHint",
      btnSaveKey: "btnSaveKey", setMockH: "setMockMode", mockDesc: "mockDesc",
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
    buildLangGrid();
    buildUiLangSelect();
  }

  // ---------- views ----------
  var VIEWS = ["view-scan", "view-history", "view-settings", "view-results", "view-qa", "view-detail"];
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
    S.billData = billData || null;
    $("previewImg").src = dataUrl;
    $("previewWrap").hidden = false;
    $("analyzePanel").hidden = false;
    $("retryRow").hidden = true;
    setStatus("", false);
    window.scrollTo(0, document.body.scrollHeight);
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

  async function analyze() {
    if (!S.imageDataUrl) return;
    var btn = $("btnAnalyze");
    btn.disabled = true;
    $("retryRow").hidden = true;
    setStatus(s("analyzingMsg"), false);
    try {
      var analysis;
      var langMeta_ = langMeta(S.billLang);
      if (S.mockMode || !S.apiKey) {
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
          apiKey: S.apiKey,
          imageDataUrl: S.imageDataUrl,
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
      renderResults();
      showView("view-results");
    } catch (e) {
      console.error(e);
      setStatus(s("analyzeFail") + (e && e.message ? " (" + e.message.slice(0, 120) + ")" : ""), true);
      $("retryRow").hidden = false;
    } finally {
      btn.disabled = false;
    }
  }

  // ---------- results ----------
  function renderResults() {
    var a = S.analysis;
    if (!a) return;
    $("resProvider").textContent = a.provider || "—";
    $("resDate").textContent = a.billDate || "—";
    $("resAmount").textContent = money(a.patientOwes);
    $("resSummary").textContent = a.summary || "";

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
        (it.suspicious && it.suspicionReason ? '<p class="expl"><strong>⚠ ' + esc(it.suspicionReason) + '</strong></p>' : "");
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
      d.innerHTML = '<div class="sev">' + esc(sevLabel) + '</div><h4>' +
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
    updatePlayButton();
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
    var a = S.analysis;
    if (!a) return "";
    var parts = [a.summary || ""];
    (a.flags || []).forEach(function (f) { parts.push(f.title + ". " + f.detail); });
    (a.nextSteps || []).slice(0, 4).forEach(function (n) { parts.push(n); });
    return parts.join(" ");
  }
  function updatePlayButton() {
    var b = $("btnPlayVoice");
    if (b) b.textContent = S.speaking ? s("btnStopVoice") : s("btnPlayVoice");
    var r = $("btnReplayVoice");
    if (r) r.textContent = S.speaking ? s("btnStopVoice") : s("btnPlayVoice");
  }
  function togglePlay() {
    if (S.speaking) { stopSpeak(); return; }
    var t = analysisSpeechText();
    if (t) speakText(t, S.analysis && S.analysis.languageCode ? S.analysis.languageCode : S.billLang);
  }

  // ---------- history ----------
  async function renderHistory() {
    var list = $("histList");
    list.innerHTML = "";
    var cases;
    try { cases = await window.MC_DB.listCases(); }
    catch (e) { cases = []; }
    $("histEmpty").hidden = cases.length > 0;
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
    renderResults();
    // detail view reuses results markup
    $("detailBody").innerHTML = '<div id="detailClone"></div>';
    $("detailClone").innerHTML = $("resultsInner").innerHTML;
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
      if (S.mockMode || !S.apiKey) {
        await new Promise(function (r) { setTimeout(r, 700); });
        var fb = ((window.MC_FIXTURES || {}).qaFallback || {}).en || ["OK"];
        var pool = ((window.MC_FIXTURES || {}).qaFallback || {})[S.billLang] || fb;
        answer = pool[S.mockQaIdx % pool.length];
        S.mockQaIdx++;
      } else {
        answer = await window.MC_API.askFollowUp({
          apiKey: S.apiKey,
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
    if (!S.mockMode && S.apiKey && micAvailable()) {
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

    $("btnAnalyze").onclick = analyze;
    $("btnRetry").onclick = analyze;

    $("btnPlayVoice").onclick = togglePlay;
    $("btnBackResults").onclick = function () { stopSpeak(); showView("view-scan"); };
    $("btnNewScan").onclick = function () {
      stopSpeak();
      S.imageDataUrl = null; S.billData = null; S.analysis = null;
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
    $("mockToggle").onchange = function (e) {
      S.mockMode = e.target.checked;
      localStorage.setItem("mc_mock", S.mockMode ? "on" : "off");
    };
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
