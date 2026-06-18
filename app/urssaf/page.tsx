import { requireUser } from "@/lib/require-auth";
import { requireCompanyProfileCompleted } from "@/lib/onboarding";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { getUrssafTurnover } from "@/lib/urssaf-queries";
import { estimateUrssaf, URSSAF_RATES_2026, type UrssafActivityCode } from "@/lib/urssaf-rates";
import { formatCurrency } from "@/lib/invoice-calculations";

export const dynamic = "force-dynamic";

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function UrssafPage({
  searchParams,
  
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser();
  await requireCompanyProfileCompleted();
  const params = (await searchParams) ?? {};
  const activity = (firstValue(params.activity) ?? "SERVICE_BNC") as UrssafActivityCode;
  const start = firstValue(params.start) ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const end = firstValue(params.end) ?? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10);
  const includeCfp = firstValue(params.cfp) === "on";

  const { invoices, turnover } = await getUrssafTurnover({
    periodStart: new Date(`${start}T00:00:00.000Z`),
    periodEnd: new Date(`${end}T23:59:59.999Z`),
  });

  const estimate = estimateUrssaf({
    turnover,
    activity,
    includeCfp,
  });

  return (
    <AppShell
      title="URSSAF"
      subtitle="Estimation des cotisations Ã  partir du chiffre d'affaires facturÃ©."
    >
      <div className="grid gap-5 md:grid-cols-4">
        <StatCard label="CA pÃ©riode" value={formatCurrency(estimate.turnover)} helper={`${invoices.length} facture(s)`} />
        <StatCard label="Cotisations" value={formatCurrency(estimate.socialContributionAmount)} helper={`${(estimate.socialContributionRate * 100).toFixed(2)} %`} />
        <StatCard label="CFP" value={formatCurrency(estimate.cfpAmount)} helper={includeCfp ? `${(estimate.cfpRate * 100).toFixed(2)} %` : "Non incluse"} />
        <StatCard label="Net estimÃ©" value={formatCurrency(estimate.netBeforeIncomeTax)} helper="Avant impÃ´t sur le revenu" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="card rounded-[2rem] p-6">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
            ParamÃ¨tres
          </p>
          <h2 className="mt-2 text-2xl font-black">Calculer une pÃ©riode</h2>

          <form className="mt-6 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input className="input" name="start" type="date" defaultValue={start} />
              <input className="input" name="end" type="date" defaultValue={end} />
            </div>

            <select className="input" name="activity" defaultValue={activity}>
              {URSSAF_RATES_2026.map((rate) => (
                <option key={rate.code} value={rate.code}>
                  {rate.label} - {(rate.socialContributionRate * 100).toFixed(2)} %
                </option>
              ))}
            </select>

            <label className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 font-semibold">
              <input name="cfp" type="checkbox" defaultChecked={includeCfp} />
              Inclure la CFP dans l'estimation
            </label>

            <button className="rounded-full bg-[var(--primary)] px-6 py-4 font-bold text-white">
              Recalculer
            </button>
          </form>
        </section>

        <section className="card rounded-[2rem] p-6">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
            DÃ©tail
          </p>
          <h2 className="mt-2 text-2xl font-black">Factures prises en compte</h2>

          {invoices.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-600">
              Aucune facture sur cette pÃ©riode.
            </div>
          ) : (
            <div className="table-wrap mt-6">
              <table>
                <thead>
                  <tr>
                    <th>NumÃ©ro</th>
                    <th>Date</th>
                    <th>Statut</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="font-black">{invoice.number}</td>
                      <td>{invoice.issueDate.toISOString().slice(0, 10)}</td>
                      <td>{invoice.status}</td>
                      <td className="font-black">{formatCurrency(Number(invoice.total))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 rounded-3xl bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            Cette estimation ne remplace pas la dÃ©claration officielle. Les taux doivent rester configurables
            car ils peuvent Ã©voluer selon l'activitÃ©, l'annÃ©e, l'ACRE, la CFP et les options fiscales.
          </div>
        </section>
      </div>
    </AppShell>
  );
}


