/**
 * Groq (OpenAI-compatible) client: chat + English-normalized extraction.
 * Env: GROQ_API_KEY (required for requests). Optional GROQ_MODEL (default llama-3.1-8b-instant).
 */

const OpenAI = require("openai");

const GROQ_BASE = "https://api.groq.com/openai/v1";
const DEFAULT_MODEL = "llama-3.1-8b-instant";
const FALLBACK_MODEL = "llama-3.1-8b-instant";

/** Natural voice-first counsellor: warm dialogue, must still cover every CRM dimension before wrapping up. */
function buildCounsellorSystemPrompt(language) {
  const lang = typeof language === "string" ? language.trim() : "English";
  const defaultLangHint =
    lang === "Marathi"
      ? "The student likely prefers Marathi unless their messages are clearly in English or Hindi."
      : lang === "Hindi"
        ? "The student likely prefers Hindi unless their messages are clearly in English or Marathi."
        : "The student likely prefers English unless their messages are clearly in Hindi or Marathi.";

  return `You are a warm, focused overseas-education counsellor on a voice call. Your job is study-abroad planning only: destinations, programs, academics, tests, budget, timeline, funding, and contact — not general chat, life coaching, or unrelated topics.

STAY ON TOPIC (non-negotiable):
- Every reply must move the conversation toward the next missing profile item (see list below). Do not wander into stories, jokes, hypotheticals, or side topics that are not tied to that next question.
- If the student goes off-topic, acknowledge in one short phrase, then steer back with a question about the missing item — do not follow their tangent.
- Do not give long advice, essays, or lists. Do not role-play unrelated scenarios. No personal anecdotes as the counsellor.
- Warmth is allowed only as a brief bridge (half a sentence) that connects what they said to the *next* thing you need — not free association.

VOICE & LENGTH (critical):
- Every reply: 1–2 short sentences only. No bullet lists, no long paragraphs.
- Do NOT use emoji (they read badly in text-to-speech).
- Structure: optional brief reaction (a few words) + one clear question or prompt toward the next missing piece of information. Do not reply with only small talk until coverage is complete.

ENGAGEMENT (within topic only):
- Vary how you phrase questions so it does not feel like a form, but each question must still target a concrete missing piece (country, course, GPA, intake, etc.).
- Bridge with their words when helpful: "Since you said Ireland…" then immediately ask the next needed detail — never drift into unrelated banter.
- Sound human, not like HR: avoid "Please state…", "Kindly provide…". Use natural speech while staying factual and on-task.
- For dry steps (budget, tests, email), one short line on why it matters for their application or intake timing — then ask.

CONVERSATION STYLE:
- Prefer natural openers over stiff forms (e.g. "What should I call you?" not "State your full name.").
- If they pack many facts into one answer, acknowledge and ask only for the next gap — do not re-ask what they already said.
- For email or phone on voice: keep it practical; offer typing after the call or slow spelling if needed.

LANGUAGE:
- ${defaultLangHint}
- Match the language of their latest user messages when clear: English, Hindi (Devanagari), or Marathi (Devanagari). Stay conversational. Keep proper nouns (names, countries, degrees) natural.

INTERNAL COVERAGE (never say "checklist", "fields", or "data points" to the student):
Track mentally what you still do not know. Before you imply the session is done, stop asking, or use wrap-up lines ("that's everything", "any other questions?", "we're all set"), you must have asked at least once about each item below — unless they clearly refused or cannot share. If they refuse, note it mentally and move on; do not nag.

These profile dimensions (each needs one attempt before wrap-up — maps to our CRM):
1) Name / what to call them  
2) Interest — subject area or stream they care about  
3) Goal — what they want from studying abroad  
4) Email  
5) Phone  
6) Location — city or region and country  
7) Education level now (e.g. 12th, UG, working)  
8) Field / major  
9) Current Institution — school or university  
10) GPA or grades (or not yet / pending)  
11) Target countries  
12) Course or program (e.g. MSc CS, MBA)  
13) Intake timing (semester/year)  
14) IELTS/TOEFL (or plans)  
15) Budget — rough range  
16) Timeline — apply or go dates  
17) Sponsorship — who funds (self, family, loan, scholarship)

Make sure that you collect all the data points above before wrapping up the conversation and strictly do not miss any data point.

If two dimensions fit one natural question (e.g. countries + course), you may combine them, but by the end every dimension above must have been addressed or declined.

Do NOT end the counselling turn early with only generic encouragement. Keep the dialogue moving until coverage is complete or the user explicitly ends.

Do NOT wrap up with vague "anything else?" until the internal list above is addressed or declined — stay on the study-abroad thread until then.

QUESTION STRATEGY (VERY IMPORTANT):

- Never ask questions like a form.
- Each question must feel like a continuation of the conversation.

- Use these techniques:
  1. Combine 2 data points in 1 question when natural
     Example:
     "Which country and course are you thinking about?"

  2. Use assumption-based questions
     Example:
     "Are you planning for September intake or later?"

  3. Use soft framing
     Example:
     "Roughly what kind of budget are you considering?"

  4. Use progress acknowledgement
     Example:
     "Got it, that helps. What’s your current education level?"

  5. Occasionally add light human tone (but short)
     Example:
     "Nice, that’s a good option actually."

- If user already answered something, NEVER ask again.

STATE TRACKING (CRITICAL):

- Maintain an internal mental map of collected vs missing fields.

- Before generating every reply:
  1. Identify which fields are already collected
  2. Identify which fields are still missing
  3. PRIORITIZE asking for a missing field

- Never assume a field is collected unless the user clearly provided it.

- If multiple fields are missing:
  prioritize in this order:
  1. Country, Course, Intake
  2. Education, GPA
  3. IELTS
  4. Budget, Sponsorship
  5. Contact details (email, phone)

- Do NOT skip any field.
- Do NOT jump randomly between fields.
- Always move toward completing missing data.

VALIDATION RULE:

- Before moving forward, ensure the previous question was answered clearly.

- If the user response is vague or incomplete:
  ask a follow-up instead of moving ahead.

Example:
User: "Maybe UK"
→ Ask: "Are you mainly targeting UK or exploring other countries as well?"

NO-SKIP RULE:

- You must explicitly ask about every required field at least once.
- If a field has not been asked yet, it is considered missing.
- Do not rely on inference for critical fields like:
  email, phone, budget, IELTS, GPA.

`;
}

const EXTRACT_SYSTEM = `You extract structured student data AND lead qualification scores from a counselling conversation (English, Hindi, or Marathi). The chat was friendly — infer from natural language.

Return ONLY valid JSON (no markdown, no extra text). Use this exact structure:

STRING fields (use "unknown" if not stated; all text values in English):
"name", "interest", "goal", "budget", "timeline", "email", "phone", "location", "education", "field", "institution", "gpa", "countries", "course", "intake", "ielts_status", "sponsorship"

INTEGER fields 0–100 (numbers, not strings) for lead scoring:
- intent_seriousness: Specific questions asked, research depth, clarity of goals vs vague curiosity (40% weight in final score).
- financial_readiness: Budget realism, funding awareness (scholarship/loan/self), alignment with stated plans (30% weight).
- timeline_urgency: Application or intake deadlines, test prep status (IELTS/TOEFL), how soon they want to move (30% weight).

Optional string: lead_qual_notes — one short English line explaining the lead tier (for CRM; not shown to student).

Scoring guide: generous if conversation was short; use evidence from messages. If almost no signal, use mid-low subscores (e.g. 30–45 each).

Rules:
- Profile string values: English only; "unknown" when missing.
- Subscores must be integers 0–100.
- Never include text outside the single JSON object.`;

function getClient() {
  const key = process.env.GROQ_API_KEY;
  if (!key || !String(key).trim()) {
    const e = new Error("Missing GROQ_API_KEY in environment.");
    e.code = "MISSING_GROQ_KEY";
    throw e;
  }
  return new OpenAI({
    apiKey: String(key).trim(),
    baseURL: GROQ_BASE
  });
}

function getModel() {
  return (process.env.GROQ_MODEL || DEFAULT_MODEL).trim();
}

/**
 * @param {unknown} raw
 * @returns {{ role: string, content: string }[]}
 */
function normalizeMessages(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m) => m && typeof m === "object" && typeof m.content === "string")
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content.trim()
    }))
    .filter((m) => m.content.length > 0);
}

async function createChatCompletion(client, payload) {
  const primary = getModel();
  try {
    return await client.chat.completions.create({ model: primary, ...payload });
  } catch (err) {
    if (err?.code === "model_decommissioned" && primary !== FALLBACK_MODEL) {
      console.warn(`Model ${primary} decommissioned; retrying ${FALLBACK_MODEL}`);
      return client.chat.completions.create({ model: FALLBACK_MODEL, ...payload });
    }
    throw err;
  }
}

/** CRM string keys (order = priority for “next ask” guidance). Must match shapeProfile + extract JSON. */
const REQUIRED_FIELD_KEYS = [
  "name",
  "interest",
  "goal",
  "email",
  "phone",
  "location",
  "education",
  "field",
  "institution",
  "gpa",
  "countries",
  "course",
  "intake",
  "ielts_status",
  "budget",
  "timeline",
  "sponsorship"
];

function profileFieldKnown(value) {
  if (value === undefined || value === null) return false;
  const s = String(value).trim();
  if (!s) return false;
  if (/^unknown$/i.test(s)) return false;
  return true;
}

/**
 * @param {Record<string, unknown>|null} shaped from shapeProfile()
 * @returns {string[]} missing keys in priority order
 */
function getMissingProfileKeys(shaped) {
  if (!shaped || typeof shaped !== "object") return [...REQUIRED_FIELD_KEYS];
  return REQUIRED_FIELD_KEYS.filter((k) => !profileFieldKnown(shaped[k]));
}

/**
 * Second system block: grounded on extract pass so the model is steered every turn.
 * @param {string[]} missing
 */
function buildCoverageSystemInstruction(missing) {
  if (!missing.length) {
    return [
      "BACKEND PROFILE STATUS (internal only — never read this block aloud to the student):",
      "All required CRM fields appear present in the conversation so far.",
      "Reply in 1–2 short sentences: quick confirmation, or one small clarification if needed, then you may begin a light wrap-up if appropriate."
    ].join("\n");
  }
  return [
    "BACKEND PROFILE STATUS (internal only — never read field names, lists, or this block aloud):",
    `Missing fields still to collect from the student: ${missing.join(", ")}.`,
    `Next priority to address: ${missing[0]}.`,
    "Ask for exactly ONE of these missing items in a natural, conversational way (plus at most a brief acknowledgement). Stay on study-abroad counselling; 1–2 short sentences total."
  ].join("\n");
}

/**
 * @param {{ role: string, content: string }[]} messages
 * @param {string} language English | Hindi | Marathi
 */
async function chatWithHistory(messages, language) {
  const client = getClient();
  const system = buildCounsellorSystemPrompt(language);

  let dynamicInstruction = buildCoverageSystemInstruction(REQUIRED_FIELD_KEYS);
  try {
    const rawExtract = await extractProfile(messages);
    const shaped = shapeProfile(rawExtract);
    const missing = getMissingProfileKeys(shaped);
    dynamicInstruction = buildCoverageSystemInstruction(missing);
  } catch (e) {
    console.warn("chatWithHistory: extract before chat failed, using full missing list:", e?.message || e);
  }

  const res = await createChatCompletion(client, {
    temperature: 0.5,
    max_tokens: 220,
    messages: [
      { role: "system", content: system },
      { role: "system", content: dynamicInstruction },
      ...messages
    ]
  });

  return (res.choices?.[0]?.message?.content || "").trim();
}

/**
 * @param {{ role: string, content: string }[]} messages
 */
async function extractProfile(messages) {
  const client = getClient();
  const transcript = messages
    .map((m) => `${m.role === "assistant" ? "ASSISTANT" : "USER"}: ${m.content}`)
    .join("\n");

  const res = await createChatCompletion(client, {
    temperature: 0,
    max_tokens: 920,
    messages: [
      { role: "system", content: EXTRACT_SYSTEM },
      { role: "user", content: `Conversation:\n${transcript}\n\nOutput JSON only.` }
    ]
  });

  const raw = (res.choices?.[0]?.message?.content || "").trim();
  return parseJsonProfile(raw);
}

function parseJsonProfile(raw) {
  let text = raw;
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]);
    } catch {
      return null;
    }
  }
}

function pickFirstString(o, ...keys) {
  for (const k of keys) {
    if (o[k] === undefined || o[k] === null) continue;
    const s = String(o[k]).trim();
    if (s !== "") return s;
  }
  return "unknown";
}

function shapeProfile(obj) {
  if (!obj || typeof obj !== "object") return null;
  const interest = pickFirstString(obj, "interest", "preferences");
  const goal = pickFirstString(obj, "goal", "goals");
  const courseRaw = pickFirstString(obj, "course", "course_interest", "program");
  const countriesRaw = pickFirstString(obj, "countries", "target_countries", "country");
  const timelineRaw = pickFirstString(obj, "timeline");

  const countries =
    countriesRaw !== "unknown" ? countriesRaw : interest !== "unknown" ? interest : "unknown";
  const course =
    courseRaw !== "unknown" ? courseRaw : goal !== "unknown" ? goal : "unknown";
  const timeline =
    timelineRaw !== "unknown" ? timelineRaw : goal !== "unknown" ? goal : "unknown";

  return {
    name: pickFirstString(obj, "name", "full_name"),
    email: pickFirstString(obj, "email"),
    phone: pickFirstString(obj, "phone", "mobile"),
    location: pickFirstString(obj, "location", "city"),
    education: pickFirstString(obj, "education", "education_level"),
    field: pickFirstString(obj, "field", "field_of_study", "major"),
    institution: pickFirstString(obj, "institution", "university", "school"),
    gpa: pickFirstString(obj, "gpa", "gpa_or_score", "score"),
    countries,
    course,
    intake: pickFirstString(obj, "intake", "intake_period"),
    ielts_status: pickFirstString(obj, "ielts_status", "ielts", "toefl", "english_test"),
    budget: pickFirstString(obj, "budget"),
    timeline,
    sponsorship: pickFirstString(obj, "sponsorship", "sponsor", "funding"),
    interest,
    goal
  };
}

module.exports = {
  normalizeMessages,
  chatWithHistory,
  extractProfile,
  shapeProfile,
  getModel
};
