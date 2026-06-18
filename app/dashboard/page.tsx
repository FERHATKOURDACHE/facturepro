
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
      subtitle="Vue dâ€™ensemble connectÃ©e Ã  PostgreSQL : clients, missions, frais et factures."
    >
      <div className="grid gap-5 md:grid-cols-5">
        <StatCard label="Clients" value={`${data.clientsCount}`} helper="En base" />
        <StatCard label="Missions rÃ©centes" value={`${data.missions.length}`} helper="DerniÃ¨res lignes" />
        <StatCard label="Heures rÃ©centes" value={formatHours(data.totalHours)} helper="CalculÃ©es depuis PostgreSQL" />
        <StatCard label="Frais rÃ©cents" value={formatCurrency(data.totalExpenses)} helper="Essence / autres" />
        <StatCard label="Factures" value={formatCurrency(data.totalInvoices)} helper="Historique facturÃ©" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="card rounded-[2rem] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-black">DerniÃ¨res missions</h2>
            <span className="badge bg-emerald-50 text-emerald-700">
              {formatCurrency(data.totalServices)}
            </span>
          </div>

          {data.missions.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-600">
              Aucune mission pour le moment. Va dans Missions et importe les donnÃ©es de mai 2026.
            </p>
          ) : (
            <div className="space-y-3">
              {data.missions.map((mission) => (
                <article key={mission.id} className="rounded-2xl bg-white/80 p-4">
                  <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                    <div>
                      <p className="font-black">{mission.title}</p>
                      <p className="text-sm text-slate-600">
                        {formatDateFr(mission.date)} Â· {formatTimeUtc(mission.startTime)} - {formatTimeUtc(mission.endTime)}
                      </p>
                      <p className="text-sm font-semibold text-slate-700">{mission.locationName ?? "Lieu non renseignÃ©"}</p>
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
          <h2 className="text-2xl font-black">Factures rÃ©centes</h2>

          {data.invoices.length === 0 ? (
            <p className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-600">
              Aucune facture en base.
            </p>
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

