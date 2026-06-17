import { prisma } from "@/lib/prisma";

/**
 * Version MVP sans authentification.
 * On utilise l'organisation de démonstration créée par le seed.
 *
 * Quand on ajoutera l'authentification, cette fonction devra retourner
 * l'organisation liée à l'utilisateur connecté.
 */
export async function getCurrentOrganization() {
  const organization = await prisma.organization.findFirst({
    where: {
      slug: "ferhat-kourdache",
    },
  });

  if (organization) return organization;

  return prisma.organization.create({
    data: {
      name: "Ferhat KOURDACHE",
      slug: "ferhat-kourdache",
      country: "FR",
      currency: "EUR",
    },
  });
}
