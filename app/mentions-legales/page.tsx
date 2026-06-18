import type { Metadata } from "next";

import { legalContent } from "@/lib/legal-content";
import { LegalContentPage } from "@/components/marketing/LegalContentPage";

export const metadata: Metadata = {
  title: "Mentions légales - FacturePro",
  description:
    "Mentions légales de FacturePro : éditeur, responsable de publication, hébergement et propriété intellectuelle.",
};

export default function MentionsLegalesPage() {
  return (
    <LegalContentPage
      eyebrow="Mentions légales"
      content={legalContent.legalNotice}
    />
  );
}
