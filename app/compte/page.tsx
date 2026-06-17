import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { logoutAction } from "@/lib/auth-actions";

export default async function ComptePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/connexion");
    }

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-12">
            <section className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
                    FacturePro
                </p>

                <h1 className="mt-3 text-3xl font-black text-slate-950">
                    Mon compte
                </h1>

                <div className="mt-6 rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm font-bold text-slate-500">Utilisateur connecté</p>

                    <p className="mt-2 text-lg font-black text-slate-950">
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
        </main>
    );
}