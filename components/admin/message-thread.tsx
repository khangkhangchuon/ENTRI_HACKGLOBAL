"use client";

import { useState } from "react";
import clsx from "clsx";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";
import { useDemo } from "@/lib/demo/store";
import { clockTime, shortDate } from "@/lib/format";

// The thread between a caseworker and a client. Both demos use it, each
// from its own side. It is person to person, with no AI.
export function MessageThread({
  clientId,
  side,
  otherName,
}: {
  clientId: string;
  side: "caseworker" | "client";
  otherName: string;
}) {
  const messages = useDemo((s) => s.messages);
  const sendMessage = useDemo((s) => s.sendMessage);
  const [text, setText] = useState("");
  const thread = messages.filter((m) => m.clientId === clientId);

  return (
    <div>
      {thread.length === 0 ? (
        <p className="text-ink-soft">No messages yet.</p>
      ) : (
        <ol className="space-y-2.5">
          {thread.map((m) => {
            const mine = m.from === side;
            return (
              <li key={m.id} className={clsx("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={clsx(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5",
                    mine ? "bg-ember-100 text-ink" : "bg-sand-100 text-ink",
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {mine ? "You" : otherName}, {shortDate(m.at)} at {clockTime(m.at)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <form
        className="mt-3 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          sendMessage(clientId, side, text);
          setText("");
        }}
      >
        <textarea
          aria-label={`Message to ${otherName}`}
          rows={2}
          maxLength={1000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Write to ${otherName}`}
          className={inputClass}
        />
        <Button type="submit" variant="primary" disabled={!text.trim()}>
          <Send className="h-4 w-4" aria-hidden />
          Send
        </Button>
      </form>
    </div>
  );
}
