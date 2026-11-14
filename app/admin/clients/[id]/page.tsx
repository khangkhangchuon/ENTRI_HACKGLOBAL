import { Suspense } from "react";
import { ClientDetail } from "@/components/admin/client-detail";

// The client id in the address is only known when the page is opened, so
// the screen loads inside a Suspense boundary.
export default function ClientDetailPage() {
  return (
    <Suspense fallback={<p className="py-10 text-ink-soft">Loading the demo…</p>}>
      <ClientDetail />
    </Suspense>
  );
}
