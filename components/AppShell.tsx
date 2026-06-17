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
} from "lucide-react";

const nav = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Building2 },
  { href: "/missions", label: "Missions", icon: Timer },
  { href: "/factures", label: "Factures", icon: FileText },
  { href: "/urssaf", label: "URSSAF", icon: Calculator },
  { href: "/ai", label: "Assistant IA", icon: Bot },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <main className="min-h-screen">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-emerald-900/10 bg-white/75 p-5 backdrop-blur-2xl lg:block">
        <Link href="/" className="mb-9 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)] text-lg font-black text-white">
            FP
          </div>
          <div>
            <p className="font-black">FacturePro</p>
            <p className="text-xs text-slate-500">MVP facturation</p>
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

        <div className="absolute bottom-5 left-5 right-5 rounded-3xl bg-slate-950 p-5 text-white">
          <BarChart3 className="mb-4 text-amber-300" />
          <p className="font-black">Objectif MVP</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Brancher ensuite la base de données, les formulaires et l’export PDF.
          </p>
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
            <Link
              href="/factures"
              className="w-fit rounded-full bg-slate-950 px-6 py-3 font-bold text-white"
            >
              Créer une facture
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
      </section>
    </main>
  );
}
