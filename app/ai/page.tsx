import { AppShell } from "@/components/AppShell";
import { AiTimesheetExtractor } from "@/components/ai/AiTimesheetExtractor";

export default function AiPage() {
  return (
    <AppShell
      title="Assistant IA"
      subtitle="Extraction automatique des heures, préparation de facture et aide à la gestion."
    >
      <AiTimesheetExtractor />
    </AppShell>
  );
}
