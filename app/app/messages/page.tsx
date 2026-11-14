"use client";

import Link from "next/link";
import { MessageThread } from "@/components/admin/message-thread";
import { bigPrimary, Screen } from "@/components/user/app-shell";
import { selectMainClient, useDemo } from "@/lib/demo/store";
import { onCaseload } from "@/lib/demo/types";

export default function MessagesPage() {
  const me = useDemo(selectMainClient);
  const caseworker = useDemo((s) => s.caseworker);

  // Messages are for talking with a caseworker. Someone using Entri on
  // their own sees how to get one.
  if (!onCaseload(me)) {
    return (
      <Screen
        title="Messages"
        intro="Messages are for talking with a caseworker."
      >
        <p className="rounded-2xl bg-sand-100 p-4">
          You do not have a caseworker yet. You can ask for one whenever you
          want.
        </p>
        <Link href="/app/caseworker" className={`${bigPrimary} mt-4`}>
          Get a caseworker
        </Link>
      </Screen>
    );
  }

  return (
    <Screen
      title={`Messages with ${caseworker.firstName}`}
      intro="Your caseworker at Brooklyn Bridges. A real person reads and answers these."
    >
      <MessageThread
        clientId={me.id}
        side="client"
        otherName={caseworker.firstName}
      />
    </Screen>
  );
}
