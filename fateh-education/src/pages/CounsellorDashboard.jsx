import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/*
  CounsellorDashboard.jsx  –  Fateh Education Platform
  ──────────────────────────────────────────────────────────────
  Lead Classification Kanban Board
  • Hot  (70–100): immediate callback   → crimson / orange glow
  • Warm (40–69):  follow-up 24 h       → amber / yellow glow
  • Cold (0–39):   nurture campaign     → ice-blue / teal glow
  ──────────────────────────────────────────────────────────────
*/

// ═══════════════════════════════════════════════════════════════
// MOCK STUDENT DATA   (12 varied students)
// ═══════════════════════════════════════════════════════════════
const STUDENTS = [
  {
    id: "FE-4821-PRSH",  name: "Priya Sharma",
    email: "priya.sharma@gmail.com",  phone: "+91 98765 43210",
    location: "Pune, Maharashtra",
    course: "MSc AI / Data Science",  country: "UK",
    intake: "Sep 2025",  institution: "SPPU",
    financial: 45,  // out of 50
    timeline: 42,   // out of 50
    ielts: "Preparing",  budget: "₹40–55L",
    transcript: "3 min 12 s",
    date: "Today, 09:14 AM",
    avatar: "PS",
  },
  {
    id: "FE-3302-RKJN",  name: "Rahul Jain",
    email: "rahul.jain@outlook.com",  phone: "+91 87654 32109",
    location: "Mumbai, Maharashtra",
    course: "MBA Finance",  country: "Ireland",
    intake: "Jan 2026",  institution: "Mumbai University",
    financial: 38,
    timeline: 35,
    ielts: "Score: 6.5",  budget: "₹30–40L",
    transcript: "4 min 05 s",
    date: "Today, 09:42 AM",
    avatar: "RJ",
  },
  {
    id: "FE-7741-ANNT",  name: "Ananya Tiwari",
    email: "ananya.t@yahoo.in",  phone: "+91 77345 11029",
    location: "Bengaluru, Karnataka",
    course: "MSc Computer Science",  country: "UK",
    intake: "Sep 2025",  institution: "PES University",
    financial: 48,
    timeline: 47,
    ielts: "Score: 7.5",  budget: "₹50–65L",
    transcript: "2 min 48 s",
    date: "Today, 10:05 AM",
    avatar: "AT",
  },
  {
    id: "FE-5519-DVRD",  name: "Dev Reddy",
    email: "dev.reddy@gmail.com",  phone: "+91 99887 65432",
    location: "Hyderabad, Telangana",
    course: "BEng Electrical",  country: "Ireland",
    intake: "Sep 2025",  institution: "JNTU Hyderabad",
    financial: 22,
    timeline: 15,
    ielts: "Not started",  budget: "₹20–28L",
    transcript: "5 min 31 s",
    date: "Today, 10:28 AM",
    avatar: "DR",
  },
  {
    id: "FE-6630-KPNR",  name: "Kavya Pillai",
    email: "kavya.pillai@hotmail.com",  phone: "+91 88776 54321",
    location: "Chennai, Tamil Nadu",
    course: "MSc Biotechnology",  country: "UK",
    intake: "Jan 2026",  institution: "Anna University",
    financial: 30,
    timeline: 28,
    ielts: "Booked",  budget: "₹25–32L",
    transcript: "3 min 54 s",
    date: "Today, 10:55 AM",
    avatar: "KP",
  },
  {
    id: "FE-9012-SMGH",  name: "Samir Ghosh",
    email: "samir.g@gmail.com",  phone: "+91 94321 87650",
    location: "Kolkata, West Bengal",
    course: "MSc Data Analytics",  country: "Ireland",
    intake: "Sep 2025",  institution: "Jadavpur University",
    financial: 43,
    timeline: 46,
    ielts: "Score: 7.0",  budget: "₹38–48L",
    transcript: "3 min 19 s",
    date: "Today, 11:15 AM",
    avatar: "SG",
  },
  {
    id: "FE-1187-NMSH",  name: "Nisha Mishra",
    email: "nisha.m@rediffmail.com",  phone: "+91 76543 21098",
    location: "Jaipur, Rajasthan",
    course: "MBA HR",  country: "UK",
    intake: "Jan 2026",  institution: "University of Rajasthan",
    financial: 16,
    timeline: 12,
    ielts: "Not started",  budget: "₹15–20L",
    transcript: "6 min 02 s",
    date: "Today, 11:40 AM",
    avatar: "NM",
  },
  {
    id: "FE-4456-ARPT",  name: "Arjun Patel",
    email: "arjun.patel@gmail.com",  phone: "+91 90012 34567",
    location: "Ahmedabad, Gujarat",
    course: "MSc Cybersecurity",  country: "UK",
    intake: "Sep 2025",  institution: "Gujarat University",
    financial: 46,
    timeline: 44,
    ielts: "Score: 7.0",  budget: "₹45–55L",
    transcript: "2 min 55 s",
    date: "Today, 12:02 PM",
    avatar: "AP",
  },
  {
    id: "FE-8823-SNKR",  name: "Sneha Kulkarni",
    email: "sneha.k@gmail.com",  phone: "+91 81234 56789",
    location: "Nagpur, Maharashtra",
    course: "MEng Mechanical",  country: "Ireland",
    intake: "Jan 2026",  institution: "VNIT Nagpur",
    financial: 35,
    timeline: 38,
    ielts: "Score: 6.0",  budget: "₹28–38L",
    transcript: "4 min 17 s",
    date: "Today, 12:30 PM",
    avatar: "SK",
  },
  {
    id: "FE-2290-VKTR",  name: "Vikram Iyer",
    email: "vikram.iyer@yahoo.com",  phone: "+91 73456 78901",
    location: "Coimbatore, Tamil Nadu",
    course: "MSc Finance",  country: "UK",
    intake: "Sep 2025",  institution: "PSG College",
    financial: 8,
    timeline: 10,
    ielts: "Not started",  budget: "₹10–15L",
    transcript: "7 min 14 s",
    date: "Today, 13:05 PM",
    avatar: "VI",
  },
  {
    id: "FE-3371-RCHD",  name: "Ritu Choudhary",
    email: "ritu.chd@gmail.com",  phone: "+91 92345 67890",
    location: "Delhi, NCR",
    course: "LLM International Law",  country: "Ireland",
    intake: "Sep 2025",  institution: "Delhi University",
    financial: 44,
    timeline: 40,
    ielts: "Score: 6.5",  budget: "₹35–45L",
    transcript: "3 min 42 s",
    date: "Today, 13:28 PM",
    avatar: "RC",
  },
  {
    id: "FE-6654-MNGR",  name: "Manish Gupta",
    email: "manish.g@outlook.com",  phone: "+91 85678 90123",
    location: "Lucknow, UP",
    course: "MSc Public Health",  country: "UK",
    intake: "Jan 2026",  institution: "Lucknow University",
    financial: 20,
    timeline: 17,
    ielts: "Preparing",  budget: "₹18–25L",
    transcript: "5 min 08 s",
    date: "Today, 13:55 PM",
    avatar: "MG",
  },
];

// ═══════════════════════════════════════════════════════════════
// SCORING + CLASSIFICATION HELPERS
// ═══════════════════════════════════════════════════════════════

/** Compute total score (max 100) and classification tier */
function classify(student) {
  const total = student.financial + student.timeline; // both already out of 50
  let tier, action, urgency;
  if (total >= 70) {
    tier = "hot";
    action = "Immediate Callback";
    urgency = "Within 2 hours";
  } else if (total >= 40) {
    tier = "warm";
    action = "Follow-up in 24 hrs";
    urgency = "Within 24 hours";
  } else {
    tier = "cold";
    action = "Add to Nurture Campaign";
    urgency = "Weekly drip email";
  }
  return { ...student, total, tier, action, urgency };
}

/** Sort enriched students into the three tier buckets */
function classifyAll(students) {
  const enriched = students.map(classify);
  return {
    hot:  enriched.filter(s => s.tier === "hot").sort((a, b) => b.total - a.total),
    warm: enriched.filter(s => s.tier === "warm").sort((a, b) => b.total - a.total),
    cold: enriched.filter(s => s.tier === "cold").sort((a, b) => b.total - a.total),
  };
}

// ═══════════════════════════════════════════════════════════════
// TIER CONFIG
// ═══════════════════════════════════════════════════════════════
const TIER = {
  hot: {
    label: "Hot Leads",
    emoji: "🔥",
    range: "70 – 100",
    color: "#f97316",          // orange
    colorDark: "#ea580c",
    colorRgb: "249,115,22",
    glow: "rgba(249,115,22,",
    bg: "rgba(249,115,22,0.09)",
    border: "rgba(249,115,22,0.28)",
    badgeBg: "rgba(249,115,22,0.15)",
    badgeBorder: "rgba(249,115,22,0.4)",
    headerBg: "linear-gradient(135deg,rgba(249,115,22,.18) 0%,rgba(234,88,12,.07) 100%)",
    scoreColor: "#fb923c",
    tag: "IMMEDIATE",
    tagColor: "#fed7aa",
    tagBg: "rgba(249,115,22,.18)",
    tagBorder: "rgba(249,115,22,.4)",
  },
  warm: {
    label: "Warm Leads",
    emoji: "⚡",
    range: "40 – 69",
    color: "#f59e0b",          // amber
    colorDark: "#d97706",
    colorRgb: "245,158,11",
    glow: "rgba(245,158,11,",
    bg: "rgba(245,158,11,0.09)",
    border: "rgba(245,158,11,0.28)",
    badgeBg: "rgba(245,158,11,0.15)",
    badgeBorder: "rgba(245,158,11,0.4)",
    headerBg: "linear-gradient(135deg,rgba(245,158,11,.18) 0%,rgba(217,119,6,.07) 100%)",
    scoreColor: "#fbbf24",
    tag: "24 HRS",
    tagColor: "#fde68a",
    tagBg: "rgba(245,158,11,.18)",
    tagBorder: "rgba(245,158,11,.4)",
  },
  cold: {
    label: "Cold Leads",
    emoji: "❄️",
    range: "0 – 39",
    color: "#22d3ee",          // cyan / ice blue
    colorDark: "#06b6d4",
    colorRgb: "34,211,238",
    glow: "rgba(34,211,238,",
    bg: "rgba(34,211,238,0.07)",
    border: "rgba(34,211,238,0.22)",
    badgeBg: "rgba(34,211,238,0.12)",
    badgeBorder: "rgba(34,211,238,0.35)",
    headerBg: "linear-gradient(135deg,rgba(34,211,238,.14) 0%,rgba(6,182,212,.05) 100%)",
    scoreColor: "#67e8f9",
    tag: "NURTURE",
    tagColor: "#a5f3fc",
    tagBg: "rgba(34,211,238,.14)",
    tagBorder: "rgba(34,211,238,.35)",
  },
};

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

/** Circular score badge with SVG ring */
function ScoreBadge({ score, t }) {
  const r = 26, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
      <svg width="64" height="64" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
        <circle cx="32" cy="32" r={r} fill="none"
          stroke="rgba(255,255,255,.08)" strokeWidth="4.5" />
        <circle cx="32" cy="32" r={r} fill="none"
          stroke={t.color} strokeWidth="4.5"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 5px ${t.glow}0.7))`, transition: "stroke-dasharray 1.2s cubic-bezier(.34,1.56,.64,1)" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: "#f1f5f9", lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: 8, color: "rgba(148,163,184,.5)", letterSpacing: ".06em" }}>/100</span>
      </div>
    </div>
  );
}

/** Mini progress bar */
function MiniBar({ label, value, max = 50, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: "rgba(148,163,184,.5)", fontFamily: "'DM Sans',sans-serif" }}>{label}</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(241,245,249,.7)", fontFamily: "'DM Sans',sans-serif" }}>
          {value}<span style={{ color: "rgba(148,163,184,.35)" }}>/{max}</span>
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,.07)", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, borderRadius: 4,
          background: `linear-gradient(90deg, ${color}cc, ${color})`,
          boxShadow: `0 0 6px ${color}88`,
          transition: "width 1s cubic-bezier(.34,1.56,.64,1)",
        }} />
      </div>
    </div>
  );
}

/** Single student card - Now uniform for all tiers */
function LeadCard({ s, t, onView }) {
  const [hov, setHov] = useState(false);
  
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 22, 
        padding: "24px 20px", 
        background: hov
          ? `linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))`
          : "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        border: hov ? `1px solid ${t.color}60` : `1px solid rgba(255,255,255,0.1)`,
        boxShadow: hov 
          ? `0 20px 40px rgba(0,0,0,0.5), 0 0 30px ${t.glow}0.15)` 
          : "0 8px 32px rgba(0,0,0,0.4)",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        transition: "all .4s cubic-bezier(.23,1,.32,1)",
        position: "relative",
        overflow: "hidden",
        marginBottom: "12px"
      }}
    >
      {/* 1. Header Row: Badge + Info */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
        <ScoreBadge score={s.total} t={t} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: "#fff" }}>
              {s.name}
            </span>
            <span style={{ 
              fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 100, 
              background: t.tagBg, border: `1px solid ${t.tagBorder}`, color: t.tagColor 
            }}>
              {t.tag}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "rgba(148,163,184,0.6)" }}>{s.id}</div>
          <div style={{ fontSize: 12, color: "rgba(148,163,184,0.5)", marginTop: 2 }}>{s.course} · {s.country}</div>
        </div>
      </div>

      {/* 2. Progress Bars Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
        <MiniBar label="Financial Readiness" value={s.financial} color={t.color} />
        <MiniBar label="Timeline Urgency" value={s.timeline} color={t.color} />
      </div>

      {/* 3. Detail Pills Section */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
        {[s.intake, s.ielts, s.budget].map((pill) => (
          <span key={pill} style={{ 
            fontSize: 10, padding: "4px 10px", borderRadius: 100, 
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", 
            color: "rgba(200,213,255,0.7)" 
          }}>
            {pill}
          </span>
        ))}
      </div>

      {/* 4. Action Area: Large Button + Mini Profile Icon */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => onView(s)}
          style={{
            flex: 1, padding: "12px", borderRadius: 14, border: "none",
            background: "linear-gradient(135deg, #f97316, #ea580c)", // Orange gradient for all
            color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 0 20px rgba(249,115,22,0.4)", transition: "all 0.3s ease"
          }}
          onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
          onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}
        >
          View Transcript
        </button>
        
        {/* Profile Button */}
        <button
          style={{
            width: 46, height: 46, borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", 
            justifyContent: "center", cursor: "pointer", color: t.color
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

/** Kanban column */
function Column({ tier, students, onView }) {
  const t = TIER[tier];
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      flex: 1, 
      height: "calc(100vh - 280px)", // Locks column height
      minHeight: "500px",            // Prevents disappearing on tiny screens
      borderRadius: 22, overflow: "hidden",
      background: "linear-gradient(180deg,rgba(255,255,255,.05) 0%,rgba(255,255,255,.02) 100%)",
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      border: `1px solid ${t.border}`,
      boxShadow: `0 0 0 1px ${t.glow}0.06), 0 8px 40px rgba(0,0,0,.4)`,
    }}>
      {/* Column header */}
      <div style={{
        padding: "18px 18px 16px",
        background: t.headerBg,
        borderBottom: `1px solid ${t.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontSize: 20 }}>{t.emoji}</span>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: "#f1f5f9", letterSpacing: "-.01em" }}>
                {t.label}
              </div>
              <div style={{ fontSize: 10, color: "rgba(148,163,184,.5)", marginTop: 1 }}>Score {t.range}</div>
            </div>
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: t.badgeBg, border: `1.5px solid ${t.badgeBorder}`,
            boxShadow: `0 0 12px ${t.glow}0.3)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: t.scoreColor,
          }}>
            {students.length}
          </div>
        </div>
      </div>

      {/* Cards scroll area - Scrolls internally */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "14px 12px",
        display: "flex", flexDirection: "column", gap: 12,
        scrollbarWidth: "thin",
        scrollbarColor: `${t.glow}0.3) transparent`,
      }}>
        {students.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "40px 20px",
            color: "rgba(148,163,184,.3)", fontSize: 13, fontStyle: "italic",
          }}>
            No {tier} leads today
          </div>
        ) : (
          students.map(s => (
            <LeadCard key={s.id} s={s} t={t} onView={onView} />
          ))
        )}
      </div>
    </div>
  );
}

/** Metric summary card */
function MetricCard({ icon, label, value, color, glow, subtitle }) {
  return (
    <div style={{
      flex: 1, minWidth: 160,
      borderRadius: 18, padding: "18px 20px",
      background: "linear-gradient(145deg,rgba(255,255,255,.07) 0%,rgba(255,255,255,.025) 100%)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      border: `1px solid ${color}38`,
      boxShadow: `0 0 0 1px ${color}0c, 0 4px 24px rgba(0,0,0,.35), 0 0 20px ${color}0a`,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(148,163,184,.5)", marginBottom: 8 }}>{label}</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 36, color: "#f1f5f9", lineHeight: 1, letterSpacing: "-.03em" }}>{value}</div>
          {subtitle && <div style={{ fontSize: 11, color: "rgba(148,163,184,.4)", marginTop: 5 }}>{subtitle}</div>}
        </div>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: `${color}18`, border: `1px solid ${color}35`,
          boxShadow: `0 0 14px ${color}22`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/** Student detail modal */
function DetailModal({ student, onClose }) {
  const navigate = useNavigate(); // <-- Added navigation hook here
  const t = TIER[student.tier];
  const backdropRef = useRef(null);
  
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div ref={backdropRef} onClick={(e) => { if (e.target === backdropRef.current) onClose(); }} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(1,5,3,.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px 16px", animation: "cdModalBg .25s ease both",
    }}>
      <div style={{
        width: "100%", maxWidth: 520,
        borderRadius: 26, overflow: "hidden",
        background: "linear-gradient(160deg,#0b1a10 0%,#060c07 100%)",
        border: `1px solid ${t.border}`,
        boxShadow: `0 0 0 1px ${t.glow}0.08), 0 28px 70px rgba(0,0,0,.7), 0 0 50px ${t.glow}0.06)`,
        animation: "cdModalIn .4s cubic-bezier(.23,1,.32,1) both",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        {/* Modal header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${t.border}`, background: t.headerBg, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ScoreBadge score={student.total} t={t} />
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17, color: "#f1f5f9" }}>{student.name}</div>
              <div style={{ fontSize: 11, color: "rgba(148,163,184,.5)", marginTop: 2 }}>{student.id}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.06)", color: "rgba(148,163,184,.65)", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,.18)"; e.currentTarget.style.color = "#fca5a5"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.color = "rgba(148,163,184,.65)"; }}>
            ✕
          </button>
        </div>

        {/* Modal body */}
        <div style={{ padding: "22px 24px" }}>
          {/* Scores */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Total Score", value: `${student.total}/100`, color: t.color },
              { label: "Financial",   value: `${student.financial}/50`, color: "#06c47a" },
              { label: "Timeline",    value: `${student.timeline}/50`,  color: "#f59e0b" },
            ].map(m => (
              <div key={m.label} style={{ borderRadius: 12, padding: "12px 14px", background: `${m.color}12`, border: `1px solid ${m.color}30`, textAlign: "center" }}>
                <div style={{ fontSize: 20, fontFamily: "'Syne',sans-serif", fontWeight: 800, color: "#f1f5f9" }}>{m.value}</div>
                <div style={{ fontSize: 10, color: "rgba(148,163,184,.5)", marginTop: 3 }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Details table */}
          <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)", marginBottom: 20 }}>
            {[
              { icon: "📧", label: "Email",    value: student.email },
              { icon: "📱", label: "Phone",    value: student.phone },
              { icon: "📍", label: "Location", value: student.location },
              { icon: "🎓", label: "Course",   value: student.course },
              { icon: "🌍", label: "Country",  value: student.country },
              { icon: "📅", label: "Intake",   value: student.intake },
              { icon: "📝", label: "IELTS",    value: student.ielts },
              { icon: "💰", label: "Budget",   value: student.budget },
              { icon: "🎙️", label: "Transcript", value: student.transcript },
            ].map((row, i) => (
              <div key={row.label} style={{ display: "flex", padding: "10px 14px", borderBottom: i < 8 ? "1px solid rgba(255,255,255,.06)" : "none", background: i % 2 === 0 ? "rgba(255,255,255,.02)" : "transparent" }}>
                <span style={{ width: 20, fontSize: 13, flexShrink: 0 }}>{row.icon}</span>
                <span style={{ fontSize: 12, color: "rgba(148,163,184,.5)", width: 90, flexShrink: 0 }}>{row.label}</span>
                <span style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Action */}
          <div style={{ borderRadius: 12, padding: "12px 16px", background: `${t.glow}0.1)`, border: `1px solid ${t.border}`, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color, boxShadow: `0 0 8px ${t.color}`, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.scoreColor }}>{student.action}</div>
              <div style={{ fontSize: 11, color: "rgba(148,163,184,.45)", marginTop: 2 }}>Urgency: {student.urgency}</div>
            </div>
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${t.color},${t.colorDark})`, color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", boxShadow: `0 0 20px ${t.glow}0.4)` }}>
              📞 Call Now
            </button>
            <button 
              onClick={() => navigate('/report')} // <-- Hooked up navigation to the report page
              style={{ flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${t.border}`, background: t.badgeBg, color: t.scoreColor, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}
            >
              📤 View Detailed Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════
export default function CounsellorDashboard({ counsellorName = "Dr. Aarav Mehta", onLogout }) {
  const [activeModal, setActiveModal] = useState(null);
  const [search, setSearch]           = useState("");
  const [filterTier, setFilterTier]   = useState("all");

  const { hot, warm, cold } = classifyAll(STUDENTS);
  const allLeads = [...hot, ...warm, ...cold];

  /* Apply search + tier filter */
  const filtered = (tier, leads) => {
    if (filterTier !== "all" && filterTier !== tier) return [];
    if (!search.trim()) return leads;
    const q = search.toLowerCase();
    return leads.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.course.toLowerCase().includes(q) ||
      s.country.toLowerCase().includes(q)
    );
  };

  const now = new Date().toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short", year:"numeric" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes cdFadeIn   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cdModalBg  { from{opacity:0} to{opacity:1} }
        @keyframes cdModalIn  { from{opacity:0;transform:translateY(32px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes cdPulse    { 0%,100%{opacity:1} 50%{opacity:.4} }

        ::-webkit-scrollbar            { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track      { background: transparent; }
        ::-webkit-scrollbar-thumb      { background: rgba(6,196,122,.3); border-radius: 4px; }

        .cd-metric   { animation: cdFadeIn .6s ease both; }
        .cd-metric:nth-child(1){ animation-delay:.05s }
        .cd-metric:nth-child(2){ animation-delay:.12s }
        .cd-metric:nth-child(3){ animation-delay:.19s }
        .cd-metric:nth-child(4){ animation-delay:.26s }

        .cd-col      { animation: cdFadeIn .65s ease both; }
        .cd-col:nth-child(1){ animation-delay:.15s }
        .cd-col:nth-child(2){ animation-delay:.25s }
        .cd-col:nth-child(3){ animation-delay:.35s }

        .cd-live-dot { animation: cdPulse 1.8s ease-in-out infinite; }

        input::placeholder { color: rgba(148,163,184,.3); }
      `}</style>

      <div style={{
        position: "fixed", inset: 0, display: "flex", flexDirection: "column",
        background: "radial-gradient(ellipse 110% 65% at 50% -8%,#051a10 0%,#030d06 44%,#010603 100%)",
        fontFamily: "'DM Sans', sans-serif", overflow: "hidden",
      }}>
        {/* Grid bg */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: "linear-gradient(rgba(6,196,122,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(6,196,122,.04) 1px,transparent 1px)",
          backgroundSize: "58px 58px",
          maskImage: "radial-gradient(ellipse 100% 50% at 50% 0%,black 10%,transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 100% 50% at 50% 0%,black 10%,transparent 100%)",
        }}/>

        {/* ── TOP NAV ── */}
        <header style={{
          position: "relative", zIndex: 10,
          padding: "0 24px",
          background: "rgba(3,13,6,.85)",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(6,196,122,.12)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 62, flexShrink: 0, gap: 12, flexWrap: "wrap",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="26" height="29" viewBox="0 0 36 40" fill="none">
              <path d="M18 2L2 8v12c0 10 6.5 17 16 19 9.5-2 16-9 16-19V8L18 2Z" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="1"/>
              <path d="M18 9L21 19 18 16 15 19Z" fill="white" opacity=".95"/>
              <path d="M18 16L20 25 18 23 16 25Z" fill="#93c5fd" opacity=".85"/>
            </svg>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: "#f1f5f9", lineHeight: 1.2 }}>FATEH</div>
              <div style={{ fontSize: 8, color: "#06c47a", letterSpacing: ".1em" }}>EDUCATION</div>
            </div>
            <div style={{ width: 1, height: 28, background: "rgba(255,255,255,.08)", margin: "0 6px" }}/>
            <div style={{ fontSize: 11, color: "rgba(148,163,184,.5)", letterSpacing: ".06em" }}>
              COUNSELLOR PORTAL
            </div>
          </div>

          {/* Live indicator + date */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="cd-live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#06c47a", boxShadow: "0 0 7px #06c47a", display: "inline-block" }}/>
            <span style={{ fontSize: 11, color: "rgba(148,163,184,.45)" }}>{now}</span>
          </div>

          {/* Counsellor + logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "linear-gradient(135deg,#06c47a,#059e62)",
                border: "2px solid rgba(6,196,122,.45)",
                boxShadow: "0 0 14px rgba(6,196,122,.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 11, color: "#fff",
              }}>
                {counsellorName.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </div>
              <div style={{ lineHeight: 1.25 }}>
                <div style={{ fontSize: 11, color: "rgba(148,163,184,.4)" }}>Welcome back,</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{counsellorName.split(" ").slice(0, 2).join(" ")}</div>
              </div>
            </div>
            <button
              onClick={onLogout}
              style={{
                padding: "7px 14px", borderRadius: 9,
                background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.28)",
                color: "#fca5a5", fontSize: 12, fontWeight: 600,
                fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "all .2s",
                display: "flex", alignItems: "center", gap: 5,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,.22)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,.1)"; }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </header>

        {/* ── SCROLLABLE CONTENT ── */}
        <div style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 1, padding: "20px 20px 28px" }}>

          {/* ── METRICS ROW ── */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <div className="cd-metric" style={{ flex: 1, minWidth: 140 }}>
              <MetricCard icon="📋" label="Total Leads" value={allLeads.length} color="#06c47a" subtitle="Today's intake" />
            </div>
            <div className="cd-metric" style={{ flex: 1, minWidth: 140 }}>
              <MetricCard icon="🔥" label="Hot Leads"   value={hot.length}  color="#f97316" subtitle="Immediate action" />
            </div>
            <div className="cd-metric" style={{ flex: 1, minWidth: 140 }}>
              <MetricCard icon="⚡" label="Warm Leads"  value={warm.length} color="#f59e0b" subtitle="Follow-up today" />
            </div>
            <div className="cd-metric" style={{ flex: 1, minWidth: 140 }}>
              <MetricCard icon="❄️" label="Cold Leads"  value={cold.length} color="#22d3ee" subtitle="Nurture pipeline" />
            </div>
          </div>

          {/* ── SEARCH + FILTER BAR ── */}
          <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
              <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(148,163,184,.4)", display: "flex" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, ID, course, country…"
                style={{
                  width: "100%", padding: "10px 14px 10px 36px",
                  borderRadius: 10, outline: "none",
                  background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
                  color: "#f1f5f9", fontSize: 13, fontFamily: "'DM Sans',sans-serif",
                  transition: "all .2s",
                }}
                onFocus={e => { e.target.style.borderColor = "rgba(6,196,122,.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(6,196,122,.1)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,.1)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Tier filter pills */}
            <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
              {[
                { key: "all",  label: "All",  color: "#06c47a" },
                { key: "hot",  label: "🔥 Hot",  color: "#f97316" },
                { key: "warm", label: "⚡ Warm", color: "#f59e0b" },
                { key: "cold", label: "❄️ Cold", color: "#22d3ee" },
              ].map(f => (
                <button key={f.key} onClick={() => setFilterTier(f.key)} style={{
                  padding: "8px 14px", borderRadius: 9, cursor: "pointer",
                  fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
                  background: filterTier === f.key ? `${f.color}22` : "rgba(255,255,255,.05)",
                  color: filterTier === f.key ? f.color : "rgba(148,163,184,.5)",
                  border: filterTier === f.key ? `1px solid ${f.color}45` : "1px solid rgba(255,255,255,.09)",
                  transition: "all .2s",
                }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── KANBAN COLUMNS ── */}
          <div style={{
            display: "flex", gap: 16, 
            overflowX: "auto",
            paddingBottom: "10px"
          }}>
            <div className="cd-col" style={{ flex: 1, minWidth: "340px" }}>
              <Column tier="hot"  students={filtered("hot", hot)}   onView={setActiveModal} />
            </div>
            <div className="cd-col" style={{ flex: 1, minWidth: "340px" }}>
              <Column tier="warm" students={filtered("warm", warm)} onView={setActiveModal} />
            </div>
            <div className="cd-col" style={{ flex: 1, minWidth: "340px" }}>
              <Column tier="cold" students={filtered("cold", cold)} onView={setActiveModal} />
            </div>
          </div>

        </div>

        {/* ── DETAIL MODAL ── */}
        {activeModal && (
          <DetailModal student={activeModal} onClose={() => setActiveModal(null)} />
        )}
      </div>
    </>
  );
}
