import { Suspense } from "react";
import { SmartIntake } from "@/components/admin/intake";

export default function IntakePage() {
  return (
    <Suspense fallback={<p className="py-10 text-ink-soft">Loading the demo…</p>}>
      <SmartIntake />
    </Suspense>
  );
}
