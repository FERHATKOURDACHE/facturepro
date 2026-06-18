
import { AppShell } from "@/components/AppShell";
import { getCurrentOrganization } from "@/lib/current-organization";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-auth";
import { updateSettingsAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ParametresPage() {
  await requireUser();

  const organization = await getCurrentOrganization();

  const profile =
    (await prisma.companyProfile.findFirst({
      where: {
        organizationId: organization.id,
        isDefault: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })) ??
    (await prisma.companyProfile.findFirst({
      where: {
        organizationId: organization.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    }));

  return (
    <AppShell
      title="Paramètres"
      subtitle="Informations de l’émetteur, coordonnées bancaires et préférences document."
    >
      <form action={updateSettingsAction} className="grid gap-6">
        <input type="hidden" name="profileId" value={profile?.id ?? ""} />

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="card rounded-[2rem] p-6">
            <h2 className="text-2xl font-black">Profil émetteur</h2>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--muted)]">
                  Nom légal
                </span>
                <input
                  className="input"
                  name="legalName"
                  required
                  defaultValue={profile?.legalName ?? organization.name}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--muted)]">
                  Nom commercial
                </span>
                <input
                  className="input"
                  name="tradeName"
                  defaultValue={profile?.tradeName ?? ""}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--muted)]">
                  Adresse
                </span>
                <input
                  className="input"
                  name="addressLine1"
                  required
                  defaultValue={profile?.addressLine1 ?? ""}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--muted)]">
                  Complément d’adresse
                </span>
                <input
                  className="input"
                  name="addressLine2"
                  defaultValue={profile?.addressLine2 ?? ""}
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-[var(--muted)]">
                    Code postal
                  </span>
                  <input
                    className="input"
                    name="postalCode"
                    required
                    defaultValue={profile?.postalCode ?? ""}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-bold text-[var(--muted)]">
                    Ville
                  </span>
                  <input
                    className="input"
                    name="city"
                    required
                    defaultValue={profile?.city ?? ""}
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--muted)]">
                  Pays
                </span>
                <input
                  className="input"
                  name="country"
                  defaultValue={profile?.country ?? organization.country ?? "FR"}
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-[var(--muted)]">
                    Email
                  </span>
                  <input
                    className="input"
                    name="email"
                    type="email"
                    defaultValue={profile?.email ?? ""}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-bold text-[var(--muted)]">
                    Téléphone
                  </span>
                  <input
                    className="input"
                    name="phone"
                    defaultValue={profile?.phone ?? ""}
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="card rounded-[2rem] p-6">
            <h2 className="text-2xl font-black">Informations légales</h2>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-[var(--muted)]">
                    SIREN
                  </span>
                  <input
                    className="input"
                    name="siren"
                    defaultValue={profile?.siren ?? ""}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-bold text-[var(--muted)]">
                    SIRET
                  </span>
                  <input
                    className="input"
                    name="siret"
                    defaultValue={profile?.siret ?? ""}
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-[var(--muted)]">
                    Code APE
                  </span>
                  <input
                    className="input"
                    name="ape"
                    defaultValue={profile?.ape ?? ""}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-bold text-[var(--muted)]">
                    Numéro TVA
                  </span>
                  <input
                    className="input"
                    name="vatNumber"
                    defaultValue={profile?.vatNumber ?? ""}
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--muted)]">
                  Régime TVA
                </span>
                <select
                  className="input"
                  name="vatRegime"
                  defaultValue={profile?.vatRegime ?? "FRANCHISE_BASE"}
                >
                  <option value="FRANCHISE_BASE">
                    Franchise en base de TVA
                  </option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--muted)]">
                  Mention légale par défaut
                </span>
                <textarea
                  className="input min-h-28"
                  name="invoiceLegalNotice"
                  defaultValue={
                    profile?.invoiceLegalNotice ??
                    "TVA non applicable - article 293 B du CGI"
                  }
                />
              </label>
            </div>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="card rounded-[2rem] p-6">
            <h2 className="text-2xl font-black">Coordonnées bancaires</h2>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--muted)]">
                  IBAN
                </span>
                <input
                  className="input"
                  name="iban"
                  defaultValue={profile?.iban ?? ""}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--muted)]">
                  BIC
                </span>
                <input
                  className="input"
                  name="bic"
                  defaultValue={profile?.bic ?? ""}
                />
              </label>
            </div>
          </section>

          <section className="card rounded-[2rem] p-6">
            <h2 className="text-2xl font-black">Préférences facture</h2>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--muted)]">
                  Taux horaire standard
                </span>
                <input
                  className="input"
                  name="defaultHourlyRate"
                  type="number"
                  step="0.01"
                  defaultValue={profile?.defaultHourlyRate?.toString() ?? "13"}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--muted)]">
                  Devise
                </span>
                <input
                  className="input"
                  name="currency"
                  defaultValue={organization.currency ?? "EUR"}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--muted)]">
                  Activité URSSAF
                </span>
                <select
                  className="input"
                  name="urssafActivity"
                  defaultValue={profile?.urssafActivity ?? "SERVICE_BNC"}
                >
                  <option value="SERVICE_BNC">Prestation de service BNC</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--muted)]">
                  Taux URSSAF
                </span>
                <input
                  className="input"
                  name="urssafRate"
                  type="number"
                  step="0.0001"
                  defaultValue={profile?.urssafRate?.toString() ?? "0.2560"}
                />
              </label>
            </div>
          </section>
        </div>

        <div className="flex justify-end">
          <button className="rounded-full bg-[var(--primary)] px-8 py-4 font-bold text-white">
            Enregistrer les paramètres
          </button>
        </div>
      </form>
    </AppShell>
  );
}

