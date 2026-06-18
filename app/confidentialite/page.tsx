import type { Metadata } from "next";

import { getPublicContent } from "@/lib/public-content";
import { LegalContentPage } from "@/components/marketing/LegalContentPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Politique de confidentialité - FacturePro",
  description:
    "Politique de confidentialité FacturePro : données collectées, finalités, conservation, droits RGPD, cookies et sous-traitants.",
};

export default async function ConfidentialitePage() {
  const { legalContent, siteConfig } = await getPublicContent();

  return (
    <LegalContentPage
      eyebrow="Confidentialité"
      content={legalContent.privacy}
      siteConfig={siteConfig}
    />
  );
}
