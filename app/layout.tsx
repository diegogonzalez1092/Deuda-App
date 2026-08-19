import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "../src/branding/Logo";
import "./globals.css";

export const metadata: Metadata = {
  title: "Capital Recovery Consulting LLC — Refinanciación y consolidación de pasivos",
  description:
    "Monitoreá tu situación crediticia en el BCRA y accedé a ofertas de refinanciación y consolidación de pasivos.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="site-header">
          <Link href="/" aria-label="Ir al inicio">
            <Logo />
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
