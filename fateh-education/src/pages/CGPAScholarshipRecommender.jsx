import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/* ═══════════════════════════════════════════════════════════════
   FATEH EDUCATION — Scholarship Recommender (Pure CSS Version)
   Added: High-quality University Images
   ═══════════════════════════════════════════════════════════════ */

const T = {
  bg: "#030712",
  glass: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
  glassBorder: "1px solid rgba(255,255,255,0.1)",
  blue: "#6366f1",
  emerald: "#10b981",
  font: "'Syne', 'Space Grotesk', sans-serif",
  fontBody: "'Space Grotesk', sans-serif",
};

// ── Dataset with Campus Images ──
const universities = [
  { name: "University of Leeds", country: "UK", fee: 2800000, scholarship: "International Excellence Award", image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80" },
  { name: "University of Manchester", country: "UK", fee: 3000000, scholarship: "Global Futures Scholarship", image: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=800&q=80" },
  { name: "University of Edinburgh", country: "UK", fee: 2900000, scholarship: "Edinburgh Global Scholarship", image: "https://images.unsplash.com/photo-1583373834259-46cc92173cb7?auto=format&fit=crop&w=800&q=80" },
  { name: "University of Birmingham", country: "UK", fee: 2600000, scholarship: "Developing Solutions Scholarship", image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80" },
  { name: "University of Nottingham", country: "UK", fee: 2700000, scholarship: "Excellence Scholarship", image: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=800&q=80" },
  { name: "University College Dublin", country: "Ireland", fee: 2400000, scholarship: "Global Excellence Award", image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80" },
  { name: "Trinity College Dublin", country: "Ireland", fee: 2600000, scholarship: "Trinity Provost Award", image: "https://images.unsplash.com/photo-1548509925-0e7826dd7915?auto=format&fit=crop&w=800&q=80" },
  { name: "University of Galway", country: "Ireland", fee: 2200000, scholarship: "Ireland Merit Bursary", image: "https://images.unsplash.com/photo-1603513492128-ba7bc9b3e143?auto=format&fit=crop&w=800&q=80" },
  { name: "University College Cork", country: "Ireland", fee: 2100000, scholarship: "UCC International Scholarship", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80" },
  { name: "Dublin City University", country: "Ireland", fee: 1900000, scholarship: "DCU Global Merit Award", image: "https://images.unsplash.com/photo-1525926472898-750567e7c978?auto=format&fit=crop&w=800&q=80" },
];

// ── Helpers ──
function getScholarshipRate(cgpa) {
  if (cgpa >= 8.5) return 0.40;
  if (cgpa >= 7.5) return 0.28;
  if (cgpa >= 6.5) return 0.18;
  return 0.10;
}
function fmtINR(n) {
  const l = n / 100000;
  return l >= 10 ? `₹${(l / 10).toFixed(2)} Cr` : `₹${l.toFixed(2)} L`;
}

// ── Sub Components ──
function UniCard({ uni, rate }) {
  const final = Math.round(uni.fee * (1 - rate));
  const pct = Math.round(rate * 100);
  const flag = uni.country === "UK" ? "🇬🇧" : "🇮🇪";

  return (
    <div style={{
      background: T.glass, 
      border: T.glassBorder, 
      borderRadius: "20px",
      backdropFilter: "blur(12px)", 
      transition: "transform 0.3s, box-shadow 0.3s", 
      position: "relative",
      overflow: "hidden", // Ensures the image doesn't break the rounded corners
      display: "flex",
      flexDirection: "column"
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = "translateY(-6px)";
      e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.5)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}
    >
      {/* Image Header */}
      <div style={{ position: "relative", height: "160px", width: "100%" }}>
        <img 
          src={uni.image} 
          alt={uni.name} 
          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
        />
        {/* Dark gradient overlay to blend image into the card */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(3,7,18,0) 0%, rgba(3,7,18,0.9) 100%)"
        }} />
        {/* Flag badge floating on image */}
        <span style={{ position: "absolute", top: "16px", right: "16px", fontSize: "24px", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
          {flag}
        </span>
      </div>

      {/* Card Content */}
      <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ marginBottom: "16px" }}>
          <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#fff", marginBottom: "4px" }}>{uni.name}</h3>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{uni.country}</p>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", textDecoration: "line-through", marginRight: "10px" }}>{fmtINR(uni.fee)}</span>
          <span style={{ fontSize: "22px", fontWeight: "800", color: T.emerald }}>{fmtINR(final)}</span>
        </div>

        <div style={{ fontSize: "11px", padding: "6px 12px", borderRadius: "100px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc", display: "inline-block", marginBottom: "20px", alignSelf: "flex-start" }}>
          {uni.scholarship}
        </div>

        <div style={{ marginTop: "auto" }}>
          <div style={{ height: "6px", width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${T.blue}, ${T.emerald})`, transition: "width 0.5s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>Est. Savings</span>
            <span style={{ fontSize: "11px", fontWeight: "700", color: T.emerald }}>{pct}% OFF</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CGPAScholarshipRecommender() {
  const navigate = useNavigate();
  const location = useLocation();
  const dashGPA = location.state?.gpa;
  const initialGPA = dashGPA ? parseFloat(dashGPA.split('/')[0]) : 7.5;

  const [cgpa, setCgpa] = useState(initialGPA);
  const rate = getScholarshipRate(cgpa);

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: "#fff", fontFamily: T.fontBody, padding: "60px 20px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "2px", color: T.blue, textTransform: "uppercase", marginBottom: "20px", display: "block" }}>
            Fateh AI · Financial Insight
          </span>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: "800", letterSpacing: "-1px", lineHeight: "1.1", marginBottom: "20px" }}>
            Based on your AI Interview,<br />
            <span style={{ background: `linear-gradient(to right, #fff, ${T.blue})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>here are your savings</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: "600px", margin: "0 auto 40px" }}>
            Our AI extracted your CGPA as <b style={{ color: "#fff" }}>{cgpa.toFixed(1)}</b>. Use the slider below to refine your score and see updated university costs.
          </p>

          {/* Slider Card */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: T.glassBorder, padding: "30px", borderRadius: "24px", maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "rgba(255,255,255,0.6)" }}>CGPA</span>
              <input 
                type="range" min="5" max="10" step="0.1" value={cgpa} 
                onChange={(e) => setCgpa(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: T.blue, cursor: "pointer" }} 
              />
              <div style={{ fontSize: "24px", fontWeight: "800", color: T.blue, width: "60px" }}>{cgpa.toFixed(1)}</div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "60px" }}>
          <div style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.2)", padding: "20px", borderRadius: "16px", textAlign: "center" }}>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "8px" }}>Est. Scholarship</p>
            <h2 style={{ fontSize: "28px", fontWeight: "800", color: T.blue }}>{Math.round(rate * 100)}%</h2>
          </div>
          <div style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)", padding: "20px", borderRadius: "16px", textAlign: "center" }}>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "8px" }}>Scholarship Tier</p>
            <h2 style={{ fontSize: "24px", fontWeight: "800", color: T.emerald }}>{cgpa >= 8.5 ? "Platinum" : cgpa >= 7.5 ? "Gold" : "Silver"}</h2>
          </div>
        </div>

        {/* Universities Grid */}
        <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "30px" }}>Recommended Universities</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {universities.map((u) => (
            <UniCard key={u.name} uni={u} rate={rate} />
          ))}
        </div>

        {/* Final CTA */}
        <div style={{ marginTop: "80px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "60px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "16px" }}>Ready to secure your spot?</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "40px" }}>Book a session now to discuss these scholarship options with an expert.</p>
          <button 
            onClick={() => navigate('/book')}
            style={{
              padding: "20px 50px", borderRadius: "100px", border: "none",
              background: "linear-gradient(90deg, #10b981, #3b82f6)",
              color: "#fff", fontSize: "18px", fontWeight: "700", cursor: "pointer",
              boxShadow: "0 10px 40px rgba(16,185,129,0.3)", transition: "transform 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            Book Appointment with Expert →
          </button>
        </div>
      </div>
    </div>
  );
}
