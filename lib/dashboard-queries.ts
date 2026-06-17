import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-organization";

export async function getDashboardData() {
  const organization = await getCurrentOrganization();

  const [clientsCount, missions, invoices] = await Promise.all([
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
      orderBy: {
        date: "desc",
      },
      take: 8,
    }),
    prisma.invoice.findMany({
      where: {
        organizationId: organization.id,
      },
      orderBy: {
        issueDate: "desc",
      },
      take: 5,
    }),
  ]);

  const totalHours = missions.reduce((sum, mission) => sum + Number(mission.quantityHours), 0);
  const totalServices = missions.reduce(
    (sum, mission) => sum + Number(mission.quantityHours) * Number(mission.hourlyRate),
    0
  );
  const totalExpenses = missions.reduce(
    (sum, mission) => sum + mission.expenses.reduce((expenseSum, expense) => expenseSum + Number(expense.amount), 0),
    0
  );
  const totalInvoices = invoices.reduce((sum, invoice) => sum + Number(invoice.total), 0);

  return {
    clientsCount,
    missions,
    invoices,
    totalHours,
    totalServices,
    totalExpenses,
    totalInvoices,
  };
}
