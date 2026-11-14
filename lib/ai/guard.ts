import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type * as z from "zod";
import { AiDeclined, hasKey } from "./client";
import type { AiErrorCode, AiReply } from "./schemas";

// Protection shared by every AI route: a size cap, a shape check, a simple
// per-visitor rate limit, and one calm error shape for the browser.

const MAX_BODY_BYTES = 80_000;
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 30;

// Kept in memory. On a serverless host each instance keeps its own count,
// which is enough to slow down a runaway loop in a demo.
const hits = new Map<string, number[]>();

function allowed(visitor: string): boolean {
  const now = Date.now();
  const recent = (hits.get(visitor) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(visitor, recent);
    return false;
  }
  recent.push(now);
  hits.set(visitor, recent);
  if (hits.size > 5000) hits.clear();
  return true;
}

const MESSAGES: Record<AiErrorCode, string> = {
  unavailable: "The AI assistant is not available right now. Everything else still works.",
  busy: "The AI assistant is busy. Please try again in a few minutes.",
  invalid: "That request could not be read. Please check the text and try again.",
  declined: "The AI assistant could not draft this one. You can write it by hand.",
};

function fail(code: AiErrorCode, status: number): Response {
  const body: AiReply<never> = { ok: false, code, message: MESSAGES[code] };
  return Response.json(body, { status });
}

export async function handleAi<S extends z.ZodType, T>(
  request: Request,
  schema: S,
  run: (input: z.infer<S>) => Promise<T>,
  // An answer that needs no AI. It is tried first, so it still works when
  // the AI cannot be reached.
  withoutAi?: (input: z.infer<S>) => T | null,
): Promise<Response> {
  const raw = await request.text().catch(() => "");
  if (!raw || raw.length > MAX_BODY_BYTES) return fail("invalid", 400);

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return fail("invalid", 400);
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return fail("invalid", 400);

  const ready = withoutAi?.(parsed.data) ?? null;
  if (ready !== null) {
    const body: AiReply<T> = { ok: true, data: ready, generatedAt: new Date().toISOString() };
    return Response.json(body);
  }

  if (!hasKey()) return fail("unavailable", 503);

  const visitor =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowed(visitor)) return fail("busy", 429);

  try {
    const data = await run(parsed.data);
    const body: AiReply<T> = { ok: true, data, generatedAt: new Date().toISOString() };
    return Response.json(body);
  } catch (error) {
    if (error instanceof AiDeclined) return fail("declined", 200);
    if (error instanceof Anthropic.RateLimitError) return fail("busy", 429);
    // Log the kind of failure, never the request or the key.
    const status = error instanceof Anthropic.APIError ? error.status : undefined;
    console.error("[ai] request failed:", (error as Error)?.name, status ?? "");
    return fail("unavailable", 503);
  }
}
