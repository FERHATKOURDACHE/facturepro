import { requireUser } from "@/lib/require-auth";
import { requireCompanyProfileCompleted } from "@/lib/onboarding";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import {
  createMissionAction,
  deleteMissionAction,
  draftMissionAction,
  seedMayMissionsAction,
  updateMissionAction,
  validateMissionAction,
} from "@/app/missions/actions";
import { getMissionPageData } from "@/lib/mission-queries";
import {
  formatCurrency,
  formatDateFr,
  formatHours,
  formatTimeUtc,
} from "@/lib/mission-calculations";

export const dynamic = "force-dynamic";

function toInputDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toInputTime(date: Date) {
  return date.toISOString().slice(11, 16);
}

function statusBadge(status: string) {
  const labelMap: Record<string, string> = {
    DRAFT: "Brouillon",
    VALIDATED: "ValidÃ©e",
    INVOICED: "FacturÃ©e",
    PAID: "PayÃ©e",
    CANCELLED: "AnnulÃ©e",
  };

  const classMap: Record<string, string> = {
    DRAFT: "badge bg-slate-100 text-slate-700",
    VALIDATED: "badge bg-emerald-50 text-emerald-700",
    INVOICED: "badge bg-blue-50 text-blue-700",
    PAID: "badge bg-green-50 text-green-700",
    CANCELLED: "badge bg-red-50 text-red-700",
  };

  return (
    <span className={classMap[status] ?? "badge bg-slate-100 text-slate-700"}>
      {labelMap[status] ?? status}
    </span>
  );
}

export default async function MissionsPage() {
  await requireUser();
  await requireCompanyProfileCompleted();
  const { clients, missions, stats, weeklyTotals, locationTotals } = await getMissionPageData();
  const defaultClient = clients[0];

  return (
    <AppShell
      title="Missions & heures"
      subtitle="Saisie rÃ©elle des horaires, calcul automatique des heures et totaux par semaine."
    >
      <div className="grid gap-5 md:grid-cols-5">
        <StatCard label="Missions" value={`${stats.missionCount}`} helper="En base PostgreSQL" />
        <StatCard label="Heures" value={formatHours(stats.totalHours)} helper="Total calculÃ©" />
        <StatCard label="Prestations" value={formatCurrency(stats.totalServices)} helper="Hors frais" />
        <StatCard label="Frais" value={formatCurrency(stats.totalExpenses)} helper="Essence / autres" />
        <StatCard label="Total" value={formatCurrency(stats.totalWithExpenses)} helper="Prestations + frais" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="card rounded-[2rem] p-6">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
              Nouvelle mission
            </p>
            <h2 className="mt-2 text-2xl font-black">Saisir une journÃ©e ou vacation</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              L'application calcule automatiquement la durÃ©e travaillÃ©e avec l'heure de dÃ©but, l'heure de fin et la pause.
            </p>
          </div>

          {clients.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-amber-300 bg-amber-50 p-5 text-amber-900">
              Ajoute d'abord un client dans la page Clients.
            </div>
          ) : (
            <form action={createMissionAction} className="grid gap-4">
              <select className="input" name="clientId" defaultValue={defaultClient?.id} required>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.legalName}
                  </option>
                ))}
              </select>

              <input className="input" name="title" defaultValue="Prestation magasin" placeholder="Titre de la mission *" required />

              <div className="grid gap-4 md:grid-cols-3">
                <input className="input" name="date" type="date" required />
                <input className="input" name="startTime" type="time" required />
                <input className="input" name="endTime" type="time" required />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <input className="input" name="breakMinutes" type="number" min="0" defaultValue="0" placeholder="Pause minutes" />
                <input className="input" name="hourlyRate" type="number" min="0" step="0.01" defaultValue="13" placeholder="Taux horaire" />
                <input className="input" name="fuelAmount" type="number" min="0" step="0.01" defaultValue="0" placeholder="Frais essence" />
              </div>

              <input className="input" name="locationName" placeholder="Lieu / magasin" />
              <input className="input" name="address" placeholder="Adresse du lieu" />
              <input className="input" name="fuelLabel" placeholder="LibellÃ© frais, ex : Frais essence Ã‰tampes" />
              <textarea className="input min-h-28" name="notes" placeholder="Notes internes" />

              <button className="rounded-full bg-[var(--primary)] px-6 py-4 font-bold text-white shadow-xl transition hover:-translate-y-0.5">
                Ajouter la mission
              </button>
            </form>
          )}

          <form action={seedMayMissionsAction} className="mt-4">
            <button className="w-full rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3 font-bold text-emerald-800">
              Importer les missions de mai 2026
            </button>
          </form>
        </section>

        <section className="card rounded-[2rem] p-6">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
                Analyse automatique
              </p>
              <h2 className="mt-2 text-2xl font-black">Totaux dynamiques</h2>
            </div>
            <span className="badge bg-emerald-50 text-emerald-700">
              {stats.validatedCount} validÃ©e{stats.validatedCount > 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 font-black">Par semaine</h3>
              <div className="space-y-3">
                {weeklyTotals.length === 0 ? (
                  <p className="rounded-2xl bg-white/75 p-4 text-slate-600">Aucune mission.</p>
                ) : (
                  weeklyTotals.map((week) => (
                    <div key={week.label} className="rounded-2xl bg-white/80 p-4">
                      <div className="flex justify-between gap-4">
                        <p className="font-bold">{week.label}</p>
                        <p className="font-black text-[var(--primary)]">{formatHours(week.hours)}</p>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {week.count} ligne{week.count > 1 ? "s" : ""} Â· {formatCurrency(week.amount)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-black">Par lieu</h3>
              <div className="space-y-3">
                {locationTotals.length === 0 ? (
                  <p className="rounded-2xl bg-white/75 p-4 text-slate-600">Aucun lieu.</p>
                ) : (
                  locationTotals.map((location) => (
                    <div key={location.location} className="rounded-2xl bg-white/80 p-4">
                      <div className="flex justify-between gap-4">
                        <p className="font-bold">{location.location}</p>
                        <p className="font-black text-[var(--primary)]">{formatHours(location.hours)}</p>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {location.count} mission{location.count > 1 ? "s" : ""} Â· {formatCurrency(location.amount)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="card mt-6 rounded-[2rem] p-6">
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
              Feuille de temps
            </p>
            <h2 className="mt-2 text-2xl font-black">Missions enregistrÃ©es</h2>
          </div>
          <span className="badge bg-slate-100 text-slate-700">
            {missions.length} ligne{missions.length > 1 ? "s" : ""}
          </span>
        </div>

        {missions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center">
            <p className="text-lg font-black">Aucune mission pour le moment</p>
            <p className="mt-2 text-slate-600">
              Ajoute une mission manuellement ou importe les missions de mai 2026.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {missions.map((mission) => {
              const serviceAmount = Number(mission.quantityHours) * Number(mission.hourlyRate);
              const expenseAmount = mission.expenses.reduce(
                (sum, expense) => sum + Number(expense.amount),
                0
              );

              return (
                <article key={mission.id} className="rounded-[1.5rem] border border-slate-100 bg-white/85 p-5">
                  <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr_auto] lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-black">{mission.title}</h3>
                        {statusBadge(mission.status)}
                      </div>

                      <p className="mt-2 text-sm text-slate-600">
                        {formatDateFr(mission.date)} Â· {formatTimeUtc(mission.startTime)} - {formatTimeUtc(mission.endTime)}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {mission.locationName ?? "Lieu non renseignÃ©"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{mission.client.legalName}</p>

                      {mission.notes && (
                        <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                          {mission.notes}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl bg-emerald-50 p-4">
                        <p className="font-bold text-emerald-800">Heures</p>
                        <p className="mt-1 text-xl font-black">{formatHours(Number(mission.quantityHours))}</p>
                      </div>
                      <div className="rounded-2xl bg-amber-50 p-4">
                        <p className="font-bold text-amber-800">Taux</p>
                        <p className="mt-1 text-xl font-black">{formatCurrency(Number(mission.hourlyRate))}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="font-bold text-slate-700">Prestation</p>
                        <p className="mt-1 text-xl font-black">{formatCurrency(serviceAmount)}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="font-bold text-slate-700">Frais</p>
                        <p className="mt-1 text-xl font-black">{formatCurrency(expenseAmount)}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {mission.status === "DRAFT" ? (
                        <form action={validateMissionAction}>
                          <input type="hidden" name="id" value={mission.id} />
                          <button className="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white">
                            Valider
                          </button>
                        </form>
                      ) : (
                        <form action={draftMissionAction}>
                          <input type="hidden" name="id" value={mission.id} />
                          <button className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700">
                            Remettre brouillon
                          </button>
                        </form>
                      )}

                      <form action={deleteMissionAction}>
                        <input type="hidden" name="id" value={mission.id} />
                        <button className="w-full rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700">
                          Supprimer
                        </button>
                      </form>
                    </div>
                  </div>

                  <details className="mt-5 rounded-2xl bg-slate-50 p-4">
                    <summary className="cursor-pointer font-black text-slate-800">
                      Modifier la mission
                    </summary>

                    <form action={updateMissionAction} className="mt-5 grid gap-4">
                      <input type="hidden" name="id" value={mission.id} />

                      <select className="input" name="clientId" defaultValue={mission.clientId} required>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.legalName}
                          </option>
                        ))}
                      </select>

                      <input className="input" name="title" defaultValue={mission.title} required />

                      <div className="grid gap-4 md:grid-cols-3">
                        <input className="input" name="date" type="date" defaultValue={toInputDate(mission.date)} required />
                        <input className="input" name="startTime" type="time" defaultValue={toInputTime(mission.startTime)} required />
                        <input className="input" name="endTime" type="time" defaultValue={toInputTime(mission.endTime)} required />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <input className="input" name="breakMinutes" type="number" min="0" defaultValue={mission.breakMinutes} />
                        <input className="input" name="hourlyRate" type="number" min="0" step="0.01" defaultValue={Number(mission.hourlyRate)} />
                      </div>

                      <input className="input" name="locationName" defaultValue={mission.locationName ?? ""} placeholder="Lieu" />
                      <input className="input" name="address" defaultValue={mission.address ?? ""} placeholder="Adresse" />
                      <textarea className="input min-h-24" name="notes" defaultValue={mission.notes ?? ""} />

                      <button className="rounded-full bg-slate-950 px-6 py-3 font-bold text-white">
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
    </AppShell>
  );
}

