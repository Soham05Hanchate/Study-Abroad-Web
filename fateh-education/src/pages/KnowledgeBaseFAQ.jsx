import { useState, useMemo } from "react";
import {
  Search, GraduationCap, BookOpen, DollarSign, Globe, Calendar,
  ChevronDown, Sparkles, X, LayoutGrid
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   FAQ DATA
═══════════════════════════════════════════════════════════════ */
const FAQ_DATA = [
  // ── University Admissions ──────────────────────────────────
  {
    id: 1, category: "University Admissions", icon: GraduationCap,
    question: "What are the typical entry requirements for a Master's degree in the UK?",
    answer: "Most UK universities require a UK 2:1 honours degree (or international equivalent — typically 60–65% or 6.5+ CGPA) in a relevant subject. You'll also need an IELTS score of 6.0–7.0 (with no band below 5.5–6.0 depending on the course), two academic or professional references, a personal statement, and your official transcripts. Some competitive programmes at Russell Group universities like Edinburgh, UCL, or Manchester may require a 2:1 or above equivalent (70%+ or 7.5+ CGPA). Work experience may be preferred for MBA or MSc Management courses.",
  },
  {
    id: 2, category: "University Admissions", icon: GraduationCap,
    question: "How does the Irish university admission process differ from the UK?",
    answer: "Irish universities — such as UCD, Trinity College Dublin, and University of Galway — follow a similar process to the UK but have a few key differences. Postgraduate applications are submitted directly to each university (there is no centralised UCAS system for postgraduate study in Ireland). Offer timelines are often faster — you may receive a conditional offer within 2–4 weeks of applying. Ireland also uses a CAO system for undergraduate courses. For Indian students, a minimum of 55–60% aggregate in your undergraduate degree is typically required. IELTS 6.0–6.5 is the standard English requirement.",
  },
  {
    id: 3, category: "University Admissions", icon: GraduationCap,
    question: "What is UCAS and do I need it for postgraduate applications in the UK?",
    answer: "UCAS (Universities and Colleges Admissions Service) is the centralised application platform for UK undergraduate programmes — it is NOT used for postgraduate (Master's, PhD) applications. For postgraduate courses, you apply directly to each university via their own online portal. This means you can apply to multiple universities simultaneously without a limit. Fateh Education counsellors help you manage these individual applications, write tailored personal statements, and track deadlines across all your chosen institutions.",
  },

  // ── IELTS / PTE Prep ───────────────────────────────────────
  {
    id: 4, category: "IELTS/PTE Prep", icon: BookOpen,
    question: "What IELTS score do I need for top UK universities?",
    answer: "Requirements vary by university and course, but here are the common benchmarks: Standard courses (most taught Master's) require an overall IELTS Academic score of 6.5, with no individual band below 6.0. Competitive/research programmes at universities like Oxford, Cambridge, or LSE require 7.0 overall with no band below 6.5. Medicine or Law programmes may require 7.5+. For Ireland, UCD and Trinity College Dublin typically require 6.5 overall. Fateh Education partners with certified IELTS training centres and offers personalised preparation plans to help you hit your target score efficiently.",
  },
  {
    id: 5, category: "IELTS/PTE Prep", icon: BookOpen,
    question: "Is PTE Academic accepted instead of IELTS at UK and Irish universities?",
    answer: "Yes — Pearson Test of English (PTE Academic) is widely accepted as an alternative to IELTS at most UK and Irish universities, including University of Manchester, University of Leeds, University College Dublin, and Dublin City University. The equivalent score mapping is roughly: IELTS 6.5 ≈ PTE 58–62, IELTS 7.0 ≈ PTE 65–69. PTE is often preferred by students because results are typically available within 48–72 hours and the test is entirely computer-based (no human examiner for speaking). Always verify the specific acceptance policy with your target university.",
  },
  {
    id: 6, category: "IELTS/PTE Prep", icon: BookOpen,
    question: "How long does it typically take to prepare for IELTS from scratch?",
    answer: "The preparation timeline depends entirely on your current English proficiency level. Students starting from a conversational English base typically need 6–12 weeks of focused study to achieve a band 6.5. Students aiming for 7.0+ from a 5.5 baseline may need 3–5 months. Fateh Education recommends a structured approach: diagnostic mock test in Week 1 to identify weak bands, focused band-specific coaching for 4–8 weeks, then 2–3 timed full practice tests before the real exam. Our partner coaching centres in Pune, Mumbai, and Bengaluru offer both intensive and weekend batches.",
  },

  // ── Costs & Scholarships ──────────────────────────────────
  {
    id: 7, category: "Costs & Scholarships", icon: DollarSign,
    question: "What is the typical total cost of studying a Master's degree in the UK?",
    answer: "For a 1-year taught Master's in the UK, the total estimated budget (tuition + living) ranges from ₹40–70 Lakhs depending on the university and city. Tuition fees for Indian students: £12,000–£30,000/year (₹13L–₹33L approx.). Living costs in London: £18,000–£22,000/year. Living costs outside London (Manchester, Leeds, Edinburgh): £10,000–£14,000/year. Scholarship reductions of 20–50% are available for students with strong academic profiles (CGPA 7.5+). Post-study work visa (Graduate Route) allows 2 years of work in the UK after graduation, helping offset the investment.",
  },
  {
    id: 8, category: "Costs & Scholarships", icon: DollarSign,
    question: "What scholarships are available for Indian students at UK and Irish universities?",
    answer: "There are several merit-based scholarships specifically accessible to Indian students. At UK universities: University of Edinburgh Global Scholarship (up to 50% tuition), University of Leeds International Excellence Award (£3,000–£10,000), University of Manchester Global Futures Scholarship (25–35% fee reduction), University of Birmingham Developing Solutions Scholarship (full tuition + living allowance for select courses). In Ireland: UCD Global Excellence Award, Trinity College Provost Award, University of Galway International Merit Bursary. Additionally, the Chevening Scholarship (UK government-funded, full scholarship) and GREAT Scholarships are also open to Indian students. Fateh Education helps you identify and apply for scholarships that align with your CGPA and profile.",
  },
  {
    id: 9, category: "Costs & Scholarships", icon: DollarSign,
    question: "Is education loan funding available for UK and Ireland study abroad?",
    answer: "Yes — several Indian banks and NBFCs offer education loans for UK and Ireland programmes. Key lenders include SBI Global Ed-Vantage (up to ₹1.5 Cr, no collateral up to ₹40L), HDFC Credila, Axis Bank, and Prodigy Finance (collateral-free for top-ranked universities). Loan amounts typically cover tuition + living costs. Moratorium period: the course duration + 6–12 months before repayment begins. Interest rates range from 8.5–12% depending on the lender and collateral. Fateh Education has loan assistance partnerships and can connect you with a financial advisor to compare options.",
  },

  // ── Visa Process ───────────────────────────────────────────
  {
    id: 10, category: "Visa Process", icon: Globe,
    question: "What documents do I need for a UK Student Visa (formerly Tier 4)?",
    answer: "The UK Student Visa (now simply called the 'Student Visa') requires the following key documents: (1) Confirmation of Acceptance for Studies (CAS) — issued by your university after you accept a conditional/unconditional offer and pay the deposit. (2) Valid passport. (3) Proof of financial capacity — bank statements showing you can cover tuition + living costs for the first year (or full course if shorter than 9 months). (4) English language test certificate (IELTS/PTE/TOEFL). (5) Academic transcripts and degree certificates. (6) ATAS certificate (for certain science/engineering/research courses). The online application fee is £363 + Immigration Health Surcharge (IHS) of £470/year. Fateh Education provides a complete visa documentation checklist and review service.",
  },
  {
    id: 11, category: "Visa Process", icon: Globe,
    question: "How does the Ireland student visa process work for Indian students?",
    answer: "Indian students require a Study Visa (Type D Long Stay) for courses exceeding 3 months in Ireland. The process: (1) Receive your university letter of acceptance. (2) Register on the Irish Naturalisation and Immigration Service (INIS) website and create a AVATS (Application for a Visa to Travel to Ireland) application. (3) Submit documents: acceptance letter, proof of funds (€3,000–€7,000 accessible + first-year tuition), English test results, travel insurance, and accommodation proof. (4) Pay the visa fee (€60 for single entry). Processing time: 4–8 weeks. After arrival, you must register with the Garda National Immigration Bureau (GNIB) within 90 days to get your IRP (Irish Residence Permit). Students can work up to 20 hours/week during term time.",
  },

  // ── Application Timeline ────────────────────────────────────
  {
    id: 12, category: "Application Timeline", icon: Calendar,
    question: "When should I start my application for September 2025 intake at UK universities?",
    answer: "For September 2025 intake, the ideal preparation and application timeline is: Now–December 2024: Research programmes, shortlist 6–8 universities, appear for IELTS/PTE. January–February 2025: Submit applications to all shortlisted universities (most universities accept applications until June, but popular programmes fill up earlier). February–April 2025: Receive offers, compare scholarship packages, accept your preferred offer and pay deposit to secure your place and receive the CAS. May–June 2025: Apply for UK Student Visa using your CAS number. July 2025: Book accommodation, arrange travel, attend pre-departure orientation with Fateh Education. August/September 2025: Arrive and begin your programme. Starting 6–9 months ahead gives you the best scholarship and programme selection options.",
  },
  {
    id: 13, category: "Application Timeline", icon: Calendar,
    question: "What are the intake seasons for UK and Irish universities?",
    answer: "UK universities primarily have one main intake: September (the autumn semester). A smaller January intake is available at some universities for select programmes. Irish universities have two main intakes: September (the primary and most popular intake with the widest range of programmes) and January (available at universities like DCU, University of Galway, and some programmes at UCD). For the September intake, most universities open applications between October and January of the preceding year, with rolling admissions thereafter. Some competitive programmes (MBA, Data Science, AI) can fill up as early as March–April, so early applications strongly increase your chances of securing both a place and a scholarship.",
  },
  {
    id: 14, category: "Application Timeline", icon: Calendar,
    question: "How far in advance do I need to complete IELTS before applying?",
    answer: "IELTS results remain valid for 2 years from the test date. UK Visas and Immigration (UKVI) requires your IELTS score to be valid at the time of your visa application (not necessarily at the time of university application). However, most universities require you to submit your IELTS certificate as part of your application. Best practice: take your IELTS at least 2–3 months before your target application submission date. For a September 2025 intake, aim to complete IELTS by October–December 2024 if possible. If you're starting preparation now, book your test date first — this creates a natural deadline and sharpens focus during preparation.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "University Admissions", label: "University Admissions", icon: GraduationCap },
  { id: "IELTS/PTE Prep", label: "IELTS / PTE Prep", icon: BookOpen },
  { id: "Costs & Scholarships", label: "Costs & Scholarships", icon: DollarSign },
  { id: "Visa Process", label: "Visa Process", icon: Globe },
  { id: "Application Timeline", label: "Application Timeline", icon: Calendar },
];

/* ═══════════════════════════════════════════════════════════════
   ACCORDION ITEM
═══════════════════════════════════════════════════════════════ */
function AccordionItem({ item, isOpen, onToggle }) {
  const Icon = item.icon;
  return (
    <div
      style={{
        borderRadius: 16,
        border: isOpen ? "1px solid rgba(37,99,235,.45)" : "1px solid rgba(255,255,255,.08)",
        background: isOpen
          ? "linear-gradient(145deg,rgba(37,99,235,.09),rgba(37,99,235,.03))"
          : "linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.015))",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: isOpen
          ? "0 0 0 1px rgba(37,99,235,.12), 0 8px 32px rgba(0,0,0,.35)"
          : "0 2px 16px rgba(0,0,0,.25)",
        transition: "all .3s cubic-bezier(.23,1,.32,1)",
        overflow: "hidden",
      }}
    >
      {/* Question row */}
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 14,
          padding: "18px 20px", background: "none", border: "none", cursor: "pointer",
          textAlign: "left",
        }}
      >
        {/* Icon blob */}
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: isOpen ? "rgba(37,99,235,.2)" : "rgba(255,255,255,.07)",
          border: isOpen ? "1px solid rgba(37,99,235,.4)" : "1px solid rgba(255,255,255,.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .3s ease",
          boxShadow: isOpen ? "0 0 14px rgba(37,99,235,.25)" : "none",
        }}>
          <Icon size={16} style={{ color: isOpen ? "#60a5fa" : "rgba(148,163,184,.6)", transition: "color .3s" }} />
        </div>

        {/* Question text */}
        <span style={{
          flex: 1, fontSize: 14, fontWeight: isOpen ? 600 : 500,
          color: isOpen ? "#f1f5f9" : "rgba(226,232,240,.8)",
          lineHeight: 1.45, fontFamily: "'DM Sans',sans-serif",
          transition: "color .3s",
        }}>
          {item.question}
        </span>

        {/* Chevron */}
        <ChevronDown
          size={18}
          style={{
            color: isOpen ? "#60a5fa" : "rgba(148,163,184,.4)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform .35s cubic-bezier(.23,1,.32,1), color .3s",
            flexShrink: 0,
          }}
        />
      </button>

      {/* Answer panel */}
      <div style={{
        maxHeight: isOpen ? 600 : 0,
        overflow: "hidden",
        transition: "max-height .45s cubic-bezier(.23,1,.32,1)",
      }}>
        <div style={{
          padding: "0 20px 20px 72px",
          fontSize: 13.5, color: "rgba(148,163,184,.75)",
          lineHeight: 1.75, fontFamily: "'DM Sans',sans-serif",
          borderTop: "1px solid rgba(255,255,255,.06)",
          paddingTop: 16,
        }}>
          {item.answer}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function KnowledgeBaseFAQ() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [openItem, setOpenItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    return FAQ_DATA.filter(item => {
      const matchCat = activeCategory === "all" || item.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setOpenItem(null);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setActiveCategory("all");
    setOpenItem(null);
  };

  const clearSearch = () => setSearchQuery("");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:4px}
        @keyframes kbFadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .kb-fade{animation:kbFadeUp .55s ease both}
        .kb-pill-active{background:rgba(37,99,235,.22)!important;border-color:rgba(59,130,246,.55)!important;color:#93c5fd!important}
        .kb-pill{transition:all .2s ease}
        .kb-pill:hover:not(.kb-pill-active){background:rgba(255,255,255,.08)!important;border-color:rgba(255,255,255,.18)!important;color:#e2e8f0!important}
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse 100% 55% at 50% -5%, #0d1e3d 0%, #050d18 45%, #020408 100%)",
        fontFamily: "'DM Sans', sans-serif",
        color: "#f1f5f9",
        padding: "48px 20px 64px",
      }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>

          {/* ── HEADER ── */}
          <div className="kb-fade" style={{ textAlign: "center", marginBottom: 40, animationDelay: ".05s" }}>
            {/* Eyebrow badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "5px 14px", borderRadius: 100, marginBottom: 20,
              background: "rgba(37,99,235,.12)", border: "1px solid rgba(59,130,246,.28)",
            }}>
              <Sparkles size={12} style={{ color: "#60a5fa" }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#93c5fd" }}>
                AI-Powered Knowledge Base
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: "clamp(26px,5vw,42px)",
              letterSpacing: "-.03em", lineHeight: 1.1,
              marginBottom: 14,
              background: "linear-gradient(135deg,#f1f5f9 30%,#93c5fd 70%,#60a5fa 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              What would you like to know?
            </h1>
            <p style={{ fontSize: 15, color: "rgba(148,163,184,.7)", maxWidth: 460, margin: "0 auto", lineHeight: 1.65 }}>
              Browse our knowledge base or ask our multilingual AI Voice Counselor directly.
            </p>
          </div>

          {/* ── SEARCH BAR ── */}
          <div className="kb-fade" style={{ position: "relative", marginBottom: 28, animationDelay: ".12s" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 18px",
              background: "linear-gradient(145deg,rgba(255,255,255,.07),rgba(255,255,255,.025))",
              backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
              border: searchQuery ? "1px solid rgba(59,130,246,.6)" : "1px solid rgba(255,255,255,.1)",
              borderRadius: 16,
              boxShadow: searchQuery
                ? "0 0 0 3px rgba(37,99,235,.15), 0 8px 32px rgba(0,0,0,.4)"
                : "0 4px 24px rgba(0,0,0,.3)",
              transition: "all .3s ease",
            }}>
              <Search size={18} style={{ color: searchQuery ? "#60a5fa" : "rgba(148,163,184,.45)", flexShrink: 0, transition: "color .3s" }} />
              <input
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search questions — e.g. 'IELTS score for Edinburgh'…"
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  fontSize: 14, color: "#f1f5f9", fontFamily: "'DM Sans',sans-serif",
                }}
              />
              {searchQuery && (
                <button onClick={clearSearch} style={{
                  background: "rgba(255,255,255,.08)", border: "none", borderRadius: 6,
                  width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", flexShrink: 0, transition: "background .2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.16)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.08)"}
                >
                  <X size={13} style={{ color: "rgba(148,163,184,.7)" }} />
                </button>
              )}
            </div>
          </div>

          {/* ── CATEGORY PILLS ── */}
          <div className="kb-fade" style={{ marginBottom: 32, animationDelay: ".18s" }}>
            <div style={{
              display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4,
              scrollbarWidth: "none", msOverflowStyle: "none",
            }}>
              {CATEGORIES.map(({ id, label, icon: Icon }) => {
                const active = activeCategory === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleCategoryChange(id)}
                    className={`kb-pill${active ? " kb-pill-active" : ""}`}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 16px", borderRadius: 100, border: "1px solid rgba(255,255,255,.1)",
                      background: "rgba(255,255,255,.04)", cursor: "pointer",
                      fontSize: 12, fontWeight: active ? 600 : 500,
                      color: active ? "#93c5fd" : "rgba(148,163,184,.6)",
                      fontFamily: "'DM Sans',sans-serif",
                      whiteSpace: "nowrap", flexShrink: 0,
                    }}
                  >
                    <Icon size={13} style={{ color: active ? "#60a5fa" : "rgba(148,163,184,.45)" }} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── FAQ ACCORDION LIST ── */}
          <div className="kb-fade" style={{ animationDelay: ".24s" }}>
            {/* Result count */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: "rgba(148,163,184,.4)", fontWeight: 500 }}>
                {filtered.length} question{filtered.length !== 1 ? "s" : ""} found
                {searchQuery && <span> for "<span style={{ color: "#60a5fa" }}>{searchQuery}</span>"</span>}
              </span>
              {activeCategory !== "all" && (
                <span style={{
                  fontSize: 11, padding: "3px 10px", borderRadius: 100,
                  background: "rgba(37,99,235,.12)", border: "1px solid rgba(59,130,246,.25)",
                  color: "#93c5fd", fontWeight: 600,
                }}>
                  {activeCategory}
                </span>
              )}
            </div>

            {filtered.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "56px 24px",
                background: "rgba(255,255,255,.03)", borderRadius: 18,
                border: "1px solid rgba(255,255,255,.07)",
              }}>
                <Search size={36} style={{ color: "rgba(148,163,184,.2)", margin: "0 auto 16px" }} />
                <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(148,163,184,.5)", marginBottom: 8 }}>
                  No questions found
                </p>
                <p style={{ fontSize: 13, color: "rgba(148,163,184,.3)" }}>
                  Try a different search term or ask our AI Voice Counselor below.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.map(item => (
                  <AccordionItem
                    key={item.id}
                    item={item}
                    isOpen={openItem === item.id}
                    onToggle={() => setOpenItem(openItem === item.id ? null : item.id)}
                  />
                ))}
              </div>
            )}
          </div>


        </div>
      </div>
    </>
  );
}