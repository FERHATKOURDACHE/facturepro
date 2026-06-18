import Link from "next/link";

import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import {
  createClientAction,
  deleteClientAction,
  updateClientAction,
} from "@/app/clients/actions";
import { requireCompanyProfileCompleted } from "@/lib/onboarding";
import { requireUser } from "@/lib/require-auth";
import { getClients, getClientStats } from "@/lib/client-queries";

export const dynamic = "force-dynamic";

type ClientsPageProps = {
  searchParams?: Promise<{
    saved?: string;
  }>;
};

type ClientItem = Awaited<ReturnType<typeof getClients>>[number];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getSavedMessage(saved?: string) {
  if (saved === "created") {
    return {
      title: "Client enregistré",
      message:
        "Le client a bien été ajouté. Tu peux maintenant créer une mission ou préparer une facture.",
    };
  }

  if (saved === "updated") {
    return {
      title: "Client mis à jour",
      message: "Les informations du client ont bien été sauvegardées.",
    };
  }

  if (saved === "deleted") {
    return {
      title: "Client supprimé",
      message: "Le client a bien été retiré de ta base.",
    };
  }

  return null;
}

function clientCompleteness(client: ClientItem) {
  const fields = [
    client.legalName,
    client.addressLine1,
    client.postalCode,
    client.city,
    client.email,
    client.siret,
  ];

  const completed = fields.filter(Boolean).length;
  const total = fields.length;
  const percent = Math.round((completed / total) * 100);

  return {
    completed,
    total,
    percent,
    isComplete: percent >= 85,
  };
}

function addressLine(client: ClientItem) {
  const parts = [
    client.addressLine1,
    client.addressLine2,
    [client.postalCode, client.city].filter(Boolean).join(" "),
    client.country,
  ].filter(Boolean);

  return parts.join(" · ");
}

function contactLine(client: ClientItem) {
  const parts = [
    client.contactName ? `Contact : ${client.contactName}` : null,
    client.email ? `Email : ${client.email}` : null,
    client.phone ? `Téléphone : ${client.phone}` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : "Aucune coordonnée de contact renseignée.";
}

function identityLine(client: ClientItem) {
  const parts = [
    client.siren ? `SIREN : ${client.siren}` : null,
    client.siret ? `SIRET : ${client.siret}` : null,
    client.ape ? `APE / NAF : ${client.ape}` : null,
    client.vatNumber ? `TVA : ${client.vatNumber}` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : "Aucune identification entreprise renseignée.";
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  await requireUser();
  await requireCompanyProfileCompleted();

  const params = await searchParams;
  const savedMessage = getSavedMessage(params?.saved);

  const [clients, stats] = await Promise.all([getClients(), getClientStats()]);

  return (
    <AppShell
      title="Clients"
      subtitle="Centralise tes clients, leurs coordonnées de facturation et le parcours vers missions et factures."
    >
      <div className="grid gap-5 md:grid-cols-4">
        <StatCard
          label="Clients"
          value={`${stats.clientCount}`}
          helper="Base active"
        />
        <StatCard
          label="Missions"
          value={`${stats.missionCount}`}
          helper="Rattachées aux clients"
        />
        <StatCard
          label="Factures"
          value={`${stats.invoiceCount}`}
          helper="Historique client"
        />
        <StatCard
          label="À compléter"
          value={`${stats.incompleteCount}`}
          helper="Fiches incomplètes"
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
              Parcours client
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Client → mission → facture → encaissement
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Une fiche client propre facilite la saisie des missions, la génération
              des factures PDF / Excel et le suivi des paiements. Priorité : nom légal,
              adresse, ville, email de facturation, SIRET et délai de paiement.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/missions"
              className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-black text-slate-800 transition hover:bg-white"
            >
              Créer une mission
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

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="card rounded-[2rem] p-6">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
              Nouveau client
            </p>
            <h2 className="mt-2 text-2xl font-black">Ajouter un client</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Renseigne une fiche claire dès le départ. Les informations saisies
              ici seront utilisées dans les missions, les factures et les exports.
            </p>
          </div>

          <form action={createClientAction} className="grid gap-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-950">
                1. Identité du client
              </p>
              <div className="mt-4 grid gap-4">
                <input
                  className="input bg-white"
                  name="legalName"
                  placeholder="Raison sociale *"
                  required
                />
                <input
                  className="input bg-white"
                  name="contactName"
                  placeholder="Contact principal"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-950">
                2. Coordonnées de facturation
              </p>
              <div className="mt-4 grid gap-4">
                <input
                  className="input bg-white"
                  name="email"
                  type="email"
                  placeholder="Email facturation"
                  autoComplete="email"
                />
                <input
                  className="input bg-white"
                  name="phone"
                  placeholder="Téléphone"
                  autoComplete="tel"
                />
                <input
                  className="input bg-white"
                  name="addressLine1"
                  placeholder="Adresse *"
                  required
                />
                <input
                  className="input bg-white"
                  name="addressLine2"
                  placeholder="Complément d'adresse"
                />

                <div className="grid gap-4 md:grid-cols-3">
                  <input
                    className="input bg-white"
                    name="postalCode"
                    placeholder="Code postal"
                  />
                  <input
                    className="input bg-white"
                    name="city"
                    placeholder="Ville"
                  />
                  <input
                    className="input bg-white"
                    name="country"
                    defaultValue="FR"
                    placeholder="Pays"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-950">
                3. Informations légales et paiement
              </p>
              <div className="mt-4 grid gap-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <input className="input bg-white" name="siren" placeholder="SIREN" />
                  <input className="input bg-white" name="siret" placeholder="SIRET" />
                  <input className="input bg-white" name="ape" placeholder="APE / NAF" />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    className="input bg-white"
                    name="vatNumber"
                    placeholder="N° TVA intracommunautaire"
                  />
                  <input
                    className="input bg-white"
                    name="paymentTermsDays"
                    type="number"
                    min="0"
                    defaultValue="30"
                    placeholder="Délai paiement"
                  />
                </div>
              </div>
            </div>

            <button className="rounded-full bg-[var(--primary)] px-6 py-4 font-bold text-white shadow-xl transition hover:-translate-y-0.5">
              Enregistrer le client
            </button>
          </form>
        </section>

        <section className="card rounded-[2rem] p-6">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
                Base clients
              </p>
              <h2 className="mt-2 text-2xl font-black">Clients enregistrés</h2>
            </div>
            <span className="badge bg-emerald-50 text-emerald-700">
              {clients.length} client{clients.length > 1 ? "s" : ""}
            </span>
          </div>

          {clients.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
                Première étape
              </p>
              <p className="mt-3 text-xl font-black text-slate-950">
                Aucun client enregistré
              </p>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Ajoute ton premier client pour créer des missions, suivre tes heures
                et générer tes factures.
              </p>
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-left text-sm leading-6 text-slate-600">
                <p className="font-bold text-slate-900">Checklist minimale :</p>
                <p>
                  Nom légal, adresse, code postal, ville, email de facturation
                  et délai de paiement.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {clients.map((client) => {
                const completeness = clientCompleteness(client);
                const relatedCount = client._count.missions + client._count.invoices;

                return (
                  <article
                    key={client.id}
                    className="rounded-[1.5rem] border border-slate-100 bg-white/85 p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-black">{client.legalName}</h3>
                          <span
                            className={
                              completeness.isComplete
                                ? "badge bg-emerald-50 text-emerald-700"
                                : "badge bg-amber-50 text-amber-700"
                            }
                          >
                            Fiche {completeness.percent}% complète
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {addressLine(client) || "Adresse non renseignée."}
                        </p>

                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                              Missions
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-950">
                              {client._count.missions}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                              Factures
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-950">
                              {client._count.invoices}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                              Paiement
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-950">
                              {client.paymentTermsDays}j
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {client.siret && (
                            <span className="badge bg-slate-100 text-slate-700">
                              SIRET : {client.siret}
                            </span>
                          )}
                          {client.ape && (
                            <span className="badge bg-slate-100 text-slate-700">
                              APE : {client.ape}
                            </span>
                          )}
                          <span className="badge bg-emerald-50 text-emerald-700">
                            Créé le {formatDate(client.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex min-w-[190px] flex-col gap-2">
                        <Link
                          href="/missions"
                          className="rounded-full bg-slate-950 px-4 py-2 text-center text-sm font-bold text-white"
                        >
                          Mission
                        </Link>
                        <Link
                          href="/factures"
                          className="rounded-full bg-emerald-50 px-4 py-2 text-center text-sm font-bold text-emerald-700"
                        >
                          Facture
                        </Link>

                        {relatedCount === 0 ? (
                          <form action={deleteClientAction}>
                            <input type="hidden" name="id" value={client.id} />
                            <button className="w-full rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100">
                              Supprimer
                            </button>
                          </form>
                        ) : (
                          <div className="rounded-2xl bg-slate-100 p-3 text-xs font-bold leading-5 text-slate-600">
                            Suppression verrouillée : client lié à des missions ou factures.
                          </div>
                        )}
                      </div>
                    </div>

                    <details className="mt-5 rounded-2xl bg-slate-50 p-4">
                      <summary className="cursor-pointer font-black text-slate-800">
                        Voir et modifier la fiche complète
                      </summary>

                      <div className="mt-4 grid gap-3 text-sm text-slate-600">
                        <div className="rounded-2xl bg-white p-4">
                          <p className="font-black text-slate-950">Contact</p>
                          <p className="mt-1 leading-6">{contactLine(client)}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-4">
                          <p className="font-black text-slate-950">Identification</p>
                          <p className="mt-1 leading-6">{identityLine(client)}</p>
                        </div>
                      </div>

                      <form action={updateClientAction} className="mt-5 grid gap-4">
                        <input type="hidden" name="id" value={client.id} />

                        <input
                          className="input"
                          name="legalName"
                          defaultValue={client.legalName}
                          required
                        />
                        <input
                          className="input"
                          name="contactName"
                          defaultValue={client.contactName ?? ""}
                          placeholder="Contact"
                        />
                        <input
                          className="input"
                          name="email"
                          type="email"
                          defaultValue={client.email ?? ""}
                          placeholder="Email"
                          autoComplete="email"
                        />
                        <input
                          className="input"
                          name="phone"
                          defaultValue={client.phone ?? ""}
                          placeholder="Téléphone"
                          autoComplete="tel"
                        />
                        <input
                          className="input"
                          name="addressLine1"
                          defaultValue={client.addressLine1}
                          required
                        />
                        <input
                          className="input"
                          name="addressLine2"
                          defaultValue={client.addressLine2 ?? ""}
                          placeholder="Complément d'adresse"
                        />

                        <div className="grid gap-4 md:grid-cols-3">
                          <input
                            className="input"
                            name="postalCode"
                            defaultValue={client.postalCode ?? ""}
                            placeholder="Code postal"
                          />
                          <input
                            className="input"
                            name="city"
                            defaultValue={client.city ?? ""}
                            placeholder="Ville"
                          />
                          <input
                            className="input"
                            name="country"
                            defaultValue={client.country ?? "FR"}
                            placeholder="Pays"
                          />
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <input
                            className="input"
                            name="siren"
                            defaultValue={client.siren ?? ""}
                            placeholder="SIREN"
                          />
                          <input
                            className="input"
                            name="siret"
                            defaultValue={client.siret ?? ""}
                            placeholder="SIRET"
                          />
                          <input
                            className="input"
                            name="ape"
                            defaultValue={client.ape ?? ""}
                            placeholder="APE / NAF"
                          />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <input
                            className="input"
                            name="vatNumber"
                            defaultValue={client.vatNumber ?? ""}
                            placeholder="N° TVA"
                          />
                          <input
                            className="input"
                            name="paymentTermsDays"
                            type="number"
                            min="0"
                            defaultValue={client.paymentTermsDays}
                          />
                        </div>

                        <button className="rounded-full bg-slate-950 px-6 py-3 font-bold text-white transition hover:-translate-y-0.5">
                          Sauvegarder les modifications
                        </button>
                      </form>
                    </details>
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
