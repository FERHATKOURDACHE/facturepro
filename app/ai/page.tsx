import { requireUser } from "@/lib/require-auth";
import { requireCompanyProfileCompleted } from "@/lib/onboarding";
import { AppShell } from "@/components/AppShell";
import { AiTimesheetExtractor } from "@/components/ai/AiTimesheetExtractor";
import { getCurrentOrganization } from "@/lib/current-organization";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AiPage() {
  await requireUser();
  await requireCompanyProfileCompleted();

  const organization = await getCurrentOrganization();

  const clients = await prisma.client.findMany({
    where: {
      organizationId: organization.id,
    },
    orderBy: {
      legalName: "asc",
    },
    select: {
      id: true,
      legalName: true,
    },
  });

  return (
    <AppShell
      title="Assistant IA"
      subtitle="Transforme un texte brut en feuille de temps structurée pour préparer tes missions et tes factures."
    >
      <section className="mb-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[var(--primary)]">
              Parcours IA
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Texte brut → extraction → missions brouillon
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Colle un planning, un message ou un récapitulatif d'heures.
              FacturePro extrait les dates, horaires, lieux, taux et frais,
              puis prépare des missions en brouillon à vérifier avant facturation.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href="/clients"
              className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-black text-slate-800 transition hover:bg-white"
            >
              Voir les clients
            </a>
            <a
              href="/missions"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
            >
              Voir les missions
            </a>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-bold text-slate-500">1. Texte brut</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Copie un message avec dates, horaires, lieux et frais.
            </p>
          </div>
          <div className="rounded-3xl bg-emerald-50 p-5">
            <p className="text-sm font-bold text-emerald-700">2. Extraction</p>
            <p className="mt-2 text-sm leading-6 text-emerald-900">
              L'IA ou le fallback local transforme le texte en lignes structurées.
            </p>
          </div>
          <div className="rounded-3xl bg-amber-50 p-5">
            <p className="text-sm font-bold text-amber-700">3. Import</p>
            <p className="mt-2 text-sm leading-6 text-amber-900">
              Les lignes sont importées en missions brouillon à contrôler.
            </p>
          </div>
        </div>
      </section>

      <AiTimesheetExtractor clients={clients} />
    </AppShell>
  );
}
