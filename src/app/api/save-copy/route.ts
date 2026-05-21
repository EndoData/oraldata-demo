import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FILE_PATH = "src/lib/copy.json";

type SavePayload = {
  token?: string;
  deltas?: Record<string, string>;
};

function getEnv(key: string): string | null {
  const v = process.env[key];
  return v && v.length > 0 ? v : null;
}

function setByPath(
  obj: Record<string, unknown>,
  path: string,
  value: string,
): void {
  const segments = path.split(".").flatMap((s) => {
    const m = s.match(/^([^\[]+)((?:\[\d+\])*)$/);
    if (!m) return [s];
    const head = m[1];
    const indices = m[2]
      ? [...m[2].matchAll(/\[(\d+)\]/g)].map((x) => x[1])
      : [];
    return [head, ...indices];
  });

  let cur: Record<string, unknown> | unknown[] = obj;
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i];
    const key = /^\d+$/.test(seg) ? Number(seg) : seg;
    const next = (cur as Record<string | number, unknown>)[
      key as string | number
    ];
    if (next === undefined || next === null) {
      throw new Error(`Invalid path: ${path} (broken at ${seg})`);
    }
    cur = next as Record<string, unknown> | unknown[];
  }
  const last = segments[segments.length - 1];
  const lastKey = /^\d+$/.test(last) ? Number(last) : last;
  (cur as Record<string | number, unknown>)[lastKey] = value;
}

export async function POST(req: Request) {
  const token = getEnv("EDIT_TOKEN");
  const ghToken = getEnv("GITHUB_TOKEN");
  const owner = getEnv("GITHUB_OWNER");
  const repo = getEnv("GITHUB_REPO");
  const branch = getEnv("GITHUB_BRANCH") ?? "main";

  if (!token || !ghToken || !owner || !repo) {
    return NextResponse.json(
      { error: "Server is missing required env (EDIT_TOKEN, GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO)" },
      { status: 500 },
    );
  }

  let payload: SavePayload;
  try {
    payload = (await req.json()) as SavePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (payload.token !== token) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  const deltas = payload.deltas ?? {};
  const entries = Object.entries(deltas);
  if (entries.length === 0) {
    return NextResponse.json({ error: "No changes" }, { status: 400 });
  }

  const headers = {
    Authorization: `Bearer ${ghToken}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  // 1. Fetch current copy.json
  const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${FILE_PATH}?ref=${branch}`;
  const getRes = await fetch(getUrl, { headers });
  if (!getRes.ok) {
    return NextResponse.json(
      { error: `Failed to fetch copy.json: ${getRes.status}` },
      { status: 502 },
    );
  }
  const fileMeta = (await getRes.json()) as {
    sha: string;
    content: string;
    encoding: string;
  };
  const currentJson = JSON.parse(
    Buffer.from(fileMeta.content, "base64").toString("utf-8"),
  ) as Record<string, unknown>;

  // 2. Apply deltas
  for (const [path, value] of entries) {
    try {
      setByPath(currentJson, path, value);
    } catch (err) {
      return NextResponse.json(
        {
          error: `Path error for "${path}": ${
            err instanceof Error ? err.message : "unknown"
          }`,
        },
        { status: 400 },
      );
    }
  }

  // 3. Commit
  const newContent = `${JSON.stringify(currentJson, null, 2)}\n`;
  const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${FILE_PATH}`;
  const putRes = await fetch(putUrl, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `Edit copy via inline editor (${entries.length} change${
        entries.length === 1 ? "" : "s"
      })`,
      content: Buffer.from(newContent, "utf-8").toString("base64"),
      sha: fileMeta.sha,
      branch,
    }),
  });

  if (!putRes.ok) {
    const body = await putRes.text();
    return NextResponse.json(
      { error: `Failed to commit: ${putRes.status} ${body}` },
      { status: 502 },
    );
  }

  const commitData = (await putRes.json()) as {
    commit?: { sha?: string };
  };

  return NextResponse.json({
    ok: true,
    commit: commitData.commit?.sha ?? null,
    changes: entries.length,
  });
}
