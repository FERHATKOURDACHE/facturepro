import { PublicPageShell } from "@/components/marketing/PublicPageShell";

type LegalContent = {
  title: string;
  subtitle: string;
  lastUpdated: string;
  warning: string;
  sections: ReadonlyArray<{
    title: string;
    paragraphs: ReadonlyArray<string>;
    items?: ReadonlyArray<string>;
  }>;
};

type LegalContentPageProps = {
  eyebrow: string;
  content: LegalContent;
};

export function LegalContentPage({ eyebrow, content }: LegalContentPageProps) {
  return (
    <PublicPageShell
      eyebrow={eyebrow}
      title={content.title}
      subtitle={content.subtitle}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-black text-amber-950">
              À vérifier avant commercialisation
            </p>
            <p className="mt-2 text-sm leading-6 text-amber-900">
              {content.warning}
            </p>
          </div>

          <div className="mt-8 space-y-8">
            {content.sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl font-black text-slate-950">
                  {section.title}
                </h2>

                <div className="mt-4 space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-sm leading-7 text-slate-600"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {section.items ? (
                  <ul className="mt-4 space-y-2 rounded-3xl bg-slate-50 p-5 text-sm leading-6 text-slate-700">
                    {section.items.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </article>

        <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
            Document
          </p>
          <h2 className="mt-3 text-xl font-black text-slate-950">
            Informations
          </h2>

          <div className="mt-5 space-y-4 text-sm text-slate-600">
            <div>
              <p className="font-black text-slate-950">Dernière mise à jour</p>
              <p>{content.lastUpdated}</p>
            </div>

            <div>
              <p className="font-black text-slate-950">Statut</p>
              <p>Base prête à personnaliser avant lancement commercial.</p>
            </div>

            <div>
              <p className="font-black text-slate-950">Conseil</p>
              <p>
                Compléter avec les informations réelles de l’entreprise et
                faire relire avant vente à grande échelle.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </PublicPageShell>
  );
}
