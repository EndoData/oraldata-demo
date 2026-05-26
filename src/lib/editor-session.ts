import { createHmac, timingSafeEqual } from "node:crypto";

export const EDITOR_SESSION_COOKIE = "oraldata_editor_session";
export const EDITOR_MARKER_COOKIE = "oraldata_editor_active";
export const EDITOR_SESSION_MAX_AGE = 60 * 60 * 4; // 4h

function getSecret(): string {
  const secret = process.env.EDIT_TOKEN;
  if (!secret) throw new Error("EDIT_TOKEN env var not set");
  return secret;
}

export function signEditorSession(): string {
  const expiresAt = Date.now() + EDITOR_SESSION_MAX_AGE * 1000;
  const hmac = createHmac("sha256", getSecret())
    .update(String(expiresAt))
    .digest("hex");
  return `${expiresAt}.${hmac}`;
}

export function verifyEditorSession(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  const [expiresAtStr, hmac] = cookieValue.split(".");
  if (!expiresAtStr || !hmac) return false;
  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  const expected = createHmac("sha256", getSecret())
    .update(expiresAtStr)
    .digest("hex");
  const a = Buffer.from(hmac, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
