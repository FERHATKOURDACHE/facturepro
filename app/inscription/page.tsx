import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { GoogleOAuthButton } from "@/components/auth/GoogleOAuthButton";
import { registerAction } from "@/lib/auth-actions";

export const dynamic = "force-dynamic";

type InscriptionPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  if (error === "missing_fields") {
    return {
      title: "Champs obligatoires",
      message: "Renseigne ton nom, ton email et ton mot de passe pour créer ton compte.",
    };
  }

  if (error === "password_too_short") {
    return {
      title: "Mot de passe trop court",
      message: "Utilise un mot de passe d'au moins 8 caractères.",
    };
  }

  if (error === "email_already_used") {
    return {
      title: "Email déjà utilisé",
      message: "Un compte existe déjà avec cet email. Connecte-toi ou utilise une autre adresse.",
    };
  }

  return null;
}

export default async function InscriptionPage({
  searchParams,
}: InscriptionPageProps) {
  const session = await auth();

  if (session?.user) {
    redirect("/apres-connexion");
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
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-black">{errorMessage.title}</p>
            <p className="mt-1 text-sm leading-6">{errorMessage.message}</p>
          </div>
        )}

        <GoogleOAuthButton label="Créer mon compte avec Google" />

        <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          ou
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <form action={registerAction} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-700">Nom</label>
            <input
              name="name"
              type="text"
              required
              className="input mt-2"
              placeholder="Votre nom"
              autoComplete="name"
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
              autoComplete="email"
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
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-[var(--primary)] px-6 py-4 font-bold text-white shadow-xl transition hover:-translate-y-0.5"
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
