import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-organization";

export async function getClients() {
  const organization = await getCurrentOrganization();

  return prisma.client.findMany({
    where: {
      organizationId: organization.id,
    },
    include: {
      _count: {
        select: {
          missions: true,
          invoices: true,
        },
      },
    },
    orderBy: [
      { createdAt: "desc" },
      { legalName: "asc" },
    ],
  });
}

export async function getClientStats() {
  const organization = await getCurrentOrganization();

  const clients = await prisma.client.findMany({
    where: {
      organizationId: organization.id,
    },
    select: {
      id: true,
      email: true,
      phone: true,
      city: true,
      siret: true,
    },
  });

  const [missionCount, invoiceCount] = await Promise.all([
    prisma.mission.count({
      where: {
        organizationId: organization.id,
      },
    }),
    prisma.invoice.count({
      where: {
        organizationId: organization.id,
      },
    }),
  ]);

  const incompleteCount = clients.filter(
    (client) => !client.email || !client.city || !client.siret
  ).length;

  return {
    clientCount: clients.length,
    missionCount,
    invoiceCount,
    incompleteCount,
  };
}
