export const siteConfig = {
  name: "FacturePro",
  tagline: "Facturation intelligente pour micro-entrepreneurs",
  description:
    "FacturePro aide les indépendants, freelances et micro-entrepreneurs à gérer leurs clients, missions, factures, paiements, exports PDF/Excel, URSSAF et extraction IA.",
  domain: "https://facturepro.fr",
  appUrl: "/connexion",
  supportEmail: "support@facturepro.fr",
  legalEmail: "legal@facturepro.fr",
  rgpdEmail: "rgpd@facturepro.fr",
  salesEmail: "contact@facturepro.fr",
  company: {
    legalName: "FacturePro",
    tradeName: "FacturePro",
    ownerName: "À compléter",
    legalForm: "À compléter",
    siren: "À compléter",
    siret: "À compléter",
    address: "À compléter",
    city: "À compléter",
    postalCode: "À compléter",
    country: "France",
    publicationDirector: "À compléter",
  },
  hosting: {
    provider: "Vercel Inc.",
    address: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
    website: "https://vercel.com",
  },
  product: {
    target:
      "micro-entrepreneurs, freelances, prestataires terrain, consultants, agences et indépendants",
    mainBenefits: [
      "Créer des factures professionnelles",
      "Transformer des missions en factures",
      "Exporter en PDF et Excel",
      "Suivre les paiements encaissés",
      "Préparer les montants URSSAF",
      "Importer des horaires avec l’assistant IA",
    ],
  },
  social: {
    linkedin: "",
    tiktok: "",
    instagram: "",
  },
} as const;

export type SiteConfig = typeof siteConfig;
