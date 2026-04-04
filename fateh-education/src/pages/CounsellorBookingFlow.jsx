import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════
   FATEH EDUCATION — CounsellorBookingFlow.jsx  v2
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
    <span style={{ display:"inline-flex", alignItems:"center", gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill={i <= Math.round(v) ? "#fbbf24" : "rgba(255,255,255,.15)"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </span>
  );
}

function Pill({ children, color, bg }) {
  return (
    <span style={{
      fontSize: 10, padding: "3px 9px", borderRadius: 100,
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
        borderRadius: 22, padding: "22px 20px",
        cursor: "pointer",
        background: hov
          ? `linear-gradient(145deg,${c.color}1a 0%,${c.color}08 100%)`
          : DT.glass,
        backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
        border: hov ? `1px solid ${c.color}60` : DT.border,
        boxShadow: hov
          ? `0 0 0 1px ${c.color}30, 0 20px 60px rgba(0,0,0,.55), 0 0 40px ${c.color}18`
          : DT.shadow,
        transform: hov ? "translateY(-6px) scale(1.005)" : "translateY(0) scale(1)",
        transition: "all .38s cubic-bezier(.23,1,.32,1)",
      }}
    >
      {/* Ambient corner glow */}
      <div style={{
        position:"absolute", top:0, right:0, width:110, height:110,
        borderRadius:"0 22px 0 100%",
        background:`radial-gradient(circle at 80% 20%,${c.color}28,transparent 65%)`,
        pointerEvents:"none", transition:"opacity .4s",
        opacity: hov ? 1 : 0.5,
      }}/>

      {/* Badge */}
      <div style={{
        position:"absolute", top:14, right:14,
        padding:"3px 9px", borderRadius:100,
        fontSize:9, fontWeight:700, letterSpacing:".08em",
        background:`${c.badgeColor}20`,
        border:`1px solid ${c.badgeColor}50`,
        color: c.badgeColor,
      }}>
        {c.badge}
      </div>

      {/* Avatar + Name */}
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
        <div style={{
          width:54, height:54, borderRadius:"50%", flexShrink:0,
          background:`linear-gradient(135deg,${c.color}dd,${c.color}88)`,
          border:`2.5px solid ${c.color}70`,
          boxShadow:`0 0 22px ${c.color}50, inset 0 1px 0 rgba(255,255,255,.3)`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:17, fontWeight:800, color:"#fff", fontFamily:DT.font,
          transition:"transform .3s ease, box-shadow .3s ease",
          transform: hov ? "scale(1.08)" : "scale(1)",
        }}>
          {c.initials}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:15, fontWeight:700, color:"#f1f5f9", fontFamily:DT.font, letterSpacing:"-.01em", marginBottom:3 }}>{c.name}</div>
          <div style={{ fontSize:12, color:"rgba(148,163,184,.65)", lineHeight:1.3 }}>{c.title}</div>
        </div>
      </div>

      {/* Bio */}
      <p style={{ fontSize:12, color:"rgba(148,163,184,.5)", lineHeight:1.55, marginBottom:13, fontFamily:DT.body }}>
        {c.bio}
      </p>

      {/* Tags */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:15 }}>
        {c.tags.map(t => <Pill key={t}>{t}</Pill>)}
      </div>

      {/* Stats row */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <StarRating v={c.rating} />
              <span style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", fontFamily:DT.font }}>{c.rating}</span>
            </div>
            <div style={{ fontSize:9, color:"rgba(148,163,184,.4)", marginTop:1 }}>{c.reviews} reviews</div>
          </div>
          <div style={{ width:1, height:28, background:"rgba(255,255,255,.08)" }}/>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", fontFamily:DT.font }}>{c.exp}</div>
            <div style={{ fontSize:9, color:"rgba(148,163,184,.4)", marginTop:1 }}>experience</div>
          </div>
          <div style={{ width:1, height:28, background:"rgba(255,255,255,.08)" }}/>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", fontFamily:DT.font }}>{c.sessions.toLocaleString()}</div>
            <div style={{ fontSize:9, color:"rgba(148,163,184,.4)", marginTop:1 }}>sessions</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <div style={{
            width:7, height:7, borderRadius:"50%",
            background: isToday ? DT.green : "#f59e0b",
            boxShadow:`0 0 7px ${isToday ? DT.green : "#f59e0b"}`,
          }}/>
          <span style={{ fontSize:10, fontWeight:600, color: isToday ? DT.greenLight : "#fcd34d", fontFamily:DT.body }}>
            {c.avail}
          </span>
        </div>
      </div>

      {/* CTA strip — appears on hover */}
      <div style={{
        marginTop:15, padding:"10px", borderRadius:12, textAlign:"center",
        fontSize:13, fontWeight:600, fontFamily:DT.body,
        background: hov ? `linear-gradient(135deg,${c.color}ee,${c.color}aa)` : "rgba(255,255,255,.04)",
        border: hov ? `1px solid ${c.color}` : "1px solid rgba(255,255,255,.07)",
        color: hov ? "#fff" : "rgba(148,163,184,.4)",
        boxShadow: hov ? `0 0 20px ${c.color}60` : "none",
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

  // Sync dates with activeDate object on mount
  const allDates = useRef(dates);

  const pickDate = (d) => { setActiveDate(d); setActiveSlot(null); };

  return (
    <div style={{ animation:"cbfSlide .42s cubic-bezier(.23,1,.32,1) both" }}>
      {/* Back */}
      <button onClick={onBack} style={{
        display:"flex", alignItems:"center", gap:6,
        background:"none", border:"none", cursor:"pointer",
        color:"rgba(148,163,184,.55)", fontSize:13,
        fontFamily:DT.body, padding:0, marginBottom:22,
        transition:"color .2s",
      }}
        onMouseEnter={e=>e.currentTarget.style.color="#e2e8f0"}
        onMouseLeave={e=>e.currentTarget.style.color="rgba(148,163,184,.55)"}>
        ← Back to counsellors
      </button>

      {/* Mini counsellor profile */}
      <div style={{
        display:"flex", alignItems:"center", flexWrap:"wrap", gap:14,
        padding:"16px 20px", borderRadius:18, marginBottom:26,
        background:`linear-gradient(135deg,${c.color}18,${c.color}07)`,
        border:`1px solid ${c.color}35`,
        backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
      }}>
        <div style={{
          width:50, height:50, borderRadius:"50%", flexShrink:0,
          background:`linear-gradient(135deg,${c.color}dd,${c.color}88)`,
          border:`2px solid ${c.color}60`,
          boxShadow:`0 0 18px ${c.color}50`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:15, fontWeight:800, color:"#fff", fontFamily:DT.font,
        }}>{c.initials}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:15, fontWeight:700, color:"#f1f5f9", fontFamily:DT.font }}>{c.name}</div>
          <div style={{ fontSize:12, color:"rgba(148,163,184,.6)" }}>{c.title}</div>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {[`⭐ ${c.rating}`, "🕐 30 min", "📹 Google Meet"].map(t => (
            <span key={t} style={{ fontSize:12, padding:"5px 12px", borderRadius:9, background:"rgba(255,255,255,.06)", border:DT.border, color:"rgba(200,213,255,.6)", fontFamily:DT.body }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Section: Date */}
      <div style={{ marginBottom:22 }}>
        <div style={{ fontSize:11, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"rgba(148,163,184,.45)", marginBottom:12, fontFamily:DT.body }}>
          Select a Date
        </div>
        <div ref={stripRef} style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:6, scrollbarWidth:"none" }}>
          {dates.map(d => {
            const active = activeDate?.id === d.id;
            const empty  = d.slots.length === 0;
            return (
              <button key={d.id} onClick={() => !empty && pickDate(d)}
                style={{
                  flexShrink:0, width:58, padding:"11px 4px", borderRadius:14,
                  textAlign:"center", cursor: empty ? "not-allowed" : "pointer",
                  opacity: empty ? .28 : 1,
                  background: active
                    ? `linear-gradient(145deg,rgba(37,99,235,.6),rgba(29,78,216,.4))`
                    : "rgba(255,255,255,.05)",
                  border: active ? "1px solid rgba(59,130,246,.65)" : DT.border,
                  boxShadow: active ? "0 0 20px rgba(37,99,235,.35)" : "none",
                  transition:"all .25s ease",
                }}>
                <div style={{ fontSize:9, fontWeight:600, letterSpacing:".08em", textTransform:"uppercase", color: active ? "#93c5fd" : "rgba(148,163,184,.45)", marginBottom:3 }}>{d.day}</div>
                <div style={{ fontFamily:DT.font, fontWeight:800, fontSize:20, color: active ? "#fff" : "#c8d5ff", lineHeight:1.1 }}>{d.num}</div>
                <div style={{ fontSize:9, color: active ? "#93c5fd" : "rgba(148,163,184,.4)", marginTop:2 }}>{d.month}</div>
                {d.slots.length > 0 && (
                  <div style={{ display:"flex", justifyContent:"center", gap:2, marginTop:5 }}>
                    {[...Array(Math.min(d.slots.length, 4))].map((_,i) => (
                      <div key={i} style={{ width:3, height:3, borderRadius:"50%", background: active ? "#60a5fa" : "rgba(59,130,246,.4)" }}/>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section: Time */}
      <div style={{ marginBottom:26 }}>
        <div style={{ fontSize:11, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"rgba(148,163,184,.45)", marginBottom:12, fontFamily:DT.body }}>
          Available Time Slots
          {activeDate && <span style={{ color:"rgba(148,163,184,.3)", marginLeft:8, textTransform:"none", letterSpacing:0, fontSize:11 }}>— {activeDate.full}</span>}
        </div>
        {activeDate && activeDate.slots.length > 0 ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(105px,1fr))", gap:9 }}>
            {activeDate.slots.map(slot => {
              const sel = activeSlot === slot;
              return (
                <button key={slot} onClick={() => setActiveSlot(slot)}
                  style={{
                    padding:"11px 6px", borderRadius:12, border:"none",
                    cursor:"pointer", fontFamily:DT.body, fontSize:13,
                    fontWeight: sel ? 700 : 500,
                    background: sel
                      ? "linear-gradient(135deg,#2563eb,#1d4ed8)"
                      : "rgba(255,255,255,.06)",
                    color: sel ? "#fff" : "rgba(200,213,255,.7)",
                    border: sel ? "1px solid rgba(59,130,246,.7)" : DT.border,
                    boxShadow: sel ? "0 0 20px rgba(37,99,235,.55),0 4px 14px rgba(0,0,0,.35)" : "none",
                    transform: sel ? "scale(1.07)" : "scale(1)",
                    transition:"all .22s cubic-bezier(.34,1.56,.64,1)",
                  }}>
                  {slot}
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ padding:"24px", borderRadius:14, background:"rgba(255,255,255,.03)", border:DT.border, textAlign:"center", color:"rgba(148,163,184,.4)", fontSize:13, fontFamily:DT.body }}>
            No slots available on this date — please choose another.
          </div>
        )}
      </div>

      {/* Confirm button */}
      <button disabled={!activeSlot} onClick={() => activeSlot && onConfirm({ counsellor:c, date:activeDate, slot:activeSlot })}
        style={{
          width:"100%", padding:"15px", borderRadius:16, border:"none",
          fontFamily:DT.body, fontSize:15, fontWeight:700,
          cursor: activeSlot ? "pointer" : "not-allowed",
          background: activeSlot
            ? "linear-gradient(135deg,#2563eb,#1d4ed8)"
            : "rgba(255,255,255,.06)",
          color: activeSlot ? "#fff" : "rgba(148,163,184,.3)",
          boxShadow: activeSlot ? "0 0 28px rgba(37,99,235,.55),0 6px 20px rgba(0,0,0,.4)" : "none",
          transition:"all .3s ease",
        }}
        onMouseEnter={e => { if(activeSlot) e.currentTarget.style.transform="scale(1.02)"; }}
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
    <div style={{ textAlign:"center", animation:"cbfSlide .5s cubic-bezier(.23,1,.32,1) both" }}>
      {/* Orb + checkmark */}
      <div style={{ position:"relative", width:120, height:120, margin:"0 auto 28px", display:"flex", alignItems:"center", justifyContent:"center" }}>
        {[120,96,74].map((sz,i) => (
          <div key={sz} style={{
            position:"absolute", width:sz, height:sz, borderRadius:"50%",
            border:"1px solid rgba(16,185,129,.24)",
            animation:`cbfRing ${1.6+i*.25}s ease-in-out ${i*.18}s infinite`,
          }}/>
        ))}
        <div style={{
          width:74, height:74, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(16,185,129,.95) 0%,rgba(5,150,105,.75) 60%)",
          boxShadow:"0 0 55px rgba(16,185,129,.65),0 0 110px rgba(16,185,129,.25),inset 0 1px 0 rgba(255,255,255,.3)",
          display:"flex", alignItems:"center", justifyContent:"center",
          animation:"cbfPop .65s cubic-bezier(.34,1.56,.64,1) .15s both",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"
              style={{
                strokeDasharray:28, strokeDashoffset: drawn ? 0 : 28,
                transition:"stroke-dashoffset .5s cubic-bezier(.4,0,.2,1) .55s",
              }}/>
          </svg>
        </div>
      </div>

      <h2 style={{ fontFamily:DT.font, fontWeight:800, fontSize:"clamp(24px,4vw,32px)", color:"#f1f5f9", letterSpacing:"-.03em", marginBottom:8 }}>
        {studentName ? `You're booked, ${studentName}!` : "Booking Confirmed!"}
      </h2>
      <p style={{ fontSize:14, color:"rgba(148,163,184,.6)", marginBottom:30, fontFamily:DT.body, lineHeight:1.6 }}>
        Your session has been scheduled. A confirmation will be sent to your email.
      </p>

      {/* Details card */}
      <div style={{
        borderRadius:22, padding:"22px 26px", marginBottom:18, textAlign:"left",
        background:"linear-gradient(135deg,rgba(16,185,129,.12),rgba(5,150,105,.05))",
        border:"1px solid rgba(16,185,129,.25)",
        boxShadow:"0 0 44px rgba(16,185,129,.09),0 8px 48px rgba(0,0,0,.45)",
        backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
      }}>
        {/* Counsellor row */}
        <div style={{ display:"flex", alignItems:"center", gap:13, marginBottom:18, paddingBottom:18, borderBottom:"1px solid rgba(255,255,255,.07)" }}>
          <div style={{
            width:48, height:48, borderRadius:"50%", flexShrink:0,
            background:`linear-gradient(135deg,${booking.counsellor.color}dd,${booking.counsellor.color}88)`,
            border:`2px solid ${booking.counsellor.color}60`,
            boxShadow:`0 0 18px ${booking.counsellor.color}50`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:14, fontWeight:800, color:"#fff", fontFamily:DT.font,
          }}>{booking.counsellor.initials}</div>
          <div>
            <div style={{ fontFamily:DT.font, fontWeight:700, fontSize:15, color:"#f1f5f9" }}>{booking.counsellor.name}</div>
            <div style={{ fontSize:12, color:"rgba(148,163,184,.55)", marginTop:2 }}>{booking.counsellor.title}</div>
          </div>
          <div style={{ marginLeft:"auto", padding:"5px 12px", borderRadius:100, background:"rgba(16,185,129,.15)", border:"1px solid rgba(16,185,129,.3)", fontSize:11, fontWeight:600, color:DT.greenLight }}>
            Confirmed ✓
          </div>
        </div>
        {/* Rows */}
        {details.slice(1).map(row => (
          <div key={row.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:14 }}>{row.icon}</span>
              <span style={{ fontSize:12, color:"rgba(148,163,184,.5)", fontFamily:DT.body }}>{row.label}</span>
            </div>
            <span style={{ fontSize:12, fontFamily:DT.body, fontWeight:500, color: row.isLink ? "#60a5fa" : "#e2e8f0", textDecoration: row.isLink ? "underline" : "none", textDecorationColor:"rgba(96,165,250,.4)", cursor: row.isLink ? "pointer" : "default" }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Reminder note */}
      <div style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"12px 16px", borderRadius:14, marginBottom:24, background:"rgba(37,99,235,.08)", border:"1px solid rgba(59,130,246,.2)", textAlign:"left" }}>
        <span style={{ fontSize:16, flexShrink:0 }}>💡</span>
        <p style={{ fontSize:12, color:"rgba(200,213,255,.65)", lineHeight:1.65, fontFamily:DT.body, margin:0 }}>
          Keep your academic documents (transcripts, SOP, LORs) ready before the session. Your counsellor will review your profile in advance.
        </p>
      </div>

      {/* Action buttons */}
      <div style={{ display:"flex", gap:12 }}>
        <button onClick={onClose}
          style={{ flex:1, padding:"13px", borderRadius:14, background:"rgba(255,255,255,.06)", border:DT.border, color:"rgba(200,213,255,.7)", fontSize:14, fontWeight:600, fontFamily:DT.body, cursor:"pointer", transition:"all .2s" }}
          onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,.11)"; e.currentTarget.style.color="#fff"; }}
          onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,.06)"; e.currentTarget.style.color="rgba(200,213,255,.7)"; }}>
          ← Back to Dashboard
        </button>
        <button style={{ flex:1, padding:"13px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#059669,#047857)", color:"#fff", fontSize:14, fontWeight:700, fontFamily:DT.body, cursor:"pointer", boxShadow:"0 0 24px rgba(5,150,105,.45)", transition:"transform .2s" }}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.03)"}
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
        .cbf-body::-webkit-scrollbar        { width:4px }
        .cbf-body::-webkit-scrollbar-thumb  { background:rgba(37,99,235,.35); border-radius:4px }
        .cbf-body::-webkit-scrollbar-track  { background:transparent }
      `}</style>

      {/* ── Backdrop ── */}
      <div
        ref={backdropRef}
        onClick={handleBackdrop}
        style={{
          position:"fixed", inset:0, zIndex:9999,
          background:"rgba(2,5,10,.9)",
          backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)",
          display:"flex", alignItems:"flex-start", justifyContent:"center",
          padding:"20px 16px 40px", overflowY:"auto",
          animation:"cbfBackdrop .3s ease both",
        }}
      >
        {/* ── Modal ── */}
        <div style={{
          width:"100%",
          maxWidth: step === 1 ? 940 : 660,
          background: DT.bg,
          border:"1px solid rgba(255,255,255,.08)",
          borderRadius:28,
          boxShadow:"0 28px 90px rgba(0,0,0,.75),inset 0 1px 0 rgba(255,255,255,.06)",
          overflow:"hidden",
          animation:"cbfModal .48s cubic-bezier(.23,1,.32,1) both",
          transition:"max-width .38s cubic-bezier(.23,1,.32,1)",
        }}>

          {/* ── Modal header ── */}
          <div style={{
            padding:"18px 28px",
            borderBottom:"1px solid rgba(255,255,255,.07)",
            background:"rgba(255,255,255,.025)",
            display:"flex", alignItems:"center",
            justifyContent:"space-between",
            flexWrap:"wrap", gap:12,
          }}>
            {/* Logo */}
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <svg width="28" height="31" viewBox="0 0 36 40" fill="none">
                <path d="M18 2L2 8v12c0 10 6.5 17 16 19 9.5-2 16-9 16-19V8L18 2Z" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="1"/>
                <path d="M18 9L21 19 18 16 15 19Z" fill="white" opacity=".95"/>
                <path d="M18 16L20 25 18 23 16 25Z" fill="#93c5fd" opacity=".85"/>
              </svg>
              <div>
                <div style={{ color:"#f1f5f9", fontFamily:DT.font, fontWeight:700, fontSize:14, lineHeight:1.2 }}>Book a Session</div>
                <div style={{ color:DT.blueLight, fontSize:9, letterSpacing:".1em", lineHeight:1.2 }}>FATEH EDUCATION</div>
              </div>
            </div>

            {/* Step progress */}
            <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
              {STEPS.map((label, i) => {
                const n      = i + 1;
                const active = step === n;
                const done   = step > n;
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <div style={{
                      display:"flex", alignItems:"center", gap:5,
                      padding:"5px 11px", borderRadius:100,
                      fontSize:11, fontWeight:600, fontFamily:DT.body,
                      background: active ? "rgba(37,99,235,.22)" : done ? "rgba(16,185,129,.14)" : "rgba(255,255,255,.05)",
                      border: active ? "1px solid rgba(59,130,246,.45)" : done ? "1px solid rgba(16,185,129,.28)" : "1px solid rgba(255,255,255,.08)",
                      color: active ? "#93c5fd" : done ? DT.greenLight : "rgba(148,163,184,.35)",
                      transition:"all .3s ease",
                    }}>
                      <span style={{ fontSize:12 }}>{done ? "✅" : ICONS[i]}</span>
                      <span style={{ display: "inline" }}>{label}</span>
                    </div>
                    {i < 2 && (
                      <div style={{ width:16, height:1, background: done ? "rgba(16,185,129,.4)" : "rgba(255,255,255,.1)", transition:"background .4s" }}/>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Close */}
            <button onClick={onClose} style={{
              width:32, height:32, borderRadius:"50%",
              border:"1px solid rgba(255,255,255,.1)",
              background:"rgba(255,255,255,.06)",
              color:"rgba(148,163,184,.65)", fontSize:14,
              cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
              flexShrink:0, transition:"all .2s",
            }}
              onMouseEnter={e=>{ e.currentTarget.style.background="rgba(239,68,68,.18)"; e.currentTarget.style.color="#fca5a5"; e.currentTarget.style.borderColor="rgba(239,68,68,.4)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,.06)"; e.currentTarget.style.color="rgba(148,163,184,.65)"; e.currentTarget.style.borderColor="rgba(255,255,255,.1)"; }}>
              ✕
            </button>
          </div>

          {/* ── Modal body ── */}
          <div className="cbf-body" style={{ padding:"28px", maxHeight:"82vh", overflowY:"auto" }}>

            {/* Step 1 */}
            {step === 1 && (
              <div style={{ animation:"cbfSlide .4s ease both" }}>
                <div style={{ marginBottom:22 }}>
                  <h3 style={{ fontFamily:DT.font, fontWeight:800, fontSize:"clamp(18px,3vw,24px)", color:"#f1f5f9", letterSpacing:"-.025em", marginBottom:6 }}>
                    Choose Your Counsellor
                  </h3>
                  <p style={{ fontSize:13, color:"rgba(148,163,184,.55)", fontFamily:DT.body }}>
                    All sessions are free · 30 min · Conducted on Google Meet
                  </p>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:16 }}>
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

/*
═══════════════════════════════════════════════════════════════════
  INTEGRATION SNIPPET — paste into StudentView.jsx
═══════════════════════════════════════════════════════════════════

  1. Import at top of file:
     import CounsellorBookingFlow from "./CounsellorBookingFlow";

  2. Add state inside your component:
     const [bookingOpen, setBookingOpen] = useState(false);

  3. Replace the old BookButton / static button with:
     <button onClick={() => setBookingOpen(true)} ...>
       Book a Counselling Session With Us!
     </button>

  4. Render the modal anywhere inside your JSX return:
     <CounsellorBookingFlow
       isOpen={bookingOpen}
       onClose={() => setBookingOpen(false)}
       studentName={dashData?.name?.split(" ")[0]}   // optional
     />
═══════════════════════════════════════════════════════════════════ */