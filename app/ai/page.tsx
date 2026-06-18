import { requireUser } from "@/lib/require-auth";
import { AppShell } from "@/components/AppShell";
import { AiTimesheetExtractor } from "@/components/ai/AiTimesheetExtractor";

export const dynamic = "force-dynamic";

export default async function AiPage() {
  await requireUser();

  return (
    <AppShell
      title="Assistant IA"
      subtitle="Transforme un texte brut en feuille de temps structurée pour préparer tes missions et tes factures."
    >
      <AiTimesheetExtractor />
    </AppShell>
  );
}
