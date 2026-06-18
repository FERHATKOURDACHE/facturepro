import Link from "next/link";

import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { getDashboardData } from "@/lib/dashboard-queries";
import {
  formatCurrency,
  formatDateFr,
  formatHours,
  formatTimeUtc,
} from "@/lib/mission-calculations";
import { requireCompanyProfileCompleted } from "@/lib/onboarding";
import { requireUser } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

function invoiceStatusLabel(status: string) {
  const labels: Record<string, string> = {
    READY: "Prête",
    SENT: "Envoyée",
    PARTIALLY_PAID: "Partiellement payée",
    PAID: "Payée",
    OVERDUE: "En retard",
    CANCELLED: "Annulée",
  };

  return labels[status] ?? status;
}

function statusBadgeClass(status: string) {
  const classes: Record<string, string> = {
    READY: "badge bg-slate-100 text-slate-700",
    SENT: "badge bg-blue-50 text-blue-700",
    PARTIALLY_PAID: "badge bg-amber-50 text-amber-700",
    PAID: "badge bg-emerald-50 text-emerald-700",
    OVERDUE: "badge bg-red-50 text-red-700",
    CANCELLED: "badge bg-slate-100 text-slate-500",
  };

  return classes[status] ?? "badge bg-slate-100 text-slate-700";
}

export default async function DashboardPage() {
  await requireUser();
  await requireCompanyProfileCompleted();

  const data = await getDashboardData();

  const hasClients = data.clientsCount > 0;
  const hasMissions = data.stats.missionsCount > 0;
  const hasInvoices = data.stats.invoicesCount > 0;
  const hasBillableMissions = data.stats.billableMissionsCount > 0;

  const workflowItems = [
    {
      title: "1. Client",
      description: "Créer une fiche client propre pour rattacher les missions.",
      href: "/clients",
      action: hasClients ? "Voir les clients" : "Ajouter un client",
      status: hasClients ? "OK" : "À faire",
      done: hasClients,
    },
    {
      title: "2. Mission",
      description: "Saisir les heures, le lieu, le taux horaire et les frais.",
      href: "/missions",
      action: hasMissions ? "Voir les missions" : "Créer une mission",
      status: hasMissions ? "OK" : "À faire",
      done: hasMissions,
    },
    {
      title: "3. Facture",
      description: "Transformer les missions validées en facture PDF / Excel.",
      href: "/factures",
      action: hasInvoices ? "Voir les factures" : "Créer une facture",
      status: hasInvoices ? "OK" : "À faire",
      done: hasInvoices,
    },
    {
      title: "4. URSSAF",
      description: "Suivre le chiffre d'affaires encaissé et préparer la déclaration.",
      href: "/urssaf",
      action: "Voir l'URSSAF",
      status: "Suivi",
      done: data.stats.totalInvoices > 0,
    },
  ];

  const priorityActions = [
    {
      title: "Importer des heures avec l'IA",
      description: "Colle une feuille d'heures pour générer des missions brouillon.",
      href: "/ai",
      action: "Importer IA",
    },
    {
      title: "Valider les missions",
      description: `${data.stats.draftMissionsCount} brouillon(s) à vérifier avant facturation.`,
      href: "/missions",
      action: "Ouvrir missions",
    },
    {
      title: "Créer une facture",
      description: `${data.stats.billableMissionsCount} mission(s) validée(s) non facturée(s).`,
      href: "/factures",
      action: hasBillableMissions ? "Facturer" : "Préparer",
    },
    {
      title: "Suivre les encaissements",
      description: `${formatCurrency(data.stats.totalOpenInvoices)} encore ouvert sur les factures.`,
      href: "/factures",
      action: "Voir paiements",
    },
  ];

  return (
    <AppShell
      title="Dashboard"
      subtitle="Vue d'ensemble professionnelle : activité, missions, factures, encaissements et prochaines actions."
    >
      <div className="grid gap-5 md:grid-cols-5">
        <StatCard
          label="Clients"
          value={`${data.clientsCount}`}
          helper="Base active"
        />
        <StatCard
          label="Missions"
          value={`${data.stats.missionsCount}`}
          helper="Toutes les missions"
        />
        <StatCard
          label="Heures"
          value={formatHours(data.stats.totalHours)}
          helper="Temps travaillé total"
        />
        <StatCard
          label="CA missions"
          value={formatCurrency(data.stats.totalRevenue)}
          helper="Prestations + frais"
        />
        <StatCard
          label="Facturé"
          value={formatCurrency(data.stats.totalInvoices)}
          helper="Total factures"
        />
      </div>

      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[var(--primary)]">
              Pilotage FacturePro
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Client → mission → facture → paiement → URSSAF
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Le dashboard centralise ton activité : clients actifs, heures saisies,
              missions validées, factures ouvertes, encaissements et suivi URSSAF.
              Utilise-le comme tableau de bord quotidien pour savoir quoi faire ensuite.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/ai"
              className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-black text-slate-800 transition hover:bg-white"
            >
              Importer IA
            </Link>
            <Link
              href="/factures"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
            >
              Générer une facture
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
            À facturer
          </p>
          <p className="mt-3 text-3xl font-black text-slate-950">
            {data.stats.billableMissionsCount}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Missions validées non facturées
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
            Brouillons
          </p>
          <p className="mt-3 text-3xl font-black text-slate-950">
            {data.stats.draftMissionsCount}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Missions à contrôler
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
            À encaisser
          </p>
          <p className="mt-3 text-3xl font-black text-slate-950">
            {formatCurrency(data.stats.totalOpenInvoices)}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Factures non soldées
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
            Payé
          </p>
          <p className="mt-3 text-3xl font-black text-slate-950">
            {formatCurrency(data.stats.totalPaidInvoices)}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Factures marquées payées
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[var(--primary)]">
              Parcours métier
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Les prochaines actions pour avancer
            </h2>
          </div>

          <Link
            href="/parametres"
            className="w-fit rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-black text-slate-800 transition hover:bg-white"
          >
            Modifier le profil
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {workflowItems.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-black text-slate-950">{item.title}</h3>
                <span
                  className={
                    item.done
                      ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700"
                      : "rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700"
                  }
                >
                  {item.status}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {item.description}
              </p>

              <Link
                href={item.href}
                className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white transition hover:-translate-y-0.5"
              >
                {item.action}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-4">
        {priorityActions.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
          >
            <p className="font-black text-slate-950">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {item.description}
            </p>
            <span className="mt-4 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white">
              {item.action}
            </span>
          </Link>
        ))}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="card rounded-[2rem] p-6">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
                Activité récente
              </p>
              <h2 className="mt-2 text-2xl font-black">Dernières missions</h2>
            </div>
            <span className="badge bg-emerald-50 text-emerald-700">
              {formatCurrency(data.stats.totalServices)}
            </span>
          </div>

          {data.missions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center">
              <p className="text-lg font-black text-slate-950">
                Aucune mission enregistrée
              </p>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Commence par créer un client, puis ajoute ta première mission
                pour suivre tes heures et ton chiffre d'affaires.
              </p>
              <Link
                href="/missions"
                className="mt-5 inline-flex rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white"
              >
                Créer une mission
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.missions.map((mission) => (
                <article key={mission.id} className="rounded-2xl bg-white/80 p-4">
                  <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black">{mission.title}</p>
                        <span className="badge bg-slate-100 text-slate-700">
                          {mission.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        {formatDateFr(mission.date)} ·{" "}
                        {formatTimeUtc(mission.startTime)} -{" "}
                        {formatTimeUtc(mission.endTime)}
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {mission.client.legalName} ·{" "}
                        {mission.locationName ?? "Lieu non renseigné"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-[var(--primary)]">
                        {formatHours(Number(mission.quantityHours))}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatCurrency(
                          Number(mission.quantityHours) *
                            Number(mission.hourlyRate)
                        )}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="card rounded-[2rem] p-6">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
                Encaissement
              </p>
              <h2 className="mt-2 text-2xl font-black">Factures récentes</h2>
            </div>
            <span className="badge bg-blue-50 text-blue-700">
              {data.stats.invoicesCount} facture{data.stats.invoicesCount > 1 ? "s" : ""}
            </span>
          </div>

          {data.invoices.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center">
              <p className="text-lg font-black text-slate-950">
                Aucune facture générée
              </p>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Une fois tes missions validées, tu pourras générer une facture
                automatiquement depuis la page Factures.
              </p>
              <Link
                href="/factures"
                className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white"
              >
                Aller aux factures
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.invoices.map((invoice) => (
                <article key={invoice.id} className="rounded-2xl bg-white/80 p-4">
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="font-black">{invoice.number}</p>
                      <p className="text-sm text-slate-600">
                        {invoice.client.legalName} · {formatDateFr(invoice.issueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black">
                        {formatCurrency(Number(invoice.total))}
                      </p>
                      <span className={statusBadgeClass(invoice.status)}>
                        {invoiceStatusLabel(invoice.status)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
