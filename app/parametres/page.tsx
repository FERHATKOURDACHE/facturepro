import Link from "next/link";

import { AppShell } from "@/components/AppShell";
import { getCurrentOrganization } from "@/lib/current-organization";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-auth";
import { updateSettingsAction } from "./actions";

type ParametresPageProps = {
  searchParams?: Promise<{
    onboarding?: string;
    saved?: string;
  }>;
};

export const dynamic = "force-dynamic";

function isFilled(value?: string | null) {
  return Boolean(value?.trim());
}

function progressLabel(completed: number, total: number) {
  return `${completed}/${total} informations obligatoires`;
}

function completionPercent(completed: number, total: number) {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

function displayValue(value?: string | null) {
  return isFilled(value) ? value : "Non renseigné";
}

export default async function ParametresPage({
  searchParams,
}: ParametresPageProps) {
  await requireUser();

  const organization = await getCurrentOrganization();

  const params = await searchParams;
  const onboardingRequired = params?.onboarding === "required";
  const settingsSaved = params?.saved === "1" && !onboardingRequired;

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

  const requiredItems = [
    {
      label: "Nom légal",
      complete: isFilled(profile?.legalName ?? organization.name),
      helper: "Nom officiel affiché sur les factures.",
    },
    {
      label: "Adresse",
      complete: isFilled(profile?.addressLine1),
      helper: "Adresse de l'entreprise ou de l'activité.",
    },
    {
      label: "Code postal",
      complete: isFilled(profile?.postalCode),
      helper: "Code postal de l'adresse de facturation.",
    },
    {
      label: "Ville",
      complete: isFilled(profile?.city),
      helper: "Ville de l'adresse de facturation.",
    },
  ];

  const professionalItems = [
    {
      label: "Email",
      complete: isFilled(profile?.email),
      helper: "Coordonnée visible ou utile pour les échanges client.",
    },
    {
      label: "Téléphone",
      complete: isFilled(profile?.phone),
      helper: "Coordonnée de contact complémentaire.",
    },
    {
      label: "SIRET",
      complete: isFilled(profile?.siret),
      helper: "Identifiant utile sur les documents professionnels.",
    },
    {
      label: "Mention légale",
      complete: isFilled(profile?.invoiceLegalNotice),
      helper: "Texte repris dans les factures PDF.",
    },
    {
      label: "IBAN",
      complete: isFilled(profile?.iban),
      helper: "Coordonnée bancaire pour le règlement.",
    },
    {
      label: "Taux URSSAF",
      complete: Boolean(profile?.urssafRate),
      helper: "Base de calcul du suivi URSSAF.",
    },
  ];

  const completedRequiredItems = requiredItems.filter((item) => item.complete).length;
  const completedProfessionalItems = professionalItems.filter((item) => item.complete).length;
  const professionalPercent = completionPercent(
    completedRequiredItems + completedProfessionalItems,
    requiredItems.length + professionalItems.length
  );

  const invoicePreviewLines = [
    ["Émetteur", profile?.legalName ?? organization.name],
    ["Adresse", [profile?.addressLine1, profile?.postalCode, profile?.city].filter(Boolean).join(" ")],
    ["Email", profile?.email],
    ["Téléphone", profile?.phone],
    ["SIRET", profile?.siret],
    ["Mention légale", profile?.invoiceLegalNotice ?? "TVA non applicable - article 293 B du CGI"],
  ];

  return (
    <AppShell
      title="Paramètres"
      subtitle="Configure le profil émetteur utilisé dans les factures, les exports PDF / Excel et le suivi URSSAF."
    >
      <form action={updateSettingsAction} className="grid gap-6">
        <input
          type="hidden"
          name="redirectTo"
          value={onboardingRequired ? "/dashboard" : ""}
        />

        {onboardingRequired && (
          <section className="rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 text-amber-950 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-700">
                  Onboarding requis
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight">
                  Complète ton profil entreprise
                </h2>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-amber-900">
                  Avant d'utiliser FacturePro, renseigne les informations
                  obligatoires de ton entreprise. Ces données servent à générer
                  des documents propres et à débloquer le dashboard, les clients,
                  les missions, les factures, l'IA et l'URSSAF.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-black text-amber-800">
                    {progressLabel(completedRequiredItems, requiredItems.length)}
                  </span>

                  <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-amber-800 ring-1 ring-amber-100">
                    Redirection vers le dashboard après enregistrement
                  </span>
                </div>
              </div>

              <div className="rounded-3xl bg-white/85 p-5 ring-1 ring-amber-100">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-700">
                  Checklist
                </p>

                <div className="mt-4 grid gap-3">
                  {requiredItems.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-black text-amber-950">{item.label}</p>

                        <span
                          className={
                            item.complete
                              ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700"
                              : "rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700"
                          }
                        >
                          {item.complete ? "OK" : "À remplir"}
                        </span>
                      </div>

                      <p className="mt-1 text-sm leading-6 text-amber-800">
                        {item.helper}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {settingsSaved && (
          <section className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-black">Paramètres enregistrés</p>
                <p className="mt-1 text-sm leading-6">
                  Les informations de ton profil entreprise ont bien été mises à jour.
                </p>
              </div>

              <span className="w-fit rounded-full bg-white px-4 py-2 text-sm font-black text-emerald-700 ring-1 ring-emerald-100">
                Sauvegarde OK
              </span>
            </div>
          </section>
        )}

        <input type="hidden" name="profileId" value={profile?.id ?? ""} />

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[var(--primary)]">
                Parcours paramètres
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Profil entreprise → factures → exports → URSSAF
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Les informations ci-dessous alimentent automatiquement les factures,
                les PDF, les fichiers Excel, les mentions légales et le suivi URSSAF.
                Une fiche complète évite les documents incomplets ou non professionnels.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/factures"
                className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-black text-slate-800 transition hover:bg-white"
              >
                Voir les factures
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

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
              Complétion
            </p>
            <p className="mt-3 text-3xl font-black text-slate-950">
              {professionalPercent}%
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Profil professionnel global
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
              Obligatoire
            </p>
            <p className="mt-3 text-3xl font-black text-slate-950">
              {completedRequiredItems}/{requiredItems.length}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Champs requis pour utiliser l'application
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
              Facture
            </p>
            <p className="mt-3 text-3xl font-black text-slate-950">
              {isFilled(profile?.invoiceLegalNotice) ? "OK" : "À faire"}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Mention légale par défaut
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
              URSSAF
            </p>
            <p className="mt-3 text-3xl font-black text-slate-950">
              {profile?.urssafRate?.toString() ?? "0.256"}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Taux configuré pour l'estimation
            </p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="card rounded-[2rem] p-6">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
                  Étape principale
                </p>
                <h2 className="mt-2 text-2xl font-black">Profil émetteur</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Ces informations apparaissent sur les factures et les exports.
                </p>
              </div>

              {onboardingRequired && (
                <span className="w-fit rounded-full bg-red-50 px-4 py-2 text-xs font-black text-red-700">
                  Champs obligatoires
                </span>
              )}
            </div>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--muted)]">
                  Nom légal *
                </span>
                <input
                  className="input"
                  name="legalName"
                  required
                  defaultValue={profile?.legalName ?? organization.name}
                  placeholder="Exemple : Ferhat Kourdache"
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
                  placeholder="Optionnel"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--muted)]">
                  Adresse *
                </span>
                <input
                  className="input"
                  name="addressLine1"
                  required
                  defaultValue={profile?.addressLine1 ?? ""}
                  placeholder="Numéro et rue"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--muted)]">
                  Complément d'adresse
                </span>
                <input
                  className="input"
                  name="addressLine2"
                  defaultValue={profile?.addressLine2 ?? ""}
                  placeholder="Appartement, étage, bâtiment..."
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-[var(--muted)]">
                    Code postal *
                  </span>
                  <input
                    className="input"
                    name="postalCode"
                    required
                    defaultValue={profile?.postalCode ?? ""}
                    placeholder="75000"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-bold text-[var(--muted)]">
                    Ville *
                  </span>
                  <input
                    className="input"
                    name="city"
                    required
                    defaultValue={profile?.city ?? ""}
                    placeholder="Paris"
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
                    placeholder="contact@exemple.fr"
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
                    placeholder="06 00 00 00 00"
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="card rounded-[2rem] p-6">
            <h2 className="text-2xl font-black">Aperçu facture</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Contrôle rapide des informations reprises dans les documents PDF et Excel.
            </p>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                FacturePro - aperçu émetteur
              </p>

              <div className="mt-4 grid gap-3">
                {invoicePreviewLines.map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-slate-50 p-4 text-sm"
                  >
                    <p className="font-black text-slate-950">{label}</p>
                    <p className="mt-1 leading-6 text-slate-600">
                      {displayValue(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
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
                    placeholder="9 chiffres"
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
                    placeholder="14 chiffres"
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
                    placeholder="Exemple : 6201Z"
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
                    placeholder="Optionnel"
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
                  placeholder="FR76..."
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
                  placeholder="Optionnel"
                />
              </label>

              <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Ces champs seront utiles pour afficher clairement les informations
                de règlement sur les documents de facturation.
              </div>
            </div>
          </section>
        </div>

        <section className="card rounded-[2rem] p-6">
          <h2 className="text-2xl font-black">Préférences facture et URSSAF</h2>

          <div className="mt-6 grid gap-4 lg:grid-cols-4">
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

        <div className="sticky bottom-4 z-10 rounded-[2rem] border border-slate-200 bg-white/90 p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-black text-slate-950">
                {onboardingRequired
                  ? "Enregistre ton profil pour débloquer FacturePro"
                  : "Enregistrer les paramètres"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Les champs marqués avec * sont obligatoires pour accéder aux pages métier.
              </p>
            </div>

            <button className="rounded-full bg-[var(--primary)] px-8 py-4 font-bold text-white shadow-xl transition hover:-translate-y-0.5">
              {onboardingRequired
                ? "Enregistrer et accéder au dashboard"
                : "Enregistrer les paramètres"}
            </button>
          </div>
        </div>
      </form>
    </AppShell>
  );
}
