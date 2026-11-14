"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import clsx from "clsx";
import { Compass, Home, ListChecks, MessageCircle, MessagesSquare, UserRound } from "lucide-react";
import { useDemoReady } from "@/components/demo/demo-provider";
import { EntriLogo } from "@/components/brand/logo";
import { ReadAloud } from "@/components/user/read-aloud";
import { Celebration } from "@/components/user/step-done";
import { useDemo } from "@/lib/demo/store";

const TABS = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/plan", label: "My plan", icon: ListChecks },
  { href: "/app/find", label: "Find help", icon: Compass },
  { href: "/app/ask", label: "Ask Entri", icon: MessageCircle },
  { href: "/app/me", label: "Me", icon: UserRound },
];

// The phone. On a desktop it is drawn as a phone frame in the middle of the
// page. On a real phone it fills the screen.
export function AppShell({ children }: { children: React.ReactNode }) {
  const ready = useDemoReady();
  const signedIn = useDemo((s) => s.signedIn);
  const pathname = usePathname();
  const router = useRouter();
  const onLogin = pathname === "/app/login";
  const bare = onLogin || pathname === "/app/guide";

  // The demo starts at the sign-in page.
  useEffect(() => {
    if (!ready) return;
    if (!signedIn && !onLogin) router.replace("/app/login");
  }, [ready, signedIn, onLogin, router]);

  const show = ready && (signedIn || onLogin);

  return (
    <div className="relative mx-auto flex w-full max-w-[430px] flex-1 flex-col bg-paper sm:my-6 sm:h-[820px] sm:flex-none sm:overflow-hidden sm:rounded-[2.75rem] sm:border-[10px] sm:border-night-900 sm:shadow-2xl">
      {!bare && (
        <header className="flex items-center justify-between gap-2 border-b border-sand-200 bg-paper px-4 py-2.5">
          <Link href="/app" aria-label="Home" className="text-ink">
            <EntriLogo size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <ReadAloud />
            <Link
              href="/app/messages"
              aria-label="Messages with Diane"
              className="rounded-full border border-sand-300 bg-white p-2 text-ink hover:bg-sand-100"
            >
              <MessagesSquare className="h-5 w-5" aria-hidden />
            </Link>
          </div>
        </header>
      )}

      {/* The screen is always rendered, and stays hidden until the saved
          demo data has loaded and the visitor is signed in. */}
      {!show && <p className="flex-1 p-6 text-lg text-ink-soft">Loading…</p>}
      <div className={show ? "flex-1 overflow-y-auto" : "hidden"} data-read>
        {children}
      </div>

      {show && signedIn && <Celebration />}

      {!bare && (
        <nav
          aria-label="Main"
          className="sticky bottom-0 border-t border-sand-200 bg-white sm:static"
        >
          <ul className="grid grid-cols-5">
            {TABS.map(({ href, label, icon: Icon }) => {
              const active = href === "/app" ? pathname === "/app" : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={clsx(
                      "flex flex-col items-center gap-0.5 px-1 pb-2.5 pt-2 text-[13px]",
                      active ? "font-semibold text-ember-700" : "text-ink-soft",
                    )}
                  >
                    <Icon className="h-6 w-6" aria-hidden />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}

export function Screen({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-5 pb-8 pt-5 text-lg">
      <h1 className="font-display text-3xl leading-tight">{title}</h1>
      {intro && <p className="mt-1.5 text-ink-soft">{intro}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

// Large, easy-to-tap button styles for the phone.
export const bigButton =
  "flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-lg font-semibold transition-colors disabled:opacity-50";
export const bigPrimary = `${bigButton} bg-ember-600 text-white hover:bg-ember-700`;
export const bigSecondary = `${bigButton} border-2 border-sand-300 bg-white text-ink hover:bg-sand-100`;
