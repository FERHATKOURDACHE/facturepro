import type { Metadata } from "next";

import { siteConfig } from "@/lib/site-config";
import { PublicPageShell } from "@/components/marketing/PublicPageShell";

export const metadata: Metadata = {
  title: "Support - FacturePro",
  description:
    "Contactez le support FacturePro pour une question produit, commerciale, RGPD ou technique.",
};

export default function SupportPage() {
  const contacts = [
    {
      title: "Support utilisateur",
      email: siteConfig.supportEmail,
      description:
        "Questions sur le compte, l’utilisation, les factures, missions, exports ou paiements.",
    },
    {
      title: "Contact commercial",
      email: siteConfig.salesEmail,
      description:
        "Questions sur les offres, partenariats, démonstrations ou demandes professionnelles.",
    },
    {
      title: "Contact RGPD",
      email: siteConfig.rgpdEmail,
      description:
        "Exercice des droits d’accès, rectification, effacement, opposition, limitation ou portabilité.",
    },
  ];

  return (
    <PublicPageShell
      eyebrow="Support"
      title="Une question ? Contacte l’équipe FacturePro."
      subtitle="Les contacts sont centralisés dans la configuration du site pour être modifiés facilement."
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {contacts.map((contact) => (
          <article
            key={contact.email}
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-black text-slate-950">
              {contact.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {contact.description}
            </p>
            <a
              href={`mailto:${contact.email}`}
              className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
            >
              {contact.email}
            </a>
          </article>
        ))}
      </div>

      <section className="mt-8 rounded-[2rem] border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-lg font-black text-amber-950">
          Informations à compléter avant lancement
        </h2>
        <p className="mt-2 text-sm leading-6 text-amber-900">
          Avant la commercialisation, remplace les emails génériques, ajoute ton
          vrai domaine, ton SIRET, ton adresse professionnelle et les coordonnées
          définitives de support.
        </p>
      </section>
    </PublicPageShell>
  );
}
