export type PricingPlan = {
  name: string;
  badge: string;
  price: string;
  period: string;
  description: string;
  cta: string;
  href: string;
  highlighted: boolean;
  features: string[];
  limits: string[];
};

export const pricingContent = {
  eyebrow: "Tarifs",
  title: "Des offres simples pour lancer, gérer et développer ton activité.",
  subtitle:
    "Les tarifs sont centralisés dans un fichier unique. Tu peux les modifier à tout moment sans changer les pages une par une.",
  plans: [
    {
      name: "Starter",
      badge: "Pour démarrer",
      price: "0 €",
      period: "/ mois",
      description:
        "Pour tester FacturePro, créer ses premiers clients et structurer son activité.",
      cta: "Créer un compte",
      href: "/inscription",
      highlighted: false,
      features: [
        "Gestion des clients",
        "Gestion des missions",
        "Création de factures",
        "Export PDF",
        "Tableau de bord simple",
      ],
      limits: [
        "Usage limité",
        "Fonctions avancées désactivées",
        "Support prioritaire non inclus",
      ],
    },
    {
      name: "Pro",
      badge: "Recommandé",
      price: "19 €",
      period: "/ mois",
      description:
        "Pour les indépendants qui veulent gagner du temps et suivre sérieusement leur facturation.",
      cta: "Choisir Pro",
      href: "/inscription?plan=pro",
      highlighted: true,
      features: [
        "Clients illimités",
        "Missions illimitées",
        "Factures professionnelles",
        "Exports PDF et Excel",
        "Suivi paiements",
        "Préparation URSSAF",
        "Assistant IA pour extraire les horaires",
      ],
      limits: [
        "Paiement Stripe à activer",
        "Domaine personnalisé à configurer",
      ],
    },
    {
      name: "Business",
      badge: "Bientôt",
      price: "Sur devis",
      period: "",
      description:
        "Pour les équipes, agences, cabinets ou structures avec plusieurs utilisateurs.",
      cta: "Contacter l’équipe",
      href: "/support",
      highlighted: false,
      features: [
        "Multi-utilisateurs",
        "Rôles et permissions",
        "Audit avancé",
        "Exports avancés",
        "Accompagnement personnalisé",
      ],
      limits: [
        "Disponible dans une prochaine version",
      ],
    },
  ] satisfies PricingPlan[],
} as const;
