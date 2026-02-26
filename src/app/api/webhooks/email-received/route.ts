import { NextRequest, NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  cleanReplyText,
  shouldAgentReply,
} from "@/lib/email/receive";
import { addReply, getDailyLog, getLastEmailId } from "@/lib/redis";
import { generateReplyResponse } from "@/lib/ai/coach";
import { formatContextForPrompt, buildDailyContext } from "@/lib/ai/context";
import { buildReplyEmailHtml } from "@/lib/email/templates";
import { sendReplyEmail } from "@/lib/email/send";
import type { UserReply } from "@/types";

export async function POST(request: NextRequest) {
  const body = await request.text();

  // Verify webhook signature
  let payload;
  try {
    payload = verifyWebhookSignature(body, {
      "svix-id": request.headers.get("svix-id") ?? "",
      "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
      "svix-signature": request.headers.get("svix-signature") ?? "",
    });
  } catch {
    console.error("Webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Only process email.received events
  if (payload.type !== "email.received") {
    return NextResponse.json({ ignored: true });
  }

  const { subject, text } = payload.data;
  const rawText = text ?? "";
  const cleanedText = cleanReplyText(rawText);

  if (!cleanedText) {
    return NextResponse.json({ stored: false, reason: "empty reply" });
  }

  const today = new Date().toISOString().split("T")[0];

  // Store the reply
  const reply: UserReply = {
    text: cleanedText,
    receivedAt: new Date().toISOString(),
    rawSubject: subject ?? "",
  };
  await addReply(today, reply);

  // Determine if we should reply immediately
  if (shouldAgentReply(cleanedText)) {
    try {
      const dailyLog = await getDailyLog(today);
      const originalCoaching = dailyLog?.coachingResponse ?? "";

      // Build minimal context for the reply
      const whoopData = dailyLog?.whoopData ?? {
        recovery: null,
        sleep: null,
        strain: null,
      };
      const context = await buildDailyContext(new Date(), whoopData);
      const contextStr = formatContextForPrompt(context);

      // Generate reply via Claude
      const replyContent = await generateReplyResponse(
        originalCoaching,
        cleanedText,
        contextStr
      );

      // Send reply email in the same thread
      const lastEmailId = await getLastEmailId();
      const replySubject = subject?.startsWith("Re:")
        ? subject
        : `Re: ${subject ?? "Your coaching update"}`;

      const html = buildReplyEmailHtml(replyContent);
      await sendReplyEmail(replySubject, html, lastEmailId ?? undefined);

      // Store the agent's reply too
      const agentReply: UserReply = {
        text: replyContent,
        receivedAt: new Date().toISOString(),
        rawSubject: replySubject,
        isAgentReply: true,
      };
      await addReply(today, agentReply);

      return NextResponse.json({
        stored: true,
        replied: true,
      });
    } catch (error) {
      console.error("Error generating reply:", error);
      // Still return 200 — the reply was stored, just couldn't auto-reply
      return NextResponse.json({
        stored: true,
        replied: false,
        error: "Failed to generate auto-reply",
      });
    }
  }

  return NextResponse.json({ stored: true, replied: false });
}
