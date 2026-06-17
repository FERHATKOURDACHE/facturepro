import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-organization";

export async function getClients() {
  const organization = await getCurrentOrganization();

  return prisma.client.findMany({
    where: {
      organizationId: organization.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getClientStats() {
  const organization = await getCurrentOrganization();

  const [clientCount, missionCount, invoiceCount] = await Promise.all([
    prisma.client.count({
      where: {
        organizationId: organization.id,
      },
    }),
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

  return {
    clientCount,
    missionCount,
    invoiceCount,
  };
}
