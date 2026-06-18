import { requireUser } from "@/lib/require-auth";
import { requireCompanyProfileCompleted } from "@/lib/onboarding";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { getUrssafTurnover } from "@/lib/urssaf-queries";
import {
  estimateUrssafPro,
  isDateInAcrePeriod,
  URSSAF_OFFICIAL_PORTAL_URL,
  URSSAF_RATES_2026,
  type UrssafActivityCode,
} from "@/lib/urssaf-rates";
import { formatCurrency } from "@/lib/invoice-calculations";

export const dynamic = "force-dynamic";

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function dateInputToUtc(value: string | null, endOfDay = false) {
  if (!value) return null;
  return new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
}

function declarationFrequencyLabel(value: string) {
  if (value === "QUARTERLY") return "Trimestrielle";
  return "Mensuelle";
}

function paymentMethodLabel(method: string) {
  const labels: Record<string, string> = {
    BANK_TRANSFER: "Virement",
    CARD: "Carte bancaire",
    CASH: "Espèces",
    CHECK: "Chèque",
    OTHER: "Autre",
  };

  return labels[method] ?? method;
}

export default async function UrssafPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser();
  await requireCompanyProfileCompleted();

  const params = (await searchParams) ?? {};
  const today = new Date();

  const activity = (firstValue(params.activity) ?? "SERVICE_BNC") as UrssafActivityCode;
  const declarationFrequency = firstValue(params.declarationFrequency) ?? "MONTHLY";

  const start =
    firstValue(params.start) ??
    new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .slice(0, 10);

  const end =
    firstValue(params.end) ??
    new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);

  const includeCfp = firstValue(params.cfp) === "on";
  const includeAcre = firstValue(params.acre) === "on";
  const acreStart = firstValue(params.acreStart) ?? start;
  const acreEnd = firstValue(params.acreEnd) ?? end;

  const acreStartDate = includeAcre ? dateInputToUtc(acreStart) : null;
  const acreEndDate = includeAcre ? dateInputToUtc(acreEnd, true) : null;

  const { invoices, payments, invoiceCount, paymentCount } =
    await getUrssafTurnover({
      periodStart: new Date(`${start}T00:00:00.000Z`),
      periodEnd: new Date(`${end}T23:59:59.999Z`),
    });

  const estimate = estimateUrssafPro({
    payments: payments.map((payment) => ({
      amount: Number(payment.amount),
      paidAt: payment.paidAt,
    })),
    activity,
    includeCfp,
    includeAcre,
    acreStart: acreStartDate,
    acreEnd: acreEndDate,
  });
  const periodLabel = `${start} → ${end}`;
  const hasPayments = payments.length > 0;

  return (
    <AppShell
      title="URSSAF Pro"
      subtitle="Estimation professionnelle des cotisations à partir du chiffre d'affaires encaissé."
    >
      <div className="grid gap-5 md:grid-cols-5">
        <StatCard
          label="CA encaissé"
          value={formatCurrency(estimate.turnover)}
          helper={`${paymentCount} paiement${paymentCount > 1 ? "s" : ""} · ${invoiceCount} facture${invoiceCount > 1 ? "s" : ""}`}
        />
        <StatCard
          label="CA ACRE"
          value={formatCurrency(estimate.acreTurnover)}
          helper={includeAcre ? "Période ACRE activée" : "ACRE désactivée"}
        />
        <StatCard
          label="Cotisations"
          value={formatCurrency(estimate.socialContributionAmount)}
          helper={`${(estimate.socialContributionRate * 100).toFixed(2)} % normal`}
        />
        <StatCard
          label="CFP"
          value={formatCurrency(estimate.cfpAmount)}
          helper={includeCfp ? `${(estimate.cfpRate * 100).toFixed(2)} %` : "Non incluse"}
        />
        <StatCard
          label="Total estimé"
          value={formatCurrency(estimate.totalEstimatedAmount)}
          helper={`Net estimé : ${formatCurrency(estimate.netBeforeIncomeTax)}`}
        />
      </div>

      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[var(--primary)]">
              Parcours URSSAF
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Factures payées → CA encaissé → déclaration
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              FacturePro additionne les paiements encaissés sur la période
              sélectionnée. Les factures non payées ne sont pas intégrées dans
              cette estimation.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href="/factures"
              className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-black text-slate-800 transition hover:bg-white"
            >
              Voir les factures
            </a>
            <a
              href={URSSAF_OFFICIAL_PORTAL_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
            >
              Portail URSSAF
            </a>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-bold text-slate-500">Période analysée</p>
            <p className="mt-2 text-lg font-black text-slate-950">{periodLabel}</p>
          </div>
          <div className="rounded-3xl bg-emerald-50 p-5">
            <p className="text-sm font-bold text-emerald-700">Base de calcul</p>
            <p className="mt-2 text-lg font-black text-emerald-950">
              {paymentCount} paiement{paymentCount > 1 ? "s" : ""} encaissé{paymentCount > 1 ? "s" : ""}
            </p>
          </div>
          <div className="rounded-3xl bg-amber-50 p-5">
            <p className="text-sm font-bold text-amber-700">À vérifier</p>
            <p className="mt-2 text-lg font-black text-amber-950">
              Déclaration officielle URSSAF
            </p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="card rounded-[2rem] p-6">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
            Paramètres URSSAF
          </p>
          <h2 className="mt-2 text-2xl font-black">Calculer une déclaration</h2>

          <form className="mt-6 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-600">
                Type de déclaration
              </span>
              <select
                className="input"
                name="declarationFrequency"
                defaultValue={declarationFrequency}
              >
                <option value="MONTHLY">Mensuelle</option>
                <option value="QUARTERLY">Trimestrielle</option>
              </select>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-600">
                  Début de période
                </span>
                <input className="input" name="start" type="date" defaultValue={start} />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-600">
                  Fin de période
                </span>
                <input className="input" name="end" type="date" defaultValue={end} />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-slate-600">
                Activité
              </span>
              <select className="input" name="activity" defaultValue={activity}>
                {URSSAF_RATES_2026.map((rate) => (
                  <option key={rate.code} value={rate.code}>
                    {rate.label} - {(rate.socialContributionRate * 100).toFixed(2)} %
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 font-semibold">
              <input name="cfp" type="checkbox" defaultChecked={includeCfp} />
              Inclure la CFP dans l'estimation
            </label>

            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
              <label className="flex items-center gap-3 font-black text-emerald-950">
                <input name="acre" type="checkbox" defaultChecked={includeAcre} />
                ACRE activée
              </label>

              <p className="mt-2 text-sm leading-6 text-emerald-800">
                Si tu bénéficies de l'ACRE, les paiements encaissés dans la période ACRE sont calculés avec un taux minoré.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-emerald-900">
                    Début ACRE
                  </span>
                  <input className="input bg-white" name="acreStart" type="date" defaultValue={acreStart} />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-bold text-emerald-900">
                    Fin ACRE
                  </span>
                  <input className="input bg-white" name="acreEnd" type="date" defaultValue={acreEnd} />
                </label>
              </div>

              <div className="mt-4 rounded-2xl bg-white/80 p-4 text-sm leading-6 text-emerald-900">
                <p>
                  Taux ACRE indicatif avant juillet 2026 :{" "}
                  <strong>{(estimate.acreRateBeforeJuly2026 * 100).toFixed(2)} %</strong>
                </p>
                <p>
                  Taux ACRE indicatif à partir de juillet 2026 :{" "}
                  <strong>{(estimate.acreRateFromJuly2026 * 100).toFixed(2)} %</strong>
                </p>
              </div>
            </div>

            <button className="rounded-full bg-[var(--primary)] px-6 py-4 font-bold text-white">
              Recalculer
            </button>
          </form>
        </section>

        <section className="card rounded-[2rem] p-6">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
            Synthèse
          </p>
          <h2 className="mt-2 text-2xl font-black">Déclaration estimée</h2>

          <div className="mt-6 grid gap-3 rounded-3xl bg-slate-50 p-5 text-sm leading-6 text-slate-700">
            <p>
              <strong>Mode :</strong> {declarationFrequencyLabel(declarationFrequency)}
            </p>
            <p>
              <strong>Activité :</strong> {estimate.activityLabel}
            </p>
            <p>
              <strong>CA encaissé :</strong> {formatCurrency(estimate.turnover)}
            </p>
            <p>
              <strong>CA au taux normal :</strong> {formatCurrency(estimate.standardTurnover)}
            </p>
            <p>
              <strong>CA en période ACRE :</strong> {formatCurrency(estimate.acreTurnover)}
            </p>
            <p>
              <strong>Cotisations sociales estimées :</strong>{" "}
              {formatCurrency(estimate.socialContributionAmount)}
            </p>
            <p>
              <strong>CFP :</strong> {formatCurrency(estimate.cfpAmount)}
            </p>
            <p className="text-lg font-black text-slate-950">
              Total estimé à payer : {formatCurrency(estimate.totalEstimatedAmount)}
            </p>
          </div>

          <a
            href={URSSAF_OFFICIAL_PORTAL_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white"
          >
            Déclarer / payer sur l'URSSAF
          </a>

          <div className="mt-6 rounded-3xl bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            Cette estimation ne remplace pas la déclaration officielle. Le chiffre d'affaires à déclarer correspond aux encaissements bruts, sans déduction des frais. Les taux doivent être vérifiés sur le portail URSSAF selon l'activité, l'année, l'ACRE, la CFP et les options fiscales.
          </div>

          <div className="mt-8">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
              Détail
            </p>
            <h3 className="mt-2 text-xl font-black">Paiements pris en compte</h3>

            {!hasPayments ? (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center">
                <p className="text-xl font-black text-slate-950">
                  Aucun paiement encaissé sur cette période
                </p>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  Crée une facture, enregistre un paiement avec sa date
                  d'encaissement, puis sélectionne la période correspondante.
                </p>
              </div>
            ) : (
              <div className="table-wrap mt-6">
                <table>
                  <thead>
                    <tr>
                      <th>Facture</th>
                      <th>Client</th>
                      <th>Date paiement</th>
                      <th>Méthode</th>
                      <th>Régime</th>
                      <th>Encaissé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => {
                      const isAcre = isDateInAcrePeriod({
                        paidAt: invoice.paidAt,
                        includeAcre,
                        acreStart: acreStartDate,
                        acreEnd: acreEndDate,
                      });

                      return (
                        <tr key={invoice.paymentId}>
                          <td className="font-black">{invoice.number}</td>
                          <td>{invoice.clientName}</td>
                          <td>{formatDate(invoice.paidAt)}</td>
                          <td>{paymentMethodLabel(invoice.paymentMethod)}</td>
                          <td>{isAcre ? "ACRE" : "Normal"}</td>
                          <td className="font-black">{formatCurrency(invoice.paidAmount)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
