import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  uiLangToApi,
  speechRecognitionLang,
  resolveChatTtsLang,
  resolveSpeechSynthesisVoice,
  ttsRateForLocale,
  postChat,
  postExtract,
  profileToStudentFields,
} from "../utils/counsellorClient";
/* ═══════════════════════════════════════════════════════════════
   FATEH EDUCATION — Student View
   AI Voice Agent + Student Overview Dashboard
   Dark glassmorphism · Desktop & Mobile responsive
   ═══════════════════════════════════════════════════════════════ */

// ── Design tokens (inline styles for portability) ──
const T = {
  bg: "#060b14",
  bgGrad: "radial-gradient(ellipse 90% 55% at 50% -5%, #0d2547 0%, #060b14 50%, #030508 100%)",
  glass: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
  glassBorder: "1px solid rgba(255,255,255,0.09)",
  glassShadow: "0 8px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
  blue: "#2563eb",
  blueLight: "#60a5fa",
  blueMid: "#3b82f6",
  font: "'Syne', 'Space Grotesk', sans-serif",
  fontBody: "'Space Grotesk', sans-serif",
};

// ── Mock data that fills in per phase ──
const MOCK_DATA = {
  phase1: { name: "Priya Sharma", email: "priya.sharma@gmail.com", phone: "+91 98765 43210", location: "Pune, Maharashtra" },
  phase2: { education: "Bachelor's (B.Tech)", field: "Computer Science", institution: "SPPU, Pune", gpa: "8.4 / 10", countries: "UK, Ireland", course: "MSc AI / Data Science", intake: "September 2025" },
  phase3: { ielts: "Preparing (Target 7.0)", budget: "₹40–55 Lakhs", timeline: "6–8 months", sponsorship: "Self-funded + Education Loan" },
};

// ── Unique ID generator ──
function genID() {
  return "FE-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Date.now().toString(36).slice(-4).toUpperCase();
}

function introForLang(langCode) {
  if (langCode === "HI") {
    return "नमस्ते! विदेश में पढ़ाई की पूरी जानकारी के लिए कुछ छोटे-छोटे सवाल पूछूँगी। पहले बताइए, मैं आपको क्या नाम से बुलाऊँ?";
  }
  if (langCode === "MR") {
    return "नमस्कार! परदेशी शिक्षणाबद्दल थोडे प्रश्न विचारेन. आधी सांगा, मी तुम्हाला कोणत्या नावाने हाक मारू?";
  }
  return "Hey! I'll ask a few short things about your study-abroad plan—goals, school background, destinations, tests, budget, and how to reach you. First, what should I call you?";
}

// ── Returning-student mock DB ──
const MOCK_DB = {
  "FE-DEMO-2025": {
    id: "FE-DEMO-2025",
    ...MOCK_DATA.phase1,
    ...MOCK_DATA.phase2,
    ...MOCK_DATA.phase3,
    date: "Jun 12, 2025",
  },
};

// ════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════

// ── Shield Logo ──
function FatehLogo({ size = 32 }) {
  return (
    <svg width={size} height={size * 1.11} viewBox="0 0 36 40" fill="none">
      <path d="M18 2L2 8v12c0 10 6.5 17 16 19 9.5-2 16-9 16-19V8L18 2Z" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="1" />
      <path d="M18 9L21 19 18 16 15 19Z" fill="white" opacity="0.95" />
      <path d="M18 16L20 25 18 23 16 25Z" fill="#93c5fd" opacity="0.85" />
      <circle cx="18" cy="27" r="1.5" fill="white" opacity="0.65" />
    </svg>
  );
}

// ── Pulsing Orb (AI visual) ──
function AIOrb({ active }) {
  return (
    <div style={{ position: "relative", width: 160, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Outer rings */}
      {[1, 2, 3].map((i) => (
        <div key={i} style={{
          position: "absolute",
          width: 160 - i * 8,
          height: 160 - i * 8,
          borderRadius: "50%",
          border: `1px solid rgba(59,130,246,${active ? 0.25 - i * 0.06 : 0.1})`,
          animation: active ? `orbRing ${1.4 + i * 0.4}s ease-in-out infinite` : "none",
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
      {/* Core */}
      <div style={{
        width: 100,
        height: 100,
        borderRadius: "50%",
        background: active
          ? "radial-gradient(circle, rgba(37,99,235,0.9) 0%, rgba(29,78,216,0.7) 40%, rgba(37,99,235,0.3) 100%)"
          : "radial-gradient(circle, rgba(37,99,235,0.35) 0%, rgba(29,78,216,0.2) 60%, transparent 100%)",
        boxShadow: active
          ? "0 0 60px rgba(37,99,235,0.7), 0 0 120px rgba(37,99,235,0.3), inset 0 0 30px rgba(147,197,253,0.3)"
          : "0 0 20px rgba(37,99,235,0.2)",
        transition: "all 0.6s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: active ? "orbPulse 2s ease-in-out infinite" : "none",
      }}>
        {/* Waveform bars */}
        <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{
              width: 3,
              background: "rgba(255,255,255,0.9)",
              borderRadius: 2,
              animation: active ? `wave ${0.8 + i * 0.1}s ease-in-out infinite alternate` : "none",
              animationDelay: `${i * 0.1}s`,
              height: active ? undefined : 8,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Phase field row ──
function PhaseField({ label, value, filled, delay = 0 }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 2,
      opacity: filled ? 1 : 0.35,
      transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
      transform: filled ? "translateX(0)" : "translateX(-6px)",
    }}>
      <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(148,163,184,0.5)", fontFamily: T.fontBody }}>{label}</span>
      <div style={{
        fontSize: 12,
        color: filled ? "#e2e8f0" : "rgba(100,116,139,0.6)",
        fontFamily: T.fontBody,
        background: filled ? "rgba(37,99,235,0.08)" : "rgba(255,255,255,0.03)",
        border: filled ? "1px solid rgba(59,130,246,0.2)" : "1px solid rgba(255,255,255,0.06)",
        padding: "5px 8px",
        borderRadius: 6,
        minHeight: 26,
        transition: "all 0.4s ease",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>
        {filled ? value : "—"}
      </div>
    </div>
  );
}

// ── Phase panel ──
function PhasePanel({ phase, currentPhase, data }) {
  const isActive = currentPhase === phase;
  const isDone = currentPhase > phase;
  const label = ["Personal Info", "Academic Profile", "Readiness"][phase - 1];
  const color = isDone ? "#10b981" : isActive ? "#3b82f6" : "rgba(148,163,184,0.3)";

  const fields = {
    1: [
      { label: "Full Name", key: "name" },
      { label: "Email", key: "email" },
      { label: "Phone", key: "phone" },
      { label: "Location", key: "location" },
    ],
    2: [
      { label: "Education", key: "education" },
      { label: "Field", key: "field" },
      { label: "Institution", key: "institution" },
      { label: "GPA / Score", key: "gpa" },
      { label: "Target Countries", key: "countries" },
      { label: "Course Interest", key: "course" },
      { label: "Intake", key: "intake" },
    ],
    3: [
      { label: "IELTS / TOEFL", key: "ielts" },
      { label: "Budget", key: "budget" },
      { label: "Timeline", key: "timeline" },
      { label: "Sponsorship", key: "sponsorship" },
    ],
  }[phase];

  return (
    <div style={{
      borderRadius: 16,
      padding: "14px 16px",
      background: isActive
        ? "linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(37,99,235,0.03) 100%)"
        : "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
      border: isActive ? "1px solid rgba(59,130,246,0.3)" : isDone ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(255,255,255,0.06)",
      backdropFilter: "blur(12px)",
      transition: "all 0.4s ease",
    }}>
      {/* Phase header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 20, height: 20, borderRadius: "50%",
          background: isDone ? "#10b981" : isActive ? "#2563eb" : "rgba(255,255,255,0.08)",
          border: `1px solid ${color}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 700, color: "#fff",
          flexShrink: 0,
        }}>
          {isDone ? "✓" : phase}
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color, fontFamily: T.fontBody, letterSpacing: "0.05em" }}>{label}</span>
        {isActive && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "#3b82f6", animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        )}
      </div>
      {/* Fields */}
      <div style={{ display: "grid", gridTemplateColumns: phase === 2 ? "1fr 1fr" : "1fr 1fr", gap: "6px 10px" }}>
        {fields.map((f, i) => (
          <PhaseField
            key={f.key}
            label={f.label}
            value={data[f.key]}
            filled={isDone || (isActive && data[f.key])}
            delay={i * 0.08}
          />
        ))}
      </div>
    </div>
  );
}

// ── Dashboard card ──
function DashCard({ title, icon, children, accent }) {
  return (
    <div style={{
      borderRadius: 20,
      padding: "20px 22px",
      background: T.glass,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: accent ? `1px solid rgba(59,130,246,0.25)` : T.glassBorder,
      boxShadow: T.glassShadow,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(148,163,184,0.6)", fontFamily: T.fontBody }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function DataRow({ label, value, highlight }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", gap: 12 }}>
      <span style={{ fontSize: 12, color: "rgba(148,163,184,0.55)", fontFamily: T.fontBody, flexShrink: 0 }}>{label}</span>
      <span style={{
        fontSize: 12, fontFamily: T.fontBody, textAlign: "right",
        color: highlight ? "#60a5fa" : "#e2e8f0",
        fontWeight: highlight ? 600 : 400,
      }}>{value}</span>
    </div>
  );
}

// ════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════
export default function StudentView() {
  // 1. Removed bookingOpen state as we are redirecting now
  const [callState, setCallState] = useState("idle"); // idle | active | ended
  const [currentPhase, setCurrentPhase] = useState(0);
  const [phaseData, setPhaseData] = useState({});
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashData, setDashData] = useState(null);
  const [returnCode, setReturnCode] = useState("");
  const [codeError, setCodeError] = useState("");
  
  // 2. Added the navigate hook for redirection
  const navigate = useNavigate(); 
  
  const [lang, setLang] = useState("EN");
  const [elapsed, setElapsed] = useState(0);
  const [conversation, setConversation] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [typedInput, setTypedInput] = useState("");

  const dashRef = useRef(null);
  const timerRef = useRef(null);
  const phaseTimers = useRef([]);
  const conversationRef = useRef([]);
  const recognitionRef = useRef(null);
  const voiceModeRef = useRef(false);
  const autoSendTimerRef = useRef(null);
  const sendingRef = useRef(false);
  const callStateRef = useRef("idle");
  const langRef = useRef(lang);
  /** True while TTS is playing — ignore recognition (avoids mic picking up speaker). */
  const ttsPlayingRef = useRef(false);
  /** Ignore STT results until this timestamp (tail of TTS / room echo after mic opens). */
  const ignoreSttUntilRef = useRef(0);

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);
  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return undefined;
    const load = () => {
      window.speechSynthesis.getVoices();
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return undefined;
  }, []);

  useEffect(() => {
    return () => {
      voiceModeRef.current = false;
      if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current);
      try {
        recognitionRef.current?.stop();
      } catch {
        /* noop */
      }
    };
  }, []);

  // ── Call timer ──
  useEffect(() => {
    if (callState === "active") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [callState]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const appendMessage = (role, content) => {
    const next = [...conversationRef.current, { role, content }];
    conversationRef.current = next;
    setConversation(next);
  };

  /** Stop STT so speaker output is not transcribed as “user” speech (echo loop). */
  const pauseMicForTts = () => {
    ttsPlayingRef.current = true;
    voiceModeRef.current = false;
    if (autoSendTimerRef.current) {
      clearTimeout(autoSendTimerRef.current);
      autoSendTimerRef.current = null;
    }
    try {
      recognitionRef.current?.stop();
    } catch {
      /* not running */
    }
  };

  /** Resume STT after assistant audio finishes (delay lets room noise settle). */
  const resumeMicAfterTts = () => {
    ttsPlayingRef.current = false;
    if (callStateRef.current !== "active" || !recognitionRef.current) return;
    voiceModeRef.current = true;
    window.setTimeout(() => {
      if (callStateRef.current !== "active" || !voiceModeRef.current || ttsPlayingRef.current) return;
      ignoreSttUntilRef.current = Date.now() + 650;
      try {
        recognitionRef.current?.start();
      } catch {
        /* already listening or invalid state */
      }
    }, 550);
  };

  /**
   * @param {{ skipResume?: boolean, uiLang?: 'EN'|'HI'|'MR', forceUiLocale?: boolean }} [opts]
   * forceUiLocale + uiLang: opening greeting. Otherwise uiLang steers Devanagari replies (MR vs HI).
   */
  const speakText = useCallback((text, opts = {}) =>
    new Promise((resolve) => {
      const skipResume = opts.skipResume === true;
      const done = () => {
        if (skipResume) {
          ttsPlayingRef.current = false;
        } else {
          resumeMicAfterTts();
        }
        resolve();
      };

      if (typeof window === "undefined" || !window.speechSynthesis || !text?.trim()) {
        resolve();
        return;
      }

      pauseMicForTts();

      void (async () => {
        try {
          let voices = window.speechSynthesis.getVoices();
          if (!voices.length) {
            await new Promise((r) => {
              let settled = false;
              const finish = () => {
                if (settled) return;
                settled = true;
                window.speechSynthesis.removeEventListener("voiceschanged", finish);
                r();
              };
              window.speechSynthesis.addEventListener("voiceschanged", finish);
              window.setTimeout(finish, 1000);
            });
            voices = window.speechSynthesis.getVoices();
          }

          const langCode = resolveChatTtsLang(text, {
            uiLang: opts.uiLang,
            forceUiLocale: opts.forceUiLocale === true
          });
          const { voice, utteranceLang } = resolveSpeechSynthesisVoice(voices, langCode);

          const u = new SpeechSynthesisUtterance(text);
          u.lang = utteranceLang;
          u.rate = ttsRateForLocale(utteranceLang);
          u.pitch = 1;
          if (voice) u.voice = voice;

          u.onend = () => done();
          u.onerror = () => done();
          try {
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(u);
          } catch {
            done();
          }
        } catch {
          done();
        }
      })();
    }), []);

  const runUserMessage = useCallback(async (raw) => {
    const text = (raw || "").trim();
    if (!text || sendingRef.current) return;
    sendingRef.current = true;
    setChatLoading(true);
    setChatError("");
    appendMessage("user", text);
    try {
      const reply = await postChat(conversationRef.current, uiLangToApi(langRef.current));
      const trimmed = (reply || "").trim() || "Could you say that once more?";
      appendMessage("assistant", trimmed);
      await speakText(trimmed, { uiLang: langRef.current });
    } catch (e) {
      setChatError(e?.message || "Request failed");
      appendMessage(
        "assistant",
        "Sorry — I could not reach the counsellor service. Start the API on port 5000 or check your connection."
      );
    } finally {
      sendingRef.current = false;
      setChatLoading(false);
    }
  }, [speakText]);

  const stopRecognition = () => {
    ttsPlayingRef.current = false;
    ignoreSttUntilRef.current = 0;
    voiceModeRef.current = false;
    if (autoSendTimerRef.current) {
      clearTimeout(autoSendTimerRef.current);
      autoSendTimerRef.current = null;
    }
    try {
      recognitionRef.current?.stop();
    } catch {
      /* noop */
    }
    recognitionRef.current = null;
  };

  // ── Start call (real mic + Groq /chat) ──
  const handleStartCall = () => {
    stopRecognition();
    phaseTimers.current.forEach(clearTimeout);
    phaseTimers.current = [];
    setChatError("");
    setTypedInput("");
    conversationRef.current = [];
    setConversation([]);
    sendingRef.current = false;
    setChatLoading(false);

    const greeting = introForLang(lang);
    appendMessage("assistant", greeting);

    setCallState("active");
    setCurrentPhase(1);
    setElapsed(0);
    setPhaseData({});
    setShowDashboard(false);
    setDashData(null);

    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) {
      setChatError("Voice not supported in this browser — type your replies below.");
      return;
    }

    const r = new SR();
    r.lang = speechRecognitionLang(lang);
    r.interimResults = true;
    r.continuous = true;
    r.maxAlternatives = 1;

    let latestTranscript = "";

    r.onresult = (event) => {
      if (ttsPlayingRef.current || sendingRef.current) return;
      if (Date.now() < ignoreSttUntilRef.current) return;

      let interimText = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const piece = event.results[i]?.[0]?.transcript?.trim();
        if (!piece) continue;
        if (event.results[i].isFinal) finalText += `${piece} `;
        else interimText += `${piece} `;
      }
      const preview = (finalText || interimText).trim();
      if (preview) latestTranscript = preview;

      if (finalText.trim()) {
        latestTranscript = "";
        if (autoSendTimerRef.current) {
          clearTimeout(autoSendTimerRef.current);
          autoSendTimerRef.current = null;
        }
        void runUserMessage(finalText.trim());
        return;
      }

      if (latestTranscript) {
        if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current);
        const pauseMs = langRef.current === "EN" ? 1300 : 1650;
        autoSendTimerRef.current = setTimeout(() => {
          if (!latestTranscript || ttsPlayingRef.current || sendingRef.current) return;
          const t = latestTranscript;
          latestTranscript = "";
          void runUserMessage(t);
        }, pauseMs);
      }
    };

    r.onend = () => {
      if (ttsPlayingRef.current) return;
      if (voiceModeRef.current && callStateRef.current === "active") {
        setTimeout(() => {
          if (ttsPlayingRef.current) return;
          try {
            r.start();
          } catch {
            /* noop */
          }
        }, 180);
      }
    };

    recognitionRef.current = r;
    voiceModeRef.current = false;

    void (async () => {
      await speakText(greeting, { skipResume: true, uiLang: lang, forceUiLocale: true });
      if (callStateRef.current !== "active") return;
      // Let the greeting finish in the room before opening the mic (avoids transcribing TTS as “user”).
      await new Promise((res) => {
        window.setTimeout(res, 900);
      });
      if (callStateRef.current !== "active") return;
      voiceModeRef.current = true;
      ignoreSttUntilRef.current = Date.now() + 800;
      try {
        r.start();
      } catch {
        setChatError("Microphone could not start — allow access or type below.");
      }
    })();
  };

  // ── End call → Groq /extract → dashboard ──
  const handleEndCall = async () => {
    stopRecognition();
    phaseTimers.current.forEach(clearTimeout);
    phaseTimers.current = [];
    setCallState("ended");
    setCurrentPhase(4);

    if (!conversationRef.current.length) {
      setChatError("No conversation to extract.");
      return;
    }

    setChatLoading(true);
    setChatError("");
    try {
      const { profile, studentPublicId } = await postExtract(conversationRef.current, {
        language: uiLangToApi(lang),
        source: "fateh_student_voice"
      });
      const fields = profileToStudentFields(profile);
      const id = genID();
      const full = {
        id,
        ...fields,
        mongoStudentId: studentPublicId || null,
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      };
      setPhaseData(fields);
      setDashData(full);
      setTimeout(() => {
        setShowDashboard(true);
        setTimeout(() => dashRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      }, 400);
    } catch (e) {
      setChatError(e?.message || "Extraction failed.");
      const id = genID();
      const emptyFields = profileToStudentFields({});
      setDashData({
        id,
        ...emptyFields,
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      });
      setPhaseData(emptyFields);
      setShowDashboard(true);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendTyped = () => {
    if (!typedInput.trim()) return;
    const t = typedInput.trim();
    setTypedInput("");
    void runUserMessage(t);
  };

  useEffect(() => {
    if (recognitionRef.current && callState === "active") {
      recognitionRef.current.lang = speechRecognitionLang(lang);
    }
  }, [lang, callState]);

  // ── Return code ──
  const handleReturnCode = () => {
    const d = MOCK_DB[returnCode.trim().toUpperCase()];
    if (d) {
      setCodeError("");
      setDashData(d);
      setShowDashboard(true);
      setTimeout(() => dashRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } else {
      setCodeError("Code not found. Try: FE-DEMO-2025");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Space+Grotesk:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #030508; }
        ::-webkit-scrollbar-thumb { background: #1d4ed8; border-radius: 3px; }

        @keyframes orbPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 60px rgba(37,99,235,0.7), 0 0 120px rgba(37,99,235,0.3); }
          50% { transform: scale(1.06); box-shadow: 0 0 80px rgba(37,99,235,0.9), 0 0 160px rgba(37,99,235,0.4); }
        }
        @keyframes orbRing {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.12); opacity: 1; }
        }
        @keyframes wave {
          from { height: 6px; }
          to { height: 28px; }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes callPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.5); }
          50% { box-shadow: 0 0 0 12px rgba(37,99,235,0); }
        }
        @keyframes bookGlow {
          0%, 100% { box-shadow: 0 0 24px rgba(37,99,235,0.5), 0 4px 24px rgba(0,0,0,0.4); }
          50% { box-shadow: 0 0 48px rgba(37,99,235,0.8), 0 8px 32px rgba(0,0,0,0.5); }
        }
        @keyframes calFloat {
          0%, 100% { transform: translateY(0) rotate(-4deg); }
          50% { transform: translateY(-5px) rotate(-4deg); }
        }
        @keyframes gridMove {
          from { background-position: 0 0; }
          to { background-position: 48px 48px; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .fade-in { animation: fadeUp 0.6s ease both; }
        .slide-in { animation: slideIn 0.7s cubic-bezier(0.23, 1, 0.32, 1) both; }
        .start-btn:hover { transform: scale(1.04) !important; }
        .end-btn:hover { transform: scale(1.04) !important; }
        .lang-btn:hover { background: rgba(37,99,235,0.2) !important; color: #93c5fd !important; }
        .code-submit:hover { background: #2563eb !important; }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .agent-grid { flex-direction: column !important; }
          .phases-panel { width: 100% !important; max-height: 360px; overflow-y: auto; }
          .dash-grid-4 { grid-template-columns: 1fr 1fr !important; }
          .dash-grid-3 { grid-template-columns: 1fr !important; }
          .orb-wrap { width: 120px !important; height: 120px !important; }
          .controls-row { flex-wrap: wrap !important; gap: 10px !important; }
        }
        @media (max-width: 480px) {
          .dash-grid-4 { grid-template-columns: 1fr !important; }
          .hero-pad { padding: 20px 16px !important; }
          .header-inner { padding: 12px 16px !important; }
        }
      `}</style>

      <div style={{ background: T.bgGrad, minHeight: "100vh", fontFamily: T.fontBody, position: "relative", overflowX: "hidden" }}>

        {/* Grid bg */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: "linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 0%, black 20%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 0%, black 20%, transparent 100%)",
        }} />
        {/* Orb */}
        <div style={{ position: "fixed", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)", top: -100, left: "5%", filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />

        {/* ── HEADER ── */}
        <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(6,11,20,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="header-inner" style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FatehLogo size={30} />
              <div>
                <div style={{ color: "#fff", fontFamily: T.font, fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em", lineHeight: 1.2 }}>FATEH</div>
                <div style={{ color: "#3b82f6", fontSize: 9, letterSpacing: "0.1em" }}>EDUCATION</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {/* Latency badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 100, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.22)" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
                <span style={{ fontSize: 10, color: "#6ee7b7", fontWeight: 600, letterSpacing: "0.05em" }}>&lt;3s response</span>
              </div>
              {/* Language selector */}
              <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 2 }}>
                {["EN", "HI", "MR"].map((l) => (
                  <button key={l} className="lang-btn" onClick={() => setLang(l)} style={{
                    padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer",
                    fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", fontFamily: T.fontBody,
                    background: lang === l ? "rgba(37,99,235,0.35)" : "transparent",
                    color: lang === l ? "#93c5fd" : "rgba(148,163,184,0.5)",
                    transition: "all 0.2s ease",
                  }}>{l}</button>
                ))}
              </div>
              {/* Call status */}
              {callState === "active" && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 100, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", animation: "callPulse 1.5s infinite" }} />
                  <span style={{ fontSize: 11, color: "#fca5a5", fontWeight: 600 }}>LIVE · {fmt(elapsed)}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        <main style={{ position: "relative", zIndex: 1 }}>

          {/* ── SECTION 1 — VOICE AGENT ── */}
          <section className="hero-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 28px 48px" }}>
            {/* Returning user bar */}
            <div className="fade-in" style={{ marginBottom: 32, animationDelay: "0.05s" }}>
              <div style={{ borderRadius: 16, padding: "14px 20px", background: T.glass, backdropFilter: "blur(20px)", border: T.glassBorder, boxShadow: T.glassShadow, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto" }}>
                  <span style={{ fontSize: 16 }}>🔑 Already registered?</span>
                </div>
                <div style={{ flex: 1, minWidth: 200, display: "flex", gap: 8 }}>
                  <input value={returnCode} onChange={(e) => { setReturnCode(e.target.value); setCodeError(""); }} onKeyDown={(e) => e.key === "Enter" && handleReturnCode()} placeholder="Enter unique code" style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "9px 14px", color: "#e2e8f0", outline: "none" }} />
                  <button className="code-submit" onClick={handleReturnCode} style={{ background: "rgba(37,99,235,0.25)", border: "1px solid rgba(59,130,246,0.35)", color: "#93c5fd", padding: "9px 18px", borderRadius: 10, cursor: "pointer", fontWeight: 600 }}>Access →</button>
                </div>
              </div>
              {codeError ? (
                <div style={{ marginTop: 10, fontSize: 12, color: "#fca5a5", fontFamily: T.fontBody }}>{codeError}</div>
              ) : null}
            </div>

            <div className="agent-grid" style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
              {/* Left: Orb + controls */}
              <div className="fade-in" style={{ flex: "0 0 auto", width: "min(100%, 340px)", borderRadius: 24, padding: "32px 24px", background: T.glass, border: T.glassBorder, boxShadow: T.glassShadow, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                <AIOrb active={callState === "active"} />
                <div
                  className="controls-row"
                  style={{
                    display: "flex",
                    flexDirection: callState === "ended" ? "column" : "row",
                    gap: 12,
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  {callState === "idle" && (
                    <button onClick={handleStartCall} style={{ flex: 1, padding: "14px 20px", borderRadius: 14, background: "linear-gradient(135deg, #059669, #047857)", color: "#fff", fontWeight: 700, cursor: "pointer", border: "none" }}>Start Call</button>
                  )}
                  {callState === "active" && (
                    <button onClick={handleEndCall} style={{ flex: 1, padding: "14px 20px", borderRadius: 14, background: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>End Call</button>
                  )}
                  {callState === "ended" && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/scholarships", {
                          state: { gpa: phaseData.gpa || dashData?.gpa || undefined },
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "14px 20px",
                        borderRadius: 14,
                        background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                        color: "#fff",
                        fontWeight: 700,
                        cursor: "pointer",
                        border: "none",
                        fontFamily: T.fontBody,
                        boxShadow: "0 0 20px rgba(99,102,241,0.35)",
                      }}
                    >
                      View scholarship matches
                    </button>
                  )}
                </div>
              </div>

              {/* Right: Extraction phases */}
              <div className="phases-panel fade-in" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                {callState === "active" && (
                  <div
                    style={{
                      borderRadius: 16,
                      padding: "14px 16px",
                      background: "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(255,255,255,0.02) 100%)",
                      border: "1px solid rgba(59,130,246,0.2)",
                      backdropFilter: "blur(12px)",
                      maxHeight: 240,
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        color: "rgba(148,163,184,0.6)",
                        fontFamily: T.fontBody,
                      }}
                    >
                      LIVE CONVERSATION
                    </div>
                    {conversation.map((m, i) => (
                      <div
                        key={`${i}-${m.role}`}
                        style={{
                          alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                          maxWidth: "92%",
                          padding: "8px 12px",
                          borderRadius: 12,
                          fontSize: 13,
                          lineHeight: 1.45,
                          color: "#e2e8f0",
                          fontFamily: T.fontBody,
                          background: m.role === "user" ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.06)",
                          border: `1px solid ${m.role === "user" ? "rgba(59,130,246,0.25)" : "rgba(255,255,255,0.08)"}`,
                        }}
                      >
                        {m.content}
                      </div>
                    ))}
                    {chatLoading && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: 12,
                          color: "rgba(148,163,184,0.75)",
                          fontFamily: T.fontBody,
                        }}
                      >
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            border: "2px solid rgba(59,130,246,0.3)",
                            borderTopColor: "#3b82f6",
                            borderRadius: "50%",
                            animation: "spin 0.7s linear infinite",
                          }}
                        />
                        Waiting for counsellor…
                      </div>
                    )}
                  </div>
                )}
                {callState === "active" && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <input
                      value={typedInput}
                      onChange={(e) => setTypedInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendTyped()}
                      placeholder="Type a message if you prefer…"
                      disabled={chatLoading}
                      style={{
                        flex: 1,
                        minWidth: 160,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 10,
                        padding: "10px 14px",
                        color: "#e2e8f0",
                        outline: "none",
                        fontFamily: T.fontBody,
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSendTyped}
                      disabled={chatLoading}
                      style={{
                        padding: "10px 18px",
                        borderRadius: 10,
                        border: "none",
                        cursor: chatLoading ? "not-allowed" : "pointer",
                        fontWeight: 600,
                        fontFamily: T.fontBody,
                        background: "rgba(37,99,235,0.35)",
                        color: "#bfdbfe",
                        opacity: chatLoading ? 0.6 : 1,
                      }}
                    >
                      Send
                    </button>
                  </div>
                )}
                {chatError ? (
                  <div style={{ fontSize: 12, color: "#fca5a5", fontFamily: T.fontBody }}>{chatError}</div>
                ) : null}
                <PhasePanel phase={1} currentPhase={currentPhase} data={phaseData} />
                <PhasePanel phase={2} currentPhase={currentPhase} data={phaseData} />
                <PhasePanel phase={3} currentPhase={currentPhase} data={phaseData} />
              </div>
            </div>
          </section>

          {/* ── SECTION 2 — STUDENT OVERVIEW ── */}
          {showDashboard && dashData && (
            <section ref={dashRef} className="slide-in" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px 60px" }}>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontFamily: T.font, fontWeight: 800, fontSize: "clamp(24px, 4vw, 38px)", color: "#fff" }}>{dashData.name || "—"}</h2>
                {dashData.mongoStudentId ? (
                  <p style={{ marginTop: 4, fontSize: 11, color: "rgba(148,163,184,0.5)", fontFamily: T.fontBody }}>
                    Reference · {dashData.mongoStudentId}
                  </p>
                ) : null}
                <p style={{ marginTop: 8, fontSize: 13, color: "rgba(148,163,184,0.85)", fontFamily: T.fontBody, maxWidth: 520 }}>
                  Here’s a summary of what you shared with us{dashData.date ? ` · ${dashData.date}` : ""}. A counsellor can use this to help plan your next steps.
                </p>
              </div>

              <div className="dash-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                <DashCard title="Personal Info" icon="👤">
                  <DataRow label="Email" value={dashData.email || "—"} />
                  <DataRow label="Phone" value={dashData.phone || "—"} />
                  <DataRow label="Location" value={dashData.location || "—"} />
                </DashCard>
                <DashCard title="Academic Profile" icon="🎓" accent>
                  <DataRow label="Education" value={dashData.education || "—"} />
                  <DataRow label="Field" value={dashData.field || "—"} />
                  <DataRow label="Institution" value={dashData.institution || "—"} />
                  <DataRow label="GPA / Score" value={dashData.gpa || "—"} highlight />
                  <DataRow label="Course interest" value={dashData.course || "—"} />
                  <DataRow label="Intake" value={dashData.intake || "—"} />
                </DashCard>
                <DashCard title="Study & readiness" icon="🌍">
                  <DataRow label="Target countries" value={dashData.countries || "—"} highlight />
                  <DataRow label="IELTS / TOEFL" value={dashData.ielts || "—"} />
                  <DataRow label="Budget" value={dashData.budget || "—"} />
                  <DataRow label="Timeline" value={dashData.timeline || "—"} />
                  <DataRow label="Sponsor / funding" value={dashData.sponsorship || "—"} />
                </DashCard>
              </div>

              {/* ── REDIRECT BOOKING AREA ── */}
              <div style={{ marginTop: 28, borderRadius: 24, padding: "48px 40px", textAlign: "center", background: "linear-gradient(135deg, rgba(37,99,235,0.14) 0%, rgba(29,78,216,0.08) 50%, rgba(5,150,105,0.08) 100%)", border: "1px solid rgba(59,130,246,0.25)", boxShadow: T.glassShadow, backdropFilter: "blur(24px)" }}>
                <span style={{ fontSize: 40, display: "block", marginBottom: 16, animation: "calFloat 4s ease-in-out infinite" }}>📅</span>
                <h2 style={{ fontFamily: T.font, fontWeight: 800, fontSize: "clamp(22px, 3.5vw, 34px)", color: "#fff", marginBottom: 10 }}>Ready to take the next step?</h2>
                <p style={{ fontSize: 14, color: "rgba(148,163,184,0.6)", maxWidth: 460, margin: "0 auto 28px", lineHeight: 1.65 }}>Speak directly with a Fateh expert counsellor who will review your profile and map out your roadmap.</p>
                
                {/* REPLACED: Redirection Button */}
                <button
                  type="button"
                  onClick={() => navigate("/book")}
                  style={{ padding: "16px 36px", borderRadius: 16, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", border: "none", boxShadow: "0 0 24px rgba(37,99,235,0.5)" }}
                >
                  Book a Counselling Session With Us!
                </button>

                <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 22 }}>
                  {["Free consultation", "Expert counsellors"].map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 5px #10b981" }} />
                      <span style={{ fontSize: 12, color: "rgba(148,163,184,0.5)" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}
