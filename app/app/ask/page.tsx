"use client";

import Link from "next/link";
import { bigPrimary, bigSecondary, Screen } from "@/components/user/app-shell";
import { useDemo } from "@/lib/demo/store";

// A holding screen. Ask Entri is the next part of the build.
export default function AskPage() {
  const caseworker = useDemo((s) => s.caseworker);
  return (
    <Screen
      title="Ask Entri"
      intro="Ask a question in your own words and get an answer from verified sources."
    >
      <p className="rounded-2xl bg-sand-100 p-4">
        Ask Entri is being built and will open here soon. Until then, you can message{" "}
        {caseworker.firstName} or look through Find help.
      </p>
      <div className="mt-4 space-y-2.5">
        <Link href="/app/messages" className={bigPrimary}>
          Message {caseworker.firstName}
        </Link>
        <Link href="/app/find" className={bigSecondary}>
          Find help
        </Link>
      </div>
    </Screen>
  );
}
