import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const { question, workerName, tier, policyStatus, language } = await req.json();

  const langInstruction = language === 'hi'
    ? 'Reply ONLY in simple Hindi (Devanagari script). Use words a delivery rider knows.'
    : 'Reply in simple conversational English. Use words a delivery rider understands.';

  const systemPrompt = `You are OffShift's helpful voice assistant for gig delivery workers in India.
The worker's name is ${workerName}. They are on the ${tier} tier. Policy status: ${policyStatus}.
${langInstruction}
Keep answers under 3 sentences. Be warm and direct. Never use insurance jargon.
You can answer questions about: how OffShift works, when they get paid, what triggers payouts, 
how to renew, what their tier means, how much they get paid, fraud policy, and general help.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    system: systemPrompt,
    messages: [{ role: 'user', content: question }],
  });

  const answer = response.content[0].type === 'text' ? response.content[0].text : 'I could not answer that.';
  return NextResponse.json({ answer });
}
