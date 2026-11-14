import { Suspense } from "react";
import { OurResources } from "@/components/admin/our-resources";

export default function ResourcesPage() {
  return (
    <Suspense fallback={<p className="py-10 text-ink-soft">Loading the demo…</p>}>
      <OurResources />
    </Suspense>
  );
}
