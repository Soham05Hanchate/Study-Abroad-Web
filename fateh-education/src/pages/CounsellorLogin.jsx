import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
/*
  CounsellorLogin.jsx  –  Fateh Education Platform
  ─────────────────────────────────────────────────────
  Standalone secure-portal login UI.
  No routing, no external state, no dependencies beyond React.

  onSubmit mock behaviour:
    • Correct ID  →  FATH-2024  (logs payload, shows success)
    • Any other ID  →  shows error banner for 3 s, resets
  ─────────────────────────────────────────────────────
*/

export default function CounsellorLogin() {
  const [form, setForm]     = useState({ name: "", id: "", email: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const navigate = useNavigate();

  /* ── Escape clears error state ── */
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape" && status === "error") setStatus("idle"); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [status]);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())
      e.name = "Full name is required.";
    if (!form.id.trim())
      e.id = "Counsellor ID is required.";
    else if (!/^FATH-\d{4}$/i.test(form.id.trim()))
      e.id = "Format: FATH-XXXX  (e.g. FATH-2024)";
    if (!form.email.trim())
      e.email = "Email address is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      e.email = "Please enter a valid email address.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setStatus("loading");
    await new Promise((r) => setTimeout(r, 1800)); // simulate API

if (form.id.toUpperCase() === "FATH-2024") {
    setStatus("success");
    // Redirect after the success animation finishes
    setTimeout(() => {
        navigate('/counsellor-dashboard');
    }, 2000);
}
    
  };

  return (
    <>
      {/* ── Injected keyframes + resets ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes cl-orb-a  { 0%,100%{transform:translate(0,0) scale(1)}   50%{transform:translate(32px,-22px) scale(1.09)} }
        @keyframes cl-orb-b  { 0%,100%{transform:translate(0,0) scale(1)}   50%{transform:translate(-22px,26px) scale(1.07)} }
        @keyframes cl-orb-c  { 0%,100%{transform:translate(0,0)}            60%{transform:translate(16px,-32px)} }
        @keyframes cl-fadein { from{opacity:0;transform:translateY(28px) scale(.975)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes cl-shake  { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        @keyframes cl-spin   { to{transform:rotate(360deg)} }
        @keyframes cl-glow   { 0%,100%{box-shadow:0 0 24px rgba(6,196,122,.52),0 4px 22px rgba(0,0,0,.42)} 50%{box-shadow:0 0 52px rgba(6,196,122,.9),0 4px 26px rgba(0,0,0,.52)} }
        @keyframes cl-ring   { 0%,100%{opacity:.28;transform:scale(1)} 50%{opacity:1;transform:scale(1.14)} }
        @keyframes cl-pop    { from{opacity:0;transform:scale(.35)} to{opacity:1;transform:scale(1)} }
        @keyframes cl-check  { from{stroke-dashoffset:28} to{stroke-dashoffset:0} }
        @keyframes cl-shimmer{ from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes cl-dot    { 0%,100%{opacity:.15} 50%{opacity:.9} }

        .cl-enter   { animation: cl-fadein .7s cubic-bezier(.23,1,.32,1) both .05s; }
        .cl-shake   { animation: cl-shake .4s cubic-bezier(.36,.07,.19,.97) both; }
        .cl-glowbtn { animation: cl-glow 2.7s ease-in-out infinite; }

        ::-webkit-scrollbar            { width: 4px; }
        ::-webkit-scrollbar-thumb      { background: rgba(6,196,122,.45); border-radius: 4px; }
        ::-webkit-scrollbar-track      { background: transparent; }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #071410 inset !important;
          -webkit-text-fill-color: #f1f5f9 !important;
          transition: background-color 5000s;
        }
        input::placeholder { color: rgba(148,163,184,.28); }
      `}</style>

      {/* ══════════════════════════════════════
          FULL-SCREEN WRAPPER
      ══════════════════════════════════════ */}
      <div style={{
        position: "fixed", inset: 0,
        background: "radial-gradient(ellipse 110% 65% at 50% -8%, #051a10 0%, #030d06 44%, #010603 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "24px 16px 32px", overflowY: "auto",
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(6,196,122,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(6,196,122,.055) 1px,transparent 1px)",
          backgroundSize: "58px 58px",
          maskImage: "radial-gradient(ellipse 90% 65% at 50% 0%,black 8%,transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 65% at 50% 0%,black 8%,transparent 100%)",
        }}/>

        {/* Ambient orbs */}
        {[
          { w:580, h:580, color:"rgba(6,196,122,.18)",  top:"-14%", left:"2%",   anim:"cl-orb-a 14s ease-in-out infinite" },
          { w:400, h:400, color:"rgba(6,160,100,.12)",   bottom:"6%",right:"5%",  anim:"cl-orb-b 11s ease-in-out infinite" },
          { w:250, h:250, color:"rgba(16,185,129,.09)",  top:"42%",  right:"18%", anim:"cl-orb-c  9s ease-in-out infinite" },
        ].map((o, i) => (
          <div key={i} style={{
            position: "absolute", borderRadius: "50%", pointerEvents: "none",
            width: o.w, height: o.h,
            background: `radial-gradient(circle,${o.color} 0%,transparent 70%)`,
            filter: "blur(55px)",
            top: o.top, bottom: o.bottom, left: o.left, right: o.right,
            animation: o.anim,
          }}/>
        ))}

        {/* Particles */}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", opacity:.28 }}>
          {Array.from({ length: 30 }, (_, i) => (
            <circle key={i}
              cx={`${(((i * 37 + 11) % 97) + 1.5).toFixed(1)}%`}
              cy={`${(((i * 53 + 7)  % 97) + 1.5).toFixed(1)}%`}
              r={(((i * 13) % 14) * 0.1 + 0.4).toFixed(1)}
              fill="#4adeaa">
              <animate attributeName="opacity"
                values="0.12;0.88;0.12"
                dur={`${((i * 7) % 7 + 6).toFixed(1)}s`}
                begin={`${((i * 3) % 5).toFixed(1)}s`}
                repeatCount="indefinite"/>
            </circle>
          ))}
        </svg>

        {/* ══════════════════════════════════════
            GLASS CARD
        ══════════════════════════════════════ */}
        <div
          className="cl-enter"
          style={{
            position: "relative", zIndex: 1,
            width: "100%", maxWidth: 456,
            borderRadius: 28,
            padding: "42px 38px 34px",
            background: "linear-gradient(145deg,rgba(255,255,255,.085) 0%,rgba(255,255,255,.03) 100%)",
            backdropFilter: "blur(36px)", WebkitBackdropFilter: "blur(36px)",
            border: "1px solid rgba(255,255,255,.12)",
            boxShadow: [
              "0 0 0 1px rgba(6,196,122,.07)",
              "0 30px 80px rgba(0,0,0,.65)",
              "0 0 60px rgba(6,196,122,.06)",
              "inset 0 1px 0 rgba(255,255,255,.1)",
            ].join(","),
          }}
        >
          {/* Top shimmer */}
          <div style={{
            position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
            background: "linear-gradient(90deg,transparent,rgba(6,196,122,.6),rgba(16,185,129,.28),transparent)",
            transformOrigin: "left",
            animation: "cl-shimmer .9s cubic-bezier(.23,1,.32,1) .3s both",
          }}/>

          {/* Inner radial glow */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: 28, pointerEvents: "none",
            background: "radial-gradient(ellipse 70% 40% at 50% 0%,rgba(6,196,122,.07),transparent 70%)",
          }}/>

          {/* ── SUCCESS ── */}
          {status === "success" ? (
            <SuccessScreen name={form.name} />
          ) : (
            <LoginForm
              form={form} errors={errors} status={status}
              set={set} handleSubmit={handleSubmit}
            />
          )}
        </div>

        {/* Footer tagline */}
        <p style={{ position:"relative", zIndex:1, marginTop:18, fontSize:11, color:"rgba(148,163,184,.2)", letterSpacing:".05em", textAlign:"center" }}>
          © {new Date().getFullYear()} Fateh Education · Counsellor Portal v2.0
        </p>
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────
   LOGIN FORM
────────────────────────────────────────────── */
function LoginForm({ form, errors, status, set, handleSubmit }) {
  return (
    <>
      {/* Header */}
      <div style={{ textAlign:"center", marginBottom:28, position:"relative", zIndex:1 }}>
        {/* Logo ring */}
        <div style={{
          width:68, height:68, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(6,196,122,.26),rgba(5,158,98,.12))",
          border:"1.5px solid rgba(6,196,122,.4)",
          boxShadow:"0 0 32px rgba(6,196,122,.28),inset 0 1px 0 rgba(255,255,255,.15)",
          display:"flex", alignItems:"center", justifyContent:"center",
          margin:"0 auto 16px",
        }}>
          <FatehShield size={36}/>
        </div>

        {/* Secure badge */}
        <div style={{
          display:"inline-flex", alignItems:"center", gap:5,
          padding:"4px 13px", borderRadius:100, marginBottom:14,
          background:"rgba(16,185,129,.1)", border:"1px solid rgba(16,185,129,.24)",
        }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", boxShadow:"0 0 7px #10b981", display:"inline-block" }}/>
          <span style={{ fontSize:10, fontWeight:700, color:"#6ee7b7", letterSpacing:".12em", textTransform:"uppercase" }}>
            Secure Portal
          </span>
        </div>

        <h1 style={{
          fontFamily:"'Syne',sans-serif", fontWeight:800,
          fontSize:"clamp(20px,4vw,26px)", color:"#f1f5f9",
          letterSpacing:"-.025em", lineHeight:1.15, marginBottom:8,
        }}>
          Counsellor Portal
        </h1>
        <p style={{ fontSize:13, color:"rgba(148,163,184,.6)", lineHeight:1.65 }}>
          Enter your credentials to access<br/>AI-qualified leads and student insights.
        </p>
      </div>

      {/* Error banner */}
      {status === "error" && (
        <div className="cl-shake" style={{
          display:"flex", alignItems:"center", gap:9,
          padding:"12px 14px", borderRadius:12, marginBottom:18,
          background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.32)",
        }}>
          <span style={{ fontSize:18, flexShrink:0 }}>🔐</span>
          <p style={{ fontSize:13, color:"#fca5a5", lineHeight:1.5, margin:0 }}>
            Authentication failed. Please verify your Counsellor ID and try again.
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate style={{ display:"flex", flexDirection:"column", gap:18, position:"relative", zIndex:1 }}>

        <Field id="f-name" label="Full Name" type="text"
          placeholder="e.g. Dr. Aarav Mehta"
          value={form.name} onChange={set("name")} error={errors.name}
          icon={<PersonIcon/>}/>

        <Field id="f-id" label="Counsellor ID" type="text"
          placeholder="FATH-2024"
          value={form.id} onChange={set("id")} error={errors.id}
          hint="Format: FATH-XXXX  ·  Demo: use FATH-2024"
          icon={<LockIcon/>}/>

        <Field id="f-email" label="Registered Email ID" type="email"
          placeholder="you@fateh.edu.in"
          value={form.email} onChange={set("email")} error={errors.email}
          icon={<MailIcon/>}/>

        {/* Authenticate button */}
        <button
          type="submit"
          disabled={status === "loading"}
          className={status === "loading" ? "" : "cl-glowbtn"}
          style={{
            width:"100%", padding:"15px", borderRadius:14, border:"none",
            fontSize:15, fontWeight:700, fontFamily:"'DM Sans',sans-serif",
            cursor: status === "loading" ? "not-allowed" : "pointer",
            background:"linear-gradient(135deg,#06c47a,#059e62)",
            color:"#fff", marginTop:4,
            display:"flex", alignItems:"center", justifyContent:"center", gap:9,
            opacity: status === "loading" ? .84 : 1,
            transition:"transform .25s ease, opacity .25s ease",
          }}
          onMouseEnter={(e) => { if (status !== "loading") e.currentTarget.style.transform = "scale(1.02) translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1) translateY(0)"; }}
        >
          {status === "loading" ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.2" strokeLinecap="round"
                style={{ animation:"cl-spin 1s linear infinite" }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Authenticating…
            </>
          ) : (
            <>
              <LockIcon size={16}/>
              Authenticate
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.2" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div style={{ display:"flex", alignItems:"center", gap:12, margin:"22px 0 16px" }}>
        <div style={{ flex:1, height:1, background:"rgba(255,255,255,.07)" }}/>
        <span style={{ fontSize:10, color:"rgba(148,163,184,.32)", letterSpacing:".08em", fontWeight:600 }}>SECURE ACCESS</span>
        <div style={{ flex:1, height:1, background:"rgba(255,255,255,.07)" }}/>
      </div>

      {/* Trust row */}
      <div style={{ display:"flex", justifyContent:"center", gap:16, marginBottom:20, flexWrap:"wrap" }}>
        {[["🔒","256-bit SSL"],["🛡️","Encrypted"],["🔑","SSO Ready"]].map(([icon,label]) => (
          <div key={label} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <span style={{ fontSize:12 }}>{icon}</span>
            <span style={{ fontSize:10, color:"rgba(148,163,184,.38)", fontWeight:500 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign:"center" }}>
        <a href="mailto:support@fateh.edu.in"
          style={{ fontSize:12, color:"rgba(148,163,184,.38)", textDecoration:"none", transition:"color .2s" }}
          onMouseEnter={(e) => (e.target.style.color = "#86efcb")}
          onMouseLeave={(e) => (e.target.style.color = "rgba(148,163,184,.38)")}>
          Need help? Contact IT Support →
        </a>
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────
   SUCCESS SCREEN
────────────────────────────────────────────── */
function SuccessScreen({ name }) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 280); return () => clearTimeout(t); }, []);
  const first = (name || "Counsellor").trim().split(" ")[0];

  return (
    <div style={{ textAlign:"center", padding:"8px 0", position:"relative", zIndex:1 }}>
      <div style={{ position:"relative", width:114, height:114, margin:"0 auto 24px", display:"flex", alignItems:"center", justifyContent:"center" }}>
        {[114,92,72].map((sz, i) => (
          <div key={sz} style={{
            position:"absolute", width:sz, height:sz, borderRadius:"50%",
            border:"1px solid rgba(16,185,129,.25)",
            animation:`cl-ring ${1.65+i*.22}s ease-in-out ${i*.18}s infinite`,
          }}/>
        ))}
        <div style={{
          width:72, height:72, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(16,185,129,.95),rgba(5,150,105,.75))",
          boxShadow:"0 0 55px rgba(16,185,129,.65),0 0 110px rgba(16,185,129,.22)",
          display:"flex", alignItems:"center", justifyContent:"center",
          animation:"cl-pop .65s cubic-bezier(.34,1.56,.64,1) .15s both",
        }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"
              style={{
                strokeDasharray:28,
                strokeDashoffset: drawn ? 0 : 28,
                transition:"stroke-dashoffset .5s cubic-bezier(.4,0,.2,1) .5s",
              }}/>
          </svg>
        </div>
      </div>

      <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(20px,4vw,26px)", color:"#f1f5f9", letterSpacing:"-.025em", marginBottom:8 }}>
        Welcome back, {first}!
      </h2>
      <p style={{ fontSize:13, color:"rgba(148,163,184,.6)", lineHeight:1.65, marginBottom:24 }}>
        Authentication successful.<br/>Redirecting to your counsellor dashboard…
      </p>
      <div style={{ display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
        {["Lead Dashboard","AI Transcripts","Student Scores"].map((tag) => (
          <span key={tag} style={{
            fontSize:11, padding:"5px 12px", borderRadius:100,
            background:"rgba(16,185,129,.12)", border:"1px solid rgba(16,185,129,.26)",
            color:"#6ee7b7", fontWeight:600,
          }}>✓ {tag}</span>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   FIELD COMPONENT
────────────────────────────────────────────── */
function Field({ id, label, type, placeholder, value, onChange, error, hint, icon }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <label htmlFor={id} style={{
        fontSize:11, fontWeight:700, letterSpacing:".1em",
        textTransform:"uppercase", color:"rgba(148,163,184,.58)",
        fontFamily:"'DM Sans',sans-serif",
      }}>
        {label}
      </label>
      <div style={{ position:"relative" }}>
        <div style={{
          position:"absolute", left:14, top:"50%", transform:"translateY(-50%)",
          display:"flex", alignItems:"center", pointerEvents:"none",
          color: focused ? "#4adeaa" : "rgba(148,163,184,.38)",
          transition:"color .25s ease",
        }}>
          {icon}
        </div>
        <input
          id={id} type={type} placeholder={placeholder}
          value={value} onChange={onChange} autoComplete="off"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width:"100%", padding:"13px 14px 13px 44px",
            borderRadius:12, outline:"none",
            fontSize:14, fontFamily:"'DM Sans',sans-serif", color:"#f1f5f9",
            background: focused ? "rgba(6,196,122,.09)" : "rgba(255,255,255,.04)",
            border: error
              ? "1px solid rgba(239,68,68,.6)"
              : focused
                ? "1px solid rgba(6,196,122,.72)"
                : "1px solid rgba(255,255,255,.1)",
            boxShadow: focused
              ? "0 0 0 3px rgba(6,196,122,.13),0 0 22px rgba(6,196,122,.11)"
              : error
                ? "0 0 0 3px rgba(239,68,68,.09)"
                : "none",
            transition:"all .25s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>
      {error && (
        <span style={{ fontSize:11, color:"#fca5a5", display:"flex", alignItems:"center", gap:4 }}>
          <span>⚠</span>{error}
        </span>
      )}
      {hint && !error && (
        <span style={{ fontSize:11, color:"rgba(148,163,184,.38)" }}>{hint}</span>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   SVG ICONS
────────────────────────────────────────────── */
function FatehShield({ size = 36 }) {
  return (
    <svg width={size} height={size * 1.11} viewBox="0 0 36 40" fill="none">
      <path d="M18 2L2 8v12c0 10 6.5 17 16 19 9.5-2 16-9 16-19V8L18 2Z" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="1"/>
      <path d="M18 9L21 19 18 16 15 19Z" fill="white" opacity=".95"/>
      <path d="M18 16L20 25 18 23 16 25Z" fill="#93c5fd" opacity=".85"/>
      <circle cx="18" cy="27" r="1.5" fill="white" opacity=".65"/>
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function LockIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}