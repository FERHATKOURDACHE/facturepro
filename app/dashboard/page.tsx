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

export default async function DashboardPage() {
  await requireUser();
  await requireCompanyProfileCompleted();

  const data = await getDashboardData();

  const hasClients = data.clientsCount > 0;
  const hasMissions = data.missions.length > 0;
  const hasInvoices = data.invoices.length > 0;

  const quickStartItems = [
    {
      title: "1. Ajouter un client",
      description:
        "Crée ton premier client pour pouvoir rattacher tes missions et factures.",
      href: "/clients",
      action: hasClients ? "Voir les clients" : "Ajouter un client",
      status: hasClients ? "OK" : "À faire",
      done: hasClients,
    },
    {
      title: "2. Créer une mission",
      description:
        "Ajoute tes heures, ton taux horaire, tes lieux et tes frais éventuels.",
      href: "/missions",
      action: hasMissions ? "Voir les missions" : "Créer une mission",
      status: hasMissions ? "OK" : "À faire",
      done: hasMissions,
    },
    {
      title: "3. Générer une facture",
      description:
        "Transforme tes missions validées en facture professionnelle exportable.",
      href: "/factures",
      action: hasInvoices ? "Voir les factures" : "Créer une facture",
      status: hasInvoices ? "OK" : "À faire",
      done: hasInvoices,
    },
    {
      title: "4. Importer avec l'IA",
      description:
        "Colle une feuille d'heures pour préparer automatiquement tes missions.",
      href: "/ai",
      action: "Ouvrir l'IA",
      status: "Optionnel",
      done: false,
    },
  ];

  return (
    <AppShell
      title="Dashboard"
      subtitle="Vue d'ensemble de ton activité : clients, missions, frais, factures et prochaines actions."
    >
      <div className="grid gap-5 md:grid-cols-5">
        <StatCard
          label="Clients"
          value={`${data.clientsCount}`}
          helper="En base"
        />
        <StatCard
          label="Missions récentes"
          value={`${data.missions.length}`}
          helper="Dernières lignes"
        />
        <StatCard
          label="Heures récentes"
          value={formatHours(data.totalHours)}
          helper="Calculées depuis PostgreSQL"
        />
        <StatCard
          label="Frais récents"
          value={formatCurrency(data.totalExpenses)}
          helper="Essence / autres"
        />
        <StatCard
          label="Factures"
          value={formatCurrency(data.totalInvoices)}
          helper="Historique facturé"
        />
      </div>

      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[var(--primary)]">
              Démarrage rapide
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Les prochaines actions pour avancer
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Suis ces étapes pour passer d'un compte vide à un cycle complet :
              client, mission, facture, puis suivi URSSAF.
            </p>
          </div>

          <Link
            href="/parametres"
            className="w-fit rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-black text-slate-800 transition hover:bg-white"
          >
            Modifier le profil
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickStartItems.map((item) => (
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

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="card rounded-[2rem] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-black">Dernières missions</h2>
            <span className="badge bg-emerald-50 text-emerald-700">
              {formatCurrency(data.totalServices)}
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
                      <p className="font-black">{mission.title}</p>
                      <p className="text-sm text-slate-600">
                        {formatDateFr(mission.date)} ·{" "}
                        {formatTimeUtc(mission.startTime)} -{" "}
                        {formatTimeUtc(mission.endTime)}
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
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
          <h2 className="text-2xl font-black">Factures récentes</h2>

          {data.invoices.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center">
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
            <div className="mt-5 space-y-3">
              {data.invoices.map((invoice) => (
                <article key={invoice.id} className="rounded-2xl bg-white/80 p-4">
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="font-black">{invoice.number}</p>
                      <p className="text-sm text-slate-600">
                        {formatDateFr(invoice.issueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black">
                        {formatCurrency(Number(invoice.total))}
                      </p>
                      <span className="badge bg-amber-50 text-amber-700">
                        {invoice.status}
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
