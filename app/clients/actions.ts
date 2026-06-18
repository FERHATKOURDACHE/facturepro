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

function numberFromForm(
  formData: FormData,
  key: string,
  defaultValue: number,
  options: { min?: number; max?: number } = {}
) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    return defaultValue;
  }

  const normalized = value.replace(",", ".");
  const numberValue = Number(normalized);

  if (Number.isNaN(numberValue)) {
    throw new Error(`Le champ ${key} doit être un nombre.`);
  }

  if (options.min !== undefined && numberValue < options.min) {
    throw new Error(`Le champ ${key} est trop faible.`);
  }

  if (options.max !== undefined && numberValue > options.max) {
    throw new Error(`Le champ ${key} est trop élevé.`);
  }

  return numberValue;
}

function normalizeCountry(value: string | null) {
  const country = (value ?? "FR").trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(country)) {
    throw new Error("Pays invalide.");
  }

  return country;
}

function normalizeEmail(value: string | null) {
  if (!value) return null;

  const email = value.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Email client invalide.");
  }

  return email;
}

function normalizeSiret(value: string | null) {
  if (!value) return null;

  const normalized = value.replace(/\s+/g, "");

  if (!/^\d{14}$/.test(normalized)) {
    throw new Error("SIRET invalide. Il doit contenir 14 chiffres.");
  }

  return normalized;
}

function normalizeSiren(value: string | null) {
  if (!value) return null;

  const normalized = value.replace(/\s+/g, "");

  if (!/^\d{9}$/.test(normalized)) {
    throw new Error("SIREN invalide. Il doit contenir 9 chiffres.");
  }

  return normalized;
}

function buildClientData(formData: FormData) {
  return {
    legalName: requiredString(formData, "legalName"),
    contactName: optionalString(formData.get("contactName")),
    email: normalizeEmail(optionalString(formData.get("email"))),
    phone: optionalString(formData.get("phone")),
    addressLine1: requiredString(formData, "addressLine1"),
    addressLine2: optionalString(formData.get("addressLine2")),
    postalCode: optionalString(formData.get("postalCode")),
    city: optionalString(formData.get("city")),
    country: normalizeCountry(optionalString(formData.get("country"))),
    siren: normalizeSiren(optionalString(formData.get("siren"))),
    siret: normalizeSiret(optionalString(formData.get("siret"))),
    ape: optionalString(formData.get("ape")),
    vatNumber: optionalString(formData.get("vatNumber")),
    paymentTermsDays: Math.round(
      numberFromForm(formData, "paymentTermsDays", 30, {
        min: 0,
        max: 365,
      })
    ),
  };
}

export async function createClientAction(formData: FormData) {
  const organization = await getCurrentOrganization();
  const data = buildClientData(formData);

  await prisma.$transaction(async (tx) => {
    const client = await tx.client.create({
      data: {
        organizationId: organization.id,
        ...data,
      },
    });

    await tx.auditLog.create({
      data: {
        organizationId: organization.id,
        action: "client.created",
        entityType: "Client",
        entityId: client.id,
        metadata: {
          legalName: data.legalName,
          email: data.email,
          city: data.city,
        },
      },
    });
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");

  redirect("/clients?saved=created");
}

export async function updateClientAction(formData: FormData) {
  const organization = await getCurrentOrganization();

  const id = requiredString(formData, "id");
  const data = buildClientData(formData);

  const client = await prisma.client.findFirst({
    where: {
      id,
      organizationId: organization.id,
    },
    select: {
      id: true,
    },
  });

  if (!client) {
    throw new Error("Client introuvable.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.client.update({
      where: {
        id,
        organizationId: organization.id,
      },
      data,
    });

    await tx.auditLog.create({
      data: {
        organizationId: organization.id,
        action: "client.updated",
        entityType: "Client",
        entityId: id,
        metadata: {
          legalName: data.legalName,
          email: data.email,
          city: data.city,
        },
      },
    });
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  revalidatePath("/missions");
  revalidatePath("/factures");

  redirect("/clients?saved=updated");
}

export async function deleteClientAction(formData: FormData) {
  const organization = await getCurrentOrganization();
  const id = requiredString(formData, "id");

  const client = await prisma.client.findFirst({
    where: {
      id,
      organizationId: organization.id,
    },
    select: {
      id: true,
      legalName: true,
    },
  });

  if (!client) {
    throw new Error("Client introuvable.");
  }

  const [relatedInvoices, relatedMissions] = await Promise.all([
    prisma.invoice.count({
      where: {
        organizationId: organization.id,
        clientId: id,
      },
    }),
    prisma.mission.count({
      where: {
        organizationId: organization.id,
        clientId: id,
      },
    }),
  ]);

  if (relatedInvoices > 0 || relatedMissions > 0) {
    throw new Error(
      "Ce client est lié à des missions ou factures. Suppression bloquée pour éviter une perte de données."
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.client.delete({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    await tx.auditLog.create({
      data: {
        organizationId: organization.id,
        action: "client.deleted",
        entityType: "Client",
        entityId: id,
        metadata: {
          legalName: client.legalName,
        },
      },
    });
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");

  redirect("/clients?saved=deleted");
}
