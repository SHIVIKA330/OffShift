import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-20250514";

export function getAnthropicClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("Missing ANTHROPIC_API_KEY");
  }
  return new Anthropic({ apiKey: key });
}

export async function generateHindiPremiumExplanation(params: {
  zoneLabel: string;
  shiftLabel: string;
  kavachScore: number;
  finalPremium: number;
  coverageLabel: string;
}): Promise<string> {
  const client = getAnthropicClient();
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `तुम OffShift के लिए साधारण हिंदी लेखक हो। ठीक दो वाक्य देवनागरी में लिखो (कोई अंग्रेज़ी नहीं)।
ज़ोन: ${params.zoneLabel}
शिफ्ट: ${params.shiftLabel}
Kavach Score: ${params.kavachScore}
प्रीमियम (₹): ${params.finalPremium}
कवरेज: ${params.coverageLabel}
पहले वाक्य में स्कोर और ज़ोन/शिफ्ट का कारण बताओ; दूसरे में कीमत।`,
      },
    ],
  });
  const text = msg.content.find((b) => b.type === "text");
  if (text && text.type === "text") return text.text.trim();
  return `आपका Kavach Score ${params.kavachScore} है — ${params.zoneLabel} ज़ोन और ${params.shiftLabel} शिफ्ट के हिसाब से। आपका प्रीमियम ₹${params.finalPremium} है।`;
}

export type FraudAssessment = {
  fraud_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  red_flags: string[];
  recommendation: "APPROVE" | "MANUAL_REVIEW" | "REJECT";
  reasoning: string;
};

export async function runFraudDetection(payload: Record<string, unknown>): Promise<FraudAssessment> {
  const client = getAnthropicClient();
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    system:
      "You are OffShift's fraud detection AI for parametric insurance claims. Analyze the claim data and return ONLY valid JSON with keys: fraud_score (0-100 number), risk_level (LOW|MEDIUM|HIGH), red_flags (array of strings), recommendation (APPROVE|MANUAL_REVIEW|REJECT), reasoning (short string). No markdown, no prose outside JSON.",
    messages: [
      {
        role: "user",
        content: JSON.stringify(payload),
      },
    ],
  });
  const text = msg.content.find((b) => b.type === "text");
  const raw = text && text.type === "text" ? text.text.trim() : "{}";
  let parsed: Partial<FraudAssessment>;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw) as Partial<FraudAssessment>;
  } catch {
    parsed = {};
  }
  const fraud_score = Math.min(
    100,
    Math.max(0, Number(parsed.fraud_score ?? 50))
  );
  const risk_level =
    parsed.risk_level === "LOW" ||
    parsed.risk_level === "MEDIUM" ||
    parsed.risk_level === "HIGH"
      ? parsed.risk_level
      : fraud_score < 30
        ? "LOW"
        : fraud_score < 60
          ? "MEDIUM"
          : "HIGH";
  const recommendation =
    parsed.recommendation === "APPROVE" ||
    parsed.recommendation === "MANUAL_REVIEW" ||
    parsed.recommendation === "REJECT"
      ? parsed.recommendation
      : fraud_score < 30
        ? "APPROVE"
        : fraud_score <= 60
          ? "MANUAL_REVIEW"
          : "REJECT";
  return {
    fraud_score,
    risk_level,
    red_flags: Array.isArray(parsed.red_flags)
      ? (parsed.red_flags as string[])
      : [],
    recommendation,
    reasoning:
      typeof parsed.reasoning === "string"
        ? parsed.reasoning
        : "Automated assessment.",
  };
}
