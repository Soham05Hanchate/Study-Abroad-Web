import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

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

// ── Returning-student mock DB ──
const MOCK_DB = {
  "FE-DEMO-2025": {
    id: "FE-DEMO-2025",
    ...MOCK_DATA.phase1,
    ...MOCK_DATA.phase2,
    ...MOCK_DATA.phase3,
    score: 87,
    status: "Highly Qualified",
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

// ── Score ring ──
function ScoreRing({ score }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="100" height="100" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444"}
          strokeWidth="6" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)" }} />
      </svg>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: T.font, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 9, color: "rgba(148,163,184,0.6)", letterSpacing: "0.08em" }}>SCORE</div>
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

// ── Book Session Button ──
function BookButton() {
  const [booked, setBooked] = useState(false);
  return (
    <button
      onClick={() => setBooked(true)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        padding: "16px 36px", borderRadius: 16, border: "none", cursor: "pointer",
        background: booked ? "linear-gradient(135deg, #059669, #047857)" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
        color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: T.fontBody,
        animation: booked ? "none" : "bookGlow 2.5s ease-in-out infinite",
        transition: "all 0.3s ease", position: "relative", zIndex: 1,
      }}
      onMouseEnter={(e) => { if (!booked) e.currentTarget.style.transform = "scale(1.05) translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1) translateY(0)"; }}
    >
      {booked ? "✅  Booking confirmed!" : (
        <>
          Book a Session with Us!
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </>
      )}
    </button>
  );
}

// ════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════
export default function StudentView() {
  const [callState, setCallState] = useState("idle"); // idle | active | ended
  const [currentPhase, setCurrentPhase] = useState(0);
  const [phaseData, setPhaseData] = useState({});
  const [studentID, setStudentID] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashData, setDashData] = useState(null);
  const [returnCode, setReturnCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [lang, setLang] = useState("EN");
  const [elapsed, setElapsed] = useState(0);
  const dashRef = useRef(null);
  const timerRef = useRef(null);
  const phaseTimers = useRef([]);

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

  // ── Start call ──
  const handleStartCall = () => {
    setCallState("active");
    setCurrentPhase(1);
    setElapsed(0);
    setPhaseData({});

    // Phase 1: fill after 2s
    phaseTimers.current.push(setTimeout(() => {
      setPhaseData((d) => ({ ...d, ...MOCK_DATA.phase1 }));
    }, 2000));
    // Phase 2: start after 5s, fill at 7s
    phaseTimers.current.push(setTimeout(() => setCurrentPhase(2), 5000));
    phaseTimers.current.push(setTimeout(() => {
      setPhaseData((d) => ({ ...d, ...MOCK_DATA.phase2 }));
    }, 7000));
    // Phase 3: start after 10s, fill at 12s
    phaseTimers.current.push(setTimeout(() => setCurrentPhase(3), 10000));
    phaseTimers.current.push(setTimeout(() => {
      setPhaseData((d) => ({ ...d, ...MOCK_DATA.phase3 }));
    }, 12000));
  };

  // ── End call ──
  const handleEndCall = () => {
    phaseTimers.current.forEach(clearTimeout);
    phaseTimers.current = [];
    const id = genID();
    setStudentID(id);
    setCallState("ended");
    setCurrentPhase(4); // all phases done
    const full = { id, ...MOCK_DATA.phase1, ...MOCK_DATA.phase2, ...MOCK_DATA.phase3, ...phaseData, score: 87, status: "Highly Qualified", date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) };
    setDashData(full);
    setTimeout(() => {
      setShowDashboard(true);
      setTimeout(() => dashRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }, 600);
  };

  // ── Return code ──
  const handleReturnCode = () => {
    const d = MOCK_DB[returnCode.trim().toUpperCase()];
    if (d) {
      setCodeError("");
      setDashData(d);
      setStudentID(d.id);
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

          {/* ════════════════════════════════════
              SECTION 1 — VOICE AGENT
          ════════════════════════════════════ */}
          <section className="hero-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 28px 48px" }}>

            {/* ── Returning user bar ── */}
            <div className="fade-in" style={{ marginBottom: 32, animationDelay: "0.05s" }}>
              <div style={{
                borderRadius: 16, padding: "14px 20px",
                background: T.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                border: T.glassBorder, boxShadow: T.glassShadow,
                display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto" }}>
                  <span style={{ fontSize: 16 }}>🔑</span>
                  <span style={{ fontSize: 13, color: "rgba(148,163,184,0.7)", fontFamily: T.fontBody }}>
                    Already registered?
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 200, display: "flex", gap: 8 }}>
                  <input
                    value={returnCode}
                    onChange={(e) => { setReturnCode(e.target.value); setCodeError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleReturnCode()}
                    placeholder="Enter your unique code  e.g. FE-DEMO-2025"
                    style={{
                      flex: 1, background: "rgba(255,255,255,0.04)", border: codeError ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 10, padding: "9px 14px", color: "#e2e8f0", fontSize: 13,
                      fontFamily: T.fontBody, outline: "none", transition: "border 0.2s",
                    }}
                  />
                  <button className="code-submit" onClick={handleReturnCode} style={{
                    background: "rgba(37,99,235,0.25)", border: "1px solid rgba(59,130,246,0.35)",
                    color: "#93c5fd", padding: "9px 18px", borderRadius: 10, cursor: "pointer",
                    fontSize: 13, fontWeight: 600, fontFamily: T.fontBody, transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}>
                    Access →
                  </button>
                </div>
                {codeError && <span style={{ fontSize: 11, color: "#fca5a5", width: "100%", paddingLeft: 4 }}>{codeError}</span>}
              </div>
            </div>

            {/* ── Page title ── */}
            <div className="fade-in" style={{ marginBottom: 28, animationDelay: "0.1s" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 100, background: "rgba(37,99,235,0.1)", border: "1px solid rgba(59,130,246,0.2)", marginBottom: 12 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 8px #3b82f6", display: "inline-block" }} />
                <span style={{ fontSize: 10, color: "#93c5fd", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>AI Voice Counselor</span>
              </div>
              <h1 style={{ fontFamily: T.font, fontWeight: 800, fontSize: "clamp(24px, 4vw, 42px)", color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                Your Overseas Journey<br />
                <span style={{ color: "#60a5fa" }}>Starts Here</span>
              </h1>
              <p style={{ marginTop: 10, fontSize: "clamp(13px, 1.5vw, 15px)", color: "rgba(148,163,184,0.6)", maxWidth: 480, lineHeight: 1.65 }}>
                Our multilingual AI counselor will guide you through a quick conversation to build your personalized study abroad profile.
              </p>
            </div>

            {/* ── Agent + Phases grid ── */}
            <div className="agent-grid" style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

              {/* Left: Orb + controls */}
              <div className="fade-in" style={{
                flex: "0 0 auto", width: "min(100%, 340px)",
                borderRadius: 24, padding: "32px 24px",
                background: T.glass, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                border: callState === "active" ? "1px solid rgba(59,130,246,0.3)" : T.glassBorder,
                boxShadow: callState === "active" ? "0 0 40px rgba(37,99,235,0.15), " + T.glassShadow : T.glassShadow,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
                transition: "all 0.4s ease",
                animationDelay: "0.15s",
              }}>
                {/* Status label */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: callState === "active" ? "#ef4444" : callState === "ended" ? "#10b981" : "rgba(148,163,184,0.4)",
                    boxShadow: callState === "active" ? "0 0 8px #ef4444" : callState === "ended" ? "0 0 8px #10b981" : "none",
                    transition: "all 0.4s",
                  }} />
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: callState === "active" ? "#fca5a5" : callState === "ended" ? "#6ee7b7" : "rgba(148,163,184,0.5)" }}>
                    {callState === "idle" ? "READY" : callState === "active" ? "LISTENING" : "SESSION COMPLETE"}
                  </span>
                </div>

                {/* Orb */}
                <div className="orb-wrap">
                  <AIOrb active={callState === "active"} />
                </div>

                {/* Phase indicator */}
                {callState !== "idle" && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {[1, 2, 3].map((p) => (
                      <div key={p} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{
                          width: currentPhase > p ? 24 : currentPhase === p ? 24 : 6,
                          height: 6, borderRadius: 3,
                          background: currentPhase > p ? "#10b981" : currentPhase === p ? "#3b82f6" : "rgba(255,255,255,0.1)",
                          transition: "all 0.4s ease",
                        }} />
                      </div>
                    ))}
                    {currentPhase <= 3 && (
                      <span style={{ fontSize: 10, color: "rgba(148,163,184,0.5)", marginLeft: 4 }}>
                        Phase {Math.min(currentPhase, 3)}/3
                      </span>
                    )}
                  </div>
                )}

                {/* AI message */}
                {callState === "active" && (
                  <div style={{
                    background: "rgba(37,99,235,0.08)", border: "1px solid rgba(59,130,246,0.15)",
                    borderRadius: 12, padding: "10px 14px", textAlign: "center",
                  }}>
                    <p style={{ fontSize: 12, color: "rgba(200,213,255,0.7)", lineHeight: 1.5, fontStyle: "italic" }}>
                      {currentPhase === 1 && '"Hello! I\'m your Fateh AI counselor. Could you please share your name and contact details?"'}
                      {currentPhase === 2 && '"Great! Now tell me about your academic background and your goals for studying abroad..."'}
                      {currentPhase === 3 && '"Almost done! Let\'s talk about your test preparation and financial readiness..."'}
                    </p>
                  </div>
                )}

                {/* Controls */}
                <div className="controls-row" style={{ display: "flex", gap: 12, width: "100%", justifyContent: "center" }}>
                  {callState === "idle" && (
                    <button className="start-btn" onClick={handleStartCall} style={{
                      flex: 1, padding: "14px 20px", borderRadius: 14, border: "none", cursor: "pointer",
                      background: "linear-gradient(135deg, #059669, #047857)",
                      boxShadow: "0 0 24px rgba(5,150,105,0.5), 0 4px 16px rgba(0,0,0,0.3)",
                      color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: T.fontBody,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      animation: "callPulse 2s ease-in-out infinite",
                      transition: "transform 0.2s ease",
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
                      Start Call
                    </button>
                  )}
                  {callState === "active" && (
                    <button className="end-btn" onClick={handleEndCall} style={{
                      flex: 1, padding: "14px 20px", borderRadius: 14, border: "none", cursor: "pointer",
                      background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                      boxShadow: "0 0 24px rgba(220,38,38,0.5), 0 4px 16px rgba(0,0,0,0.3)",
                      color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: T.fontBody,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      transition: "transform 0.2s ease",
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
                      End Call
                    </button>
                  )}
                  {callState === "ended" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 14, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", width: "100%", justifyContent: "center" }}>
                      <span style={{ fontSize: 16 }}>✅</span>
                      <span style={{ fontSize: 13, color: "#6ee7b7", fontWeight: 600 }}>Session Complete</span>
                    </div>
                  )}
                </div>

                {/* Student ID after call */}
                {studentID && callState === "ended" && (
                  <div style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 12, padding: "12px 16px", width: "100%", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "rgba(148,163,184,0.5)", letterSpacing: "0.1em", marginBottom: 4 }}>YOUR STUDENT ID</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#60a5fa", fontFamily: T.font, letterSpacing: "0.05em" }}>{studentID}</div>
                    <div style={{ fontSize: 10, color: "rgba(148,163,184,0.4)", marginTop: 4 }}>Save this to access your profile later</div>
                  </div>
                )}
              </div>

              {/* Right: Extraction phases */}
              <div className="phases-panel fade-in" style={{
                flex: 1,
                display: "flex", flexDirection: "column", gap: 12,
                animationDelay: "0.2s",
                opacity: callState === "idle" ? 0.5 : 1,
                transition: "opacity 0.4s ease",
              }}>
                <div style={{ marginBottom: 4 }}>
                  <h3 style={{ fontFamily: T.font, fontWeight: 700, fontSize: 15, color: "#fff", letterSpacing: "-0.01em" }}>Data Extraction</h3>
                  <p style={{ fontSize: 12, color: "rgba(148,163,184,0.5)", marginTop: 2 }}>Real-time profile building across 3 phases</p>
                </div>
                <PhasePanel phase={1} currentPhase={currentPhase} data={phaseData} />
                <PhasePanel phase={2} currentPhase={currentPhase} data={phaseData} />
                <PhasePanel phase={3} currentPhase={currentPhase} data={phaseData} />
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════
              SECTION 2 — STUDENT OVERVIEW
          ════════════════════════════════════ */}
          {showDashboard && dashData && (
            <section ref={dashRef} className="slide-in" style={{
              maxWidth: 1200, margin: "0 auto", padding: "0 28px 60px",
            }}>
              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, rgba(59,130,246,0.3), transparent)" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 100, background: "rgba(37,99,235,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                  <span style={{ fontSize: 12 }}>📋</span>
                  <span style={{ fontSize: 11, color: "#93c5fd", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Student Overview</span>
                </div>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, rgba(59,130,246,0.3), transparent)" }} />
              </div>

              {/* Dashboard header */}
              <div style={{ marginBottom: 28, display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
                <div>
                  <p style={{ fontSize: 13, color: "rgba(148,163,184,0.5)", marginBottom: 4 }}>Welcome back 👋</p>
                  <h2 style={{ fontFamily: T.font, fontWeight: 800, fontSize: "clamp(24px, 4vw, 38px)", color: "#fff", letterSpacing: "-0.03em" }}>
                    {dashData.name}
                  </h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: 13, fontWeight: 700, color: "#60a5fa", fontFamily: T.font,
                      letterSpacing: "0.04em", background: "rgba(37,99,235,0.1)",
                      border: "1px solid rgba(59,130,246,0.25)", padding: "4px 12px", borderRadius: 8,
                    }}>{dashData.id}</span>
                    <span style={{
                      fontSize: 11, padding: "4px 10px", borderRadius: 100,
                      background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)",
                      color: "#6ee7b7", fontWeight: 600,
                    }}>{dashData.status}</span>
                    <span style={{ fontSize: 11, color: "rgba(148,163,184,0.4)" }}>Registered {dashData.date}</span>
                  </div>
                </div>

                {/* Score */}
                <div style={{
                  borderRadius: 20, padding: "20px 28px",
                  background: T.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(16,185,129,0.2)", boxShadow: T.glassShadow,
                  display: "flex", alignItems: "center", gap: 20,
                }}>
                  <ScoreRing score={dashData.score} />
                  <div>
                    <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", letterSpacing: "0.1em", marginBottom: 4 }}>LEAD QUALITY</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#10b981", fontFamily: T.font }}>{dashData.status}</div>
                    <div style={{ fontSize: 11, color: "rgba(148,163,184,0.4)", marginTop: 4 }}>Top {100 - dashData.score}% of applicants</div>
                  </div>
                </div>
              </div>

              {/* Dashboard cards grid */}
              <div className="dash-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>

                {/* Personal Info */}
                <DashCard title="Personal Info" icon="👤">
                  <DataRow label="Full Name" value={dashData.name} />
                  <DataRow label="Email" value={dashData.email} />
                  <DataRow label="Phone" value={dashData.phone} />
                  <DataRow label="Location" value={dashData.location} />
                </DashCard>

                {/* Academic Profile */}
                <DashCard title="Academic Profile" icon="🎓" accent>
                  <DataRow label="Education" value={dashData.education} />
                  <DataRow label="Field" value={dashData.field} />
                  <DataRow label="Institution" value={dashData.institution} />
                  <DataRow label="GPA / Score" value={dashData.gpa} highlight />
                  <DataRow label="Intake" value={dashData.intake} highlight />
                </DashCard>

                {/* Study Preferences */}
                <DashCard title="Study Preferences" icon="🌍">
                  <DataRow label="Target Countries" value={dashData.countries} highlight />
                  <DataRow label="Course Interest" value={dashData.course} />
                  <DataRow label="IELTS / TOEFL" value={dashData.ielts} />
                  <DataRow label="Timeline" value={dashData.timeline} />
                </DashCard>

              </div>

              {/* Second row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginTop: 16 }} className="dash-grid-4">

                {/* Financial Readiness */}
                <DashCard title="Financial Readiness" icon="💰">
                  <DataRow label="Budget Range" value={dashData.budget} highlight />
                  <DataRow label="Sponsorship" value={dashData.sponsorship} />
                </DashCard>

                {/* Next Steps */}
                <DashCard title="Recommended Next Steps" icon="🚀">
                  {[
                    "Complete IELTS preparation (target 7.0+)",
                    "Shortlist 5 universities in UK/Ireland",
                    "Prepare SOP and LOR documents",
                    "Schedule a counsellor call",
                  ].map((step, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(37,99,235,0.2)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <span style={{ fontSize: 9, color: "#60a5fa", fontWeight: 700 }}>{i + 1}</span>
                      </div>
                      <span style={{ fontSize: 12, color: "rgba(200,213,255,0.65)", lineHeight: 1.5, fontFamily: T.fontBody }}>{step}</span>
                    </div>
                  ))}
                </DashCard>

              </div>

              {/* ── BOOK A SESSION ── */}
              <div style={{
                marginTop: 28, borderRadius: 24, overflow: "hidden", position: "relative",
                padding: "48px 40px", textAlign: "center",
                background: "linear-gradient(135deg, rgba(37,99,235,0.14) 0%, rgba(29,78,216,0.08) 50%, rgba(5,150,105,0.08) 100%)",
                border: "1px solid rgba(59,130,246,0.25)",
                boxShadow: "0 0 60px rgba(37,99,235,0.1), 0 8px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
                backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
              }}>
                {/* Top shimmer line */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.5), rgba(16,185,129,0.3), transparent)" }} />
                {/* Radial glow overlay */}
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(37,99,235,0.08), transparent 70%)", pointerEvents: "none" }} />

                <span style={{ fontSize: 40, display: "block", marginBottom: 16, animation: "calFloat 4s ease-in-out infinite" }}>📅</span>

                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 100, background: "rgba(37,99,235,0.12)", border: "1px solid rgba(59,130,246,0.22)", marginBottom: 14 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 6px #3b82f6", display: "inline-block" }} />
                  <span style={{ fontSize: 10, color: "#93c5fd", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>Expert Counseling Available</span>
                </div>

                <h2 style={{ fontFamily: T.font, fontWeight: 800, fontSize: "clamp(22px, 3.5vw, 34px)", color: "#fff", letterSpacing: "-0.03em", marginBottom: 10, position: "relative", zIndex: 1 }}>
                  Ready to take the next step?
                </h2>
                <p style={{ fontSize: 14, color: "rgba(148,163,184,0.6)", maxWidth: 460, margin: "0 auto 28px", lineHeight: 1.65, position: "relative", zIndex: 1 }}>
                  Speak directly with a Fateh expert counsellor who will review your profile, suggest universities, and map out your complete UK &amp; Ireland application roadmap.
                </p>

                <BookButton />

                <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 22, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
                  {["Free consultation", "30-minute session", "Expert counsellors", "Personalised roadmap"].map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 5px #10b981" }} />
                      <span style={{ fontSize: 12, color: "rgba(148,163,184,0.5)" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export bar */}
              <div style={{
                marginTop: 20, borderRadius: 16, padding: "16px 20px",
                background: T.glass, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                border: T.glassBorder, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>Profile ready for counsellor review</div>
                  <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", marginTop: 2 }}>Your structured data has been queued in the lead dashboard</div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {["📄 Download PDF", "📤 Share Profile"].map((label) => (
                    <button key={label} style={{
                      padding: "8px 16px", borderRadius: 10, cursor: "pointer",
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(200,213,255,0.7)", fontSize: 12, fontFamily: T.fontBody,
                      transition: "all 0.2s",
                    }}
                      onMouseEnter={(e) => { e.target.style.background = "rgba(37,99,235,0.15)"; e.target.style.borderColor = "rgba(59,130,246,0.3)"; e.target.style.color = "#93c5fd"; }}
                      onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.05)"; e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.color = "rgba(200,213,255,0.7)"; }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

            </section>
          )}
        </main>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(3,5,8,0.8)", padding: "16px 28px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FatehLogo size={22} />
              <span style={{ fontSize: 12, color: "rgba(148,163,184,0.4)", fontFamily: T.font }}>Fateh Education</span>
            </div>
            <span style={{ fontSize: 11, color: "rgba(148,163,184,0.3)" }}>© {new Date().getFullYear()} Fateh Education. All rights reserved.</span>
          </div>
        </footer>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   PATCH: Add BookSession component and insert it
   into the dashboard section after the export bar.
   Replace the export bar closing tag area with the
   updated block below in your StudentView.jsx.
   ───────────────────────────────────────────── */