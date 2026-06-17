import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FacturePro MVP",
  description: "Application de facturation, feuilles de temps et gestion clients.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
