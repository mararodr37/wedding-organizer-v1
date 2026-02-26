import { Webhook } from "svix";

interface ResendInboundPayload {
  type: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    text?: string;
    html?: string;
    created_at: string;
  };
}

export function verifyWebhookSignature(
  payload: string,
  headers: {
    "svix-id": string;
    "svix-timestamp": string;
    "svix-signature": string;
  }
): ResendInboundPayload {
  const wh = new Webhook(process.env.RESEND_WEBHOOK_SECRET!);
  return wh.verify(payload, headers) as ResendInboundPayload;
}

export function cleanReplyText(text: string): string {
  const lines = text.split("\n");
  const cleaned: string[] = [];

  for (const line of lines) {
    // Stop at quoted content
    if (line.startsWith(">")) break;
    if (/^On .+ wrote:$/i.test(line.trim())) break;
    if (/^-{2,}$/.test(line.trim())) break; // signature delimiter
    if (/^Sent from my/i.test(line.trim())) break;
    if (/^Get Outlook/i.test(line.trim())) break;

    cleaned.push(line);
  }

  return cleaned.join("\n").trim();
}

const QUESTION_KEYWORDS = [
  "what should",
  "how many",
  "how much",
  "can i",
  "should i",
  "help",
  "substitute",
  "instead of",
  "alternative",
  "modify",
  "change",
  "adjust",
  "skip",
  "swap",
];

export function shouldAgentReply(replyText: string): boolean {
  const lower = replyText.toLowerCase();

  // Contains a question
  if (replyText.includes("?")) return true;

  // Contains question-like keywords
  if (QUESTION_KEYWORDS.some((kw) => lower.includes(kw))) return true;

  // Long detailed feedback (over 100 chars) warrants acknowledgment
  if (replyText.length > 100) return true;

  return false;
}
