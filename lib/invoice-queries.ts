import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-organization";

export async function getInvoicePageData() {
  const organization = await getCurrentOrganization();

  const [clients, profiles, invoices, validatedMissionsCount] = await Promise.all([
    prisma.client.findMany({
      where: {
        organizationId: organization.id,
      },
      orderBy: {
        legalName: "asc",
      },
    }),
    prisma.companyProfile.findMany({
      where: {
        organizationId: organization.id,
      },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "asc" },
      ],
    }),
    prisma.invoice.findMany({
      where: {
        organizationId: organization.id,
      },
      include: {
        client: true,
        profile: true,
        lines: {
          orderBy: {
            lineOrder: "asc",
          },
        },
        missions: {
          select: {
            id: true,
            date: true,
            quantityHours: true,
            hourlyRate: true,
            locationName: true,
          },
          orderBy: {
            date: "asc",
          },
        },
        expenses: true,
        payments: true,
      },
      orderBy: {
        issueDate: "desc",
      },
    }),
    prisma.mission.count({
      where: {
        organizationId: organization.id,
        status: "VALIDATED",
        invoiceId: null,
      },
    }),
  ]);

  const totalInvoiced = invoices.reduce((sum, invoice) => sum + Number(invoice.total), 0);
  const totalPaid = invoices
    .filter((invoice) => invoice.status === "PAID")
    .reduce((sum, invoice) => sum + Number(invoice.total), 0);
  const totalOpen = invoices
    .filter((invoice) => invoice.status !== "PAID" && invoice.status !== "CANCELLED")
    .reduce((sum, invoice) => sum + Number(invoice.total), 0);

  return {
    organization,
    clients,
    profiles,
    invoices,
    stats: {
      invoiceCount: invoices.length,
      validatedMissionsCount,
      totalInvoiced,
      totalPaid,
      totalOpen,
    },
  };
}

export async function getInvoiceSourcePreview(params: {
  clientId: string;
  periodStart: Date;
  periodEnd: Date;
}) {
  const organization = await getCurrentOrganization();

  const missions = await prisma.mission.findMany({
    where: {
      organizationId: organization.id,
      clientId: params.clientId,
      status: "VALIDATED",
      invoiceId: null,
      date: {
        gte: params.periodStart,
        lte: params.periodEnd,
      },
    },
    include: {
      expenses: true,
      client: true,
    },
    orderBy: [
      { date: "asc" },
      { startTime: "asc" },
    ],
  });

  const totalHours = missions.reduce((sum, mission) => sum + Number(mission.quantityHours), 0);
  const servicesAmount = missions.reduce(
    (sum, mission) => sum + Number(mission.quantityHours) * Number(mission.hourlyRate),
    0
  );
  const expensesAmount = missions.reduce(
    (sum, mission) => sum + mission.expenses.reduce((expenseSum, expense) => expenseSum + Number(expense.amount), 0),
    0
  );

  return {
    missions,
    totalHours,
    servicesAmount,
    expensesAmount,
    totalBeforeDeduction: servicesAmount + expensesAmount,
  };
}
