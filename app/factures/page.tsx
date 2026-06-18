import Link from "next/link";
import { requireUser } from "@/lib/require-auth";
import { requireCompanyProfileCompleted } from "@/lib/onboarding";
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

export const dynamic = "force-dynamic";

type FacturesPageProps = {
  searchParams?: Promise<{
    saved?: string;
  }>;
};

function formatDate(date: Date | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getSavedMessage(saved?: string) {
  const messages: Record<string, { title: string; message: string }> = {
    created: {
      title: "Facture générée",
      message: "La facture a bien été créée depuis les missions validées.",
    },
    payment: {
      title: "Paiement enregistré",
      message:
        "Le paiement a bien été ajouté. Le suivi URSSAF tiendra compte de la date d'encaissement.",
    },
    sent: {
      title: "Facture marquée envoyée",
      message: "Le statut de la facture a bien été mis à jour.",
    },
    overdue: {
      title: "Facture marquée en retard",
      message: "La facture est maintenant signalée comme en retard.",
    },
    status_updated: {
      title: "Statut mis à jour",
      message: "Le statut de la facture a bien été enregistré.",
    },
    cancelled: {
      title: "Facture annulée",
      message:
        "La facture a été annulée et les missions associées ont été libérées.",
    },
  };

  return saved ? messages[saved] ?? null : null;
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

  return (
    <span className={classes[status] ?? classes.DRAFT}>
      {labels[status] ?? status}
    </span>
  );
}

function decimalToNumber(value: unknown) {
  return Number(value ?? 0);
}

function unitLabel(unit: string) {
  const labels: Record<string, string> = {
    HOUR: "Heures",
    DAY: "Jours",
    UNIT: "Unités",
    FIXED_PRICE: "Forfait",
  };

  return labels[unit] ?? unit;
}

function paymentMethodLabel(method: string) {
  const labels: Record<string, string> = {
    BANK_TRANSFER: "Virement bancaire",
    CARD: "Carte bancaire",
    CASH: "Espèces",
    CHECK: "Chèque",
    OTHER: "Autre",
  };

  return labels[method] ?? method;
}

function getInvoicePaymentInfo(invoice: {
  total: unknown;
  payments: Array<{ amount: unknown }>;
}) {
  const total = decimalToNumber(invoice.total);
  const paid = invoice.payments.reduce(
    (sum, payment) => sum + decimalToNumber(payment.amount),
    0
  );
  const remaining = Math.max(0, total - paid);
  const progress = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

  return {
    total,
    paid,
    remaining,
    progress,
  };
}

export default async function FacturesPage({ searchParams }: FacturesPageProps) {
  await requireUser();
  await requireCompanyProfileCompleted();

  const params = await searchParams;
  const savedMessage = getSavedMessage(params?.saved);

  const { clients, profiles, invoices, stats } = await getInvoicePageData();

  const defaultClient = clients[0];
  const defaultProfile = profiles[0];

  const today = new Date();
  const firstDayOfMonth = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
  );

  const todayInput = toDateInput(today);
  const firstDayInput = toDateInput(firstDayOfMonth);

  return (
    <AppShell
      title="Factures"
      subtitle="Crée, exporte, envoie et encaisse tes factures depuis les missions validées."
    >
      <div className="grid gap-5 md:grid-cols-5">
        <StatCard
          label="Factures"
          value={`${stats.invoiceCount}`}
          helper="Historique complet"
        />
        <StatCard
          label="À facturer"
          value={`${stats.validatedMissionsCount}`}
          helper="Missions validées"
        />
        <StatCard
          label="Total facturé"
          value={formatCurrency(stats.totalInvoiced)}
          helper="Hors factures annulées"
        />
        <StatCard
          label="En attente"
          value={formatCurrency(stats.totalOpen)}
          helper="À encaisser"
        />
        <StatCard
          label="Payé"
          value={formatCurrency(stats.totalPaid)}
          helper="CA encaissé"
        />
      </div>

      {savedMessage && (
        <section className="mt-6 rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-black">{savedMessage.title}</p>
              <p className="mt-1 text-sm leading-6">{savedMessage.message}</p>
            </div>

            <span className="w-fit rounded-full bg-white px-4 py-2 text-sm font-black text-emerald-700 ring-1 ring-emerald-100">
              Sauvegarde OK
            </span>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[var(--primary)]">
              Cycle de facturation
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Missions validées → facture → PDF / Excel → paiement → URSSAF
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Une facture est générée depuis des missions validées. Elle peut
              ensuite être exportée, envoyée, encaissée puis utilisée dans le
              suivi du chiffre d'affaires encaissé pour l'URSSAF.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/missions"
              className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-black text-slate-800 transition hover:bg-white"
            >
              Aller aux missions
            </Link>
            <Link
              href="/urssaf"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
            >
              Voir l'URSSAF
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="card rounded-[2rem] p-6">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
              Génération automatique
            </p>
            <h2 className="mt-2 text-2xl font-black">
              Créer une facture depuis les missions
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Sélectionne un client et une période. FacturePro récupère les
              missions validées non facturées, groupe les lignes par taux
              horaire, ajoute les frais et prépare les exports PDF / Excel.
            </p>
          </div>

          {clients.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-amber-300 bg-amber-50 p-5 text-amber-900">
              <p className="text-lg font-black">Client requis</p>
              <p className="mt-2 text-sm leading-6">
                Pour générer une facture, commence par ajouter un client, puis
                crée et valide des missions associées à ce client.
              </p>
              <Link
                href="/clients"
                className="mt-4 inline-flex rounded-full bg-amber-900 px-5 py-3 text-sm font-bold text-white"
              >
                Ajouter un client
              </Link>
            </div>
          ) : (
            <form
              action={createInvoiceFromValidatedMissionsAction}
              className="grid gap-4"
            >
              <select
                className="input"
                name="clientId"
                defaultValue={defaultClient?.id}
                required
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.legalName}
                  </option>
                ))}
              </select>

              <select
                className="input"
                name="profileId"
                defaultValue={defaultProfile?.id}
              >
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.legalName}{" "}
                    {profile.isDefault ? "(profil par défaut)" : ""}
                  </option>
                ))}
              </select>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  className="input"
                  name="periodStart"
                  type="date"
                  defaultValue={firstDayInput}
                  required
                />
                <input
                  className="input"
                  name="periodEnd"
                  type="date"
                  defaultValue={todayInput}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  className="input"
                  name="issueDate"
                  type="date"
                  defaultValue={todayInput}
                  required
                />
                <input
                  className="input"
                  name="number"
                  placeholder="Numéro manuel, sinon automatique"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  className="input"
                  name="paidHoursDeduction"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue="0"
                  placeholder="Heures déjà payées"
                />
                <input
                  className="input"
                  name="paidHoursDeductionRate"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue="13"
                  placeholder="Taux de déduction"
                />
              </div>

              <input
                className="input"
                name="deductionLabel"
                placeholder="Libellé de déduction"
              />

              <textarea
                className="input min-h-24"
                name="legalNotice"
                defaultValue={
                  defaultProfile?.invoiceLegalNotice ??
                  "TVA non applicable - article 293 B du CGI"
                }
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
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
                Facturation
              </p>
              <p className="mt-3 text-xl font-black text-slate-950">
                Aucune facture générée
              </p>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Valide tes missions, sélectionne un client et une période, puis
                génère automatiquement une facture prête à exporter en PDF ou Excel.
              </p>
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-left text-sm leading-6 text-slate-600">
                <p className="font-bold text-slate-900">Étapes recommandées :</p>
                <p>
                  1. Ajouter un client · 2. Créer une mission · 3. Valider la
                  mission · 4. Générer la facture.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {invoices.map((invoice) => {
                const paymentInfo = getInvoicePaymentInfo(invoice);

                return (
                  <article
                    key={invoice.id}
                    className="rounded-[1.5rem] border border-slate-100 bg-white/85 p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-black">{invoice.number}</h3>
                          {statusBadge(invoice.status)}
                        </div>

                        <p className="mt-2 text-sm text-slate-600">
                          Client :{" "}
                          <span className="font-semibold text-slate-800">
                            {invoice.client.legalName}
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Émise le {formatDate(invoice.issueDate)} · Échéance{" "}
                          {formatDate(invoice.dueDate)}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Période : {formatDate(invoice.periodStart)} au{" "}
                          {formatDate(invoice.periodEnd)}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="badge bg-slate-100 text-slate-700">
                            {invoice.missions.length} mission
                            {invoice.missions.length > 1 ? "s" : ""}
                          </span>
                          <span className="badge bg-slate-100 text-slate-700">
                            {invoice.lines.length} ligne
                            {invoice.lines.length > 1 ? "s" : ""}
                          </span>
                          <span className="badge bg-emerald-50 text-emerald-700">
                            Payé : {formatCurrency(paymentInfo.paid)}
                          </span>
                          <span className="badge bg-amber-50 text-amber-700">
                            Reste : {formatCurrency(paymentInfo.remaining)}
                          </span>
                        </div>
                      </div>

                      <div className="min-w-[230px] rounded-3xl bg-slate-950 p-5 text-right text-white">
                        <p className="text-sm text-slate-400">Total facture</p>
                        <p className="mt-2 text-3xl font-black">
                          {formatCurrency(paymentInfo.total)}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          TVA : {formatCurrency(decimalToNumber(invoice.vatAmount))}
                        </p>

                        <div className="mt-4 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-2 rounded-full bg-emerald-400"
                            style={{ width: `${paymentInfo.progress}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs font-bold text-slate-300">
                          Encaissement : {paymentInfo.progress}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      <a
                        href={`/api/invoices/${invoice.id}/pdf`}
                        className="rounded-2xl bg-slate-950 px-5 py-4 text-center text-sm font-black text-white transition hover:-translate-y-0.5"
                      >
                        Télécharger le PDF
                      </a>

                      <a
                        href={`/api/invoices/${invoice.id}/excel`}
                        className="rounded-2xl bg-emerald-50 px-5 py-4 text-center text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
                      >
                        Exporter Excel
                      </a>
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
                                  {line.description && (
                                    <p className="text-xs text-slate-500">
                                      {line.description}
                                    </p>
                                  )}
                                </td>
                                <td>
                                  {line.unit === "HOUR"
                                    ? formatHours(decimalToNumber(line.quantity))
                                    : decimalToNumber(line.quantity)}
                                </td>
                                <td>{unitLabel(line.unit)}</td>
                                <td>
                                  {formatCurrency(decimalToNumber(line.unitPrice))}
                                </td>
                                <td className="font-black">
                                  {formatCurrency(decimalToNumber(line.total))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {invoice.payments.length > 0 && (
                        <div className="mt-5 rounded-2xl bg-white p-4">
                          <p className="font-black text-slate-950">
                            Paiements enregistrés
                          </p>
                          <div className="mt-3 grid gap-2">
                            {invoice.payments.map((payment) => (
                              <div
                                key={payment.id}
                                className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700"
                              >
                                <span className="font-black text-slate-950">
                                  {formatCurrency(decimalToNumber(payment.amount))}
                                </span>{" "}
                                · {paymentMethodLabel(payment.method)} · encaissé le{" "}
                                {formatDate(payment.paidAt)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {invoice.legalNotice && (
                        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
                          {invoice.legalNotice}
                        </div>
                      )}
                    </details>

                    <div className="mt-5 grid gap-3 md:grid-cols-6">
                      <form action={updateInvoiceStatusAction}>
                        <input type="hidden" name="id" value={invoice.id} />
                        <input type="hidden" name="status" value="SENT" />
                        <button className="w-full rounded-full bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
                          Marquer envoyée
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
                          Annuler
                        </button>
                      </form>

                      {paymentInfo.remaining > 0 ? (
                        <form
                          action={registerInvoicePaymentAction}
                          className="rounded-2xl bg-emerald-50 p-3 md:col-span-3"
                        >
                          <input type="hidden" name="id" value={invoice.id} />

                          <div className="mb-2 rounded-xl bg-white/80 p-3 text-xs font-bold text-emerald-900">
                            Reste à payer : {formatCurrency(paymentInfo.remaining)}
                          </div>

                          <div className="grid gap-2 md:grid-cols-2">
                            <input
                              className="input bg-white"
                              name="amount"
                              type="number"
                              min="0"
                              step="0.01"
                              defaultValue={paymentInfo.remaining}
                              placeholder="Montant encaissé"
                            />
                            <input
                              className="input bg-white"
                              name="paidAt"
                              type="date"
                              defaultValue={todayInput}
                              aria-label="Date d'encaissement"
                            />
                          </div>

                          <select
                            className="input mt-2 bg-white"
                            name="method"
                            defaultValue="BANK_TRANSFER"
                          >
                            <option value="BANK_TRANSFER">Virement bancaire</option>
                            <option value="CARD">Carte bancaire</option>
                            <option value="CASH">Espèces</option>
                            <option value="CHECK">Chèque</option>
                            <option value="OTHER">Autre</option>
                          </select>

                          <input
                            className="input mt-2 bg-white"
                            name="reference"
                            placeholder="Référence paiement"
                          />

                          <textarea
                            className="input mt-2 min-h-20 bg-white"
                            name="notes"
                            placeholder="Notes paiement"
                          />

                          <button className="mt-2 w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white">
                            Enregistrer paiement
                          </button>
                        </form>
                      ) : (
                        <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800 md:col-span-3">
                          Facture entièrement payée
                        </div>
                      )}
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
