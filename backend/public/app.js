/**
 * Voice + text UI: POST /chat (full history), POST /extract, SpeechSynthesis for playback.
 */

const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const extractBtn = document.getElementById("extractBtn");
const languageSelect = document.getElementById("languageSelect");
const statusEl = document.getElementById("status");
const profileOutputEl = document.getElementById("profileOutput");
const loadingBar = document.getElementById("loadingBar");

/** @type {{ role: 'user' | 'assistant', content: string }[]} */
const conversation = [];

let cachedVoices = [];
let browserTtsPrimed = false;

function setStatus(text) {
  statusEl.textContent = text;
}

function setLoading(on) {
  loadingBar.classList.toggle("hidden", !on);
}

function loadSpeechVoices() {
  if (!("speechSynthesis" in window)) return [];
  cachedVoices = window.speechSynthesis.getVoices();
  return cachedVoices;
}

if ("speechSynthesis" in window) {
  loadSpeechVoices();
  window.speechSynthesis.onvoiceschanged = () => loadSpeechVoices();
}

function primeBrowserTts() {
  if (!("speechSynthesis" in window) || browserTtsPrimed) return;
  browserTtsPrimed = true;
  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
  } catch {
    /* ignore */
  }
}

/**
 * Pick TTS locale from assistant text (Devanagari → hi vs mr heuristic).
 * @param {string} text
 */
function detectResponseSpeechLang(text) {
  const t = (text || "").trim();
  if (!t) return "en-IN";
  if (!/[\u0900-\u097F]/.test(t)) return "en-IN";
  if (/[ळऱ]/.test(t)) return "mr-IN";
  if (
    /(आहे|आहेत|नाही|मला|तुम्हाला|धन्यवाद|कसं|कशी|कोणता|कोणती|मराठी)/.test(t)
  ) {
    return "mr-IN";
  }
  return "hi-IN";
}

function addMessage(role, content, store = true) {
  const bubble = document.createElement("article");
  bubble.className = `msg ${role === "assistant" ? "bot" : "user"}`;
  bubble.textContent = content;
  chatEl.appendChild(bubble);
  chatEl.scrollTop = chatEl.scrollHeight;
  if (store) conversation.push({ role, content });
}

function selectedLanguage() {
  return languageSelect?.value || "English";
}

function speechLangCode(lang) {
  if (lang === "Hindi") return "hi-IN";
  if (lang === "Marathi") return "mr-IN";
  return "en-US";
}

function findBestVoice(langCode) {
  const voices = cachedVoices.length ? cachedVoices : loadSpeechVoices();
  if (!voices.length) return null;
  const want = langCode.toLowerCase();
  const base = want.split("-")[0];
  return (
    voices.find((v) => (v.lang || "").toLowerCase() === want) ||
    voices.find((v) => (v.lang || "").toLowerCase().startsWith(`${base}-`)) ||
    voices.find((v) => (v.lang || "").toLowerCase() === base) ||
    (base === "hi"
      ? voices.find((v) => /hindi|हिंदी/i.test(v.name || ""))
      : null) ||
    (base === "mr"
      ? voices.find((v) => /marathi|मराठी/i.test(v.name || ""))
      : null) ||
    null
  );
}

/** No mr-IN on many PCs — use Hindi voice so audio still plays. */
function resolveVoiceForTts(langCode) {
  let v = findBestVoice(langCode);
  let utterLang = langCode;
  if (String(langCode || "").toLowerCase().startsWith("mr") && !v) {
    v = findBestVoice("hi-IN");
    if (v) utterLang = (v.lang || "").trim() || "hi-IN";
  }
  if (v) {
    const vl = (v.lang || "").trim();
    if (vl) utterLang = vl;
  }
  return { voice: v, utterLang };
}

function ttsRateFor(utterLang) {
  const l = String(utterLang || "").toLowerCase();
  if (l.startsWith("en")) return 2;
  if (l.startsWith("hi")) return 0.88;
  if (l.startsWith("mr")) return 0.92;
  return 1;
}

function speakWithBrowser(text, langCode) {
  if (!("speechSynthesis" in window)) return Promise.resolve(false);
  if (!text?.trim()) return Promise.resolve(false);
  primeBrowserTts();

  return new Promise((resolve) => {
    if (!cachedVoices.length) {
      window.setTimeout(() => loadSpeechVoices(), 400);
    }

    const { voice, utterLang } = resolveVoiceForTts(langCode);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = utterLang;
    u.rate = ttsRateFor(utterLang);
    u.pitch = 1;
    if (voice) u.voice = voice;

    let done = false;
    const finish = (ok) => {
      if (done) return;
      done = true;
      resolve(ok);
    };

    u.onerror = (e) => {
      console.warn("speech synthesis:", e?.error);
      finish(false);
    };
    u.onend = () => finish(true);

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(u);
      window.setTimeout(() => {
        if (!done && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) finish(true);
      }, 500);
    } catch (err) {
      console.warn(err);
      finish(false);
    }
  });
}

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;
  primeBrowserTts();

  addMessage("user", text);
  inputEl.value = "";
  setLoading(true);
  setStatus("Sending…");

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        messages: conversation.map((m) => ({ role: m.role, content: m.content })),
        language: selectedLanguage()
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.details || data.error || `Request failed (${res.status})`);

    const reply = (data.reply || "").trim() || "Sorry—could you repeat that?";
    addMessage("assistant", reply);

    const ui = selectedLanguage();
    let speakLang = detectResponseSpeechLang(reply);
    if (/[\u0900-\u097F]/.test(reply)) {
      if (ui === "Marathi") speakLang = "mr-IN";
      else if (ui === "Hindi") speakLang = "hi-IN";
    }
    setStatus(`Speaking (${speakLang})…`);
    const ok = await speakWithBrowser(reply, speakLang);
    setStatus(ok ? "Ready." : "Ready (voice may be limited in this browser).");
  } catch (error) {
    setStatus(`Error: ${error.message}`);
  } finally {
    setLoading(false);
  }
}

async function extractProfile() {
  if (conversation.length === 0) {
    setStatus("Chat first, then extract.");
    return;
  }

  setLoading(true);
  setStatus("Extracting…");

  try {
    const res = await fetch("/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        messages: conversation.map((m) => ({ role: m.role, content: m.content }))
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.details || data.error || `Extract failed (${res.status})`);

    profileOutputEl.textContent = JSON.stringify(data.profile, null, 2);
    setStatus("Extraction done.");
  } catch (error) {
    setStatus(`Extract error: ${error.message}`);
  } finally {
    setLoading(false);
  }
}

/* ----- Web Speech recognition ----- */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let listening = false;
let voiceModeEnabled = false;
let latestTranscript = "";
let autoSendTimer = null;

function readableVoiceError(code) {
  if (code === "not-allowed") return "Microphone denied. Allow access for this site.";
  if (code === "service-not-allowed") return "Speech blocked. Try Chrome or Edge.";
  if (code === "no-speech") return "No speech heard—try again.";
  if (code === "audio-capture") return "No microphone found.";
  if (code === "network") return "Network error during recognition.";
  return `Voice: ${code}`;
}

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = speechLangCode(selectedLanguage());
  recognition.interimResults = true;
  recognition.continuous = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    listening = true;
    voiceBtn.textContent = "Stop Speaking";
    setStatus("Listening…");
  };

  recognition.onresult = (event) => {
    let interimText = "";
    let finalText = "";

    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const piece = event.results[i]?.[0]?.transcript?.trim();
      if (!piece) continue;
      if (event.results[i].isFinal) finalText += `${piece} `;
      else interimText += `${piece} `;
    }

    const preview = (finalText || interimText).trim();
    if (preview) {
      latestTranscript = preview;
      inputEl.value = preview;
      setStatus("Listening…");
    }

    if (finalText.trim()) {
      inputEl.value = finalText.trim();
      latestTranscript = "";
      if (autoSendTimer) {
        clearTimeout(autoSendTimer);
        autoSendTimer = null;
      }
      sendMessage();
      return;
    }

    if (latestTranscript) {
      if (autoSendTimer) clearTimeout(autoSendTimer);
      autoSendTimer = setTimeout(() => {
        if (!latestTranscript || !listening) return;
        inputEl.value = latestTranscript;
        latestTranscript = "";
        sendMessage();
      }, 1300);
    }
  };

  recognition.onerror = (event) => {
    if (event.error === "not-allowed" || event.error === "service-not-allowed" || event.error === "audio-capture") {
      voiceModeEnabled = false;
    }
    setStatus(readableVoiceError(event.error));
  };

  recognition.onend = () => {
    listening = false;
    if (autoSendTimer) {
      clearTimeout(autoSendTimer);
      autoSendTimer = null;
    }
    latestTranscript = "";

    if (voiceModeEnabled) {
      setStatus("Listening… (restarting)");
      setTimeout(() => {
        if (!voiceModeEnabled || listening) return;
        try {
          recognition.start();
        } catch {
          /* ignore */
        }
      }, 150);
      return;
    }

    voiceBtn.textContent = "Start Speaking";
    const st = String(statusEl.textContent);
    if (!st.startsWith("Voice:") && !st.startsWith("Microphone") && !st.startsWith("Error:")) {
      setStatus("Ready.");
    }
  };
} else {
  voiceBtn.disabled = true;
  setStatus("Speech recognition unsupported—use Chrome/Edge or type.");
}

if (languageSelect) {
  languageSelect.addEventListener("change", () => {
    if (recognition && !listening) recognition.lang = speechLangCode(selectedLanguage());
    setStatus(`Language: ${selectedLanguage()}`);
  });
}

sendBtn.addEventListener("click", () => {
  primeBrowserTts();
  sendMessage();
});

inputEl.addEventListener("keydown", (event) => {
  primeBrowserTts();
  if (event.key === "Enter") sendMessage();
});

voiceBtn.addEventListener("click", () => {
  primeBrowserTts();
  if (!recognition) return;

  if (listening) {
    voiceModeEnabled = false;
    recognition.stop();
  } else {
    try {
      voiceModeEnabled = true;
      recognition.lang = speechLangCode(selectedLanguage());
      setStatus("Requesting microphone…");
      recognition.start();
    } catch (error) {
      voiceModeEnabled = false;
      setStatus(`Voice error: ${error.message}`);
    }
  }
});

extractBtn.addEventListener("click", extractProfile);

function introByLanguage(lang) {
  if (lang === "Hindi") {
    return "नमस्ते! मैं आपका ओवरसीज़ एजुकेशन काउंसलर हूँ। शुरू करने के लिए अपना नाम बताइए?";
  }
  if (lang === "Marathi") {
    return "नमस्कार! मी तुमचा विदेशात शिक्षणासाठीचा समुपदेशक आहे. सुरुवातीला तुमचे नाव सांगाल का?";
  }
  return "Hi! I am your overseas education counsellor. What is your name?";
}

// Include greeting in history so the first /chat call has assistant context.
addMessage("assistant", introByLanguage(selectedLanguage()), true);
