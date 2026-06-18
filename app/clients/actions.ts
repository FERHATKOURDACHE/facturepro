"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-organization";

function optionalString(value: FormDataEntryValue | null) {
  const stringValue = typeof value === "string" ? value.trim() : "";
  return stringValue.length > 0 ? stringValue : null;
}

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Le champ ${key} est obligatoire.`);
  }

  return value.trim();
}

function numberFromForm(formData: FormData, key: string, defaultValue: number) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    return defaultValue;
  }

  const numberValue = Number(value.replace(",", "."));

  if (Number.isNaN(numberValue)) {
    return defaultValue;
  }

  return numberValue;
}

export async function createClientAction(formData: FormData) {
  const organization = await getCurrentOrganization();

  const legalName = requiredString(formData, "legalName");
  const addressLine1 = requiredString(formData, "addressLine1");

  await prisma.client.create({
    data: {
      organizationId: organization.id,
      legalName,
      contactName: optionalString(formData.get("contactName")),
      email: optionalString(formData.get("email")),
      phone: optionalString(formData.get("phone")),
      addressLine1,
      addressLine2: optionalString(formData.get("addressLine2")),
      postalCode: optionalString(formData.get("postalCode")),
      city: optionalString(formData.get("city")),
      country: optionalString(formData.get("country")) ?? "FR",
      siren: optionalString(formData.get("siren")),
      siret: optionalString(formData.get("siret")),
      ape: optionalString(formData.get("ape")),
      vatNumber: optionalString(formData.get("vatNumber")),
      paymentTermsDays: numberFromForm(formData, "paymentTermsDays", 30),
    },
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");

  redirect("/clients?saved=created");
}

export async function updateClientAction(formData: FormData) {
  const organization = await getCurrentOrganization();

  const id = requiredString(formData, "id");
  const legalName = requiredString(formData, "legalName");
  const addressLine1 = requiredString(formData, "addressLine1");

  await prisma.client.update({
    where: {
      id,
      organizationId: organization.id,
    },
    data: {
      legalName,
      contactName: optionalString(formData.get("contactName")),
      email: optionalString(formData.get("email")),
      phone: optionalString(formData.get("phone")),
      addressLine1,
      addressLine2: optionalString(formData.get("addressLine2")),
      postalCode: optionalString(formData.get("postalCode")),
      city: optionalString(formData.get("city")),
      country: optionalString(formData.get("country")) ?? "FR",
      siren: optionalString(formData.get("siren")),
      siret: optionalString(formData.get("siret")),
      ape: optionalString(formData.get("ape")),
      vatNumber: optionalString(formData.get("vatNumber")),
      paymentTermsDays: numberFromForm(formData, "paymentTermsDays", 30),
    },
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");

  redirect("/clients?saved=updated");
}

export async function deleteClientAction(formData: FormData) {
  const organization = await getCurrentOrganization();
  const id = requiredString(formData, "id");

  const relatedInvoices = await prisma.invoice.count({
    where: {
      organizationId: organization.id,
      clientId: id,
    },
  });

  const relatedMissions = await prisma.mission.count({
    where: {
      organizationId: organization.id,
      clientId: id,
    },
  });

  if (relatedInvoices > 0 || relatedMissions > 0) {
    throw new Error(
      "Ce client est lié à des missions ou factures. Suppression bloquée pour éviter une perte de données."
    );
  }

  await prisma.client.delete({
    where: {
      id,
      organizationId: organization.id,
    },
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");

  redirect("/clients?saved=deleted");
}
