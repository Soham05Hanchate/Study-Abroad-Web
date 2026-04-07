import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';

/* ─────────────────────────────────────────────
   FATEH EDUCATION — AI Voice Agent Landing Page
   Immersive Video Background Theme
   ───────────────────────────────────────────── */

const css = {
  page: {
    minHeight: "100vh",
    fontFamily: "'Space Grotesk', sans-serif",
    position: "relative",
    backgroundColor: "#030508", // Fallback color
  },
  glassCard: {
    background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.09)",
    boxShadow: "0 8px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)",
  },
  glassCardHoverStudent: {
    background: "linear-gradient(135deg, rgba(37,99,235,0.14) 0%, rgba(37,99,235,0.04) 100%)",
    border: "1px solid rgba(59,130,246,0.45)",
    boxShadow: "0 0 52px rgba(37,99,235,0.2), 0 12px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
  },
  glassCardHoverCounsellor: {
    background: "linear-gradient(135deg, rgba(5,150,105,0.12) 0%, rgba(5,150,105,0.03) 100%)",
    border: "1px solid rgba(52,211,153,0.38)",
    boxShadow: "0 0 48px rgba(5,150,105,0.16), 0 12px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
  },
  btnStudent: {
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    boxShadow: "0 0 24px rgba(37,99,235,0.5), 0 4px 16px rgba(0,0,0,0.3)",
  },
  btnCounsellor: {
    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    boxShadow: "0 0 24px rgba(5,150,105,0.45), 0 4px 16px rgba(0,0,0,0.3)",
  }
};

// ── Shield Logo ──
function FatehLogo({ size = 36 }) {
  return (
    <svg width={size} height={size * 1.11} viewBox="0 0 36 40" fill="none">
      <path d="M18 2L2 8v12c0 10 6.5 17 16 19 9.5-2 16-9 16-19V8L18 2Z" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="1" />
      <path d="M18 9 L21 19 L18 16 L15 19 Z" fill="white" opacity="0.95" />
      <path d="M18 16 L20 25 L18 23 L16 25 Z" fill="#93c5fd" opacity="0.85" />
      <circle cx="18" cy="27" r="1.5" fill="white" opacity="0.65" />
    </svg>
  );
}

// ── Animated counter ──
function Counter({ target, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let v = 0;
        const step = Math.ceil(target / 60);
        const t = setInterval(() => {
          v = Math.min(v + step, target);
          setVal(v);
          if (v >= target) clearInterval(t);
        }, 20);
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── Typing headline ──
const LINES = ["Overseas Education.", "Your UK & Ireland Journey.", "AI-Powered Admissions."];
function TypingText() {
  const [line, setLine] = useState(0);
  const [txt, setTxt] = useState("");
  const [del, setDel] = useState(false);
  useEffect(() => {
    const target = LINES[line];
    if (!del && txt.length < target.length) {
      const t = setTimeout(() => setTxt(target.slice(0, txt.length + 1)), 60);
      return () => clearTimeout(t);
    }
    if (!del && txt.length === target.length) {
      const t = setTimeout(() => setDel(true), 2000);
      return () => clearTimeout(t);
    }
    if (del && txt.length > 0) {
      const t = setTimeout(() => setTxt(txt.slice(0, -1)), 32);
      return () => clearTimeout(t);
    }
    if (del && txt.length === 0) {
      setDel(false);
      setLine((l) => (l + 1) % LINES.length);
    }
  }, [txt, del, line]);
  return (
    <span style={{ color: "#60a5fa" }}>
      {txt}
      <span className="cursor-blink">|</span>
    </span>
  );
}

// ── Path Card ──
function PathCard({ type }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const isStudent = type === "student";
  
  const hoverStyle = hovered
    ? isStudent ? css.glassCardHoverStudent : css.glassCardHoverCounsellor
    : {};

  const handleNavigation = () => {
    if (isStudent) {
      navigate('/student');
    } else {
      navigate('/counsellor-login'); 
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleNavigation} 
      style={{
        ...css.glassCard,
        ...hoverStyle,
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
        cursor: "pointer",
        borderRadius: 28,
        padding: "36px 32px",
        flex: 1,
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      <div style={{
        position: "absolute", top: 0, right: 0, width: 130, height: 130,
        borderRadius: "0 28px 0 100%",
        background: isStudent
          ? "radial-gradient(circle at top right, rgba(37,99,235,0.2), transparent 70%)"
          : "radial-gradient(circle at top right, rgba(16,185,129,0.16), transparent 70%)",
      }} />

      <div style={{
        width: 84, height: 84, borderRadius: "50%", display: "flex",
        alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
        background: isStudent
          ? "radial-gradient(circle, rgba(37,99,235,0.2) 0%, rgba(37,99,235,0.06) 100%)"
          : "radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(16,185,129,0.05) 100%)",
        border: isStudent ? "1.5px solid rgba(59,130,246,0.3)" : "1.5px solid rgba(52,211,153,0.25)",
        boxShadow: isStudent ? "0 0 28px rgba(37,99,235,0.18)" : "0 0 28px rgba(16,185,129,0.14)",
        transform: hovered ? "scale(1.08)" : "scale(1)",
        transition: "transform 0.35s ease",
      }}>
        {isStudent ? <GraduationIcon /> : <AnalyticsIcon />}
      </div>

      <div style={{
        display: "inline-block", padding: "4px 12px", borderRadius: 100,
        fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16,
        background: isStudent ? "rgba(37,99,235,0.15)" : "rgba(16,185,129,0.12)",
        border: isStudent ? "1px solid rgba(59,130,246,0.28)" : "1px solid rgba(52,211,153,0.22)",
        color: isStudent ? "#93c5fd" : "#6ee7b7",
      }}>
        {isStudent ? "AI-Powered · 24/7" : "Dashboard · Analytics"}
      </div>

      <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "clamp(20px, 3vw, 28px)", color: "#fff", letterSpacing: "-0.02em", marginBottom: 10 }}>
        {isStudent ? "I am a Student" : "I am a Counsellor"}
      </h3>

      <p style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(200,213,255,0.8)", maxWidth: 260, margin: "0 auto 24px" }}>
        {isStudent
          ? "Start your journey to the UK & Ireland instantly. Our AI voice agent guides you every step of the way."
          : "Access qualified leads, AI-generated transcripts, and intelligent student scores in real time."}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 28 }}>
        {(isStudent
          ? ["Voice Counseling", "Instant Guidance", "UK & Ireland"]
          : ["Lead Scoring", "JSON Reports", "Transcripts"]
        ).map((tag) => (
          <span key={tag} style={{
            fontSize: 11, padding: "4px 11px", borderRadius: 100,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
            color: "rgba(200,213,255,0.7)",
          }}>{tag}</span>
        ))}
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation(); 
          handleNavigation();
        }}
        style={{
          ...(isStudent ? css.btnStudent : css.btnCounsellor),
          width: "100%", padding: 15, borderRadius: 18, color: "#fff",
          fontWeight: 600, fontSize: 15, fontFamily: "'Space Grotesk', sans-serif",
          cursor: "pointer", border: "none",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transform: hovered ? "scale(1.03)" : "scale(1)",
          transition: "all 0.3s ease",
        }}
      >
        {isStudent ? "Begin My Journey" : "Enter Dashboard"}
        <span style={{ display: "inline-block", transform: hovered ? "translateX(5px)" : "translateX(0)", transition: "transform 0.3s ease" }}>→</span>
      </button>
    </div>
  );
}

function GraduationIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M18 6L3 13l15 7 15-7-15-7Z" stroke="#60a5fa" strokeWidth="1.8" strokeLinejoin="round" fill="rgba(37,99,235,.15)" />
      <path d="M7 17v8c0 3 4.8 5.5 11 5.5S29 28 29 25v-8" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M29 13v8" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="29" cy="22.5" r="2" fill="#60a5fa" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="4" y="21" width="6" height="11" rx="1.5" fill="rgba(16,185,129,.2)" stroke="#34d399" strokeWidth="1.6" />
      <rect x="15" y="13" width="6" height="19" rx="1.5" fill="rgba(16,185,129,.2)" stroke="#34d399" strokeWidth="1.6" />
      <rect x="26" y="6" width="6" height="26" rx="1.5" fill="rgba(16,185,129,.2)" stroke="#34d399" strokeWidth="1.6" />
      <path d="M7 18l10-8 10-5" stroke="#6ee7b7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="27" cy="5" r="2.2" fill="#34d399" />
    </svg>
  );
}

// ── Stats ──
function Stats() {
  const items = [
    { val: 5000, suffix: "+", label: "Students Placed" },
    { val: 97, suffix: "%", label: "Visa Success Rate" },
    { val: 120, suffix: "+", label: "Partner Universities" },
    { val: 24, suffix: "/7", label: "AI Availability" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, overflow: "hidden", marginTop: 52 }}>
      {items.map((s, i) => (
        <div key={i} style={{ background: "rgba(6,11,20,0.6)", backdropFilter: "blur(12px)", padding: "22px 12px", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "clamp(24px, 4vw, 36px)", color: "#60a5fa", lineHeight: 1 }}>
            <Counter target={s.val} suffix={s.suffix} />
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 5 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Trust bar ──
function TrustBar() {
  const unis = ["University of Edinburgh", "Trinity College Dublin", "UCL London", "King's College London", "University of Manchester", "UCD Dublin", "University of Galway", "Imperial College"];
  return (
    <div style={{ marginTop: 44, overflow: "hidden" }}>
      <p style={{ textAlign: "center", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>
        Trusted pathway to top institutions
      </p>
      <div style={{ display: "flex", gap: 24, animation: "marquee 24s linear infinite", width: "max-content" }}>
        {[...unis, ...unis].map((u, i) => (
          <span key={i} style={{ fontSize: 12, padding: "7px 16px", borderRadius: 100, color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", whiteSpace: "nowrap", backdropFilter: "blur(4px)" }}>
            {u}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main Export ──
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate(); // <-- Added navigation hook here

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Space+Grotesk:wght@300;400;500;600&display=swap');
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(26px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .fade1{animation:fadeUp 0.7s ease both 0.1s}
        .fade2{animation:fadeUp 0.7s ease both 0.25s}
        .fade3{animation:fadeUp 0.7s ease both 0.4s}
        .fade4{animation:fadeUp 0.7s ease both 0.55s}
        .fade5{animation:fadeUp 0.8s ease both 0.7s}
        .cursor-blink{animation:pulse 1.1s ease-in-out infinite}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:#030508}
        ::-webkit-scrollbar-thumb{background:#1d4ed8;border-radius:3px}
        @media(max-width:680px){
          .cards-grid{flex-direction:column!important}
          .or-divider{display:none!important}
          .stats-grid{grid-template-columns:repeat(2,1fr)!important}
          nav a, nav span.nav-link {display:none}
        }
      `}</style>

      <div style={css.page}>
        
        {/* ── IMMERSIVE BACKGROUND VIDEO ── */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          >
            <source src="/intro.mp4" type="video/mp4" />
          </video>
          
          {/* Dark gradient overlay so the white text and cards are readable over the video */}
          <div style={{ 
            position: "absolute", 
            inset: 0, 
            background: "linear-gradient(to bottom, rgba(3,5,8,0.65) 0%, rgba(6,11,20,0.85) 100%)",
            backdropFilter: "blur(2px)" 
          }} />
        </div>

        {/* ── WRAPPER TO KEEP CONTENT ABOVE VIDEO ── */}
        <div style={{ position: "relative", zIndex: 10 }}>
          
          {/* ── HEADER ── */}
          <header style={{
            position: "sticky", top: 0, transition: "all 0.3s ease",
            background: scrolled ? "rgba(6,11,20,0.88)" : "transparent",
            backdropFilter: scrolled ? "blur(20px)" : "none",
            WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
            borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
          }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FatehLogo size={36} />
                <div>
                  <div style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em", lineHeight: 1.2 }}>FATEH</div>
                  <div style={{ color: "#3b82f6", fontSize: 10, letterSpacing: "0.1em", lineHeight: 1.2 }}>CONQUER YOUR DREAMS</div>
                </div>
              </div>
              <nav style={{ display: "flex", alignItems: "center", gap: 24 }}>
                
                {/* ── UPDATED FAQ LINK ── */}
                <a 
                  href="/faqs"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/faqs');
                  }}
                  style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, textDecoration: "none", transition: "color 0.2s", fontWeight: 500, cursor: "pointer" }}
                  onMouseEnter={(e) => (e.target.style.color = "#60a5fa")}
                  onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.8)")}
                >
                  FAQs
                </a>

                {/* The rest of the static links */}
                {["Universities", "Services", "Contact"].map((n) => (
                  <button
                    key={n}
                    type="button"
                    style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, textDecoration: "none", transition: "color 0.2s", fontWeight: 500, background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif" }}
                    onMouseEnter={(e) => (e.target.style.color = "#60a5fa")}
                    onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.8)")}
                  >
                    {n}
                  </button>
                ))}
                
                <button style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 13, padding: "7px 16px", borderRadius: 10, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.25s" }}
                  onMouseEnter={(e) => { e.target.style.background = "#2563eb"; e.target.style.borderColor = "#2563eb"; }}
                  onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.1)"; e.target.style.borderColor = "rgba(255,255,255,0.2)"; }}>
                  Sign In
                </button>
              </nav>
            </div>
          </header>

          {/* ── HERO ── */}
          <main>
            <section style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 28px 20px", textAlign: "center" }}>

              <div className="fade1" style={{ marginBottom: 24 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 100, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#60a5fa", boxShadow: "0 0 8px #60a5fa", display: "inline-block", flexShrink: 0 }} />
                  <span style={{ color: "#e2e8f0", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>AI Voice Agent · Now Live</span>
                </div>
              </div>

              <h1 className="fade2" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(36px, 6vw, 66px)", letterSpacing: "-0.035em", color: "#fff", lineHeight: 1.08, marginBottom: 6 }}>
                Welcome to the
              </h1>
              <h1 className="fade2" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(36px, 6vw, 66px)", letterSpacing: "-0.035em", color: "#fff", lineHeight: 1.08, marginBottom: 20 }}>
                Future of <TypingText />
              </h1>

              <p className="fade3" style={{ color: "rgba(255,255,255,0.8)", fontSize: "clamp(14px, 2vw, 17px)", maxWidth: 520, margin: "0 auto 52px", lineHeight: 1.7, textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                Instant 24/7 AI-powered counseling meets intelligent lead management. Your gateway to top UK &amp; Ireland universities — reimagined.
              </p>

              {/* ── TWO CARDS ── */}
              <div className="fade4 cards-grid" style={{ display: "flex", flexDirection: "row", gap: 20, maxWidth: 900, margin: "0 auto" }}>
                <PathCard type="student" />
                <div className="or-divider" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: "0 4px" }}>
                  <div style={{ width: 1, flex: 1, background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.2), transparent)" }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em", padding: "10px 0" }}>OR</span>
                  <div style={{ width: 1, flex: 1, background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.2), transparent)" }} />
                </div>
                <PathCard type="counsellor" />
              </div>

              {/* Stats + Trust */}
              <div className="fade5">
                <Stats />
                <TrustBar />
              </div>
            </section>
          </main>

          {/* ── FOOTER ── */}
          <footer style={{ borderTop: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(20px)", marginTop: 64 }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 28px", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <FatehLogo size={26} />
                <span style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 14 }}>Fateh Education</span>
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                {["Privacy Policy", "Terms of Service", "Contact Us"].map((l) => (
                  <button
                    key={l}
                    type="button"
                    style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.2s", background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif" }}
                    onMouseEnter={(e) => (e.target.style.color = "#fff")}
                    onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.5)")}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>© {new Date().getFullYear()} Fateh Education. All rights reserved.</p>
            </div>
          </footer>

        </div>
      </div>
    </>
  );
}
