"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Building2,
  LayoutDashboard,
  Network,
  ScanSearch,
  Sparkles,
  Users,
} from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/intake", label: "Smart Intake", icon: Sparkles },
  { href: "/admin/gaps", label: "Gap Analysis", icon: ScanSearch },
  { href: "/admin/network", label: "Network", icon: Network },
  { href: "/admin/resources", label: "Our resources", icon: Building2 },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Caseworker sections"
      className="border-b border-sand-200 bg-sand-100/60 lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r"
    >
      <div className="hidden px-5 pb-2 pt-6 lg:block">
        <p className="font-display text-lg leading-tight">
          Brooklyn Bridges Reentry Center
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          Diane R., Reentry Coordinator
        </p>
      </div>
      <ul className="flex gap-1 overflow-x-auto px-3 py-2 lg:flex-col lg:py-3">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-[15px] transition-colors",
                  active
                    ? "bg-white font-semibold text-ink shadow-sm"
                    : "text-ink-soft hover:bg-white/70 hover:text-ink",
                )}
              >
                <Icon
                  className={clsx(
                    "h-[18px] w-[18px]",
                    active && "text-ember-600",
                  )}
                  aria-hidden
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
