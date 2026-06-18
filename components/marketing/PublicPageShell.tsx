import Link from "next/link";

import {
  siteConfig as defaultSiteConfig,
  type SiteConfig,
} from "@/lib/site-config";

type PublicPageShellProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  siteConfig?: SiteConfig;
  children: React.ReactNode;
};

export function PublicPageShell({
  eyebrow,
  title,
  subtitle,
  siteConfig,
  children,
}: PublicPageShellProps) {
  const currentSiteConfig = siteConfig ?? defaultSiteConfig;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-lg font-black tracking-tight">
            {currentSiteConfig.name}
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-bold text-slate-600 md:flex">
            <Link href="/tarifs" className="hover:text-slate-950">
              Tarifs
            </Link>
            <Link href="/support" className="hover:text-slate-950">
              Support
            </Link>
            <Link href="/connexion" className="hover:text-slate-950">
              Connexion
            </Link>
            <Link
              href="/inscription"
              className="rounded-full bg-slate-950 px-5 py-2.5 text-white transition hover:-translate-y-0.5"
            >
              Créer un compte
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="max-w-4xl">
          {eyebrow ? (
            <p className="text-sm font-black uppercase tracking-[0.28em] text-[var(--primary)]">
              {eyebrow}
            </p>
          ) : null}

          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            {title}
          </h1>

          {subtitle ? (
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="mt-10">{children}</div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {currentSiteConfig.name}. Tous droits réservés.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/mentions-legales" className="hover:text-slate-950">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="hover:text-slate-950">
              Confidentialité
            </Link>
            <Link href="/cgu" className="hover:text-slate-950">
              CGU
            </Link>
            <Link href="/support" className="hover:text-slate-950">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
