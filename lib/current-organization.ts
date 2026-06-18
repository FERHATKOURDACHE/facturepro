
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function createSlugFromEmail(email: string, userId: string) {
  const base = email
    .split("@")[0]
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${base || "organisation"}-${userId.slice(0, 8)}`;
}

export async function getCurrentOrganization() {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    redirect("/connexion");
  }

  const membership = await prisma.membership.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      organization: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (membership?.organization) {
    return membership.organization;
  }

  const organization = await prisma.organization.create({
    data: {
      name: session.user.name ?? session.user.email,
      slug: createSlugFromEmail(session.user.email, session.user.id),
      country: "FR",
      currency: "EUR",
      memberships: {
        create: {
          userId: session.user.id,
          role: "OWNER",
        },
      },
    },
  });

  return organization;
}

