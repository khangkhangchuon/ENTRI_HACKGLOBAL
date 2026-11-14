import { Suspense } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { DemoBar, DemoFooter } from "@/components/demo/demo-bar";
import { DemoProvider } from "@/components/demo/demo-provider";
import { Toaster } from "@/components/ui/toast";

export const metadata = { title: "Entri: organization demo" };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <DemoProvider>
      <DemoBar persona="diane" />
      <div className="flex flex-1 flex-col bg-paper lg:flex-row">
        <Suspense>
          <AdminNav />
        </Suspense>
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
      <DemoFooter />
      <Toaster />
    </DemoProvider>
  );
}
