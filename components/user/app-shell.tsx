"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import clsx from "clsx";
import {
  Compass,
  Home,
  ListChecks,
  MessageCircle,
  MessagesSquare,
  Monitor,
  Smartphone,
  UserRound,
} from "lucide-react";
import { useDemoReady } from "@/components/demo/demo-provider";
import { EntriLogo } from "@/components/brand/logo";
import { ReadAloud } from "@/components/user/read-aloud";
import { Celebration } from "@/components/user/step-done";
import {
  setViewMode,
  useViewMode,
  useWideScreen,
  type ViewMode,
} from "@/components/user/view-mode";
import { useDemo } from "@/lib/demo/store";

const TABS = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/plan", label: "My plan", icon: ListChecks },
  { href: "/app/find", label: "Find help", icon: Compass },
  { href: "/app/ask", label: "Ask Entri", icon: MessageCircle },
  { href: "/app/me", label: "Me", icon: UserRound },
];

function ViewSwitch({ mode }: { mode: ViewMode }) {
  const options: { id: ViewMode; label: string; icon: typeof Monitor }[] = [
    { id: "phone", label: "Phone", icon: Smartphone },
    { id: "web", label: "Website", icon: Monitor },
  ];
  return (
    <div
      role="group"
      aria-label="How to show this demo"
      className="mx-auto mt-5 flex w-fit items-center gap-1 rounded-full border border-sand-300 bg-white p-1"
    >
      {options.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-pressed={mode === id}
          onClick={() => setViewMode(id)}
          className={clsx(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[15px] font-semibold transition-colors",
            mode === id
              ? "bg-ink text-paper"
              : "text-ink-soft hover:bg-sand-100",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}

// The same app in two shapes. "Phone" draws a phone frame in the middle of
// the page. "Website" shows it the way it opens in a desktop browser. On a
// real phone it always fills the screen.
export function AppShell({ children }: { children: React.ReactNode }) {
  const ready = useDemoReady();
  const signedIn = useDemo((s) => s.signedIn);
  const pathname = usePathname();
  const router = useRouter();
  const wide = useWideScreen();
  const chosen = useViewMode();
  const web = wide && chosen === "web";
  const onLogin = pathname === "/app/login";
  const bare = onLogin || pathname === "/app/guide";

  // The demo starts at the sign-in page.
  useEffect(() => {
    if (!ready) return;
    if (!signedIn && !onLogin) router.replace("/app/login");
  }, [ready, signedIn, onLogin, router]);

  const show = ready && (signedIn || onLogin);
  const isActive = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname.startsWith(href);

  const tools = (
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
  );

  // The screen is always rendered, and stays hidden until the saved demo
  // data has loaded and the visitor is signed in.
  const screen = (
    <>
      {!show && <p className="flex-1 p-6 text-lg text-ink-soft">Loading…</p>}
      <div
        data-read
        className={clsx(
          show ? "@container flex-1" : "hidden",
          web
            ? bare
              ? "mx-auto my-10 flex min-h-[620px] w-full max-w-md flex-none flex-col rounded-3xl border border-sand-200 bg-white/60 [&>*]:flex-1"
              : "mx-auto w-full max-w-4xl"
            : "overflow-y-auto",
        )}
      >
        {children}
      </div>
    </>
  );

  return (
    <>
      {wide && <ViewSwitch mode={chosen} />}

      {web ? (
        <div className="relative mx-auto my-5 flex w-full max-w-6xl flex-1 flex-col overflow-hidden rounded-2xl border border-sand-300 bg-paper shadow-xl">
          {!bare && (
            <header className="border-b border-sand-200 bg-white">
              <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
                <Link href="/app" aria-label="Home" className="text-ink">
                  <EntriLogo size="sm" />
                </Link>
                <nav aria-label="Main" className="flex flex-1 flex-wrap gap-1">
                  {TABS.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      aria-current={isActive(href) ? "page" : undefined}
                      className={clsx(
                        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[17px]",
                        isActive(href)
                          ? "bg-ember-100 font-semibold text-ember-700"
                          : "text-ink-soft hover:bg-sand-100",
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                      {label}
                    </Link>
                  ))}
                </nav>
                {tools}
              </div>
            </header>
          )}
          {screen}
          {show && signedIn && <Celebration />}
        </div>
      ) : (
        <div className="relative mx-auto flex w-full max-w-[430px] flex-1 flex-col bg-paper md:my-5 md:h-[820px] md:flex-none md:overflow-hidden md:rounded-[2.75rem] md:border-[10px] md:border-night-900 md:shadow-2xl">
          {!bare && (
            <header className="flex items-center justify-between gap-2 border-b border-sand-200 bg-paper px-4 py-2.5">
              <Link href="/app" aria-label="Home" className="text-ink">
                <EntriLogo size="sm" />
              </Link>
              {tools}
            </header>
          )}
          {screen}
          {show && signedIn && <Celebration />}
          {!bare && (
            <nav
              aria-label="Main"
              className="sticky bottom-0 border-t border-sand-200 bg-white md:static"
            >
              <ul className="grid grid-cols-5">
                {TABS.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={isActive(href) ? "page" : undefined}
                      className={clsx(
                        "flex flex-col items-center gap-0.5 px-1 pb-2.5 pt-2 text-[13px]",
                        isActive(href)
                          ? "font-semibold text-ember-700"
                          : "text-ink-soft",
                      )}
                    >
                      <Icon className="h-6 w-6" aria-hidden />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      )}
    </>
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
