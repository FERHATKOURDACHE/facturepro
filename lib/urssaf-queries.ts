import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-organization";

export async function getUrssafTurnover(params: {
  periodStart: Date;
  periodEnd: Date;
}) {
  const organization = await getCurrentOrganization();

  const invoices = await prisma.invoice.findMany({
    where: {
      organizationId: organization.id,
      issueDate: {
        gte: params.periodStart,
        lte: params.periodEnd,
      },
      status: {
        in: ["SENT", "PARTIALLY_PAID", "PAID", "READY"],
      },
    },
  });

  const turnover = invoices.reduce((sum, invoice) => sum + Number(invoice.total), 0);

  return {
    invoices,
    turnover,
  };
}
