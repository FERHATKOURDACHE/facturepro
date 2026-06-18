import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Timer,
  WalletCards,
} from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Clients centralisés",
    text: "Enregistre tes clients avec leurs coordonnées, délais de paiement et informations de facturation.",
  },
  {
    icon: Timer,
    title: "Missions & heures",
    text: "Suis tes prestations, horaires, taux, frais et lieux de mission depuis une seule interface.",
  },
  {
    icon: FileText,
    title: "Factures automatiques",
    text: "Génère tes factures à partir des missions validées, avec lignes, frais, déductions et mentions légales.",
  },
  {
    icon: FileSpreadsheet,
    title: "Exports PDF & Excel",
    text: "Télécharge tes factures et feuilles de temps dans des formats propres, prêts à envoyer.",
  },
];

const workflow = [
  "Crée ton profil entreprise",
  "Ajoute tes clients",
  "Saisis ou importe tes missions",
  "Valide les heures travaillées",
  "Génère et exporte tes factures",
];

const audiences = [
  "Auto-entrepreneurs",
  "Freelances",
  "Intérimaires indépendants",
  "Prestataires terrain",
  "Consultants",
  "Petites structures de service",
];

export function Landing() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-800 text-lg font-black text-white shadow-xl shadow-emerald-900/20">
            FP
          </div>

          <div>
            <p className="text-lg font-black tracking-tight">FacturePro</p>
            <p className="text-xs font-semibold text-slate-500">
              Facturation SaaS
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/connexion"
            className="hidden rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-sm font-black text-slate-800 shadow-sm sm:inline-flex"
          >
            Connexion
          </Link>

          <Link
            href="/dashboard"
            className="rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-950/15"
          >
            Ouvrir l’application
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-black text-emerald-800 shadow-sm">
            <Sparkles size={18} />
            Facturation, heures, frais et exports dans un seul outil
          </div>

          <h1 className="max-w-5xl text-5xl font-black leading-[1.02] tracking-tight text-slate-950 md:text-7xl">
            Gère tes missions et génère tes{" "}
            <span className="gradient-title">factures</span> sans perdre de temps.
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
            FacturePro aide les indépendants à suivre leurs clients, leurs
            heures, leurs frais, leurs factures et leurs paiements dans une
            interface claire, moderne et professionnelle.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-7 py-4 font-black text-white shadow-2xl shadow-emerald-900/20 transition hover:-translate-y-1"
            >
              Créer mon compte <ArrowRight size={18} />
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/85 px-7 py-4 font-black text-slate-900 shadow-sm"
            >
              Voir l’application
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["PDF / Excel", "Exports propres"],
              ["URSSAF", "Estimation rapide"],
              ["IA", "Extraction d’heures"],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-3xl border border-slate-200 bg-white/75 p-4 shadow-sm"
              >
                <p className="font-black text-slate-950">{title}</p>
                <p className="mt-1 text-sm text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card rounded-[2.2rem] p-6">
          <div className="rounded-[1.7rem] bg-slate-950 p-6 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-400">
                  Facture prête à envoyer
                </p>
                <p className="mt-1 text-3xl font-black">FAC-0001</p>
              </div>

              <span className="rounded-full bg-emerald-400/15 px-4 py-2 text-xs font-black text-emerald-200">
                Prête
              </span>
            </div>

            <div className="mt-7 grid gap-4">
              {[
                ["Client", "Client professionnel"],
                ["Période", "01/06/2026 au 30/06/2026"],
                ["Heures facturées", "68h00"],
                ["Frais", "85,00 €"],
                ["Total à payer", "1 020,00 €"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-3xl bg-white p-5 text-slate-950"
                >
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    {label}
                  </p>
                  <p className="mt-2 text-xl font-black">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-emerald-400/10 p-4">
                <ReceiptText className="text-emerald-200" />
                <p className="mt-3 text-sm font-bold text-emerald-100">
                  Facture générée depuis les missions validées.
                </p>
              </div>

              <div className="rounded-3xl bg-amber-300/10 p-4">
                <WalletCards className="text-amber-200" />
                <p className="mt-3 text-sm font-bold text-amber-100">
                  Suivi paiement et statut intégré.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-[var(--primary)]">
            Fonctionnalités
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
            Tout ce qu’il faut pour facturer proprement
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            L’objectif est simple : passer moins de temps sur l’administratif
            et garder une vision claire de ton activité.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article key={feature.title} className="card rounded-[1.7rem] p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[var(--primary)]">
                  <Icon size={23} />
                </div>
                <h3 className="mt-5 text-xl font-black">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {feature.text}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-20 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="card rounded-[2rem] p-8">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-[var(--primary)]">
            Méthode
          </p>
          <h2 className="mt-3 text-3xl font-black text-slate-950">
            Un parcours simple en 5 étapes
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            FacturePro guide l’utilisateur depuis le profil entreprise jusqu’à
            l’export final de la facture.
          </p>
        </div>

        <div className="grid gap-3">
          {workflow.map((step, index) => (
            <div
              key={step}
              className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">
                {index + 1}
              </div>
              <p className="font-black text-slate-950">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="card rounded-[2rem] p-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-[var(--primary)]">
                Pour qui ?
              </p>
              <h2 className="mt-3 text-3xl font-black text-slate-950">
                Pensé pour les indépendants et prestataires
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                FacturePro s’adresse aux professionnels qui doivent suivre des
                heures, des missions, des frais et produire des factures propres.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {audiences.map((audience) => (
                <div
                  key={audience}
                  className="flex items-center gap-3 rounded-2xl bg-white/80 p-4"
                >
                  <CheckCircle2 className="text-[var(--primary)]" size={20} />
                  <span className="font-bold text-slate-800">{audience}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[2.4rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/20 md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-emerald-300">
                Prêt à commencer ?
              </p>
              <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
                Crée ton espace et prépare tes premières factures.
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                Configure ton profil entreprise, ajoute un client et commence à
                suivre tes missions dès maintenant.
              </p>
            </div>

            <Link
              href="/inscription"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-black text-slate-950"
            >
              Créer un compte <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
