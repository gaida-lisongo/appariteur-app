"use client";
import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
// import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

// export const metadata: Metadata = {
//   title: {
//     template: "%s | NextAdmin - Next.js Dashboard Kit",
//     default: "NextAdmin - Next.js Dashboard Kit",
//   },
//     description:
//         "Next.js admin dashboard toolkit with 200+ templates, UI components, and integrations for fast dashboard development.", 
// };

export default function AppariteurLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen">
        <Sidebar />

        <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
        <Header />

        <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
            {children}
        </main>
        </div>
    </div>
  );
}