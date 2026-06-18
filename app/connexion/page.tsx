
import Link from "next/link";
import { GoogleOAuthButton } from "@/components/auth/GoogleOAuthButton";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { loginAction } from "@/lib/auth-actions";

export const dynamic = "force-dynamic";

type ConnexionPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  if (error === "missing_fields") return "Email et mot de passe obligatoires.";

  if (error === "invalid_credentials") {
    return "Email ou mot de passe incorrect.";
  }

  return null;
}

export default async function ConnexionPage({
  searchParams,
}: ConnexionPageProps) {
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
          Connexion
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Connecte-toi pour accéder à ton espace de facturation.
        </p>

        {errorMessage && (
          <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        <GoogleOAuthButton label="Continuer avec Google" />

        <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          ou
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <form action={loginAction} className="mt-6 space-y-4">
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
              className="input mt-2"
              placeholder="Votre mot de passe"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-[var(--primary)] px-6 py-4 font-bold text-white shadow-xl"
          >
            Se connecter
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-bold text-[var(--primary)]">
            Créer un compte
          </Link>
        </p>
      </section>
    </main>
  );
}

