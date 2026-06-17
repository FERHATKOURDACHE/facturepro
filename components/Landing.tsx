import Link from "next/link";
import { ArrowRight, BadgeCheck, FileText, ShieldCheck, Timer, WalletCards } from "lucide-react";

export function Landing() {
  return (
    <main>
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)] text-lg font-black text-white">
            FP
          </div>
          <div>
            <p className="font-black">FacturePro</p>
            <p className="text-xs text-slate-500">Automatisation</p>
          </div>
        </Link>
        <Link href="/dashboard" className="rounded-full bg-slate-950 px-6 py-3 font-bold text-white">
          Ouvrir le dashboard
        </Link>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-sm font-bold text-emerald-800">
            <BadgeCheck size={18} />
            Version MVP 2 — site + pages application
          </div>

          <h1 className="max-w-5xl text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">
            Le logiciel qui automatise tes <span className="gradient-title">factures</span>.
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
            FacturePro centralise clients, missions, heures, frais, déductions,
            factures, feuilles de temps et suivi de paiement.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-7 py-4 font-bold text-white shadow-2xl transition hover:-translate-y-1"
            >
              Continuer l’application <ArrowRight size={18} />
            </Link>
            <Link
              href="/factures"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-7 py-4 font-bold text-slate-900"
            >
              Voir la facture exemple
            </Link>
          </div>
        </div>

        <div className="card rounded-[2rem] p-6">
          <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
            <p className="text-sm text-slate-400">Facture active</p>
            <p className="mt-1 text-3xl font-black">FAC-2026-005</p>
            <div className="mt-7 grid gap-4">
              {[
                ["Client", "Talent Pro Solution Intérim"],
                ["Heures facturées", "78h30"],
                ["Total à payer", "1 088,50 €"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-3xl bg-white p-5 text-slate-950">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
                  <p className="mt-2 text-xl font-black">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-5 md:grid-cols-4">
          {[
            [FileText, "Factures", "Numérotation, lignes, déductions"],
            [Timer, "Heures", "Récap jour, semaine et lieu"],
            [WalletCards, "Frais", "Essence, repas, déplacement"],
            [ShieldCheck, "Justificatifs", "Signature, cachet, statut"],
          ].map(([Icon, title, text]) => {
            const LucideIcon = Icon as typeof FileText;
            return (
              <article key={title as string} className="card rounded-[1.7rem] p-6">
                <LucideIcon className="text-[var(--primary)]" />
                <h2 className="mt-5 text-xl font-black">{title as string}</h2>
                <p className="mt-2 text-slate-600">{text as string}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
