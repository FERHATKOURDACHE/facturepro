import { AppShell } from "@/components/AppShell";
import { issuer } from "@/lib/data";

export default function ParametresPage() {
  return (
    <AppShell
      title="Paramètres"
      subtitle="Informations de l’émetteur, coordonnées bancaires et préférences document."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="card rounded-[2rem] p-6">
          <h2 className="text-2xl font-black">Profil émetteur</h2>
          <div className="mt-6 grid gap-4">
            <input className="input" defaultValue={issuer.name} />
            <input className="input" defaultValue={issuer.address} />
            <input className="input" defaultValue={issuer.siret} />
            <input className="input" defaultValue={issuer.email} />
            <input className="input" defaultValue={issuer.phone} />
            <input className="input" defaultValue={issuer.iban} />
            <button className="rounded-full bg-[var(--primary)] px-6 py-4 font-bold text-white">
              Enregistrer
            </button>
          </div>
        </section>

        <section className="card rounded-[2rem] p-6">
          <h2 className="text-2xl font-black">Préférences facture</h2>
          <div className="mt-6 grid gap-4">
            <label className="rounded-2xl bg-white/80 p-4">
              <p className="font-black">Taux horaire standard</p>
              <input className="input mt-3" defaultValue="13" />
            </label>
            <label className="rounded-2xl bg-white/80 p-4">
              <p className="font-black">Devise</p>
              <input className="input mt-3" defaultValue="EUR" />
            </label>
            <label className="rounded-2xl bg-white/80 p-4">
              <p className="font-black">Mention légale par défaut</p>
              <textarea
                className="input mt-3 min-h-28"
                defaultValue="Document établi sur la base des heures déclarées et prestations réalisées."
              />
            </label>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
