import { Suspense } from "react";
import { DemoBar, DemoFooter } from "@/components/demo/demo-bar";
import { DemoProvider } from "@/components/demo/demo-provider";
import { Toaster } from "@/components/ui/toast";
import { AppShell } from "@/components/user/app-shell";

export const metadata = { title: "Entri: the app for people coming home" };

export default function UserLayout({ children }: LayoutProps<"/app">) {
  return (
    <DemoProvider>
      <DemoBar persona="marcus" />
      <main className="flex flex-1 flex-col bg-sand-200/70">
        <Suspense>
          <AppShell>{children}</AppShell>
        </Suspense>
      </main>
      <DemoFooter />
      <Toaster />
    </DemoProvider>
  );
}
