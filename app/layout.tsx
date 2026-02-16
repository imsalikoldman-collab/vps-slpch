import type { Metadata } from "next";
import { type ReactNode } from "react";

import RetroShell from "@/components/RetroShell";
import { FxProvider } from "@/context/FxContext";

import "./globals.css";
import "@/styles/retro.css";

export const metadata: Metadata = {
  title: "SCU Internal Network",
  description: "Oldschool SCU styled internal network mock site.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <FxProvider>
          <RetroShell>{children}</RetroShell>
        </FxProvider>
      </body>
    </html>
  );
}
