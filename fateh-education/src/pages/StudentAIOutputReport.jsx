import { useState } from "react";
import {
  Phone, Copy, Check, FileText, Code2,
  User, Mic, BookOpen, MapPin, Mail, Globe, GraduationCap,
  DollarSign, Calendar, Clock, Target, Zap, Flame,
  Snowflake, Star, ArrowRight, MessageSquare, AlertCircle
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════ */
const REPORT = {
  student: {
    name: "Kavya Pillai",
    id: "FE-M3RT-9KP2",
    callDate: "04 Apr 2025",
    callTime: "10:32 AM",
    callDuration: "6 min 48 s",
    language: "English → Hindi",
    avatar: "KP",
  },
  score: {
    total: 88,
    tier: "hot",
    breakdown: {
      intent: { score: 36, max: 40, label: "Intent Seriousness" },
      financial: { score: 26, max: 30, label: "Financial Readiness" },
      timeline: { score: 26, max: 30, label: "Timeline Urgency" },
    },
  },
  actions: [
    { priority: 1, text: "Call immediately — discuss UK MSc AI programs and funding options" },
    { priority: 2, text: "Send Edinburgh & Leeds shortlist with fee + scholarship breakdown" },
    { priority: 3, text: "Request IELTS score report or confirm test-booking date" },
    { priority: 4, text: "Share Sep 2025 application deadline calendar with reminders" },
    { priority: 5, text: "Tag as Hot in CRM — assign to Senior Counsellor within 2 hrs" },
  ],
  profile: {
    personal: {
      name: "Kavya Pillai",
      phone: "+91 98765 43210",
      email: "kavya.pillai@gmail.com",
      location: "Pune, Maharashtra",
    },
    academic: {
      level: "Bachelor's (B.Tech)",
      field: "Computer Science & Engineering",
      institution: "Savitribai Phule Pune University",
      gpa: "8.6 / 10  (86%)",
    },
    preferences: {
      countries: "UK (primary), Ireland (secondary)",
      course: "MSc Artificial Intelligence / Data Science",
      intake: "September 2025",
    },
    readiness: {
      tests: "IELTS booked — 20 Apr 2025 (Target 7.0+)",
      budget: "₹40 – 55 Lakhs (self-funded + merit scholarship)",
      scholarship: "Yes — merit-based preferred",
      timeline: "Applying within 3 months",
    },
  },
  transcript: [
    {
      role: "agent",
      time: "0:04",
      text: "Hi! I'm Meera from Fateh Education. I'm here to help you explore your study abroad options for the UK and Ireland. This will just take about 5 minutes. Can I start by asking your name?",
    },
    {
      role: "student",
      time: "0:11",
      text: "Sure, my name is Kavya Pillai. I'm from Pune.",
    },
    {
      role: "agent",
      time: "0:14",
      text: "Great to meet you, Kavya! Pune — wonderful city. Could you tell me about your educational background? What degree are you completing and from which institution?",
    },
    {
      role: "student",
      time: "0:28",
      text: "I've done B.Tech in Computer Science from SPPU — Savitribai Phule Pune University. My CGPA is 8.6 out of 10.",
    },
    {
      role: "agent",
      time: "0:31",
      text: "That's an excellent CGPA, Kavya — you're a very strong candidate! With an 8.6 you'd be competitive for merit scholarships at top UK universities. Which countries are you most interested in?",
    },
    {
      role: "student",
      time: "0:45",
      text: "Mainly UK — I've been looking at University of Edinburgh and University of Leeds. Also open to Ireland if there's a better scholarship deal.",
    },
    {
      role: "agent",
      time: "0:49",
      text: "Both excellent choices! Edinburgh's MSc AI and Leeds' Data Science programs are very popular with Indian students. What specific course are you targeting?",
    },
    {
      role: "student",
      time: "1:02",
      text: "MSc in AI or Data Science. I want to get into the AI industry after graduating.",
    },
    {
      role: "agent",
      time: "1:06",
      text: "Perfect — both are very in-demand right now. What's your IELTS situation? Have you taken the test or are you preparing?",
    },
    {
      role: "student",
      time: "1:18",
      text: "I've booked the test for April 20th. I'm aiming for 7 or above. My mock scores are around 6.5 right now but I'm practising daily.",
    },
    {
      role: "agent",
      time: "1:22",
      text: "That's great progress — April 20th gives you plenty of time for September intake. What's your approximate budget for the full programme including living costs?",
    },
    {
      role: "student",
      time: "1:38",
      text: "My parents can arrange around 40 to 55 lakhs. We'd really prefer if there's a merit scholarship to reduce that a bit.",
    },
    {
      role: "agent",
      time: "1:43",
      text: "Absolutely — with your CGPA you're in the bracket for Edinburgh's Global Scholarship and Leeds' International Excellence Award, both can give you 20–35% tuition reduction. When are you planning to apply?",
    },
    {
      role: "student",
      time: "1:56",
      text: "I want to submit applications within the next 2–3 months. September 2025 intake is my target.",
    },
    {
      role: "agent",
      time: "2:00",
      text: "Excellent planning, Kavya! You're well within the window. I've collected all the information I need. A senior Fateh counsellor will contact you very soon with a personalised shortlist. You'll also receive a unique profile code by email — you can use it anytime to access your profile on our portal. Is there anything else you'd like to know before I wrap up?",
    },
    {
      role: "student",
      time: "2:18",
      text: "No, that's really helpful! Looking forward to hearing from the counsellor. Thank you, Meera.",
    },
    {
      role: "agent",
      time: "2:21",
      text: "Thank you, Kavya! Best of luck with your IELTS on the 20th. You're going to do great. We'll be in touch very soon. Goodbye!",
    },
  ],
  rawJson: {
    student_id: "FE-M3RT-9KP2",
    call_metadata: {
      date: "2025-04-04T10:32:00+05:30",
      duration_seconds: 408,
      language: "en-hi",
      agent: "Meera v2.1",
    },
    extracted_data: {
      personal: { name: "Kavya Pillai", phone: "+919876543210", email: "kavya.pillai@gmail.com", location: "Pune, Maharashtra, India" },
      academic: { level: "Bachelor's", field: "Computer Science & Engineering", institution: "Savitribai Phule Pune University", gpa: "8.6/10" },
      preferences: { countries: ["UK", "Ireland"], course: "MSc Artificial Intelligence / Data Science", intake: "September 2025", universities: ["University of Edinburgh", "University of Leeds"] },
      readiness: { ielts_status: "booked", ielts_date: "2025-04-20", ielts_target: "7.0+", budget_inr: "4000000-5500000", scholarship_interest: true, timeline_months: 3 },
    },
    lead_score: {
      total: 88,
      tier: "hot",
      breakdown: { intent_seriousness: { score: 36, max: 40, weight: "40%" }, financial_readiness: { score: 26, max: 30, weight: "30%" }, timeline_urgency: { score: 26, max: 30, weight: "30%" } },
    },
    recommended_actions: ["immediate_callback", "send_university_shortlist", "request_ielts_scores", "share_deadline_calendar"],
  },
};

/* ═══════════════════════════════════════════════════════════════
   TIER CONFIG
═══════════════════════════════════════════════════════════════ */
const TIER_CFG = {
  hot:  { label: "HOT LEAD",  icon: Flame,    color: "#f97316", rgb: "249,115,22",  bg: "rgba(249,115,22,.12)", border: "rgba(249,115,22,.35)", badge: "rgba(249,115,22,.18)" },
  warm: { label: "WARM LEAD", icon: Zap,      color: "#f59e0b", rgb: "245,158,11",  bg: "rgba(245,158,11,.12)", border: "rgba(245,158,11,.35)", badge: "rgba(245,158,11,.18)" },
  cold: { label: "COLD LEAD", icon: Snowflake,color: "#22d3ee", rgb: "34,211,238",  bg: "rgba(34,211,238,.10)", border: "rgba(34,211,238,.30)", badge: "rgba(34,211,238,.16)" },
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
function ScoreRing({ score, max, color, size = 80 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / max) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}aa)`, transition: "stroke-dasharray 1.2s cubic-bezier(.34,1.56,.64,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: size * 0.28, color: "#f1f5f9", lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: size * 0.14, color: "rgba(148,163,184,.5)" }}>/{max}</span>
      </div>
    </div>
  );
}

function ProgressBar({ score, max, color }) {
  return (
    <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,.07)", overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: 3,
        width: `${(score / max) * 100}%`,
        background: `linear-gradient(90deg, ${color}bb, ${color})`,
        boxShadow: `0 0 8px ${color}88`,
        transition: "width 1.1s cubic-bezier(.34,1.56,.64,1)",
      }} />
    </div>
  );
}

function DataField({ icon: Icon, label, value, accent }) {
  return (
    <div style={{
      display: "flex", gap: 12, padding: "12px 14px",
      background: "rgba(255,255,255,.03)", borderRadius: 10,
      border: "1px solid rgba(255,255,255,.06)",
      transition: "all .2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.055)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.06)"; }}
    >
      <div style={{ width: 32, height: 32, borderRadius: 8, background: accent ? `${accent}18` : "rgba(255,255,255,.06)", border: `1px solid ${accent ? `${accent}35` : "rgba(255,255,255,.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={14} style={{ color: accent || "rgba(148,163,184,.6)" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(148,163,184,.5)", marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
      </div>
    </div>
  );
}

function SectionTitle({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <div style={{ height: 1, width: 18, background: "rgba(255,255,255,.15)" }} />
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(148,163,184,.5)" }}>{label}</span>
      <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,.07)" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   JSON SYNTAX HIGHLIGHTER
═══════════════════════════════════════════════════════════════ */
function highlightJson(json) {
  return json
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
      let cls = "json-num";
      if (/^"/.test(match)) cls = /:$/.test(match) ? "json-key" : "json-str";
      else if (/true|false/.test(match)) cls = "json-bool";
      else if (/null/.test(match)) cls = "json-null";
      return `<span class="${cls}">${match}</span>`;
    });
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function StudentAIOutputReport({ report = REPORT }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [copied, setCopied] = useState(false);
  const t = TIER_CFG[report.score.tier];
  const TierIcon = t.icon;

  const handleCopy = () => {
    navigator.clipboard?.writeText(JSON.stringify(report.rawJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:4px}
        @keyframes srFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes srPulse{0%,100%{opacity:1}50%{opacity:.4}}
        .sr-fade1{animation:srFadeUp .5s ease both .05s}
        .sr-fade2{animation:srFadeUp .5s ease both .12s}
        .sr-fade3{animation:srFadeUp .5s ease both .19s}
        .sr-fade4{animation:srFadeUp .5s ease both .26s}
        .live-dot{animation:srPulse 1.8s ease-in-out infinite}
        .json-key{color:#67e8f9}
        .json-str{color:#86efac}
        .json-num{color:#fbbf24}
        .json-bool{color:#f97316}
        .json-null{color:#f87171}
      `}</style>

      <div style={{
        minHeight: "100vh", fontFamily: "'DM Sans', sans-serif",
        background: "radial-gradient(ellipse 100% 55% at 50% -5%, #0d2040 0%, #050d18 45%, #020408 100%)",
        color: "#f1f5f9", padding: "24px 20px 40px",
      }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>

          {/* ── GLOBAL HEADER ── */}
          <div className="sr-fade1" style={{
            display: "flex", alignItems: "flex-start", justifyContent: "space-between",
            gap: 16, flexWrap: "wrap", marginBottom: 24,
            padding: "22px 26px",
            background: "linear-gradient(145deg,rgba(255,255,255,.07),rgba(255,255,255,.025))",
            backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
            border: "1px solid rgba(255,255,255,.1)", borderRadius: 22,
            boxShadow: `0 0 0 1px rgba(${t.rgb},.06), 0 24px 60px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.08)`,
          }}>
            {/* Left: avatar + name */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: `linear-gradient(135deg,rgba(${t.rgb},.35),rgba(${t.rgb},.12))`,
                border: `2px solid rgba(${t.rgb},.45)`,
                boxShadow: `0 0 20px rgba(${t.rgb},.25)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: "#fff",
              }}>
                {report.student.avatar}
              </div>
              <div>
                <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(18px,3vw,24px)", color: "#f1f5f9", letterSpacing: "-.025em", lineHeight: 1.15 }}>
                  {report.student.name}
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                  <code style={{ fontSize: 11, color: "rgba(148,163,184,.55)", background: "rgba(255,255,255,.06)", padding: "2px 8px", borderRadius: 6, fontFamily: "'JetBrains Mono',monospace" }}>
                    {report.student.id}
                  </code>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "rgba(148,163,184,.5)" }}>
                    <Calendar size={11} /> {report.student.callDate}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "rgba(148,163,184,.5)" }}>
                    <Clock size={11} /> {report.student.callDuration}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "rgba(148,163,184,.5)" }}>
                    <Globe size={11} /> {report.student.language}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: tier badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 18px",
              background: `linear-gradient(135deg,rgba(${t.rgb},.18),rgba(${t.rgb},.08))`,
              border: `1.5px solid rgba(${t.rgb},.45)`,
              borderRadius: 14,
              boxShadow: `0 0 24px rgba(${t.rgb},.2)`,
            }}>
              <TierIcon size={20} style={{ color: t.color }} />
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, color: t.color, letterSpacing: ".08em" }}>
                  {t.label}
                </div>
                <div style={{ fontSize: 22, fontFamily: "'Syne',sans-serif", fontWeight: 800, color: "#f1f5f9", lineHeight: 1.1 }}>
                  {report.score.total} <span style={{ fontSize: 13, color: "rgba(148,163,184,.5)", fontWeight: 400 }}>/ 100</span>
                </div>
              </div>
              <div style={{ width: 1, height: 36, background: `rgba(${t.rgb},.25)` }} />
              <div>
                <div className="live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: t.color, boxShadow: `0 0 7px ${t.color}` }} />
              </div>
            </div>
          </div>

          {/* ── TOP SECTION: Score + Actions ── */}
          <div className="sr-fade2" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16, marginBottom: 20 }}>

            {/* Score Breakdown */}
            <div style={{
              padding: "24px", borderRadius: 20,
              background: "linear-gradient(145deg,rgba(255,255,255,.065),rgba(255,255,255,.02))",
              backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,.09)",
              boxShadow: "0 8px 40px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.07)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <Star size={14} style={{ color: t.color }} />
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(148,163,184,.6)" }}>Score Breakdown</span>
              </div>

              {/* Big ring + bars side by side */}
              <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20 }}>
                <ScoreRing score={report.score.total} max={100} color={t.color} size={96} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                  {Object.values(report.score.breakdown).map(({ score, max, label }) => (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 11, color: "rgba(148,163,184,.6)", fontWeight: 500 }}>{label}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#f1f5f9" }}>
                          {score}<span style={{ color: "rgba(148,163,184,.4)" }}>/{max}</span>
                        </span>
                      </div>
                      <ProgressBar score={score} max={max} color={t.color} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Score sub-cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {Object.values(report.score.breakdown).map(({ score, max, label }) => (
                  <div key={label} style={{ borderRadius: 10, padding: "10px 12px", background: `rgba(${t.rgb},.08)`, border: `1px solid rgba(${t.rgb},.22)`, textAlign: "center" }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: "#f1f5f9", lineHeight: 1 }}>{score}</div>
                    <div style={{ fontSize: 9, color: "rgba(148,163,184,.45)", marginTop: 3, letterSpacing: ".05em" }}>{label.split(" ")[0].toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Actions */}
            <div style={{
              padding: "24px", borderRadius: 20,
              background: "linear-gradient(145deg,rgba(255,255,255,.065),rgba(255,255,255,.02))",
              backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,.09)",
              boxShadow: "0 8px 40px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.07)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <AlertCircle size={14} style={{ color: t.color }} />
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(148,163,184,.6)" }}>AI Recommended Actions</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 20 }}>
                {report.actions.map(({ priority, text }) => (
                  <div key={priority} style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "10px 12px", borderRadius: 10,
                    background: priority === 1 ? `rgba(${t.rgb},.1)` : "rgba(255,255,255,.03)",
                    border: priority === 1 ? `1px solid rgba(${t.rgb},.3)` : "1px solid rgba(255,255,255,.06)",
                    transition: "all .2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = `rgba(${t.rgb},.1)`; e.currentTarget.style.borderColor = `rgba(${t.rgb},.28)`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = priority === 1 ? `rgba(${t.rgb},.1)` : "rgba(255,255,255,.03)"; e.currentTarget.style.borderColor = priority === 1 ? `rgba(${t.rgb},.3)` : "rgba(255,255,255,.06)"; }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                      background: priority === 1 ? t.color : `rgba(${t.rgb},.25)`,
                      border: `1px solid rgba(${t.rgb},.4)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 10,
                      color: priority === 1 ? "#fff" : t.color,
                    }}>
                      {priority}
                    </div>
                    <span style={{ fontSize: 12.5, color: "rgba(226,232,240,.8)", lineHeight: 1.55, fontWeight: priority === 1 ? 500 : 400 }}>{text}</span>
                  </div>
                ))}
              </div>

              <button style={{
                width: "100%", padding: "13px", borderRadius: 12, border: "none",
                background: `linear-gradient(135deg, ${t.color}, ${t.color}bb)`,
                boxShadow: `0 0 24px rgba(${t.rgb},.4), 0 4px 14px rgba(0,0,0,.3)`,
                color: "#fff", fontSize: 14, fontWeight: 700,
                fontFamily: "'DM Sans',sans-serif", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all .2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02) translateY(-1px)"; e.currentTarget.style.boxShadow = `0 0 36px rgba(${t.rgb},.6), 0 4px 18px rgba(0,0,0,.35)`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1) translateY(0)"; e.currentTarget.style.boxShadow = `0 0 24px rgba(${t.rgb},.4), 0 4px 14px rgba(0,0,0,.3)`; }}
              >
                <Phone size={16} />
                Initiate Call Now
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* ── BOTTOM: TABBED DATA DIVE ── */}
          <div className="sr-fade3" style={{
            borderRadius: 22,
            background: "linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.015))",
            backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,.09)",
            boxShadow: "0 8px 40px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.07)",
            overflow: "hidden",
          }}>
            {/* Tab bar */}
            <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,.08)", padding: "0 8px" }}>
              {[
                { key: "profile",    label: "Student Profile",   icon: User },
                { key: "transcript", label: "Call Transcript",    icon: MessageSquare },
                { key: "json",       label: "Raw JSON",           icon: Code2 },
              ].map(({ key, label, icon: Icon }) => {
                const active = activeTab === key;
                return (
                  <button key={key} onClick={() => setActiveTab(key)} style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "14px 18px", border: "none",
                    background: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: active ? 600 : 400,
                    fontFamily: "'DM Sans',sans-serif",
                    color: active ? "#f1f5f9" : "rgba(148,163,184,.5)",
                    borderBottom: active ? `2px solid ${t.color}` : "2px solid transparent",
                    transition: "all .2s", marginBottom: -1,
                  }}>
                    <Icon size={14} style={{ color: active ? t.color : "inherit" }} />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div style={{ padding: "24px" }}>

              {/* TAB 1: Student Profile */}
              {activeTab === "profile" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 24 }}>
                  {[
                    { title: "Personal",   accent: "#2563eb", items: [
                      { icon: User, label: "Full Name",    value: report.profile.personal.name },
                      { icon: Phone, label: "Phone",       value: report.profile.personal.phone },
                      { icon: Mail, label: "Email",        value: report.profile.personal.email },
                      { icon: MapPin, label: "Location",   value: report.profile.personal.location },
                    ]},
                    { title: "Academic",   accent: "#a855f7", items: [
                      { icon: GraduationCap, label: "Education Level", value: report.profile.academic.level },
                      { icon: BookOpen,      label: "Field of Study",  value: report.profile.academic.field },
                      { icon: Target,        label: "Institution",     value: report.profile.academic.institution },
                      { icon: Star,          label: "GPA / Score",     value: report.profile.academic.gpa },
                    ]},
                    { title: "Preferences", accent: "#10b981", items: [
                      { icon: Globe, label: "Target Countries", value: report.profile.preferences.countries },
                      { icon: BookOpen, label: "Course Interest", value: report.profile.preferences.course },
                      { icon: Calendar, label: "Preferred Intake", value: report.profile.preferences.intake },
                    ]},
                    { title: "Readiness",  accent: t.color, items: [
                      { icon: FileText,     label: "Test Status",    value: report.profile.readiness.tests },
                      { icon: DollarSign,   label: "Budget Range",   value: report.profile.readiness.budget },
                      { icon: Star,         label: "Scholarship",    value: report.profile.readiness.scholarship },
                      { icon: Clock,        label: "Timeline",       value: report.profile.readiness.timeline },
                    ]},
                  ].map(({ title, accent, items }) => (
                    <div key={title}>
                      <SectionTitle label={title} />
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {items.map(({ icon, label, value }) => (
                          <DataField key={label} icon={icon} label={label} value={value} accent={accent} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: Call Transcript */}
              {activeTab === "transcript" && (
                <div style={{ maxHeight: 480, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
                  {report.transcript.map((msg, i) => {
                    const isAgent = msg.role === "agent";
                    return (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", flexDirection: isAgent ? "row" : "row-reverse" }}>
                        {/* Avatar */}
                        <div style={{
                          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                          background: isAgent ? "rgba(37,99,235,.2)" : `rgba(${t.rgb},.18)`,
                          border: isAgent ? "1.5px solid rgba(37,99,235,.4)" : `1.5px solid rgba(${t.rgb},.4)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {isAgent
                            ? <Mic size={14} style={{ color: "#60a5fa" }} />
                            : <User size={14} style={{ color: t.color }} />}
                        </div>
                        {/* Bubble */}
                        <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", gap: 4, alignItems: isAgent ? "flex-start" : "flex-end" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 600, color: isAgent ? "#60a5fa" : t.color }}>
                              {isAgent ? "Meera (AI)" : "Kavya"}
                            </span>
                            <span style={{ fontSize: 10, color: "rgba(148,163,184,.35)" }}>{msg.time}</span>
                          </div>
                          <div style={{
                            padding: "11px 15px", borderRadius: isAgent ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                            background: isAgent ? "rgba(37,99,235,.12)" : `rgba(${t.rgb},.1)`,
                            border: isAgent ? "1px solid rgba(37,99,235,.22)" : `1px solid rgba(${t.rgb},.22)`,
                            fontSize: 13, color: "rgba(226,232,240,.9)", lineHeight: 1.6,
                          }}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 3: Raw JSON */}
              {activeTab === "json" && (
                <div style={{ position: "relative" }}>
                  <button onClick={handleCopy} style={{
                    position: "absolute", top: 12, right: 12, zIndex: 2,
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 13px", borderRadius: 8,
                    background: copied ? "rgba(16,185,129,.15)" : "rgba(255,255,255,.07)",
                    border: copied ? "1px solid rgba(16,185,129,.4)" : "1px solid rgba(255,255,255,.15)",
                    color: copied ? "#34d399" : "rgba(148,163,184,.7)",
                    fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all .2s",
                    fontFamily: "'DM Sans',sans-serif",
                  }}>
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Copied!" : "Copy JSON"}
                  </button>
                  <div style={{
                    padding: "20px", borderRadius: 14, overflowX: "auto",
                    background: "rgba(2,6,12,.8)", border: "1px solid rgba(255,255,255,.08)",
                    fontFamily: "'JetBrains Mono',monospace", fontSize: 12, lineHeight: 1.75,
                    maxHeight: 500, overflowY: "auto",
                  }}>
                    <pre dangerouslySetInnerHTML={{ __html: highlightJson(JSON.stringify(report.rawJson, null, 2)) }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div className="sr-fade4" style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "rgba(148,163,184,.28)", letterSpacing: ".04em" }}>
            Fateh Education · AI Report Engine v2.1 · Generated {report.student.callDate} {report.student.callTime} · {report.student.id}
          </div>
        </div>
      </div>
    </>
  );
}
