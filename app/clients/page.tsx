import { requireUser } from "@/lib/require-auth";
import { requireCompanyProfileCompleted } from "@/lib/onboarding";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { createClientAction, deleteClientAction, updateClientAction } from "@/app/clients/actions";
import { getClients, getClientStats } from "@/lib/client-queries";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}


export default async function ClientsPage() {
  await requireUser();
  await requireCompanyProfileCompleted();
  const [clients, stats] = await Promise.all([getClients(), getClientStats()]);

  return (
    <AppShell
      title="Clients"
      subtitle="Gestion rÃ©elle des clients connectÃ©e Ã  PostgreSQL avec Prisma."
    >
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard label="Clients" value={`${stats.clientCount}`} helper="EnregistrÃ©s en base" />
        <StatCard label="Missions" value={`${stats.missionCount}`} helper="LiÃ©es aux clients" />
        <StatCard label="Factures" value={`${stats.invoiceCount}`} helper="Historique client" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="card rounded-[2rem] p-6">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
              Nouveau client
            </p>
            <h2 className="mt-2 text-2xl font-black">Ajouter un client</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Renseigne les informations principales de ton client pour pouvoir créer des missions et générer des factures.
            </p>
          </div>

          <form action={createClientAction} className="grid gap-4">
            <input className="input" name="legalName" placeholder="Raison sociale *" required />
            <input className="input" name="contactName" placeholder="Contact" />
            <input className="input" name="email" type="email" placeholder="Email facturation" />
            <input className="input" name="phone" placeholder="TÃ©lÃ©phone" />
            <input className="input" name="addressLine1" placeholder="Adresse *" required />

            <div className="grid gap-4 md:grid-cols-3">
              <input className="input" name="postalCode" placeholder="Code postal" />
              <input className="input" name="city" placeholder="Ville" />
              <input className="input" name="country" defaultValue="FR" placeholder="Pays" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <input className="input" name="siren" placeholder="SIREN" />
              <input className="input" name="siret" placeholder="SIRET" />
              <input className="input" name="ape" placeholder="APE / NAF" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input className="input" name="vatNumber" placeholder="NÂ° TVA intracommunautaire" />
              <input className="input" name="paymentTermsDays" type="number" min="0" defaultValue="30" placeholder="DÃ©lai paiement" />
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
              <h2 className="mt-2 text-2xl font-black">Clients enregistrÃ©s</h2>
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
                Ajoute ton premier client pour commencer à créer des missions, suivre tes heures et générer tes factures.
              </p>
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-left text-sm leading-6 text-slate-600">
                <p className="font-bold text-slate-900">Conseil :</p>
                <p>Commence par renseigner le nom légal, l’adresse, le code postal et la ville du client.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {clients.map((client) => (
                <article key={client.id} className="rounded-[1.5rem] border border-slate-100 bg-white/85 p-5">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div>
                      <h3 className="text-xl font-black">{client.legalName}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {client.addressLine1}
                        {client.postalCode || client.city ? `, ${client.postalCode ?? ""} ${client.city ?? ""}` : ""}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {client.siret && <span className="badge bg-slate-100 text-slate-700">SIRET : {client.siret}</span>}
                        {client.ape && <span className="badge bg-slate-100 text-slate-700">APE : {client.ape}</span>}
                        <span className="badge bg-emerald-50 text-emerald-700">CrÃ©Ã© le {formatDate(client.createdAt)}</span>
                      </div>
                    </div>

                    <form action={deleteClientAction}>
                      <input type="hidden" name="id" value={client.id} />
                      <button className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700">
                        Supprimer
                      </button>
                    </form>
                  </div>

                  <details className="mt-5 rounded-2xl bg-slate-50 p-4">
                    <summary className="cursor-pointer font-black text-slate-800">
                      Modifier ce client
                    </summary>

                    <form action={updateClientAction} className="mt-5 grid gap-4">
                      <input type="hidden" name="id" value={client.id} />
                      <input className="input" name="legalName" defaultValue={client.legalName} required />
                      <input className="input" name="contactName" defaultValue={client.contactName ?? ""} placeholder="Contact" />
                      <input className="input" name="email" type="email" defaultValue={client.email ?? ""} placeholder="Email" />
                      <input className="input" name="phone" defaultValue={client.phone ?? ""} placeholder="TÃ©lÃ©phone" />
                      <input className="input" name="addressLine1" defaultValue={client.addressLine1} required />

                      <div className="grid gap-4 md:grid-cols-3">
                        <input className="input" name="postalCode" defaultValue={client.postalCode ?? ""} placeholder="Code postal" />
                        <input className="input" name="city" defaultValue={client.city ?? ""} placeholder="Ville" />
                        <input className="input" name="country" defaultValue={client.country ?? "FR"} placeholder="Pays" />
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <input className="input" name="siren" defaultValue={client.siren ?? ""} placeholder="SIREN" />
                        <input className="input" name="siret" defaultValue={client.siret ?? ""} placeholder="SIRET" />
                        <input className="input" name="ape" defaultValue={client.ape ?? ""} placeholder="APE / NAF" />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <input className="input" name="vatNumber" defaultValue={client.vatNumber ?? ""} placeholder="NÂ° TVA" />
                        <input className="input" name="paymentTermsDays" type="number" min="0" defaultValue={client.paymentTermsDays} />
                      </div>

                      <button className="rounded-full bg-slate-950 px-6 py-3 font-bold text-white">
                        Sauvegarder les modifications
                      </button>
                    </form>
                  </details>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}



