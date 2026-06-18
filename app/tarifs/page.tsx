import type { Metadata } from "next";

import { getPublicContent } from "@/lib/public-content";
import { PublicPageShell } from "@/components/marketing/PublicPageShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tarifs - FacturePro",
  description:
    "Découvrez les offres FacturePro pour gérer clients, missions, factures, paiements, exports, URSSAF et assistant IA.",
};

export default async function TarifsPage() {
  const { pricingContent, siteConfig } = await getPublicContent();

  return (
    <PublicPageShell
      eyebrow={pricingContent.eyebrow}
      title={pricingContent.title}
      subtitle={pricingContent.subtitle}
      siteConfig={siteConfig}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {pricingContent.plans.map((plan) => (
          <article
            key={plan.name}
            className={`rounded-[2rem] border p-6 shadow-sm ${
              plan.highlighted
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-950"
            }`}
          >
            <p
              className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.2em] ${
                plan.highlighted
                  ? "bg-white text-slate-950"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {plan.badge}
            </p>

            <h2 className="mt-6 text-2xl font-black">{plan.name}</h2>

            <div className="mt-4 flex items-end gap-1">
              <span className="text-4xl font-black">{plan.price}</span>
              <span
                className={plan.highlighted ? "text-slate-300" : "text-slate-500"}
              >
                {plan.period}
              </span>
            </div>

            <p
              className={`mt-4 text-sm leading-6 ${
                plan.highlighted ? "text-slate-200" : "text-slate-600"
              }`}
            >
              {plan.description}
            </p>

            <a
              href={plan.href}
              className={`mt-6 inline-flex w-full justify-center rounded-full px-5 py-3 text-sm font-black transition hover:-translate-y-0.5 ${
                plan.highlighted
                  ? "bg-white text-slate-950"
                  : "bg-slate-950 text-white"
              }`}
            >
              {plan.cta}
            </a>

            <div className="mt-7">
              <p className="text-sm font-black">Inclus</p>
              <ul className="mt-3 space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>
            </div>

            <div className="mt-7">
              <p className="text-sm font-black">Notes</p>
              <ul
                className={`mt-3 space-y-2 text-sm ${
                  plan.highlighted ? "text-slate-300" : "text-slate-500"
                }`}
              >
                {plan.limits.map((limit) => (
                  <li key={limit}>• {limit}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </PublicPageShell>
  );
}
