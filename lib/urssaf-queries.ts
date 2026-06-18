import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-organization";

export async function getUrssafTurnover(params: {
  periodStart: Date;
  periodEnd: Date;
}) {
  const organization = await getCurrentOrganization();

  const payments = await prisma.payment.findMany({
    where: {
      organizationId: organization.id,
      paidAt: {
        gte: params.periodStart,
        lte: params.periodEnd,
      },
      invoice: {
        organizationId: organization.id,
        status: {
          not: "CANCELLED",
        },
      },
    },
    include: {
      invoice: {
        include: {
          client: true,
        },
      },
    },
    orderBy: {
      paidAt: "desc",
    },
  });

  const turnover = payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  const invoiceIds = new Set(payments.map((payment) => payment.invoiceId));

  const invoices = payments.map((payment) => ({
    paymentId: payment.id,
    id: payment.invoice.id,
    number: payment.invoice.number,
    issueDate: payment.invoice.issueDate,
    status: payment.invoice.status,
    total: payment.invoice.total,
    clientName: payment.invoice.client.legalName,
    paidAt: payment.paidAt,
    paidAmount: Number(payment.amount),
    paymentMethod: payment.method,
    paymentReference: payment.reference,
  }));

  return {
    invoices,
    payments,
    turnover,
    invoiceCount: invoiceIds.size,
    paymentCount: payments.length,
    periodStart: params.periodStart,
    periodEnd: params.periodEnd,
  };
}
