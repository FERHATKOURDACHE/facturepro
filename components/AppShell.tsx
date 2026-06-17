
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
    <main className="min-h-screen">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-emerald-900/10 bg-white/75 p-5 backdrop-blur-2xl lg:block">
        <Link href="/" className="mb-9 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)] text-lg font-black text-white">
            FP
          </div>

          <div>
            <p className="font-black">FacturePro</p>
            <p className="text-xs text-slate-500">SaaS facturation</p>
          </div>
        </Link>

        <nav className="space-y-2">
          {nav.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-[var(--primary)]"
              >
                <Icon size={19} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-5 right-5 space-y-3">
          {session?.user && (
            <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-[var(--primary)]">
                  <UserCircle size={22} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950">
                    {session.user.name ?? "Utilisateur"}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {session.user.email}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-2xl bg-amber-50 px-3 py-2">
                <span className="flex items-center gap-2 text-xs font-black text-amber-700">
                  <Crown size={15} />
                  Plan
                </span>

                <span className="text-xs font-black text-amber-800">
                  {session.user.plan ?? "FREE"}
                </span>
              </div>

              <form action={logoutAction} className="mt-3">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
                >
                  <LogOut size={17} />
                  Se déconnecter
                </button>
              </form>
            </div>
          )}

          {!session?.user && (
            <div className="rounded-3xl bg-slate-950 p-5 text-white">
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
        <header className="sticky top-0 z-10 border-b border-emerald-900/10 bg-white/70 px-6 py-5 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
                FacturePro
              </p>

              <h1 className="text-3xl font-black tracking-tight">{title}</h1>

              <p className="mt-1 text-slate-600">{subtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {session?.user && (
                <Link
                  href="/compte"
                  className="rounded-full bg-emerald-50 px-5 py-3 text-sm font-bold text-[var(--primary)]"
                >
                  Mon compte
                </Link>
              )}

              <Link
                href="/factures"
                className="w-fit rounded-full bg-slate-950 px-6 py-3 font-bold text-white"
              >
                Créer une facture
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
      </section>
    </main>
  );
}

