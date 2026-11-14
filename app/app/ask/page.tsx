"use client";

import Link from "next/link";
import { bigPrimary, bigSecondary, Screen } from "@/components/user/app-shell";
import { selectMainClient, useDemo } from "@/lib/demo/store";
import { onCaseload } from "@/lib/demo/types";

// A holding screen. Ask Entri is the next part of the build.
export default function AskPage() {
  const caseworker = useDemo((s) => s.caseworker);
  const connected = useDemo((s) => onCaseload(selectMainClient(s)));
  return (
    <Screen
      title="Ask Entri"
      intro="Ask a question in your own words and get an answer from verified sources."
    >
      <p className="rounded-2xl bg-sand-100 p-4">
        Ask Entri is being built and will open here soon. Until then, Find help
        lists places across the whole network.
      </p>
      <div className="mt-4 space-y-2.5">
        <Link href="/app/find" className={bigPrimary}>
          Find help
        </Link>
        {connected && (
          <Link href="/app/messages" className={bigSecondary}>
            Message {caseworker.firstName}
          </Link>
        )}
      </div>
    </Screen>
  );
}
