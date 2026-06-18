import type { Metadata } from "next";

import { legalContent } from "@/lib/legal-content";
import { LegalContentPage } from "@/components/marketing/LegalContentPage";

export const metadata: Metadata = {
  title: "Conditions générales d’utilisation - FacturePro",
  description:
    "Conditions générales d’utilisation de FacturePro : accès au service, fonctionnalités, assistant IA, responsabilité et disponibilité.",
};

export default function CguPage() {
  return (
    <LegalContentPage
      eyebrow="CGU"
      content={legalContent.terms}
    />
  );
}
