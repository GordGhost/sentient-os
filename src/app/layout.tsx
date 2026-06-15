import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SENTIENT//OS — Skill Forge",
  description:
    "Generate, validate, publish, and verify installable AI agent skills. A real skill-package marketplace.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
