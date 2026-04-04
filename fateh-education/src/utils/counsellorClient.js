/**
 * Backend: POST /api/chat, POST /api/extract (Express + Groq).
 * Dev: proxied via src/setupProxy.js. Production: set REACT_APP_API_BASE_URL to backend origin.
 */

const BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");

export function uiLangToApi(langCode) {
  if (langCode === "HI") return "Hindi";
  if (langCode === "MR") return "Marathi";
  return "English";
}

export function speechRecognitionLang(langCode) {
  if (langCode === "HI") return "hi-IN";
  if (langCode === "MR") return "mr-IN";
  return "en-US";
}

/** BCP-47 for SpeechSynthesis from assistant reply text */
export function detectSpeechLangForTts(text) {
  const t = (text || "").trim();
  if (!t) return "en-IN";
  if (!/[\u0900-\u097F]/.test(t)) return "en-IN";
  if (/[ळऱ]/.test(t)) return "mr-IN";
  if (/(आहे|आहेत|नाही|मला|तुम्हाला|धन्यवाद|कसं|कशी|कोणता|कोणती|मराठी)/.test(t)) {
    return "mr-IN";
  }
  return "hi-IN";
}

/** Force TTS locale from UI language (use for greeting so HI/MR always get correct voice). */
export function ttsLocaleFromUiLang(langCode) {
  if (langCode === "HI") return "hi-IN";
  if (langCode === "MR") return "mr-IN";
  if (langCode === "EN") return "en-IN";
  return null;
}

/**
 * Resolve BCP-47 for TTS.
 * @param {string} text
 * @param {{ uiLang?: string, forceUiLocale?: boolean }} opts forceUiLocale: greeting uses UI lang only; replies use Devanagari + uiLang hint.
 */
export function resolveChatTtsLang(text, opts = {}) {
  const t = (text || "").trim();
  if (opts.forceUiLocale) {
    const f = ttsLocaleFromUiLang(opts.uiLang);
    if (f) return f;
  }
  const hasDeva = /[\u0900-\u097F]/.test(t);
  if (hasDeva) {
    if (opts.uiLang === "MR") return "mr-IN";
    if (opts.uiLang === "HI") return "hi-IN";
  }
  return detectSpeechLangForTts(t);
}

/** speechSynthesis.rate: Hindi engines often sound fast; English was tuned up separately. */
export function ttsRateForLocale(langCode) {
  const l = (langCode || "").toLowerCase();
  if (l.startsWith("en")) return 2;
  if (l.startsWith("hi")) return 0.88;
  if (l.startsWith("mr")) return 0.92;
  return 1;
}

/**
 * Pick a SpeechSynthesis voice; browsers often return [] until voiceschanged fires.
 * @param {SpeechSynthesisVoice[]} voices
 * @param {string} locale e.g. hi-IN
 */
export function pickVoiceForLocale(voices, locale) {
  if (!voices?.length || !locale) return null;
  const loc = locale.toLowerCase();
  const base = loc.split("-")[0];

  const exact = voices.find((x) => (x.lang || "").toLowerCase() === loc);
  if (exact) return exact;

  const byPrefix = voices.find((x) => {
    const l = (x.lang || "").toLowerCase();
    return l.startsWith(`${base}-`) || l === base;
  });
  if (byPrefix) return byPrefix;

  if (base === "hi") {
    const byName = voices.find((x) => /hindi|हिंदी/i.test(x.name || ""));
    if (byName) return byName;
  }
  if (base === "mr") {
    const byName = voices.find((x) => /marathi|मराठी/i.test(x.name || ""));
    if (byName) return byName;
  }

  return null;
}

/**
 * Many systems have hi-IN but no mr-IN — fall back to Hindi voice and match utterance.lang to the voice.
 * @returns {{ voice: SpeechSynthesisVoice | null, utteranceLang: string }}
 */
export function resolveSpeechSynthesisVoice(voices, locale) {
  if (!voices?.length || !locale) {
    return { voice: null, utteranceLang: locale || "en-IN" };
  }
  let voice = pickVoiceForLocale(voices, locale);

  if (locale.toLowerCase().startsWith("mr") && !voice) {
    voice = pickVoiceForLocale(voices, "hi-IN");
  }

  if (voice) {
    const vl = (voice.lang || "").trim();
    return { voice, utteranceLang: vl || locale };
  }
  return { voice: null, utteranceLang: locale };
}

export async function postChat(messages, language) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ messages, language })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.details || data.error || `Chat failed (${res.status})`);
  }
  return data.reply || "";
}

/**
 * @param {{ persist?: boolean, language?: string, source?: string }} [opts] persist=false skips DB write
 * @returns {Promise<{ profile: object, leadQualification: object | null, studentPublicId: string | null }>}
 */
export async function postExtract(messages, opts = {}) {
  const res = await fetch(`${BASE}/api/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      messages,
      persist: opts.persist !== false,
      language: opts.language,
      source: opts.source
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.details || data.error || `Extract failed (${res.status})`);
  }
  return {
    profile: data.profile,
    leadQualification: data.leadQualification ?? null,
    studentPublicId: data.studentPublicId ?? null
  };
}

/** Map English-normalized extract JSON into StudentView phase/dashboard fields */
export function profileToStudentFields(profile) {
  const p = profile || {};
  const u = (v) => (v && v !== "unknown" ? String(v) : "");
  return {
    name: u(p.name),
    email: u(p.email),
    phone: u(p.phone),
    location: u(p.location),
    education: u(p.education),
    field: u(p.field),
    institution: u(p.institution),
    gpa: u(p.gpa),
    countries: u(p.countries),
    course: u(p.course),
    intake: u(p.intake),
    ielts: u(p.ielts_status),
    budget: u(p.budget),
    timeline: u(p.timeline),
    sponsorship: u(p.sponsorship)
  };
}

const SCORE_KEYS = [
  "name",
  "interest",
  "goal",
  "email",
  "phone",
  "location",
  "education",
  "field",
  "institution",
  "gpa",
  "countries",
  "course",
  "intake",
  "ielts_status",
  "budget",
  "timeline",
  "sponsorship"
];

export function scoreFromProfile(profile) {
  const filled = SCORE_KEYS.filter((k) => profile?.[k] && profile[k] !== "unknown").length;
  return Math.min(98, 35 + Math.round((filled / SCORE_KEYS.length) * 63));
}
