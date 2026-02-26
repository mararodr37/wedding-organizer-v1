import { Resend } from "resend";
import { EMAIL_FROM, EMAIL_TO, EMAIL_REPLY_TO } from "@/lib/config/constants";
import { setLastEmailId } from "@/lib/redis";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendDailyCoachingEmail(
  subject: string,
  html: string
): Promise<string> {
  const { data, error } = await getResend().emails.send({
    from: EMAIL_FROM,
    to: EMAIL_TO,
    replyTo: EMAIL_REPLY_TO,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  const emailId = data?.id ?? "";
  if (emailId) {
    await setLastEmailId(emailId);
  }

  return emailId;
}

export async function sendReplyEmail(
  subject: string,
  html: string,
  inReplyTo?: string
): Promise<string> {
  const headers: Record<string, string> = {};
  if (inReplyTo) {
    headers["In-Reply-To"] = inReplyTo;
    headers["References"] = inReplyTo;
  }

  const { data, error } = await getResend().emails.send({
    from: EMAIL_FROM,
    to: EMAIL_TO,
    replyTo: EMAIL_REPLY_TO,
    subject,
    html,
    headers: Object.keys(headers).length > 0 ? headers : undefined,
  });

  if (error) {
    throw new Error(`Resend reply error: ${error.message}`);
  }

  return data?.id ?? "";
}
