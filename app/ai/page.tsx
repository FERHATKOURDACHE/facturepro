import { requireUser } from "@/lib/require-auth";
import { AppShell } from "@/components/AppShell";
import { AiTimesheetExtractor } from "@/components/ai/AiTimesheetExtractor";
import { getCurrentOrganization } from "@/lib/current-organization";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AiPage() {
  await requireUser();

  const organization = await getCurrentOrganization();

  const clients = await prisma.client.findMany({
    where: {
      organizationId: organization.id,
    },
    orderBy: {
      legalName: "asc",
    },
    select: {
      id: true,
      legalName: true,
    },
  });

  return (
    <AppShell
      title="Assistant IA"
      subtitle="Transforme un texte brut en feuille de temps structurée pour préparer tes missions et tes factures."
    >
      <AiTimesheetExtractor clients={clients} />
    </AppShell>
  );
}
