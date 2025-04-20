import "@/css/satoshi.css";
import "@/css/style.css";
import { favicon, logo } from "@/assets/logo";

import { Sidebar } from "@/components/Layouts/sidebar";

import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import { Header } from "@/components/Layouts/header";
import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    template: "%s | Plateforme d'Appariteur",
    default: "Appartiteur",
  },
  description:
    "Cette plateforme vous permet de vous connecter à votre compte et d'accéder à toutes les fonctionnalités de l'appariteur.",
  icons: {
    // Ces chemins doivent pointer vers des fichiers dans le dossier public
    icon: favicon.src,
    shortcut: logo.src,
    apple: logo.src,
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <Providers>
          <NextTopLoader color="#5750F1" showSpinner={false} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
