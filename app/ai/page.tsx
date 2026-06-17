import { requireUser } from "@/lib/require-auth";
import { AppShell } from "@/components/AppShell";
import { AiTimesheetExtractor } from "@/components/ai/AiTimesheetExtractor";

export const dynamic = "force-dynamic";

export default async function AiPage() {
  await requireUser();
  return (
    <AppShell
      title="Assistant IA"
      subtitle="Extraction automatique des heures, préparation de facture et aide à la gestion."
    >
      <AiTimesheetExtractor />
    </AppShell>
  );
}
