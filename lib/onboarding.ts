
import { redirect } from "next/navigation";

import { getCurrentOrganization } from "@/lib/current-organization";
import { prisma } from "@/lib/prisma";

export async function getCompanyProfileStatus() {
  const organization = await getCurrentOrganization();

  const profile =
    (await prisma.companyProfile.findFirst({
      where: {
        organizationId: organization.id,
        isDefault: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })) ??
    (await prisma.companyProfile.findFirst({
      where: {
        organizationId: organization.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    }));

  const isComplete = Boolean(
    profile?.legalName?.trim() &&
      profile?.addressLine1?.trim() &&
      profile?.postalCode?.trim() &&
      profile?.city?.trim()
  );

  return {
    organization,
    profile,
    isComplete,
  };
}

export async function requireCompanyProfileCompleted() {
  const { isComplete } = await getCompanyProfileStatus();

  if (!isComplete) {
    redirect("/parametres?onboarding=required");
  }
}

