"use client";
// import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

// export const metadata: Metadata = {
//   title: {
//     template: '%s | Connexion',
//     default: 'Appariteur - Authetification',
//   },
//   description:
//     'Cette plafeforme vous permet de vous connecter à votre compte et d\'accéder à toutes les fonctionnalités de l\'appariteur.',
//   icons: {
//     // Ces chemins doivent pointer vers des fichiers dans le dossier public
//     icon: favicon.src,
//     shortcut: logo.src,
//     apple: logo.src,
//   },
// };

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-2 dark:bg-[#020d1a]">
      {children}
    </div>
  );
}