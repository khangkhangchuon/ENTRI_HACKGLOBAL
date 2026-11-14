"use client";

import { useCallback, useState } from "react";
import type { AiReply } from "./schemas";

// Browser side of the AI routes. It keeps the last good answer, so a screen
// can keep showing it while a fresh one is on the way.

interface Saved<T> {
  data: T;
  generatedAt: string;
}

const memory = new Map<string, Saved<unknown>>();
const inFlight = new Map<string, Promise<AiReply<unknown>>>();

function readSaved<T>(key: string): Saved<T> | null {
  if (memory.has(key)) return memory.get(key) as Saved<T>;
  try {
    const raw = sessionStorage.getItem(`entri-ai:${key}`);
    return raw ? (JSON.parse(raw) as Saved<T>) : null;
  } catch {
    return null;
  }
}

function writeSaved<T>(key: string, value: Saved<T>) {
  memory.set(key, value);
  try {
    sessionStorage.setItem(`entri-ai:${key}`, JSON.stringify(value));
  } catch {
    // Storage can be blocked. The answer still lives in memory.
  }
}

export async function postAi<T>(path: string, body: unknown): Promise<AiReply<T>> {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await response.json()) as AiReply<T>;
  } catch {
    return {
      ok: false,
      code: "unavailable",
      message: "The AI assistant is not available right now. Everything else still works.",
    };
  }
}

export type AiStatus = "idle" | "loading" | "ready" | "error";

export interface AiState<T> {
  data: T | null;
  generatedAt: string | null;
  status: AiStatus;
  message: string | null;
}

export function useAi<T>(key: string, path: string) {
  const [state, setState] = useState<AiState<T>>({
    data: null,
    generatedAt: null,
    status: "idle",
    message: null,
  });

  const run = useCallback(
    async (body: unknown) => {
      const previous = readSaved<T>(key);
      setState({
        data: previous?.data ?? null,
        generatedAt: previous?.generatedAt ?? null,
        status: "loading",
        message: null,
      });

      // Two requests for the same thing share one call.
      const id = `${path}:${key}`;
      let pending = inFlight.get(id) as Promise<AiReply<T>> | undefined;
      if (!pending) {
        pending = postAi<T>(path, body).finally(() => inFlight.delete(id));
        inFlight.set(id, pending);
      }
      const reply = await pending;

      if (reply.ok) {
        writeSaved(key, { data: reply.data, generatedAt: reply.generatedAt });
        setState({
          data: reply.data,
          generatedAt: reply.generatedAt,
          status: "ready",
          message: null,
        });
      } else {
        setState({
          data: previous?.data ?? null,
          generatedAt: previous?.generatedAt ?? null,
          status: "error",
          message: reply.message,
        });
      }
    },
    [key, path],
  );

  return { ...state, run };
}
