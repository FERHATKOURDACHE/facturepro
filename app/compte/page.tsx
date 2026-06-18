import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppShell } from "@/components/AppShell";
import { logoutAction } from "@/lib/auth-actions";

export const dynamic = "force-dynamic";

export default async function ComptePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/connexion");
  }

  return (
    <AppShell
      title="Mon compte"
      subtitle="Consulte les informations de ton compte et ton plan actuel."
    >
      <section className="card mx-auto max-w-3xl rounded-[2rem] p-8">
        <div className="rounded-3xl bg-slate-50 p-6">
          <p className="text-sm font-bold text-slate-500">
            Utilisateur connecté
          </p>

          <p className="mt-2 text-2xl font-black text-slate-950">
            {session.user.name}
          </p>

          <p className="mt-1 text-sm text-slate-600">{session.user.email}</p>

          <div className="mt-4 inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
            Plan actuel : {session.user.plan}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white"
          >
            Retour dashboard
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full bg-red-50 px-5 py-3 text-sm font-bold text-red-700"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}
