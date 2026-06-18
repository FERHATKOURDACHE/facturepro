import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FacturePro - Facturation pour micro-entrepreneurs",
  description:
    "Application de facturation pour gérer clients, missions, heures, PDF, Excel, paiements, URSSAF et import IA.",
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
