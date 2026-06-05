import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import sharp from "sharp";
import {
  EDITOR_SESSION_COOKIE,
  verifyEditorSession,
} from "@/lib/editor-session";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB raw
const MAX_DIM = 1200;
const WEBP_QUALITY = 85;

function getEnv(key: string): string | null {
  const v = process.env[key];
  return v && v.length > 0 ? v : null;
}

export async function POST(req: Request) {
  const editToken = getEnv("EDIT_TOKEN");
  const ghToken = getEnv("GITHUB_TOKEN");
  const owner = getEnv("GITHUB_OWNER");
  const repo = getEnv("GITHUB_REPO");
  const branch = getEnv("GITHUB_BRANCH") ?? "main";

  if (!editToken || !ghToken || !owner || !repo) {
    return NextResponse.json(
      { error: "Server is missing required env (EDIT_TOKEN, GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO)" },
      { status: 500 },
    );
  }

  const c = await cookies();
  const session = c.get(EDITOR_SESSION_COOKIE)?.value;
  if (!verifyEditorSession(session)) {
    return NextResponse.json(
      { error: "Unauthorized — editor session missing or expired" },
      { status: 401 },
    );
  }

  const ip = getClientIp(req);
  const limit = rateLimit(`upload-image:${ip}`, {
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Trop d'envois. Réessayez plus tard." },
      { status: 429 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart body" }, { status: 400 });
  }

  const file = formData.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing 'image' file field" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Le fichier n'est pas une image" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image trop volumineuse (max 5 Mo)" },
      { status: 413 },
    );
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  let webpBuffer: Buffer;
  try {
    webpBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({ width: MAX_DIM, height: MAX_DIM, fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  } catch {
    return NextResponse.json(
      { error: "Image illisible ou corrompue" },
      { status: 400 },
    );
  }

  const hash = createHash("sha256").update(webpBuffer).digest("hex").slice(0, 16);
  const filePath = `public/uploads/${hash}.webp`;
  const publicPath = `/uploads/${hash}.webp`;

  const headers = {
    Authorization: `Bearer ${ghToken}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  // Dedupe: if same content (hash) already exists, skip commit
  const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
  const getRes = await fetch(getUrl, { headers });
  if (getRes.ok) {
    return NextResponse.json({ ok: true, path: publicPath, deduped: true });
  }

  const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  const putRes = await fetch(putUrl, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `Upload image via inline editor (${hash})`,
      content: webpBuffer.toString("base64"),
      branch,
    }),
  });

  if (!putRes.ok) {
    const body = await putRes.text();
    return NextResponse.json(
      { error: `Failed to commit image: ${putRes.status} ${body}` },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, path: publicPath, deduped: false });
}
