/**
 * OffShift — AI Provider (NVIDIA NIM API)
 * Uses NVIDIA's OpenAI-compatible endpoint for:
 *   1. Dynamic Hindi pricing explanations
 *   2. Structured fraud detection reasoning
 */

const NVIDIA_API = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL = "meta/llama-3.1-70b-instruct";

async function nvidiaChat(
  messages: { role: string; content: string }[],
  maxTokens = 256
): Promise<string> {
  const key = process.env.NVIDIA_API_KEY;
  if (!key) {
    throw new Error("Missing NVIDIA_API_KEY");
  }

  const res = await fetch(NVIDIA_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
      top_p: 0.9,
    }),
  });

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string };
  };

  if (!res.ok) {
    throw new Error(data.error?.message ?? `NVIDIA API error (${res.status})`);
  }

  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

// ─── Hindi Premium Explanation ──────────────────────────────────────────────

export async function generateHindiPremiumExplanation(params: {
  zoneLabel: string;
  shiftLabel: string;
  kavachScore: number;
  finalPremium: number;
  coverageLabel: string;
}): Promise<string> {
  try {
    const text = await nvidiaChat([
      {
        role: "system",
        content:
          "तुम OffShift के लिए साधारण हिंदी लेखक हो। ठीक दो वाक्य देवनागरी में लिखो (कोई अंग्रेज़ी नहीं, सिर्फ़ Kavach Score और ₹ चिह्न रहने दो)। 'बारिश' के अलावा 'बाढ़' (Flood) और 'तूफ़ान' (Storm) जैसे शब्दों का उचित उपयोग करें जब ज़रूरत हो।",
      },
      {
        role: "user",
        content: `Generate a 2-sentence plain Hindi explanation (Devanagari) for a delivery rider.
Their Kavach Score is ${params.kavachScore}. Zone: ${params.zoneLabel}. Shift: ${params.shiftLabel}.
Coverage: ${params.coverageLabel}. Premium: ₹${params.finalPremium}.
Format: "आपका Kavach Score X है क्योंकि..." First sentence explains the score and zone/shift reason. Second sentence states the price.`,
      },
    ]);

    if (text) return text;
  } catch (e) {
    console.error("NVIDIA Hindi explanation error:", e);
  }

  // Fallback if API fails
  return `आपका Kavach Score ${params.kavachScore} है — ${params.zoneLabel} ज़ोन और ${params.shiftLabel} शिफ्ट के हिसाब से। आपका प्रीमियम ₹${params.finalPremium} है।`;
}

// ─── Fraud Detection ────────────────────────────────────────────────────────

export type FraudAssessment = {
  fraud_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  red_flags: string[];
  recommendation: "APPROVE" | "MANUAL_REVIEW" | "REJECT";
  reasoning: string;
};

export async function runFraudDetection(
  payload: Record<string, unknown>
): Promise<FraudAssessment> {
  let raw: string;
  try {
    raw = await nvidiaChat(
      [
        {
          role: "system",
          content: `You are OffShift's fraud detection AI for parametric insurance claims.
Analyze the claim data and return ONLY valid JSON with these exact keys:
- fraud_score: number 0-100
- risk_level: "LOW" | "MEDIUM" | "HIGH"
- red_flags: array of specific concern strings
- recommendation: "APPROVE" | "MANUAL_REVIEW" | "REJECT"
- reasoning: 1-2 sentence explanation
No markdown, no prose outside JSON. Only output the JSON object.`,
        },
        {
          role: "user",
          content: JSON.stringify(payload),
        },
      ],
      512
    );
  } catch (e) {
    console.error("NVIDIA fraud detection error:", e);
    return {
      fraud_score: 40,
      risk_level: "MEDIUM",
      red_flags: ["AI engine unavailable — manual review"],
      recommendation: "MANUAL_REVIEW",
      reasoning: "Fallback assessment — AI provider returned an error.",
    };
  }

  let parsed: Partial<FraudAssessment>;
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(
      jsonMatch ? jsonMatch[0] : raw
    ) as Partial<FraudAssessment>;
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
