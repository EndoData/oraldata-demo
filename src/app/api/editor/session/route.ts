import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  EDITOR_MARKER_COOKIE,
  EDITOR_SESSION_COOKIE,
  EDITOR_SESSION_MAX_AGE,
  signEditorSession,
} from "@/lib/editor-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const expected = process.env.EDIT_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: "Editor is not configured (EDIT_TOKEN missing)" },
      { status: 500 },
    );
  }

  const body = (await req.json().catch(() => null)) as { token?: string } | null;
  if (!body || body.token !== expected) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  const c = await cookies();
  const value = signEditorSession();
  const baseOpts = {
    secure: true,
    sameSite: "strict" as const,
    maxAge: EDITOR_SESSION_MAX_AGE,
    path: "/",
  };
  c.set(EDITOR_SESSION_COOKIE, value, { ...baseOpts, httpOnly: true });
  c.set(EDITOR_MARKER_COOKIE, "1", { ...baseOpts, httpOnly: false });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const c = await cookies();
  c.delete(EDITOR_SESSION_COOKIE);
  c.delete(EDITOR_MARKER_COOKIE);
  return NextResponse.json({ ok: true });
}
