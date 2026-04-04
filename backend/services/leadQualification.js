/**
 * Lead qualification: weighted 0–100 score and Hot / Warm / Cold tier.
 * Weights: Intent 40%, Financial 30%, Timeline 30%.
 */

const WEIGHTS = {
  intent: 0.4,
  financial: 0.3,
  timeline: 0.3
};

function clampSubscore(value, fallback = 35) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Build qualification object from LLM-parsed extract (may include intent_seriousness, etc.).
 * @param {Record<string, unknown>|null} parsed
 */
function buildLeadQualification(parsed) {
  const intent = clampSubscore(parsed?.intent_seriousness ?? parsed?.intentSeriousness);
  const financial = clampSubscore(parsed?.financial_readiness ?? parsed?.financialReadiness);
  const timeline = clampSubscore(parsed?.timeline_urgency ?? parsed?.timelineUrgency);

  const composite = Math.round(
    WEIGHTS.intent * intent + WEIGHTS.financial * financial + WEIGHTS.timeline * timeline
  );
  const score = Math.max(0, Math.min(100, composite));

  let classification;
  let followUp;
  if (score >= 70) {
    classification = "hot";
    followUp = "Immediate callback recommended";
  } else if (score >= 40) {
    classification = "warm";
    followUp = "Follow up within 24 hours";
  } else {
    classification = "cold";
    followUp = "Nurture campaign";
  }

  const notes =
    typeof parsed?.lead_qual_notes === "string"
      ? parsed.lead_qual_notes.trim()
      : typeof parsed?.leadQualNotes === "string"
        ? parsed.leadQualNotes.trim()
        : "";

  return {
    score,
    weights: { ...WEIGHTS },
    intentSeriousness: intent,
    financialReadiness: financial,
    timelineUrgency: timeline,
    classification,
    followUp,
    notes
  };
}

module.exports = {
  WEIGHTS,
  buildLeadQualification,
  clampSubscore
};
