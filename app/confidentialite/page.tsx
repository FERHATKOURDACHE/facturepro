import type { Metadata } from "next";

import { legalContent } from "@/lib/legal-content";
import { LegalContentPage } from "@/components/marketing/LegalContentPage";

export const metadata: Metadata = {
  title: "Politique de confidentialité - FacturePro",
  description:
    "Politique de confidentialité FacturePro : données collectées, finalités, conservation, droits RGPD, cookies et sous-traitants.",
};

export default function ConfidentialitePage() {
  return (
    <LegalContentPage
      eyebrow="Confidentialité"
      content={legalContent.privacy}
    />
  );
}
