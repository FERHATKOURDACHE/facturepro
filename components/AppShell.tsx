import type { ReactNode } from "react";
import Link from "next/link";
import {
  BarChart3,
  Building2,
  FileText,
  Home,
  LayoutDashboard,
  Settings,
  Timer,
  Bot,
  Calculator,
  UserCircle,
  LogOut,
  Crown,
  Sparkles,
} from "lucide-react";

import { auth } from "@/auth";
import { logoutAction } from "@/lib/auth-actions";

const nav = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Building2 },
  { href: "/missions", label: "Missions", icon: Timer },
  { href: "/factures", label: "Factures", icon: FileText },
  { href: "/urssaf", label: "URSSAF", icon: Calculator },
  { href: "/ai", label: "Assistant IA", icon: Bot },
  { href: "/parametres", label: "Paramètres", icon: Settings },
  { href: "/compte", label: "Mon compte", icon: UserCircle },
];

export async function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  const session = await auth();

  return (
    <main className="min-h-screen bg-[var(--background)] text-slate-950">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 flex-col border-r border-white/10 bg-slate-950 p-5 text-white shadow-2xl lg:flex">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-700 text-lg font-black text-white shadow-lg shadow-emerald-950/30 transition group-hover:scale-105">
            FP
          </div>

          <div>
            <p className="text-lg font-black tracking-tight">FacturePro</p>
            <p className="text-xs font-semibold text-emerald-200/80">
              Facturation SaaS
            </p>
          </div>
        </Link>

        <div className="mt-6 shrink-0 rounded-[1.7rem] border border-white/10 bg-white/[0.06] p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-200">
              <Sparkles size={20} />
            </div>

            <div>
              <p className="text-sm font-black">Espace professionnel</p>
              <p className="mt-1 text-xs leading-5 text-slate-300">
                Clients, missions, factures et URSSAF au même endroit.
              </p>
            </div>
          </div>
        </div>

        <nav className="sidebar-scroll mt-6 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
          {nav.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-emerald-200 transition group-hover:bg-emerald-400/15">
                  <Icon size={18} />
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 shrink-0">
          {session?.user ? (
            <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-black/20">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--primary)]">
                  <UserCircle size={24} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-white">
                    {session.user.name ?? "Utilisateur"}
                  </p>
                  <p className="truncate text-xs text-slate-300">
                    {session.user.email}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-2xl bg-amber-300/15 px-3 py-2">
                <span className="flex items-center gap-2 text-xs font-black text-amber-200">
                  <Crown size={15} />
                  Plan
                </span>

                <span className="text-xs font-black text-amber-100">
                  {session.user.plan ?? "FREE"}
                </span>
              </div>

              <form action={logoutAction} className="mt-3">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-100 transition hover:bg-red-500/25"
                >
                  <LogOut size={17} />
                  Se déconnecter
                </button>
              </form>
            </div>
          ) : (
            <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.07] p-5">
              <BarChart3 className="mb-4 text-amber-300" />

              <p className="font-black">Bienvenue</p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Connecte-toi pour gérer tes clients, missions et factures.
              </p>

              <Link
                href="/connexion"
                className="mt-4 block rounded-full bg-white px-4 py-3 text-center text-sm font-bold text-slate-950"
              >
                Se connecter
              </Link>
            </div>
          )}
        </div>
      </aside>

      <section className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-white/70 bg-white/75 px-4 py-4 shadow-sm backdrop-blur-2xl sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--primary)]">
                  FacturePro
                </p>

                <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                  {title}
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
                  {subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {session?.user && (
                  <Link
                    href="/compte"
                    className="rounded-full border border-emerald-100 bg-emerald-50 px-5 py-3 text-sm font-black text-[var(--primary)] transition hover:bg-emerald-100"
                  >
                    Mon compte
                  </Link>
                )}

                <Link
                  href="/factures"
                  className="w-fit rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Créer une facture
                </Link>
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {nav.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 shadow-sm"
                  >
                    <Icon size={15} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:py-9">
          {children}
        </div>
      </section>
    </main>
  );
}

