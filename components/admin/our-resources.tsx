"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { ResourceCard } from "@/components/admin/resource-card";
import { ResourceForm } from "@/components/admin/resource-form";
import { WhenReady } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useDemo } from "@/lib/demo/store";
import type { Resource } from "@/lib/demo/types";

function Listings() {
  const params = useSearchParams();
  const router = useRouter();
  const homeOrgId = useDemo((s) => s.homeOrgId);
  const resources = useDemo((s) => s.resources);
  const org = useDemo((s) => s.organizations.find((o) => o.id === s.homeOrgId));

  // "new" opens an empty form. A resource opens it for editing.
  const [form, setForm] = useState<Resource | "new" | null>(
    params.get("add") ? "new" : null,
  );
  const mine = resources.filter((r) => r.orgId === homeOrgId);

  const close = () => {
    setForm(null);
    if (params.get("add")) router.replace("/admin/resources");
  };

  return (
    <>
      <PageHeader
        title="Our resources"
        intro="What Brooklyn Bridges offers. A new listing shows up at once in the network and in Find help on the returning citizen side."
      >
        <Button variant="primary" onClick={() => setForm("new")}>
          <Plus className="h-4 w-4" aria-hidden />
          Add a listing
        </Button>
      </PageHeader>

      <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {mine.map((r) => (
          <ResourceCard key={r.id} resource={r} org={org}>
            <Button size="sm" onClick={() => setForm(r)}>
              <Pencil className="h-4 w-4" aria-hidden />
              Edit
            </Button>
          </ResourceCard>
        ))}
      </div>

      <Dialog
        open={form !== null}
        onClose={close}
        title={form === "new" ? "Add a listing" : "Edit listing"}
        wide
      >
        {form !== null && (
          <ResourceForm
            key={form === "new" ? "new" : form.id}
            resource={form === "new" ? undefined : form}
            onClose={close}
          />
        )}
      </Dialog>
    </>
  );
}

export function OurResources() {
  return (
    <WhenReady>
      <Listings />
    </WhenReady>
  );
}
