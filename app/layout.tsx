import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Browser Games",
  description: "Play free browser games instantly — no signup required.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
