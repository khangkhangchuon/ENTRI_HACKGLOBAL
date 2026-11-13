import { DemoBar, DemoFooter } from "@/components/demo/demo-bar";
import { DemoProvider } from "@/components/demo/demo-provider";

export const metadata = { title: "Entri: caseworker demo" };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <DemoProvider>
      <DemoBar persona="diane" />
      <main className="flex-1 bg-paper">{children}</main>
      <DemoFooter />
    </DemoProvider>
  );
}
