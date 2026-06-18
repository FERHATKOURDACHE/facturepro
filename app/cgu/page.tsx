import type { Metadata } from "next";

import { getPublicContent } from "@/lib/public-content";
import { LegalContentPage } from "@/components/marketing/LegalContentPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Conditions générales d’utilisation - FacturePro",
  description:
    "Conditions générales d’utilisation de FacturePro : accès au service, fonctionnalités, assistant IA, responsabilité et disponibilité.",
};

export default async function CguPage() {
  const { legalContent, siteConfig } = await getPublicContent();

  return (
    <LegalContentPage
      eyebrow="CGU"
      content={legalContent.terms}
      siteConfig={siteConfig}
    />
  );
}
