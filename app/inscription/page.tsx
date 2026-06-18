
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { registerAction } from "@/lib/auth-actions";

export const dynamic = "force-dynamic";

type InscriptionPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  if (error === "missing_fields") return "Tous les champs sont obligatoires.";

  if (error === "password_too_short") {
    return "Le mot de passe doit contenir au moins 8 caractères.";
  }

  if (error === "email_already_used") {
    return "Un compte existe déjà avec cet email.";
  }

  return null;
}

export default async function InscriptionPage({
  searchParams,
}: InscriptionPageProps) {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const errorMessage = getErrorMessage(params?.error);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <section className="mx-auto max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
          FacturePro
        </p>

        <h1 className="mt-3 text-3xl font-black text-slate-950">
          Créer un compte
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Commence gratuitement avec ton espace de facturation auto-entrepreneur.
        </p>

        {errorMessage && (
          <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        <form action={registerAction} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-700">Nom</label>
            <input
              name="name"
              type="text"
              required
              className="input mt-2"
              placeholder="Votre nom"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">Email</label>
            <input
              name="email"
              type="email"
              required
              className="input mt-2"
              placeholder="vous@exemple.com"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">
              Mot de passe
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="input mt-2"
              placeholder="Minimum 8 caractères"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-[var(--primary)] px-6 py-4 font-bold text-white shadow-xl"
          >
            Créer mon compte
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="font-bold text-[var(--primary)]">
            Se connecter
          </Link>
        </p>
      </section>
    </main>
  );
}


