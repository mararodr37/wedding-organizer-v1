export const EMAIL_FROM = process.env.EMAIL_FROM ?? "coach@yourdomain.com";
export const EMAIL_TO = process.env.EMAIL_TO ?? "";
export const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO ?? "";
export const APP_URL = process.env.APP_URL ?? "https://wedding-organizer-v1-h5on.vercel.app";
export const PROGRAM_START_DATE = process.env.PROGRAM_START_DATE ?? "2026-03-01";
export const CRON_SECRET = process.env.CRON_SECRET ?? "";

export const WHOOP_AUTH_URL =
  "https://api.prod.whoop.com/oauth/oauth2/auth";
export const WHOOP_TOKEN_URL =
  "https://api.prod.whoop.com/oauth/oauth2/token";
export const WHOOP_API_BASE =
  "https://api.prod.whoop.com/developer/v1";
export const WHOOP_SCOPES =
  "read:recovery read:cycles read:sleep read:profile read:body_measurement offline";
