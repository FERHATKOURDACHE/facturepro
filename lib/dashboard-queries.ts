import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-organization";

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

export async function getDashboardData() {
  const organization = await getCurrentOrganization();

  const [
    clientsCount,
    allMissions,
    recentMissions,
    allInvoices,
    recentInvoices,
  ] = await Promise.all([
    prisma.client.count({
      where: {
        organizationId: organization.id,
      },
    }),
    prisma.mission.findMany({
      where: {
        organizationId: organization.id,
      },
      include: {
        expenses: true,
      },
    }),
    prisma.mission.findMany({
      where: {
        organizationId: organization.id,
      },
      include: {
        expenses: true,
        client: {
          select: {
            legalName: true,
          },
        },
      },
      orderBy: [
        { date: "desc" },
        { startTime: "desc" },
      ],
      take: 8,
    }),
    prisma.invoice.findMany({
      where: {
        organizationId: organization.id,
      },
    }),
    prisma.invoice.findMany({
      where: {
        organizationId: organization.id,
      },
      include: {
        client: {
          select: {
            legalName: true,
          },
        },
      },
      orderBy: {
        issueDate: "desc",
      },
      take: 5,
    }),
  ]);

  const totalHours = allMissions.reduce(
    (sum, mission) => sum + toNumber(mission.quantityHours),
    0
  );

  const totalServices = allMissions.reduce(
    (sum, mission) =>
      sum + toNumber(mission.quantityHours) * toNumber(mission.hourlyRate),
    0
  );

  const totalExpenses = allMissions.reduce(
    (sum, mission) =>
      sum +
      mission.expenses.reduce(
        (expenseSum, expense) => expenseSum + toNumber(expense.amount),
        0
      ),
    0
  );

  const totalInvoices = allInvoices.reduce(
    (sum, invoice) => sum + toNumber(invoice.total),
    0
  );

  const totalPaidInvoices = allInvoices
    .filter((invoice) => invoice.status === "PAID")
    .reduce((sum, invoice) => sum + toNumber(invoice.total), 0);

  const totalOpenInvoices = allInvoices
    .filter(
      (invoice) =>
        invoice.status !== "PAID" && invoice.status !== "CANCELLED"
    )
    .reduce((sum, invoice) => sum + toNumber(invoice.total), 0);

  const draftMissionsCount = allMissions.filter(
    (mission) => mission.status === "DRAFT"
  ).length;

  const validatedMissionsCount = allMissions.filter(
    (mission) => mission.status === "VALIDATED"
  ).length;

  const billableMissionsCount = allMissions.filter(
    (mission) => mission.status === "VALIDATED" && !mission.invoiceId
  ).length;

  const invoicedMissionsCount = allMissions.filter(
    (mission) => Boolean(mission.invoiceId)
  ).length;

  return {
    organization,
    clientsCount,
    missions: recentMissions,
    invoices: recentInvoices,
    stats: {
      missionsCount: allMissions.length,
      invoicesCount: allInvoices.length,
      totalHours,
      totalServices,
      totalExpenses,
      totalRevenue: totalServices + totalExpenses,
      totalInvoices,
      totalPaidInvoices,
      totalOpenInvoices,
      draftMissionsCount,
      validatedMissionsCount,
      billableMissionsCount,
      invoicedMissionsCount,
    },
    totalHours,
    totalServices,
    totalExpenses,
    totalInvoices,
  };
}
