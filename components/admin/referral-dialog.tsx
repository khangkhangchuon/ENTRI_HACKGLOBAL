"use client";

import { useState } from "react";
import { fullName } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { SelectField, TextArea } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { useDemo } from "@/lib/demo/store";
import type { Sharing } from "@/lib/demo/types";

const SHARE_OPTIONS: { key: keyof Sharing; label: string; help: string }[] = [
  { key: "profile", label: "Profile", help: "Name, borough, goal and skills" },
  { key: "plan", label: "Plan", help: "The steps in the plan" },
  { key: "progress", label: "Progress", help: "Which steps are done" },
];

export interface ReferralTarget {
  clientId?: string;
  resourceId?: string;
  // When set, only these clients can be chosen.
  clientIds?: string[];
}

// Refer a client to a resource at another organization. The caseworker
// chooses what to share, within what the client has agreed to.
export function ReferralDialog({
  target,
  onClose,
}: {
  target: ReferralTarget | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={target !== null} onClose={onClose} title="Refer a client">
      {target && <ReferralForm target={target} onClose={onClose} />}
    </Dialog>
  );
}

function ReferralForm({ target, onClose }: { target: ReferralTarget; onClose: () => void }) {
  const allClients = useDemo((s) => s.clients);
  const resources = useDemo((s) => s.resources);
  const organizations = useDemo((s) => s.organizations);
  const homeOrgId = useDemo((s) => s.homeOrgId);
  const createReferral = useDemo((s) => s.createReferral);

  const clients = target.clientIds
    ? allClients.filter((c) => target.clientIds!.includes(c.id))
    : allClients;
  const choices = resources.filter((r) => r.orgId !== homeOrgId);

  const [clientId, setClientId] = useState(target.clientId ?? "");
  const [resourceId, setResourceId] = useState(target.resourceId ?? "");
  const [picked, setPicked] = useState<(keyof Sharing)[]>(["profile"]);
  const [note, setNote] = useState("");

  const client = allClients.find((c) => c.id === clientId);
  const resource = resources.find((r) => r.id === resourceId);
  const org = organizations.find((o) => o.id === resource?.orgId);

  // What the client has already agreed to share with this organization.
  // No choice on record yet means the caseworker asks the client first.
  const agreed = client && org ? client.sharing[org.id] : undefined;
  const canShare = (key: keyof Sharing) => (agreed ? agreed[key] : true);
  const shared = picked.filter(canShare);

  const send = () => {
    if (!client || !resource) return;
    createReferral({ clientId, resourceId, shared, note: note.trim() });
    toast(`Referral sent to ${org?.name ?? resource.name}`);
    onClose();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
      className="space-y-4"
    >
      <SelectField
        label="Client"
        value={clientId}
        onChange={(e) => setClientId(e.target.value)}
        required
      >
        <option value="">Choose a client</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {fullName(c)} ({c.borough})
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Resource"
        value={resourceId}
        onChange={(e) => setResourceId(e.target.value)}
        required
      >
        <option value="">Choose a resource</option>
        {choices.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name} ({organizations.find((o) => o.id === r.orgId)?.name})
          </option>
        ))}
      </SelectField>

      <fieldset>
        <legend className="text-sm font-semibold">
          What to share{org ? ` with ${org.name}` : ""}
        </legend>
        <p className="mt-0.5 text-sm text-ink-soft">
          {client && agreed
            ? `${client.firstName} has already chosen what this organization can see.`
            : "Share only what the client has agreed to. Your case notes are never shared."}
        </p>
        <div className="mt-2 space-y-1.5">
          {SHARE_OPTIONS.map((o) => {
            const allowed = canShare(o.key);
            return (
              <label
                key={o.key}
                className={`flex items-start gap-2.5 rounded-lg border border-sand-200 bg-white px-3 py-2 ${allowed ? "" : "opacity-60"}`}
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-ember-600"
                  disabled={!allowed}
                  checked={allowed && picked.includes(o.key)}
                  onChange={(e) =>
                    setPicked(
                      e.target.checked ? [...picked, o.key] : picked.filter((k) => k !== o.key),
                    )
                  }
                />
                <span>
                  <span className="font-semibold">{o.label}</span>
                  <span className="block text-sm text-ink-soft">
                    {allowed
                      ? o.help
                      : `${client?.firstName ?? "The client"} has chosen not to share this.`}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <TextArea
        label="Note to the organization"
        hint="Optional"
        rows={3}
        maxLength={500}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="What should they know before they meet?"
      />

      <div className="flex justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={!client || !resource}>
          Send referral
        </Button>
      </div>
    </form>
  );
}
