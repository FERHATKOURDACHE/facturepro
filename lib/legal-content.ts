import { siteConfig } from "@/lib/site-config";

export type LegalSection = {
  title: string;
  paragraphs: string[];
  items?: string[];
};

export type LegalPageContent = {
  title: string;
  subtitle: string;
  lastUpdated: string;
  warning: string;
  sections: LegalSection[];
};

const lastUpdated = "18 juin 2026";

export const legalContent = {
  legalNotice: {
    title: "Mentions légales",
    subtitle:
      "Informations relatives à l’éditeur, au responsable de publication et à l’hébergement du site.",
    lastUpdated,
    warning:
      "Ces mentions sont prêtes pour le lancement, mais doivent être complétées avec les informations légales réelles de l’entreprise avant commercialisation.",
    sections: [
      {
        title: "Éditeur du site",
        paragraphs: [
          `Nom commercial : ${siteConfig.company.tradeName}`,
          `Raison sociale : ${siteConfig.company.legalName}`,
          `Forme juridique : ${siteConfig.company.legalForm}`,
          `SIREN : ${siteConfig.company.siren}`,
          `SIRET : ${siteConfig.company.siret}`,
          `Adresse : ${siteConfig.company.address}, ${siteConfig.company.postalCode} ${siteConfig.company.city}, ${siteConfig.company.country}`,
          `Email : ${siteConfig.legalEmail}`,
        ],
      },
      {
        title: "Responsable de publication",
        paragraphs: [
          `Responsable de publication : ${siteConfig.company.publicationDirector}`,
        ],
      },
      {
        title: "Hébergement",
        paragraphs: [
          `Hébergeur : ${siteConfig.hosting.provider}`,
          `Adresse : ${siteConfig.hosting.address}`,
          `Site web : ${siteConfig.hosting.website}`,
        ],
      },
      {
        title: "Propriété intellectuelle",
        paragraphs: [
          "L’ensemble des contenus, textes, interfaces, éléments graphiques, logos et fonctionnalités présents sur FacturePro sont protégés par les règles applicables en matière de propriété intellectuelle.",
          "Toute reproduction, modification, diffusion ou exploitation non autorisée est interdite.",
        ],
      },
    ],
  } satisfies LegalPageContent,

  privacy: {
    title: "Politique de confidentialité",
    subtitle:
      "Information RGPD sur les données collectées, les finalités, les durées de conservation et les droits des utilisateurs.",
    lastUpdated,
    warning:
      "Cette politique constitue une base professionnelle. Elle doit être vérifiée et adaptée avant lancement commercial selon les traitements réels, les outils utilisés et les sous-traitants activés.",
    sections: [
      {
        title: "Données collectées",
        paragraphs: [
          "FacturePro peut collecter les données nécessaires à la création du compte, à l’utilisation du service et à la gestion de la facturation.",
        ],
        items: [
          "identité et coordonnées de l’utilisateur",
          "informations d’entreprise",
          "clients enregistrés dans l’application",
          "missions, heures, prestations, frais et factures",
          "paiements et dates d’encaissement",
          "données techniques nécessaires à la sécurité et au fonctionnement du service",
          "contenus transmis à l’assistant IA pour extraction de feuille de temps",
        ],
      },
      {
        title: "Finalités",
        paragraphs: [
          "Les données sont utilisées pour fournir le service FacturePro, sécuriser l’accès, générer les documents, suivre l’activité et améliorer l’expérience utilisateur.",
        ],
        items: [
          "création et gestion du compte",
          "gestion des clients et missions",
          "création de factures et exports",
          "suivi des paiements",
          "préparation d’indicateurs URSSAF",
          "assistance IA sur demande de l’utilisateur",
          "sécurité, audit et prévention des abus",
        ],
      },
      {
        title: "Base légale",
        paragraphs: [
          "Les traitements peuvent être fondés selon les cas sur l’exécution du contrat, l’obligation légale, l’intérêt légitime ou le consentement lorsque celui-ci est requis.",
        ],
      },
      {
        title: "Durées de conservation",
        paragraphs: [
          "Les données sont conservées pendant la durée nécessaire à l’utilisation du service, puis archivées ou supprimées selon les obligations légales applicables.",
          "Les données de facturation peuvent devoir être conservées pour répondre aux obligations comptables, fiscales ou légales.",
        ],
      },
      {
        title: "Droits des utilisateurs",
        paragraphs: [
          `Les utilisateurs peuvent exercer leurs droits d’accès, de rectification, d’effacement, d’opposition, de limitation et de portabilité en écrivant à ${siteConfig.rgpdEmail}.`,
        ],
      },
      {
        title: "Cookies et traceurs",
        paragraphs: [
          "Les cookies strictement nécessaires au fonctionnement du service peuvent être utilisés sans consentement préalable.",
          "Les traceurs non essentiels, notamment certains outils de mesure d’audience ou de marketing, nécessiteront un consentement préalable lorsque la réglementation l’exige.",
        ],
      },
      {
        title: "Sous-traitants",
        paragraphs: [
          "FacturePro peut s’appuyer sur des prestataires techniques pour l’hébergement, l’authentification, l’IA, le paiement ou l’envoi d’emails.",
          "La liste précise des sous-traitants devra être complétée avant lancement commercial.",
        ],
      },
    ],
  } satisfies LegalPageContent,

  terms: {
    title: "Conditions générales d’utilisation",
    subtitle:
      "Règles d’accès et d’utilisation du service FacturePro.",
    lastUpdated,
    warning:
      "Ces CGU sont une base de travail. Elles doivent être relues et adaptées juridiquement avant vente à grande échelle.",
    sections: [
      {
        title: "Objet",
        paragraphs: [
          "Les présentes conditions définissent les règles d’utilisation de FacturePro, application de gestion de facturation destinée aux indépendants et micro-entrepreneurs.",
        ],
      },
      {
        title: "Accès au service",
        paragraphs: [
          "L’utilisateur doit créer un compte pour accéder aux fonctionnalités privées de FacturePro.",
          "L’utilisateur s’engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants.",
        ],
      },
      {
        title: "Fonctionnalités",
        paragraphs: [
          "FacturePro permet notamment de gérer des clients, missions, factures, paiements, exports et informations utiles à la préparation URSSAF.",
        ],
      },
      {
        title: "Assistant IA",
        paragraphs: [
          "L’assistant IA aide à transformer un texte brut en données structurées. Les résultats doivent toujours être vérifiés par l’utilisateur avant import, facturation ou déclaration.",
        ],
      },
      {
        title: "Responsabilité utilisateur",
        paragraphs: [
          "L’utilisateur reste responsable de l’exactitude des données saisies, des factures générées, des déclarations, des montants URSSAF et du respect de ses obligations légales, comptables et fiscales.",
        ],
      },
      {
        title: "Disponibilité",
        paragraphs: [
          "FacturePro s’efforce d’assurer une disponibilité élevée du service, mais ne garantit pas une absence totale d’interruption, notamment en cas de maintenance, incident technique ou évolution de l’infrastructure.",
        ],
      },
      {
        title: "Évolution du service",
        paragraphs: [
          "Le service peut évoluer à tout moment afin d’ajouter, modifier ou supprimer des fonctionnalités, améliorer la sécurité ou adapter l’offre commerciale.",
        ],
      },
    ],
  } satisfies LegalPageContent,
} as const;
