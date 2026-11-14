"use client";

import { MessageThread } from "@/components/admin/message-thread";
import { Screen } from "@/components/user/app-shell";
import { selectMainClient, useDemo } from "@/lib/demo/store";

export default function MessagesPage() {
  const me = useDemo(selectMainClient);
  const caseworker = useDemo((s) => s.caseworker);
  return (
    <Screen
      title={`Messages with ${caseworker.firstName}`}
      intro="Your caseworker at Brooklyn Bridges. A real person reads and answers these."
    >
      <MessageThread clientId={me.id} side="client" otherName={caseworker.firstName} />
    </Screen>
  );
}
