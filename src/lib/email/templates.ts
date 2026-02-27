import type { WhoopDayData } from "@/types";

function recoveryColor(score: number): { bg: string; text: string; label: string } {
  if (score >= 67) return { bg: "#ecfdf5", text: "#065f46", label: "Green" };
  if (score >= 34) return { bg: "#fffbeb", text: "#92400e", label: "Yellow" };
  return { bg: "#fef2f2", text: "#991b1b", label: "Red" };
}

function buildWhoopCard(whoop: WhoopDayData): string {
  if (!whoop.recovery && !whoop.sleep) {
    return `
      <div style="padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 24px;">
        <p style="color: #6b7280; margin: 0;">Whoop data unavailable today.</p>
      </div>`;
  }

  const recovery = whoop.recovery;
  const color = recovery
    ? recoveryColor(recovery.recovery_score)
    : { bg: "#f9fafb", text: "#374151", label: "N/A" };

  return `
    <div style="padding: 16px; background: ${color.bg}; border-radius: 8px; margin-bottom: 24px; border: 1px solid ${color.bg};">
      <div style="display: flex; gap: 24px; flex-wrap: wrap;">
        ${
          recovery
            ? `<div>
            <span style="font-size: 12px; color: ${color.text}; text-transform: uppercase; letter-spacing: 0.05em;">Recovery</span>
            <div style="font-size: 24px; font-weight: 600; color: ${color.text};">${recovery.recovery_score}%</div>
          </div>
          <div>
            <span style="font-size: 12px; color: ${color.text}; text-transform: uppercase; letter-spacing: 0.05em;">HRV</span>
            <div style="font-size: 18px; font-weight: 500; color: ${color.text};">${recovery.hrv_rmssd_milli.toFixed(0)} ms</div>
          </div>
          <div>
            <span style="font-size: 12px; color: ${color.text}; text-transform: uppercase; letter-spacing: 0.05em;">Resting HR</span>
            <div style="font-size: 18px; font-weight: 500; color: ${color.text};">${recovery.resting_heart_rate} bpm</div>
          </div>`
            : ""
        }
        ${
          whoop.sleep
            ? `<div>
            <span style="font-size: 12px; color: ${color.text}; text-transform: uppercase; letter-spacing: 0.05em;">Sleep</span>
            <div style="font-size: 18px; font-weight: 500; color: ${color.text};">${whoop.sleep.totalSleepHours}h</div>
          </div>`
            : ""
        }
        ${
          whoop.strain !== null
            ? `<div>
            <span style="font-size: 12px; color: ${color.text}; text-transform: uppercase; letter-spacing: 0.05em;">Strain</span>
            <div style="font-size: 18px; font-weight: 500; color: ${color.text};">${whoop.strain.toFixed(1)}</div>
          </div>`
            : ""
        }
      </div>
    </div>`;
}

function markdownToHtml(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, '<h3 style="margin: 16px 0 8px; font-size: 16px; color: #111827;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="margin: 20px 0 8px; font-size: 18px; color: #111827;">$1</h2>')
    .replace(/^- (.+)$/gm, '<li style="margin: 4px 0; color: #374151;">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul style="padding-left: 20px; margin: 8px 0;">$&</ul>')
    .replace(/\n{2,}/g, '</p><p style="margin: 8px 0; color: #374151; line-height: 1.6;">')
    .replace(/\n/g, "<br>");
}

export function buildDailyEmailHtml(
  weekNumber: number,
  dayOfWeek: string,
  whoop: WhoopDayData,
  coachingContent: string
): string {
  const whoopCard = buildWhoopCard(whoop);
  const contentHtml = markdownToHtml(coachingContent);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 32px 20px;">
    <div style="margin-bottom: 24px;">
      <span style="font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em;">
        Week ${weekNumber} &middot; ${dayOfWeek}
      </span>
    </div>

    ${whoopCard}

    <div style="color: #374151; line-height: 1.6;">
      <p style="margin: 8px 0; color: #374151; line-height: 1.6;">
        ${contentHtml}
      </p>
    </div>

    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 13px; color: #9ca3af; margin: 0;">
        Reply to this email to let me know how you're feeling.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function buildReplyEmailHtml(content: string): string {
  const contentHtml = markdownToHtml(content);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 32px 20px;">
    <div style="color: #374151; line-height: 1.6;">
      <p style="margin: 8px 0; color: #374151; line-height: 1.6;">
        ${contentHtml}
      </p>
    </div>
  </div>
</body>
</html>`;
}
