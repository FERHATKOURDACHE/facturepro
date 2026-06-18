import type { Metadata } from "next";

import { getPublicContent } from "@/lib/public-content";
import { LegalContentPage } from "@/components/marketing/LegalContentPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mentions légales - FacturePro",
  description:
    "Mentions légales de FacturePro : éditeur, responsable de publication, hébergement et propriété intellectuelle.",
};

export default async function MentionsLegalesPage() {
  const { legalContent, siteConfig } = await getPublicContent();

  return (
    <LegalContentPage
      eyebrow="Mentions légales"
      content={legalContent.legalNotice}
      siteConfig={siteConfig}
    />
  );
}
