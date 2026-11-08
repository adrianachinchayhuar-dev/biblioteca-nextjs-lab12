"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const entries = [
  { href: "/", label: "Panel", path: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" },
  { href: "/books", label: "Catálogo", path: "M4 4h4v16H4zM11 4h4v16h-4zM17 5l3-1 3 15-3 1z" },
  { href: "/authors", label: "Autores", path: "M16 20v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M14 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0m6 13v-2a4 4 0 0 0-3-4m0-11a4 4 0 0 1 0 8" },
];

export function Navigation() {
  return <NavigationLinks pathname={usePathname()} />;
}

export function NavigationLinks({ pathname }: { pathname?: string }) {
  return (
    <nav className="site-nav" aria-label="Navegación principal">
      {entries.map(({ href, label, path }) => {
        const active = pathname === href || (href !== "/" && pathname?.startsWith(`${href}/`));
        return (
          <Link key={href} href={href} data-active={active} aria-current={pathname === href ? "page" : undefined}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d={path} /></svg>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
