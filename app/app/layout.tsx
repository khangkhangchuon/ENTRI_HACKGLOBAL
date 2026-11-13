import { DemoBar, DemoFooter } from "@/components/demo/demo-bar";
import { DemoProvider } from "@/components/demo/demo-provider";

export const metadata = { title: "Entri: the app for people coming home" };

export default function UserLayout({ children }: LayoutProps<"/app">) {
  return (
    <DemoProvider>
      <DemoBar persona="marcus" />
      <main className="flex-1 bg-sand-100">{children}</main>
      <DemoFooter />
    </DemoProvider>
  );
}
