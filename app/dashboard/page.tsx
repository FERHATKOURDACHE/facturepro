
import { requireUser } from "@/lib/require-auth";
import { requireCompanyProfileCompleted } from "@/lib/onboarding";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { getDashboardData } from "@/lib/dashboard-queries";
import {
  formatCurrency,
  formatDateFr,
  formatHours,
  formatTimeUtc,
} from "@/lib/mission-calculations";

export const dynamic = "force-dynamic";





export default async function DashboardPage() {
  await requireUser();
  await requireCompanyProfileCompleted();
  const data = await getDashboardData();

  return (
    <AppShell
      title="Dashboard"
      subtitle="Vue d’ensemble connectée à PostgreSQL : clients, missions, frais et factures."
    >
      <div className="grid gap-5 md:grid-cols-5">
        <StatCard label="Clients" value={`${data.clientsCount}`} helper="En base" />
        <StatCard label="Missions récentes" value={`${data.missions.length}`} helper="Dernières lignes" />
        <StatCard label="Heures récentes" value={formatHours(data.totalHours)} helper="Calculées depuis PostgreSQL" />
        <StatCard label="Frais récents" value={formatCurrency(data.totalExpenses)} helper="Essence / autres" />
        <StatCard label="Factures" value={formatCurrency(data.totalInvoices)} helper="Historique facturé" />
      </div>

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
              <p className="text-lg font-black text-slate-950">Aucune mission enregistrée</p>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Commence par créer un client, puis ajoute ta première mission pour suivre tes heures et ton chiffre d’affaires.
              </p>
              <a
                href="/missions"
                className="mt-5 inline-flex rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white"
              >
                Créer une mission
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {data.missions.map((mission) => (
                <article key={mission.id} className="rounded-2xl bg-white/80 p-4">
                  <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                    <div>
                      <p className="font-black">{mission.title}</p>
                      <p className="text-sm text-slate-600">
                        {formatDateFr(mission.date)} · {formatTimeUtc(mission.startTime)} - {formatTimeUtc(mission.endTime)}
                      </p>
                      <p className="text-sm font-semibold text-slate-700">{mission.locationName ?? "Lieu non renseigné"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-[var(--primary)]">
                        {formatHours(Number(mission.quantityHours))}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatCurrency(Number(mission.quantityHours) * Number(mission.hourlyRate))}
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
              <p className="text-lg font-black text-slate-950">Aucune facture générée</p>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Une fois tes missions validées, tu pourras générer une facture automatiquement depuis la page Factures.
              </p>
              <a
                href="/factures"
                className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white"
              >
                Aller aux factures
              </a>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {data.invoices.map((invoice) => (
                <article key={invoice.id} className="rounded-2xl bg-white/80 p-4">
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="font-black">{invoice.number}</p>
                      <p className="text-sm text-slate-600">{formatDateFr(invoice.issueDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black">{formatCurrency(Number(invoice.total))}</p>
                      <span className="badge bg-amber-50 text-amber-700">{invoice.status}</span>
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





