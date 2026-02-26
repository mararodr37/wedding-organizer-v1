import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "./system-prompt";
import { formatContextForPrompt } from "./context";
import type { CoachingContext } from "@/types";

const anthropic = new Anthropic();

export async function generateDailyCoaching(
  context: CoachingContext
): Promise<string> {
  const systemPrompt = buildSystemPrompt();
  const userMessage = formatContextForPrompt(context);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Here is today's data. Please generate the daily coaching email.\n\n${userMessage}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return textBlock.text;
}

export async function generateReplyResponse(
  originalCoaching: string,
  userReply: string,
  todayContext: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    system: `You are Coach M, Mara's fitness coach. You are replying to a follow-up message from her about today's coaching email. Be concise, direct, warm, and helpful. Keep your response under 150 words. No emojis.`,
    messages: [
      {
        role: "user",
        content: `Today's coaching context:\n${todayContext}\n\nOriginal coaching email sent today:\n${originalCoaching}\n\nMara's reply:\n"${userReply}"\n\nPlease respond to her message.`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return textBlock.text;
}
