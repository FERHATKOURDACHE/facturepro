import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  Building2,
  Calculator,
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
    text: "Regroupe les coordonnées, délais de paiement, adresses et informations utiles pour facturer vite et proprement.",
  },
  {
    icon: Timer,
    title: "Missions et heures",
    text: "Suis tes prestations, horaires, lieux, taux, pauses et frais depuis une interface claire.",
  },
  {
    icon: FileText,
    title: "Factures automatiques",
    text: "Génère des factures à partir des missions validées, avec lignes, frais, statuts et paiements.",
  },
  {
    icon: FileSpreadsheet,
    title: "Exports PDF et Excel",
    text: "Télécharge des factures et feuilles de temps propres, prêtes à envoyer à tes clients.",
  },
  {
    icon: Calculator,
    title: "Estimation URSSAF",
    text: "Visualise ton chiffre d'affaires encaissé et prépare une estimation de cotisations avant déclaration.",
  },
  {
    icon: Bot,
    title: "Assistant IA",
    text: "Transforme un texte brut ou un planning en missions structurées à vérifier avant import.",
  },
];

const workflow = [
  "Configure ton profil entreprise",
  "Ajoute ou sélectionne ton client",
  "Saisis ou importe tes missions",
  "Valide les heures travaillées",
  "Génère la facture PDF / Excel",
  "Suis le paiement et prépare l'URSSAF",
];

const audiences = [
  "Micro-entrepreneurs",
  "Freelances",
  "Prestataires terrain",
  "Consultants",
  "Intérimaires indépendants",
  "Petites structures de service",
];

const proofCards = [
  ["Clients", "Base propre pour facturer"],
  ["Missions", "Heures et frais maîtrisés"],
  ["Factures", "PDF, Excel et paiements"],
  ["URSSAF", "CA encaissé lisible"],
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
            <p className="text-lg font-black tracking-tight">{siteConfig.name}</p>
            <p className="text-xs font-semibold text-slate-500">
              Facturation pour indépendants
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-black text-slate-600 lg:flex">
          <Link href="/tarifs" className="transition hover:text-slate-950">
            Tarifs
          </Link>
          <Link href="/support" className="transition hover:text-slate-950">
            Support
          </Link>
          <Link href="/confidentialite" className="transition hover:text-slate-950">
            RGPD
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/connexion"
            className="hidden rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-sm font-black text-slate-800 shadow-sm transition hover:bg-white sm:inline-flex"
          >
            Connexion
          </Link>

          <Link
            href="/inscription"
            className="rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5"
          >
            Créer un compte
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-8 lg:grid-cols-[1.04fr_0.96fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-black text-emerald-800 shadow-sm">
            <Sparkles size={18} />
            Clients, missions, factures, paiements, URSSAF et IA
          </div>

          <h1 className="max-w-5xl text-5xl font-black leading-[1.02] tracking-tight text-slate-950 md:text-7xl">
            La facturation claire pour les{" "}
            <span className="gradient-title">micro-entrepreneurs</span> et freelances.
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
            FacturePro centralise tes clients, tes missions, tes heures, tes
            frais, tes factures, tes paiements et ton suivi URSSAF dans un outil
            simple, moderne et professionnel.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-7 py-4 font-black text-white shadow-2xl shadow-emerald-900/20 transition hover:-translate-y-1"
            >
              Commencer gratuitement <ArrowRight size={18} />
            </Link>

            <Link
              href="/connexion"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/85 px-7 py-4 font-black text-slate-900 shadow-sm transition hover:bg-white"
            >
              J'ai déjà un compte
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-4">
            {proofCards.map(([title, text]) => (
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
                  Paiement, statut et suivi encaissé intégrés.
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
            Tout ce qu'il faut pour facturer proprement
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            L'objectif est simple : passer moins de temps sur l'administratif
            et garder une vision claire de ton activité.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
            Parcours
          </p>
          <h2 className="mt-3 text-3xl font-black text-slate-950">
            Un workflow métier en 6 étapes
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            De la création du profil jusqu'au suivi URSSAF, l'application garde
            une logique simple : client, mission, facture, paiement, déclaration.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ["IA", "Importer un planning brut"],
              ["URSSAF", "Préparer le CA encaissé"],
            ].map(([title, text]) => (
              <div key={title} className="rounded-3xl bg-slate-50 p-5">
                <p className="font-black text-slate-950">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
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
                FacturePro s'adresse aux professionnels qui doivent suivre des
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

      <section className="mx-auto grid max-w-7xl gap-5 px-6 pb-20 md:grid-cols-3">
        {[
          {
            icon: ShieldCheck,
            title: "Données organisées",
            text: "Chaque client, mission, facture et paiement reste rattaché à ton espace.",
          },
          {
            icon: BadgeCheck,
            title: "Process professionnel",
            text: "Les missions passent par un état brouillon, validation puis facturation.",
          },
          {
            icon: BarChart3,
            title: "Vision claire",
            text: "Le dashboard, les paiements et l'URSSAF donnent une lecture rapide de l'activité.",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <article key={item.title} className="card rounded-[1.7rem] p-6">
              <Icon className="text-[var(--primary)]" size={28} />
              <h3 className="mt-4 text-xl font-black text-slate-950">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.text}
              </p>
            </article>
          );
        })}
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
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-black text-slate-950 transition hover:-translate-y-1"
            >
              Créer un compte <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1fr_auto] md:items-start">
          <div>
            <p className="text-lg font-black text-slate-950">{siteConfig.name}</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
              {siteConfig.description}
            </p>
            <p className="mt-4 text-xs font-semibold text-slate-400">
              © {new Date().getFullYear()} {siteConfig.name}. Tous droits réservés.
            </p>
          </div>

          <div className="grid gap-6 text-sm sm:grid-cols-3">
            <div>
              <p className="font-black text-slate-950">Produit</p>
              <div className="mt-3 grid gap-2 text-slate-600">
                <Link href="/tarifs" className="hover:text-slate-950">
                  Tarifs
                </Link>
                <Link href="/support" className="hover:text-slate-950">
                  Support
                </Link>
                <Link href="/connexion" className="hover:text-slate-950">
                  Connexion
                </Link>
              </div>
            </div>

            <div>
              <p className="font-black text-slate-950">Légal</p>
              <div className="mt-3 grid gap-2 text-slate-600">
                <Link href="/mentions-legales" className="hover:text-slate-950">
                  Mentions légales
                </Link>
                <Link href="/confidentialite" className="hover:text-slate-950">
                  Confidentialité
                </Link>
                <Link href="/cgu" className="hover:text-slate-950">
                  CGU
                </Link>
              </div>
            </div>

            <div>
              <p className="font-black text-slate-950">RGPD</p>
              <div className="mt-3 grid gap-2 text-slate-600">
                <a href={`mailto:${siteConfig.rgpdEmail}`} className="hover:text-slate-950">
                  Contact RGPD
                </a>
                <a href={`mailto:${siteConfig.supportEmail}`} className="hover:text-slate-950">
                  Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer></main>
  );
}

