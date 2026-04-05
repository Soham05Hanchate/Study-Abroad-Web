import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════
   FATEH EDUCATION — CounsellorBookingFlow.jsx  v2 (Scaled Up + Scroll Fix)
   Complete 3-step booking modal — fully self-contained.

   Props:
     isOpen   : boolean        – controls visibility
     onClose  : () => void     – called on close / back-to-dashboard
     studentName?: string      – optionally personalise the success msg

   Usage in StudentView.jsx:
     import CounsellorBookingFlow from "./CounsellorBookingFlow";

     const [bookingOpen, setBookingOpen] = useState(false);

     // In JSX:
     <button onClick={() => setBookingOpen(true)}>
       Book a Counselling Session With Us!
     </button>

     <CounsellorBookingFlow
       isOpen={bookingOpen}
       onClose={() => setBookingOpen(false)}
       studentName="Priya"
     />
   ═══════════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────────
// DESIGN TOKENS  (mirrors StudentView dark-glass theme)
// ─────────────────────────────────────────────────────────────────
const DT = {
  font:        "'Syne', sans-serif",
  body:        "'DM Sans', 'Space Grotesk', sans-serif",
  bg:          "linear-gradient(160deg,#0b1628 0%,#060c14 60%,#020407 100%)",
  glass:       "linear-gradient(135deg,rgba(255,255,255,.075) 0%,rgba(255,255,255,.025) 100%)",
  glassBright: "linear-gradient(135deg,rgba(255,255,255,.11) 0%,rgba(255,255,255,.04) 100%)",
  border:      "1px solid rgba(255,255,255,.09)",
  borderFocus: "1px solid rgba(59,130,246,.55)",
  shadow:      "0 8px 48px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.07)",
  shadowHov:   "0 16px 64px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.1)",
  blue:        "#2563eb",
  blueLight:   "#60a5fa",
  green:       "#10b981",
  greenLight:  "#6ee7b7",
};

// ─────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────
const COUNSELLORS = [
  {
    id: 1, initials: "AM", name: "Dr. Aarav Mehta",
    title: "UK Admissions Specialist",
    bio: "10+ years guiding students into Oxbridge and Russell Group universities.",
    tags: ["Oxbridge", "Russell Group", "UCAS"],
    rating: 4.9, reviews: 312, exp: "9 yrs",
    avail: "Available Today", color: "#2563eb",
    badge: "Top Rated", badgeColor: "#f59e0b",
    sessions: 840,
  },
  {
    id: 2, initials: "SK", name: "Shreya Kapoor",
    title: "Ireland Admissions Expert",
    bio: "Specialist in Trinity College Dublin, UCD, and Irish visa pathways.",
    tags: ["Trinity College", "UCD", "Irish Visa"],
    rating: 4.8, reviews: 247, exp: "7 yrs",
    avail: "Next: Tomorrow", color: "#059669",
    badge: "Ireland Pro", badgeColor: "#10b981",
    sessions: 620,
  },
  {
    id: 3, initials: "RD", name: "Rahul Desai",
    title: "Visa & Documentation Expert",
    bio: "Expert in UK Student Visa, CAS letters, SOP review, and financial docs.",
    tags: ["UK Visa", "Financial Docs", "SOP Review"],
    rating: 4.9, reviews: 489, exp: "11 yrs",
    avail: "Available Today", color: "#7c3aed",
    badge: "Visa Expert", badgeColor: "#8b5cf6",
    sessions: 1240,
  },
  {
    id: 4, initials: "PN", name: "Preethi Nair",
    title: "Scholarship & Finance Guide",
    bio: "Helps students unlock scholarships, bursaries, and education loans.",
    tags: ["Scholarships", "Education Loans", "Bursaries"],
    rating: 4.7, reviews: 183, exp: "6 yrs",
    avail: "Available Today", color: "#db2777",
    badge: "Finance Pro", badgeColor: "#ec4899",
    sessions: 410,
  },
  {
    id: 5, initials: "KJ", name: "Karan Joshi",
    title: "Post-Study Work Visa Expert",
    bio: "Guides students through the PSW Visa, career pathways, and work rights in the UK.",
    tags: ["PSW Visa", "Career Pathways", "Work Rights"],
    rating: 4.8, reviews: 276, exp: "8 yrs",
    avail: "Next: Wednesday", color: "#0891b2",
    badge: "PSW Specialist", badgeColor: "#06b6d4",
    sessions: 590,
  },
  {
    id: 6, initials: "AS", name: "Ananya Singh",
    title: "Student Life & Housing Advisor",
    bio: "Helps students find accommodation, navigate city life, and settle into UK/Ireland.",
    tags: ["Accommodation", "Student Life", "City Guide"],
    rating: 4.6, reviews: 134, exp: "5 yrs",
    avail: "Available Today", color: "#d97706",
    badge: "New", badgeColor: "#fbbf24",
    sessions: 280,
  },
];

function buildDates() {
  const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const POOL   = ["09:00 AM","10:00 AM","11:30 AM","01:00 PM","02:30 PM","04:00 PM","05:30 PM"];
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    const empty = i % 4 === 3;
    return {
      id:    i,
      day:   DAYS[d.getDay()],
      num:   d.getDate(),
      month: MONTHS[d.getMonth()],
      full:  d.toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" }),
      slots: empty ? [] : POOL.filter(() => Math.random() > 0.4),
    };
  });
}

// ─────────────────────────────────────────────────────────────────
// TINY HELPERS
// ─────────────────────────────────────────────────────────────────
function StarRating({ v }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:3 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= Math.round(v) ? "#fbbf24" : "rgba(255,255,255,.15)"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </span>
  );
}

function Pill({ children, color, bg }) {
  return (
    <span style={{
      fontSize: 13, padding: "6px 14px", borderRadius: 100,
      background: bg || "rgba(255,255,255,.06)",
      border: color ? `1px solid ${color}44` : "1px solid rgba(255,255,255,.1)",
      color: color || "rgba(200,213,255,.6)",
      fontWeight: 500, letterSpacing: ".03em",
    }}>
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// STEP 1 — COUNSELLOR CARD
// ─────────────────────────────────────────────────────────────────
function CounsellorCard({ c, onSelect }) {
  const [hov, setHov] = useState(false);
  const isToday = c.avail.includes("Today");

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onSelect(c)}
      style={{
        position: "relative", overflow: "hidden",
        borderRadius: 26, padding: "34px 30px",
        cursor: "pointer",
        background: hov
          ? `linear-gradient(145deg,${c.color}1a 0%,${c.color}08 100%)`
          : DT.glass,
        backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
        border: hov ? `1px solid ${c.color}60` : DT.border,
        boxShadow: hov
          ? `0 0 0 1px ${c.color}30, 0 20px 60px rgba(0,0,0,.55), 0 0 40px ${c.color}18`
          : DT.shadow,
        transform: hov ? "translateY(-8px) scale(1.01)" : "translateY(0) scale(1)",
        transition: "all .38s cubic-bezier(.23,1,.32,1)",
      }}
    >
      {/* Ambient corner glow */}
      <div style={{
        position:"absolute", top:0, right:0, width:150, height:150,
        borderRadius:"0 26px 0 100%",
        background:`radial-gradient(circle at 80% 20%,${c.color}28,transparent 65%)`,
        pointerEvents:"none", transition:"opacity .4s",
        opacity: hov ? 1 : 0.5,
      }}/>

      {/* Badge */}
      <div style={{
        position:"absolute", top:20, right:20,
        padding:"6px 14px", borderRadius:100,
        fontSize:12, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase",
        background:`${c.badgeColor}20`,
        border:`1px solid ${c.badgeColor}50`,
        color: c.badgeColor,
      }}>
        {c.badge}
      </div>

      {/* Avatar + Name */}
      <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:20 }}>
        <div style={{
          width:76, height:76, borderRadius:"50%", flexShrink:0,
          background:`linear-gradient(135deg,${c.color}dd,${c.color}88)`,
          border:`3px solid ${c.color}70`,
          boxShadow:`0 0 28px ${c.color}50, inset 0 1px 0 rgba(255,255,255,.3)`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:26, fontWeight:800, color:"#fff", fontFamily:DT.font,
          transition:"transform .3s ease, box-shadow .3s ease",
          transform: hov ? "scale(1.08)" : "scale(1)",
        }}>
          {c.initials}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:22, fontWeight:700, color:"#f1f5f9", fontFamily:DT.font, letterSpacing:"-.01em", marginBottom:6 }}>{c.name}</div>
          <div style={{ fontSize:15, color:"rgba(148,163,184,.65)", lineHeight:1.3 }}>{c.title}</div>
        </div>
      </div>

      {/* Bio */}
      <p style={{ fontSize:15, color:"rgba(148,163,184,.5)", lineHeight:1.6, marginBottom:22, fontFamily:DT.body }}>
        {c.bio}
      </p>

      {/* Tags */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:24 }}>
        {c.tags.map(t => <Pill key={t}>{t}</Pill>)}
      </div>

      {/* Stats row */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:18 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <StarRating v={c.rating} />
              <span style={{ fontSize:16, fontWeight:700, color:"#f1f5f9", fontFamily:DT.font }}>{c.rating}</span>
            </div>
            <div style={{ fontSize:12, color:"rgba(148,163,184,.4)", marginTop:4 }}>{c.reviews} reviews</div>
          </div>
          <div style={{ width:1, height:36, background:"rgba(255,255,255,.08)" }}/>
          <div>
            <div style={{ fontSize:17, fontWeight:700, color:"#f1f5f9", fontFamily:DT.font }}>{c.exp}</div>
            <div style={{ fontSize:12, color:"rgba(148,163,184,.4)", marginTop:4 }}>experience</div>
          </div>
          <div style={{ width:1, height:36, background:"rgba(255,255,255,.08)" }}/>
          <div>
            <div style={{ fontSize:17, fontWeight:700, color:"#f1f5f9", fontFamily:DT.font }}>{c.sessions.toLocaleString()}</div>
            <div style={{ fontSize:12, color:"rgba(148,163,184,.4)", marginTop:4 }}>sessions</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{
            width:10, height:10, borderRadius:"50%",
            background: isToday ? DT.green : "#f59e0b",
            boxShadow:`0 0 10px ${isToday ? DT.green : "#f59e0b"}`,
          }}/>
          <span style={{ fontSize:14, fontWeight:600, color: isToday ? DT.greenLight : "#fcd34d", fontFamily:DT.body }}>
            {c.avail}
          </span>
        </div>
      </div>

      {/* CTA strip — appears on hover */}
      <div style={{
        marginTop:24, padding:"16px", borderRadius:14, textAlign:"center",
        fontSize:16, fontWeight:600, fontFamily:DT.body,
        background: hov ? `linear-gradient(135deg,${c.color}ee,${c.color}aa)` : "rgba(255,255,255,.04)",
        border: hov ? `1px solid ${c.color}` : "1px solid rgba(255,255,255,.07)",
        color: hov ? "#fff" : "rgba(148,163,184,.4)",
        boxShadow: hov ? `0 0 24px ${c.color}60` : "none",
        transition:"all .3s ease",
      }}>
        {hov ? "Select & Book →" : "View Availability"}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// STEP 2 — SLOT PICKER
// ─────────────────────────────────────────────────────────────────
function SlotPicker({ counsellor: c, onConfirm, onBack }) {
  const [dates]        = useState(buildDates);
  const [activeDate, setActiveDate]  = useState(() => {
    const first = buildDates().find(d => d.slots.length > 0);
    return first || buildDates()[0];
  });
  const [activeSlot, setActiveSlot]  = useState(null);
  const stripRef = useRef(null);

  const pickDate = (d) => { setActiveDate(d); setActiveSlot(null); };

  return (
    <div style={{ animation:"cbfSlide .42s cubic-bezier(.23,1,.32,1) both", padding: "0 20px" }}>
      {/* Back */}
      <button onClick={onBack} style={{
        display:"flex", alignItems:"center", gap:8,
        background:"none", border:"none", cursor:"pointer",
        color:"rgba(148,163,184,.55)", fontSize:16, fontWeight:500,
        fontFamily:DT.body, padding:0, marginBottom:30,
        transition:"color .2s",
      }}
        onMouseEnter={e=>e.currentTarget.style.color="#e2e8f0"}
        onMouseLeave={e=>e.currentTarget.style.color="rgba(148,163,184,.55)"}>
        ← Back to counsellors
      </button>

      {/* Mini counsellor profile */}
      <div style={{
        display:"flex", alignItems:"center", flexWrap:"wrap", gap:20,
        padding:"24px 30px", borderRadius:22, marginBottom:36,
        background:`linear-gradient(135deg,${c.color}18,${c.color}07)`,
        border:`1px solid ${c.color}35`,
        backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
      }}>
        <div style={{
          width:68, height:68, borderRadius:"50%", flexShrink:0,
          background:`linear-gradient(135deg,${c.color}dd,${c.color}88)`,
          border:`2px solid ${c.color}60`,
          boxShadow:`0 0 24px ${c.color}50`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:22, fontWeight:800, color:"#fff", fontFamily:DT.font,
        }}>{c.initials}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:20, fontWeight:700, color:"#f1f5f9", fontFamily:DT.font, marginBottom:4 }}>{c.name}</div>
          <div style={{ fontSize:15, color:"rgba(148,163,184,.6)" }}>{c.title}</div>
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {[`⭐ ${c.rating}`, "🕐 30 min", "📹 Google Meet"].map(t => (
            <span key={t} style={{ fontSize:14, padding:"8px 16px", borderRadius:12, background:"rgba(255,255,255,.06)", border:DT.border, color:"rgba(200,213,255,.6)", fontFamily:DT.body }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Section: Date */}
      <div style={{ marginBottom:34 }}>
        <div style={{ fontSize:14, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"rgba(148,163,184,.45)", marginBottom:16, fontFamily:DT.body }}>
          Select a Date
        </div>
        <div ref={stripRef} style={{ display:"flex", gap:12, overflowX:"auto", paddingBottom:10, scrollbarWidth:"none" }}>
          {dates.map(d => {
            const active = activeDate?.id === d.id;
            const empty  = d.slots.length === 0;
            return (
              <button key={d.id} onClick={() => !empty && pickDate(d)}
                style={{
                  flexShrink:0, width:84, padding:"16px 6px", borderRadius:18,
                  textAlign:"center", cursor: empty ? "not-allowed" : "pointer",
                  opacity: empty ? .28 : 1,
                  background: active
                    ? `linear-gradient(145deg,rgba(37,99,235,.6),rgba(29,78,216,.4))`
                    : "rgba(255,255,255,.05)",
                  border: active ? "1px solid rgba(59,130,246,.65)" : DT.border,
                  boxShadow: active ? "0 0 24px rgba(37,99,235,.35)" : "none",
                  transition:"all .25s ease",
                }}>
                <div style={{ fontSize:12, fontWeight:600, letterSpacing:".08em", textTransform:"uppercase", color: active ? "#93c5fd" : "rgba(148,163,184,.45)", marginBottom:6 }}>{d.day}</div>
                <div style={{ fontFamily:DT.font, fontWeight:800, fontSize:28, color: active ? "#fff" : "#c8d5ff", lineHeight:1.1 }}>{d.num}</div>
                <div style={{ fontSize:12, color: active ? "#93c5fd" : "rgba(148,163,184,.4)", marginTop:4 }}>{d.month}</div>
                {d.slots.length > 0 && (
                  <div style={{ display:"flex", justifyContent:"center", gap:3, marginTop:8 }}>
                    {[...Array(Math.min(d.slots.length, 4))].map((_,i) => (
                      <div key={i} style={{ width:4, height:4, borderRadius:"50%", background: active ? "#60a5fa" : "rgba(59,130,246,.4)" }}/>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section: Time */}
      <div style={{ marginBottom:40 }}>
        <div style={{ fontSize:14, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"rgba(148,163,184,.45)", marginBottom:16, fontFamily:DT.body }}>
          Available Time Slots
          {activeDate && <span style={{ color:"rgba(148,163,184,.3)", marginLeft:12, textTransform:"none", letterSpacing:0, fontSize:14 }}>— {activeDate.full}</span>}
        </div>
        {activeDate && activeDate.slots.length > 0 ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:14 }}>
            {activeDate.slots.map(slot => {
              const sel = activeSlot === slot;
              return (
                <button key={slot} onClick={() => setActiveSlot(slot)}
                  style={{
                    padding:"16px 10px", borderRadius:14, border:"none",
                    cursor:"pointer", fontFamily:DT.body, fontSize:16,
                    fontWeight: sel ? 700 : 500,
                    background: sel
                      ? "linear-gradient(135deg,#2563eb,#1d4ed8)"
                      : "rgba(255,255,255,.06)",
                    color: sel ? "#fff" : "rgba(200,213,255,.7)",
                    border: sel ? "1px solid rgba(59,130,246,.7)" : DT.border,
                    boxShadow: sel ? "0 0 24px rgba(37,99,235,.55),0 6px 18px rgba(0,0,0,.35)" : "none",
                    transform: sel ? "scale(1.05)" : "scale(1)",
                    transition:"all .22s cubic-bezier(.34,1.56,.64,1)",
                  }}>
                  {slot}
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ padding:"34px", borderRadius:18, background:"rgba(255,255,255,.03)", border:DT.border, textAlign:"center", color:"rgba(148,163,184,.4)", fontSize:16, fontFamily:DT.body }}>
            No slots available on this date — please choose another.
          </div>
        )}
      </div>

      {/* Confirm button */}
      <button disabled={!activeSlot} onClick={() => activeSlot && onConfirm({ counsellor:c, date:activeDate, slot:activeSlot })}
        style={{
          width:"100%", padding:"20px", borderRadius:20, border:"none",
          fontFamily:DT.body, fontSize:18, fontWeight:700,
          cursor: activeSlot ? "pointer" : "not-allowed",
          background: activeSlot
            ? "linear-gradient(135deg,#2563eb,#1d4ed8)"
            : "rgba(255,255,255,.06)",
          color: activeSlot ? "#fff" : "rgba(148,163,184,.3)",
          boxShadow: activeSlot ? "0 0 34px rgba(37,99,235,.55),0 8px 24px rgba(0,0,0,.4)" : "none",
          transition:"all .3s ease",
        }}
        onMouseEnter={e => { if(activeSlot) e.currentTarget.style.transform="scale(1.015)"; }}
        onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}>
        {activeSlot ? `Confirm Booking · ${activeSlot}` : "Select a time slot to continue"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// STEP 3 — CONFIRMATION SCREEN
// ─────────────────────────────────────────────────────────────────
function ConfirmScreen({ booking, onClose, studentName }) {
  const [drawn, setDrawn] = useState(false);
  const meetId = useRef("fteh-" + Math.random().toString(36).substring(2, 8));
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 250); return () => clearTimeout(t); }, []);

  const details = [
    { icon:"👤", label:"Counsellor",   value:booking.counsellor.name },
    { icon:"📅", label:"Date",         value:`${booking.date.day}, ${booking.date.num} ${booking.date.month}` },
    { icon:"🕐", label:"Time",         value:`${booking.slot} IST · 30 min` },
    { icon:"📹", label:"Platform",     value:"Google Meet" },
    { icon:"🔗", label:"Meeting Link", value:`meet.google.com/${meetId.current}`, isLink:true },
  ];

  return (
    <div style={{ textAlign:"center", animation:"cbfSlide .5s cubic-bezier(.23,1,.32,1) both", maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      {/* Orb + checkmark */}
      <div style={{ position:"relative", width:160, height:160, margin:"0 auto 40px", display:"flex", alignItems:"center", justifyContent:"center" }}>
        {[160,130,100].map((sz,i) => (
          <div key={sz} style={{
            position:"absolute", width:sz, height:sz, borderRadius:"50%",
            border:"2px solid rgba(16,185,129,.24)",
            animation:`cbfRing ${1.6+i*.25}s ease-in-out ${i*.18}s infinite`,
          }}/>
        ))}
        <div style={{
          width:100, height:100, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(16,185,129,.95) 0%,rgba(5,150,105,.75) 60%)",
          boxShadow:"0 0 65px rgba(16,185,129,.65),0 0 130px rgba(16,185,129,.25),inset 0 2px 0 rgba(255,255,255,.3)",
          display:"flex", alignItems:"center", justifyContent:"center",
          animation:"cbfPop .65s cubic-bezier(.34,1.56,.64,1) .15s both",
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              style={{
                strokeDasharray:28, strokeDashoffset: drawn ? 0 : 28,
                transition:"stroke-dashoffset .5s cubic-bezier(.4,0,.2,1) .55s",
              }}/>
          </svg>
        </div>
      </div>

      <h2 style={{ fontFamily:DT.font, fontWeight:800, fontSize:"clamp(32px,5vw,46px)", color:"#f1f5f9", letterSpacing:"-.03em", marginBottom:12 }}>
        {studentName ? `You're booked, ${studentName}!` : "Booking Confirmed!"}
      </h2>
      <p style={{ fontSize:18, color:"rgba(148,163,184,.6)", marginBottom:40, fontFamily:DT.body, lineHeight:1.6 }}>
        Your session has been scheduled. A confirmation will be sent to your email.
      </p>

      {/* Details card */}
      <div style={{
        borderRadius:26, padding:"32px 36px", marginBottom:24, textAlign:"left",
        background:"linear-gradient(135deg,rgba(16,185,129,.12),rgba(5,150,105,.05))",
        border:"1px solid rgba(16,185,129,.25)",
        boxShadow:"0 0 55px rgba(16,185,129,.09),0 12px 55px rgba(0,0,0,.45)",
        backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
      }}>
        {/* Counsellor row */}
        <div style={{ display:"flex", alignItems:"center", gap:18, marginBottom:24, paddingBottom:24, borderBottom:"1px solid rgba(255,255,255,.07)" }}>
          <div style={{
            width:64, height:64, borderRadius:"50%", flexShrink:0,
            background:`linear-gradient(135deg,${booking.counsellor.color}dd,${booking.counsellor.color}88)`,
            border:`2px solid ${booking.counsellor.color}60`,
            boxShadow:`0 0 22px ${booking.counsellor.color}50`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:20, fontWeight:800, color:"#fff", fontFamily:DT.font,
          }}>{booking.counsellor.initials}</div>
          <div>
            <div style={{ fontFamily:DT.font, fontWeight:700, fontSize:20, color:"#f1f5f9" }}>{booking.counsellor.name}</div>
            <div style={{ fontSize:15, color:"rgba(148,163,184,.55)", marginTop:4 }}>{booking.counsellor.title}</div>
          </div>
          <div style={{ marginLeft:"auto", padding:"8px 16px", borderRadius:100, background:"rgba(16,185,129,.15)", border:"1px solid rgba(16,185,129,.3)", fontSize:14, fontWeight:600, color:DT.greenLight }}>
            Confirmed ✓
          </div>
        </div>
        {/* Rows */}
        {details.slice(1).map(row => (
          <div key={row.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:18 }}>{row.icon}</span>
              <span style={{ fontSize:16, color:"rgba(148,163,184,.5)", fontFamily:DT.body }}>{row.label}</span>
            </div>
            <span style={{ fontSize:16, fontFamily:DT.body, fontWeight:500, color: row.isLink ? "#60a5fa" : "#e2e8f0", textDecoration: row.isLink ? "underline" : "none", textDecorationColor:"rgba(96,165,250,.4)", cursor: row.isLink ? "pointer" : "default" }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Reminder note */}
      <div style={{ display:"flex", alignItems:"flex-start", gap:14, padding:"16px 20px", borderRadius:16, marginBottom:34, background:"rgba(37,99,235,.08)", border:"1px solid rgba(59,130,246,.2)", textAlign:"left" }}>
        <span style={{ fontSize:22, flexShrink:0 }}>💡</span>
        <p style={{ fontSize:15, color:"rgba(200,213,255,.65)", lineHeight:1.65, fontFamily:DT.body, margin:0 }}>
          Keep your academic documents (transcripts, SOP, LORs) ready before the session. Your counsellor will review your profile in advance.
        </p>
      </div>

      {/* Action buttons */}
      <div style={{ display:"flex", gap:16 }}>
        <button onClick={onClose}
          style={{ flex:1, padding:"18px", borderRadius:18, background:"rgba(255,255,255,.06)", border:DT.border, color:"rgba(200,213,255,.7)", fontSize:16, fontWeight:600, fontFamily:DT.body, cursor:"pointer", transition:"all .2s" }}
          onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,.11)"; e.currentTarget.style.color="#fff"; }}
          onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,.06)"; e.currentTarget.style.color="rgba(200,213,255,.7)"; }}>
          ← Back to Dashboard
        </button>
        <button style={{ flex:1, padding:"18px", borderRadius:18, border:"none", background:"linear-gradient(135deg,#059669,#047857)", color:"#fff", fontSize:16, fontWeight:700, fontFamily:DT.body, cursor:"pointer", boxShadow:"0 0 30px rgba(5,150,105,.45)", transition:"transform .2s" }}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.025)"}
          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
          📅 Add to Calendar
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────
export default function CounsellorBookingFlow({ isOpen, onClose, studentName }) {
  const [step,        setStep]        = useState(1);
  const [counsellor,  setCounsellor]  = useState(null);
  const [booking,     setBooking]     = useState(null);
  const backdropRef                   = useRef(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) { setStep(1); setCounsellor(null); setBooking(null); }
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  const handleBackdrop = useCallback(e => {
    if (e.target === backdropRef.current) onClose();
  }, [onClose]);

  const STEPS  = ["Select Counsellor", "Choose Slot", "Booking Confirmed"];
  const ICONS  = ["👤", "📅", "✅"];

  if (!isOpen) return null;

  return (
    <>
      {/* ── Global animation keyframes (scoped to this component) ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        @keyframes cbfBackdrop { from{opacity:0} to{opacity:1} }
        @keyframes cbfModal    { from{opacity:0;transform:translateY(44px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes cbfSlide    { from{opacity:0;transform:translateY(20px) scale(.985)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes cbfRing     { 0%,100%{opacity:.35;transform:scale(1)} 50%{opacity:1;transform:scale(1.13)} }
        @keyframes cbfPop      { from{opacity:0;transform:scale(.35)} to{opacity:1;transform:scale(1)} }
        @keyframes cbfGlow     {
          0%,100%{ box-shadow:0 0 24px rgba(37,99,235,.5),0 4px 20px rgba(0,0,0,.35); }
          50%    { box-shadow:0 0 44px rgba(37,99,235,.85),0 4px 24px rgba(0,0,0,.45); }
        }
        .cbf-date-strip::-webkit-scrollbar { display:none }
        .cbf-body::-webkit-scrollbar        { width:6px }
        .cbf-body::-webkit-scrollbar-thumb  { background:rgba(37,99,235,.35); border-radius:6px }
        .cbf-body::-webkit-scrollbar-track  { background:transparent }
      `}</style>

      {/* ── Backdrop ── */}
      <div
        ref={backdropRef}
        onClick={handleBackdrop}
        style={{
          position:"fixed", inset:0, zIndex:9999,
          background:"rgba(2,5,10,.9)",
          backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
          display:"flex", alignItems:"center", justifyContent:"center",
          padding:"20px", 
          animation:"cbfBackdrop .3s ease both",
        }}
      >
        {/* ── Modal (Massive scale + FIXED HEIGHT for scrolling) ── */}
        <div style={{
          width:"96vw",
          maxWidth: step === 1 ? 1600 : 1000,
          height: "92vh", /* THIS is the magic fix that forces the inner scroll */
          display: "flex",
          flexDirection: "column",
          background: DT.bg,
          border:"1px solid rgba(255,255,255,.08)",
          borderRadius:32,
          boxShadow:"0 35px 120px rgba(0,0,0,.85),inset 0 1px 0 rgba(255,255,255,.06)",
          overflow:"hidden",
          animation:"cbfModal .48s cubic-bezier(.23,1,.32,1) both",
          transition:"max-width .38s cubic-bezier(.23,1,.32,1)",
        }}>

          {/* ── Modal header ── */}
          <div style={{
            padding:"24px 36px",
            borderBottom:"1px solid rgba(255,255,255,.07)",
            background:"rgba(255,255,255,.025)",
            display:"flex", alignItems:"center",
            justifyContent:"space-between",
            flexWrap:"wrap", gap:16,
            flexShrink: 0 /* Prevents header from shrinking when scrolling */
          }}>
            {/* Logo */}
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <svg width="36" height="40" viewBox="0 0 36 40" fill="none">
                <path d="M18 2L2 8v12c0 10 6.5 17 16 19 9.5-2 16-9 16-19V8L18 2Z" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="1"/>
                <path d="M18 9L21 19 18 16 15 19Z" fill="white" opacity=".95"/>
                <path d="M18 16L20 25 18 23 16 25Z" fill="#93c5fd" opacity=".85"/>
              </svg>
              <div>
                <div style={{ color:"#f1f5f9", fontFamily:DT.font, fontWeight:700, fontSize:18, lineHeight:1.2 }}>Book a Session</div>
                <div style={{ color:DT.blueLight, fontSize:12, letterSpacing:".1em", lineHeight:1.2, marginTop: 2 }}>FATEH EDUCATION</div>
              </div>
            </div>

            {/* Step progress */}
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              {STEPS.map((label, i) => {
                const n      = i + 1;
                const active = step === n;
                const done   = step > n;
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{
                      display:"flex", alignItems:"center", gap:6,
                      padding:"8px 16px", borderRadius:100,
                      fontSize:14, fontWeight:600, fontFamily:DT.body,
                      background: active ? "rgba(37,99,235,.22)" : done ? "rgba(16,185,129,.14)" : "rgba(255,255,255,.05)",
                      border: active ? "1px solid rgba(59,130,246,.45)" : done ? "1px solid rgba(16,185,129,.28)" : "1px solid rgba(255,255,255,.08)",
                      color: active ? "#93c5fd" : done ? DT.greenLight : "rgba(148,163,184,.35)",
                      transition:"all .3s ease",
                    }}>
                      <span style={{ fontSize:15 }}>{done ? "✅" : ICONS[i]}</span>
                      <span style={{ display: "inline" }}>{label}</span>
                    </div>
                    {i < 2 && (
                      <div style={{ width:20, height:2, background: done ? "rgba(16,185,129,.4)" : "rgba(255,255,255,.1)", transition:"background .4s" }}/>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Close */}
            <button onClick={onClose} style={{
              width:44, height:44, borderRadius:"50%",
              border:"1px solid rgba(255,255,255,.1)",
              background:"rgba(255,255,255,.06)",
              color:"rgba(148,163,184,.65)", fontSize:18,
              cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
              flexShrink:0, transition:"all .2s",
            }}
              onMouseEnter={e=>{ e.currentTarget.style.background="rgba(239,68,68,.18)"; e.currentTarget.style.color="#fca5a5"; e.currentTarget.style.borderColor="rgba(239,68,68,.4)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,.06)"; e.currentTarget.style.color="rgba(148,163,184,.65)"; e.currentTarget.style.borderColor="rgba(255,255,255,.1)"; }}>
              ✕
            </button>
          </div>

          {/* ── Modal body (Where the scrolling happens) ── */}
          <div className="cbf-body" style={{ padding:"36px 42px", flex: 1, overflowY:"auto" }}>

            {/* Step 1 */}
            {step === 1 && (
              <div style={{ animation:"cbfSlide .4s ease both" }}>
                <div style={{ marginBottom:30 }}>
                  <h3 style={{ fontFamily:DT.font, fontWeight:800, fontSize:"clamp(26px,4vw,34px)", color:"#f1f5f9", letterSpacing:"-.025em", marginBottom:8 }}>
                    Choose Your Counsellor
                  </h3>
                  <p style={{ fontSize:16, color:"rgba(148,163,184,.55)", fontFamily:DT.body }}>
                    All sessions are free · 30 min · Conducted on Google Meet
                  </p>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(380px,1fr))", gap:24 }}>
                  {COUNSELLORS.map(c => (
                    <CounsellorCard key={c.id} c={c} onSelect={c => { setCounsellor(c); setStep(2); }}/>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && counsellor && (
              <SlotPicker
                counsellor={counsellor}
                onConfirm={bk => { setBooking(bk); setStep(3); }}
                onBack={() => setStep(1)}
              />
            )}

            {/* Step 3 */}
            {step === 3 && booking && (
              <ConfirmScreen booking={booking} onClose={onClose} studentName={studentName} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}