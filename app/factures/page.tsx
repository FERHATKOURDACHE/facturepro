import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import {
  cancelInvoiceAction,
  createInvoiceFromValidatedMissionsAction,
  registerInvoicePaymentAction,
  updateInvoiceStatusAction,
} from "@/app/factures/actions";
import { getInvoicePageData } from "@/lib/invoice-queries";
import {
  formatCurrency,
  formatHours,
} from "@/lib/invoice-calculations";

function formatDate(date: Date | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function statusBadge(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "Brouillon",
    READY: "Prête",
    SENT: "Envoyée",
    PARTIALLY_PAID: "Partiellement payée",
    PAID: "Payée",
    OVERDUE: "En retard",
    CANCELLED: "Annulée",
  };

  const classes: Record<string, string> = {
    DRAFT: "badge bg-slate-100 text-slate-700",
    READY: "badge bg-blue-50 text-blue-700",
    SENT: "badge bg-amber-50 text-amber-700",
    PARTIALLY_PAID: "badge bg-purple-50 text-purple-700",
    PAID: "badge bg-emerald-50 text-emerald-700",
    OVERDUE: "badge bg-red-50 text-red-700",
    CANCELLED: "badge bg-slate-100 text-slate-500",
  };

  return <span className={classes[status] ?? classes.DRAFT}>{labels[status] ?? status}</span>;
}

function decimalToNumber(value: unknown) {
  return Number(value ?? 0);
}

export default async function FacturesPage() {
  const { clients, profiles, invoices, stats } = await getInvoicePageData();

  const defaultClient = clients[0];
  const defaultProfile = profiles[0];

  return (
    <AppShell
      title="Factures"
      subtitle="Génération réelle d'une facture depuis les missions validées."
    >
      <div className="grid gap-5 md:grid-cols-5">
        <StatCard label="Factures" value={`${stats.invoiceCount}`} helper="En base PostgreSQL" />
        <StatCard label="À facturer" value={`${stats.validatedMissionsCount}`} helper="Missions validées" />
        <StatCard label="Total facturé" value={formatCurrency(stats.totalInvoiced)} />
        <StatCard label="En attente" value={formatCurrency(stats.totalOpen)} />
        <StatCard label="Payé" value={formatCurrency(stats.totalPaid)} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="card rounded-[2rem] p-6">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
              Génération automatique
            </p>
            <h2 className="mt-2 text-2xl font-black">Créer une facture depuis les missions</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Sélectionne un client et une période. L'application récupère les missions validées non facturées,
              groupe les lignes par taux horaire, ajoute les frais, puis applique la déduction.
            </p>
          </div>

          {clients.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-amber-300 bg-amber-50 p-5 text-amber-900">
              Ajoute d'abord un client dans la page Clients.
            </div>
          ) : (
            <form action={createInvoiceFromValidatedMissionsAction} className="grid gap-4">
              <select className="input" name="clientId" defaultValue={defaultClient?.id} required>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.legalName}
                  </option>
                ))}
              </select>

              <select className="input" name="profileId" defaultValue={defaultProfile?.id}>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.legalName} {profile.isDefault ? "(profil par défaut)" : ""}
                  </option>
                ))}
              </select>

              <div className="grid gap-4 md:grid-cols-2">
                <input className="input" name="periodStart" type="date" defaultValue="2026-05-01" required />
                <input className="input" name="periodEnd" type="date" defaultValue="2026-05-31" required />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input className="input" name="issueDate" type="date" defaultValue="2026-05-31" required />
                <input className="input" name="number" placeholder="Numéro manuel, sinon auto" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input className="input" name="paidHoursDeduction" type="number" min="0" step="0.01" defaultValue="65" placeholder="Heures déjà payées" />
                <input className="input" name="paidHoursDeductionRate" type="number" min="0" step="0.01" defaultValue="13" placeholder="Taux de déduction" />
              </div>

              <input
                className="input"
                name="deductionLabel"
                defaultValue="Déduction des 65 heures déjà réglées"
                placeholder="Libellé déduction"
              />

              <textarea
                className="input min-h-24"
                name="legalNotice"
                defaultValue={defaultProfile?.invoiceLegalNotice ?? "TVA non applicable - article 293 B du CGI"}
                placeholder="Mention légale"
              />

              <textarea
                className="input min-h-24"
                name="notes"
                defaultValue="Facture générée automatiquement depuis les missions validées de la période."
                placeholder="Notes internes / client"
              />

              <button className="rounded-full bg-[var(--primary)] px-6 py-4 font-bold text-white shadow-xl transition hover:-translate-y-0.5">
                Générer la facture
              </button>
            </form>
          )}
        </section>

        <section className="card rounded-[2rem] p-6">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
                Historique
              </p>
              <h2 className="mt-2 text-2xl font-black">Factures générées</h2>
            </div>
            <span className="badge bg-emerald-50 text-emerald-700">
              {invoices.length} facture{invoices.length > 1 ? "s" : ""}
            </span>
          </div>

          {invoices.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center">
              <p className="text-lg font-black">Aucune facture pour le moment</p>
              <p className="mt-2 text-slate-600">Valide des missions, puis génère ta première facture.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {invoices.map((invoice) => {
                const paidAmount = invoice.payments.reduce(
                  (sum, payment) => sum + decimalToNumber(payment.amount),
                  0
                );

                return (
                  <article key={invoice.id} className="rounded-[1.5rem] border border-slate-100 bg-white/85 p-5">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-black">{invoice.number}</h3>
                          {statusBadge(invoice.status)}
                        </div>

                        <p className="mt-2 text-sm text-slate-600">
                          Client : <span className="font-semibold text-slate-800">{invoice.client.legalName}</span>
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Émise le {formatDate(invoice.issueDate)} · Échéance {formatDate(invoice.dueDate)}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Période : {formatDate(invoice.periodStart)} au {formatDate(invoice.periodEnd)}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="badge bg-slate-100 text-slate-700">
                            {invoice.missions.length} mission{invoice.missions.length > 1 ? "s" : ""}
                          </span>
                          <span className="badge bg-slate-100 text-slate-700">
                            {invoice.lines.length} ligne{invoice.lines.length > 1 ? "s" : ""}
                          </span>
                          <span className="badge bg-slate-100 text-slate-700">
                            Payé : {formatCurrency(paidAmount)}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-3xl bg-slate-950 p-5 text-right text-white">
                        <p className="text-sm text-slate-400">Total à payer</p>
                        <p className="mt-2 text-3xl font-black">{formatCurrency(decimalToNumber(invoice.total))}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          TVA : {formatCurrency(decimalToNumber(invoice.vatAmount))}
                        </p>
                      </div>
                    </div>

                    <details className="mt-5 rounded-2xl bg-slate-50 p-4">
                      <summary className="cursor-pointer font-black text-slate-800">
                        Voir le détail de la facture
                      </summary>

                      <div className="table-wrap mt-5">
                        <table>
                          <thead>
                            <tr>
                              <th>Ligne</th>
                              <th>Quantité</th>
                              <th>Unité</th>
                              <th>Prix unitaire</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoice.lines.map((line) => (
                              <tr key={line.id}>
                                <td>
                                  <p className="font-black">{line.label}</p>
                                  {line.description && <p className="text-xs text-slate-500">{line.description}</p>}
                                </td>
                                <td>
                                  {line.unit === "HOUR"
                                    ? formatHours(decimalToNumber(line.quantity))
                                    : decimalToNumber(line.quantity)}
                                </td>
                                <td>{line.unit}</td>
                                <td>{formatCurrency(decimalToNumber(line.unitPrice))}</td>
                                <td className="font-black">{formatCurrency(decimalToNumber(line.total))}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {invoice.legalNotice && (
                        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
                          {invoice.legalNotice}
                        </div>
                      )}
                    </details>

                    <div className="mt-5 grid gap-3 md:grid-cols-6">
                      <a
                        href={`/api/invoices/${invoice.id}/pdf`}
                        className="rounded-full bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white"
                      >
                        PDF
                      </a>

                      <a
                        href={`/api/invoices/${invoice.id}/excel`}
                        className="rounded-full bg-emerald-50 px-4 py-3 text-center text-sm font-bold text-emerald-700"
                      >
                        Excel
                      </a>

                      <form action={updateInvoiceStatusAction}>
                        <input type="hidden" name="id" value={invoice.id} />
                        <input type="hidden" name="status" value="SENT" />
                        <button className="w-full rounded-full bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
                          Marquer envoyée
                        </button>
                      </form>

                      <form action={registerInvoicePaymentAction} className="rounded-2xl bg-emerald-50 p-3">
                        <input type="hidden" name="id" value={invoice.id} />
                        <input className="input mb-2 bg-white" name="amount" type="number" min="0" step="0.01" defaultValue={decimalToNumber(invoice.total)} />
                        <input className="input mb-2 bg-white" name="reference" placeholder="Référence paiement" />
                        <button className="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white">
                          Enregistrer paiement
                        </button>
                      </form>

                      <form action={updateInvoiceStatusAction}>
                        <input type="hidden" name="id" value={invoice.id} />
                        <input type="hidden" name="status" value="OVERDUE" />
                        <button className="w-full rounded-full bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                          Marquer en retard
                        </button>
                      </form>

                      <form action={cancelInvoiceAction}>
                        <input type="hidden" name="id" value={invoice.id} />
                        <button className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
                          Annuler / libérer missions
                        </button>
                      </form>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
