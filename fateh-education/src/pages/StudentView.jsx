import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CounsellorBookingFlow from "./CounsellorBookingFlow";

/* ═══════════════════════════════════════════════════════════════
   FATEH EDUCATION — Student View
   AI Voice Agent + Student Overview Dashboard
   Dark glassmorphism · Desktop & Mobile responsive
   ═══════════════════════════════════════════════════════════════ */

// ── Design tokens ──
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

const MOCK_DATA = {
  phase1: { name: "Priya Sharma", email: "priya.sharma@gmail.com", phone: "+91 98765 43210", location: "Pune, Maharashtra" },
  phase2: { education: "Bachelor's (B.Tech)", field: "Computer Science", institution: "SPPU, Pune", gpa: "8.4 / 10", countries: "UK, Ireland", course: "MSc AI / Data Science", intake: "September 2025" },
  phase3: { ielts: "Preparing (Target 7.0)", budget: "₹40–55 Lakhs", timeline: "6–8 months", sponsorship: "Self-funded + Education Loan" },
};

function genID() {
  return "FE-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Date.now().toString(36).slice(-4).toUpperCase();
}

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

// ── Sub Components ──
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

function AIOrb({ active }) {
  return (
    <div style={{ position: "relative", width: 160, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
      <div style={{
        width: 100, height: 100, borderRadius: "50%",
        background: active
          ? "radial-gradient(circle, rgba(37,99,235,0.9) 0%, rgba(29,78,216,0.7) 40%, rgba(37,99,235,0.3) 100%)"
          : "radial-gradient(circle, rgba(37,99,235,0.35) 0%, rgba(29,78,216,0.2) 60%, transparent 100%)",
        boxShadow: active
          ? "0 0 60px rgba(37,99,235,0.7), 0 0 120px rgba(37,99,235,0.3), inset 0 0 30px rgba(147,197,253,0.3)"
          : "0 0 20px rgba(37,99,235,0.2)",
        transition: "all 0.6s ease",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: active ? "orbPulse 2s ease-in-out infinite" : "none",
      }}>
        <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{
              width: 3, background: "rgba(255,255,255,0.9)", borderRadius: 2,
              animation: active ? `wave ${0.8 + i * 0.1}s ease-in-out infinite alternate` : "none",
              animationDelay: `${i * 0.1}s`, height: active ? undefined : 8,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PhaseField({ label, value, filled, delay = 0 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, opacity: filled ? 1 : 0.35, transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`, transform: filled ? "translateX(0)" : "translateX(-6px)" }}>
      <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(148,163,184,0.5)", fontFamily: T.fontBody }}>{label}</span>
      <div style={{ fontSize: 12, color: filled ? "#e2e8f0" : "rgba(100,116,139,0.6)", fontFamily: T.fontBody, background: filled ? "rgba(37,99,235,0.08)" : "rgba(255,255,255,0.03)", border: filled ? "1px solid rgba(59,130,246,0.2)" : "1px solid rgba(255,255,255,0.06)", padding: "5px 8px", borderRadius: 6, minHeight: 26, transition: "all 0.4s ease", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {filled ? value : "—"}
      </div>
    </div>
  );
}

function PhasePanel({ phase, currentPhase, data }) {
  const isActive = currentPhase === phase;
  const isDone = currentPhase > phase;
  const label = ["Personal Info", "Academic Profile", "Readiness"][phase - 1];
  const color = isDone ? "#10b981" : isActive ? "#3b82f6" : "rgba(148,163,184,0.3)";
  const fields = {
    1: [{ label: "Full Name", key: "name" }, { label: "Email", key: "email" }, { label: "Phone", key: "phone" }, { label: "Location", key: "location" }],
    2: [{ label: "Education", key: "education" }, { label: "Field", key: "field" }, { label: "Institution", key: "institution" }, { label: "GPA / Score", key: "gpa" }, { label: "Target Countries", key: "countries" }, { label: "Course Interest", key: "course" }, { label: "Intake", key: "intake" }],
    3: [{ label: "IELTS / TOEFL", key: "ielts" }, { label: "Budget", key: "budget" }, { label: "Timeline", key: "timeline" }, { label: "Sponsorship", key: "sponsorship" }],
  }[phase];

  return (
    <div style={{ borderRadius: 16, padding: "14px 16px", background: isActive ? "linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(37,99,235,0.03) 100%)" : "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)", border: isActive ? "1px solid rgba(59,130,246,0.3)" : isDone ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", transition: "all 0.4s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: isDone ? "#10b981" : isActive ? "#2563eb" : "rgba(255,255,255,0.08)", border: `1px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
          {isDone ? "✓" : phase}
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color, fontFamily: T.fontBody, letterSpacing: "0.05em" }}>{label}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 10px" }}>
        {fields.map((f, i) => (
          <PhaseField key={f.key} label={f.label} value={data[f.key]} filled={isDone || (isActive && data[f.key])} delay={i * 0.08} />
        ))}
      </div>
    </div>
  );
}

function ScoreRing({ score }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="100" height="100" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444"} strokeWidth="6" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)" }} />
      </svg>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: T.font, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 9, color: "rgba(148,163,184,0.6)", letterSpacing: "0.08em" }}>SCORE</div>
      </div>
    </div>
  );
}

function DashCard({ title, icon, children, accent }) {
  return (
    <div style={{ borderRadius: 20, padding: "20px 22px", background: T.glass, backdropFilter: "blur(20px)", border: accent ? `1px solid rgba(59,130,246,0.25)` : T.glassBorder, boxShadow: T.glassShadow }}>
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
      <span style={{ fontSize: 12, fontFamily: T.fontBody, textAlign: "right", color: highlight ? "#60a5fa" : "#e2e8f0", fontWeight: highlight ? 600 : 400 }}>{value}</span>
    </div>
  );
}

// ════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════
export default function StudentView() {
  const [callState, setCallState] = useState("idle");
  const [currentPhase, setCurrentPhase] = useState(0);
  const [phaseData, setPhaseData] = useState({});
  const [studentID, setStudentID] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashData, setDashData] = useState(null);
  const [returnCode, setReturnCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const navigate = useNavigate(); 
  const [lang, setLang] = useState("EN");
  const [elapsed, setElapsed] = useState(0);
  const dashRef = useRef(null);
  const timerRef = useRef(null);
  const phaseTimers = useRef([]);

  useEffect(() => {
    if (callState === "active") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [callState]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleStartCall = () => {
    setCallState("active");
    setCurrentPhase(1);
    setElapsed(0);
    setPhaseData({});
    phaseTimers.current.push(setTimeout(() => setPhaseData((d) => ({ ...d, ...MOCK_DATA.phase1 })), 2000));
    phaseTimers.current.push(setTimeout(() => setCurrentPhase(2), 5000));
    phaseTimers.current.push(setTimeout(() => setPhaseData((d) => ({ ...d, ...MOCK_DATA.phase2 })), 7000));
    phaseTimers.current.push(setTimeout(() => setCurrentPhase(3), 10000));
    phaseTimers.current.push(setTimeout(() => setPhaseData((d) => ({ ...d, ...MOCK_DATA.phase3 })), 12000));
  };

  const handleEndCall = () => {
    phaseTimers.current.forEach(clearTimeout);
    phaseTimers.current = [];
    const id = genID();
    setStudentID(id);
    setCallState("ended");
    setCurrentPhase(4); 
    const full = { id, ...MOCK_DATA.phase1, ...MOCK_DATA.phase2, ...MOCK_DATA.phase3, ...phaseData, score: 87, status: "Highly Qualified", date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) };
    setDashData(full);
    setTimeout(() => {
      setShowDashboard(true);
      setTimeout(() => dashRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }, 600);
  };

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
        @keyframes orbPulse { 0%, 100% { transform: scale(1); box-shadow: 0 0 60px rgba(37,99,235,0.7), 0 0 120px rgba(37,99,235,0.3); } 50% { transform: scale(1.06); box-shadow: 0 0 80px rgba(37,99,235,0.9), 0 0 160px rgba(37,99,235,0.4); } }
        @keyframes orbRing { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.12); opacity: 1; } }
        @keyframes wave { from { height: 6px; } to { height: 28px; } }
        @keyframes dotPulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes callPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.5); } 50% { box-shadow: 0 0 0 12px rgba(37,99,235,0); } }
        @keyframes calFloat { 0%, 100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-5px) rotate(-4deg); } }
        .fade-in { animation: fadeUp 0.6s ease both; }
        .slide-in { animation: slideIn 0.7s cubic-bezier(0.23, 1, 0.32, 1) both; }
      `}</style>

      <div style={{ background: T.bgGrad, minHeight: "100vh", fontFamily: T.fontBody, position: "relative", overflowX: "hidden" }}>
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px)", backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse 80% 70% at 50% 0%, black 20%, transparent 100%)" }} />
        <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(6,11,20,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="header-inner" style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FatehLogo size={30} />
              <div>
                <div style={{ color: "#fff", fontFamily: T.font, fontWeight: 700, fontSize: 14 }}>FATEH</div>
                <div style={{ color: "#3b82f6", fontSize: 9, letterSpacing: "0.1em" }}>EDUCATION</div>
              </div>
            </div>
            {callState === "active" && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 100, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", animation: "callPulse 1.5s infinite" }} />
                <span style={{ fontSize: 11, color: "#fca5a5", fontWeight: 600 }}>LIVE · {fmt(elapsed)}</span>
              </div>
            )}
          </div>
        </header>

        <main style={{ position: "relative", zIndex: 1 }}>
          <section className="hero-pad" style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 28px 48px" }}>
            <div className="fade-in" style={{ marginBottom: 32 }}>
              <div style={{ borderRadius: 16, padding: "14px 20px", background: T.glass, backdropFilter: "blur(20px)", border: T.glassBorder, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 16 }}>🔑 Already registered?</span>
                <input value={returnCode} onChange={(e) => setReturnCode(e.target.value)} placeholder="Enter unique code" style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "9px 14px", color: "#e2e8f0" }} />
                <button onClick={handleReturnCode} style={{ background: "rgba(37,99,235,0.25)", border: "1px solid rgba(59,130,246,0.35)", color: "#93c5fd", padding: "9px 18px", borderRadius: 10, cursor: "pointer" }}>Access →</button>
              </div>
            </div>

            <div className="agent-grid" style={{ display: "flex", gap: 20 }}>
              <div style={{ flex: "0 0 auto", width: "min(100%, 340px)", borderRadius: 24, padding: "32px 24px", background: T.glass, border: T.glassBorder, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                <AIOrb active={callState === "active"} />
                <div className="controls-row" style={{ display: "flex", gap: 12, width: "100%" }}>
                  {callState !== "active" ? (
                    <button onClick={handleStartCall} className="start-btn" style={{ flex: 1, padding: "14px", borderRadius: 14, background: "linear-gradient(135deg, #059669, #047857)", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>Start Call</button>
                  ) : (
                    <button onClick={handleEndCall} className="end-btn" style={{ flex: 1, padding: "14px", borderRadius: 14, background: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>End Call</button>
                  )}
                </div>
              </div>
              <div className="phases-panel" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                <PhasePanel phase={1} currentPhase={currentPhase} data={phaseData} />
                <PhasePanel phase={2} currentPhase={currentPhase} data={phaseData} />
                <PhasePanel phase={3} currentPhase={currentPhase} data={phaseData} />
              </div>
            </div>
          </section>

          {showDashboard && dashData && (
            <section ref={dashRef} className="slide-in" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px 60px" }}>
              <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontFamily: T.font, fontWeight: 800, fontSize: 32, color: "#fff" }}>{dashData.name} Profile</h2>
                <ScoreRing score={dashData.score} />
              </div>

              <div className="dash-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                <DashCard title="Personal Info" icon="👤"><DataRow label="Email" value={dashData.email} /><DataRow label="Phone" value={dashData.phone} /></DashCard>
                <DashCard title="Academic Profile" icon="🎓" accent><DataRow label="GPA" value={dashData.gpa} highlight /><DataRow label="Course" value={dashData.course} /></DashCard>
                <DashCard title="Study Preferences" icon="🌍"><DataRow label="Target" value={dashData.countries} highlight /><DataRow label="Budget" value={dashData.budget} /></DashCard>
              </div>

              {/* ── UPDATED REDIRECT SECTION ── */}
              <div style={{ marginTop: 28, borderRadius: 24, padding: "48px 40px", textAlign: "center", background: "linear-gradient(135deg, rgba(37,99,235,0.14) 0%, rgba(29,78,216,0.08) 50%, rgba(5,150,105,0.08) 100%)", border: "1px solid rgba(59,130,246,0.25)", backdropFilter: "blur(24px)" }}>
                <span style={{ fontSize: 40, display: "block", marginBottom: 16, animation: "calFloat 4s ease-in-out infinite" }}>📅</span>
                <h2 style={{ fontFamily: T.font, fontWeight: 800, fontSize: "clamp(22px, 3.5vw, 34px)", color: "#fff", marginBottom: 10 }}>Ready to take the next step?</h2>
                <p style={{ fontSize: 14, color: "rgba(148,163,184,0.6)", maxWidth: 460, margin: "0 auto 28px", lineHeight: 1.65 }}>View your personalized scholarships based on your academic profile before booking your session.</p>
                
                {/* BUTTON REDIRECTS TO SCHOLARSHIP PAGE FIRST */}
                <button 
                  onClick={() => navigate('/scholarships', { state: { gpa: dashData?.gpa } })} 
                  style={{ padding: "16px 36px", borderRadius: 16, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", border: "none", boxShadow: "0 0 24px rgba(37,99,235,0.5)" }}
                >
                  Check My Scholarship Eligibility →
                </button>

                <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 22 }}>
                  {["Free consultation", "Scholarship estimate"].map((f) => (
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