import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppShell } from "@/components/AppShell";
import { logoutAction } from "@/lib/auth-actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function providerLabel(provider?: string) {
  if (provider === "google") return "Google OAuth";
  if (provider === "credentials") return "Email et mot de passe";

  return "Session sécurisée";
}

function providerBadgeClass(provider?: string) {
  if (provider === "google") {
    return "bg-blue-50 text-blue-700 ring-blue-100";
  }

  return "bg-emerald-50 text-emerald-700 ring-emerald-100";
}

function formatDate(date?: Date | null) {
  if (!date) return "Non disponible";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function maskUserId(id: string) {
  return `${id.slice(0, 8)}...${id.slice(-4)}`;
}

export default async function ComptePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/connexion");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      passwordHash: true,
      createdAt: true,
      updatedAt: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });

  if (!user) {
    redirect("/connexion");
  }

  const activeProvider = session.user.authProvider;
  const hasPassword = Boolean(user.passwordHash);
  const hasStripe = Boolean(user.stripeCustomerId || user.stripeSubscriptionId);

  const infoCards = [
    {
      label: "Email",
      value: user.email,
      helper: "Adresse principale du compte",
    },
    {
      label: "Plan",
      value: user.plan,
      helper: hasStripe ? "Abonnement Stripe relié" : "Aucun abonnement payant relié",
    },
    {
      label: "Connexion actuelle",
      value: providerLabel(activeProvider),
      helper:
        activeProvider === "google"
          ? "Session ouverte avec Google"
          : "Session ouverte avec email et mot de passe",
    },
    {
      label: "Sécurité",
      value: securityLabel,
      helper: hasPassword
        ? "Ce compte peut se connecter avec email et mot de passe"
        : "Ce compte utilise une connexion externe",
    },
  ];

  return (
    <AppShell
      title="Mon compte"
      subtitle="Consulte les informations de ton compte, ton mode de connexion et ton plan actuel."
    >
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[var(--primary)]">
                Parcours compte
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Profil → sécurité → paramètres
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Cette page te permet de vérifier ton identité de connexion, ton plan,
                ton niveau de sécurité et les raccourcis utiles pour gérer ton espace.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/parametres"
                className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-black text-slate-800 transition hover:bg-white"
              >
                Modifier les paramètres
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
              >
                Tableau de bord
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-500">Connexion</p>
              <p className="mt-2 text-lg font-black text-slate-950">
                {providerLabel(activeProvider)}
              </p>
            </div>
            <div className="rounded-3xl bg-emerald-50 p-5">
              <p className="text-sm font-bold text-emerald-700">Plan actuel</p>
              <p className="mt-2 text-lg font-black text-emerald-950">
                {planLabel}
              </p>
            </div>
            <div className="rounded-3xl bg-amber-50 p-5">
              <p className="text-sm font-bold text-amber-700">Sécurité</p>
              <p className="mt-2 text-lg font-black text-amber-950">
                {securityLabel}
              </p>
            </div>
          </div>
        </div>
        <div className="card rounded-[2rem] p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[var(--primary)]">
                Profil utilisateur
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                {user.name ?? user.email}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Compte créé le {formatDate(user.createdAt)} · Dernière mise à
                jour le {formatDate(user.updatedAt)}
              </p>

              <p className="mt-2 text-xs font-semibold text-slate-400">
                ID utilisateur : {maskUserId(user.id)}
              </p>
            </div>

            <div
              className={`w-fit rounded-full px-4 py-2 text-sm font-black ring-1 ${providerBadgeClass(
                activeProvider
              )}`}
            >
              {providerLabel(activeProvider)}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {infoCards.map((card) => (
            <article key={card.label} className="card rounded-[1.5rem] p-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                {card.label}
              </p>

              <p className="mt-3 break-words text-xl font-black text-slate-950">
                {card.value}
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {card.helper}
              </p>
            </article>
          ))}
        </div>

        <div className="card rounded-[2rem] p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-950">
                Actions du compte
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Tu peux revenir au tableau de bord ou fermer ta session.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white"
              >
                Retour dashboard
              </Link>

              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
                >
                  Se déconnecter
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
