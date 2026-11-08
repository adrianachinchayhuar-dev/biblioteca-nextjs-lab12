import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Navigation, NavigationLinks } from "./_library/navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Entre Páginas | Biblioteca digital",
  description: "Gestión de autores y libros de la biblioteca.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>
        <header className="site-header">
          <div className="site-header-inner">
            <Link href="/" className="brand">
              <span className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 6C9 4 5 4 3 5v13c3-1 6-1 9 1 3-2 6-2 9-1V5c-2-1-6-1-9 1Zm0 0v13" /></svg>
              </span>
              <span>Entre Páginas<small>Biblioteca digital</small></span>
            </Link>
            <Suspense fallback={<NavigationLinks />}><Navigation /></Suspense>
            <p className="sidebar-note"><span aria-hidden="true">✦</span> Archivo literario</p>
          </div>
        </header>
        <div className="site-content">
          {children}
          <footer className="site-footer">
            <span>Entre Páginas</span>
            <a href="https://openlibrary.org/dev/docs/api/covers">Portadas de Open Library</a>
          </footer>
        </div>
      </body>
    </html>
  );
}
