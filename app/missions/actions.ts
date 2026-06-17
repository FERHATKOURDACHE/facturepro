"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-organization";
import {
  calculateHours,
  dateAndTimeToUtcDate,
  toDecimal,
} from "@/lib/mission-calculations";

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

function numberFromForm(formData: FormData, key: string, defaultValue = 0) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    return defaultValue;
  }

  const normalized = value.replace(",", ".");
  const numberValue = Number(normalized);

  if (Number.isNaN(numberValue)) {
    throw new Error(`Le champ ${key} doit être un nombre.`);
  }

  return numberValue;
}

async function assertClientBelongsToOrganization(clientId: string, organizationId: string) {
  const client = await prisma.client.findFirst({
    where: {
      id: clientId,
      organizationId,
    },
  });

  if (!client) {
    throw new Error("Client introuvable pour cette organisation.");
  }

  return client;
}

export async function createMissionAction(formData: FormData) {
  const organization = await getCurrentOrganization();

  const clientId = requiredString(formData, "clientId");
  await assertClientBelongsToOrganization(clientId, organization.id);

  const date = requiredString(formData, "date");
  const startTime = requiredString(formData, "startTime");
  const endTime = requiredString(formData, "endTime");
  const breakMinutes = numberFromForm(formData, "breakMinutes", 0);
  const hourlyRate = numberFromForm(formData, "hourlyRate", 13);
  const fuelAmount = numberFromForm(formData, "fuelAmount", 0);

  const quantityHours = calculateHours({
    startTime,
    endTime,
    breakMinutes,
  });

  await prisma.$transaction(async (tx) => {
    const mission = await tx.mission.create({
      data: {
        organizationId: organization.id,
        clientId,
        date: new Date(`${date}T00:00:00.000Z`),
        startTime: dateAndTimeToUtcDate(date, startTime),
        endTime: dateAndTimeToUtcDate(date, endTime),
        breakMinutes,
        title: requiredString(formData, "title"),
        locationName: optionalString(formData.get("locationName")),
        address: optionalString(formData.get("address")),
        hourlyRate: toDecimal(hourlyRate),
        quantityHours: toDecimal(quantityHours),
        status: "DRAFT",
        notes: optionalString(formData.get("notes")),
      },
    });

    if (fuelAmount > 0) {
      await tx.expense.create({
        data: {
          organizationId: organization.id,
          missionId: mission.id,
          type: "FUEL",
          label: optionalString(formData.get("fuelLabel")) ?? "Frais carburant",
          amount: toDecimal(fuelAmount),
          expenseDate: new Date(`${date}T00:00:00.000Z`),
          notes: "Frais ajouté depuis la mission.",
        },
      });
    }
  });

  revalidatePath("/missions");
  revalidatePath("/dashboard");
  revalidatePath("/factures");
}

export async function updateMissionAction(formData: FormData) {
  const organization = await getCurrentOrganization();

  const id = requiredString(formData, "id");
  const clientId = requiredString(formData, "clientId");
  await assertClientBelongsToOrganization(clientId, organization.id);

  const date = requiredString(formData, "date");
  const startTime = requiredString(formData, "startTime");
  const endTime = requiredString(formData, "endTime");
  const breakMinutes = numberFromForm(formData, "breakMinutes", 0);
  const hourlyRate = numberFromForm(formData, "hourlyRate", 13);
  const quantityHours = calculateHours({
    startTime,
    endTime,
    breakMinutes,
  });

  await prisma.mission.update({
    where: {
      id,
      organizationId: organization.id,
    },
    data: {
      clientId,
      date: new Date(`${date}T00:00:00.000Z`),
      startTime: dateAndTimeToUtcDate(date, startTime),
      endTime: dateAndTimeToUtcDate(date, endTime),
      breakMinutes,
      title: requiredString(formData, "title"),
      locationName: optionalString(formData.get("locationName")),
      address: optionalString(formData.get("address")),
      hourlyRate: toDecimal(hourlyRate),
      quantityHours: toDecimal(quantityHours),
      notes: optionalString(formData.get("notes")),
    },
  });

  revalidatePath("/missions");
  revalidatePath("/dashboard");
  revalidatePath("/factures");
}

export async function validateMissionAction(formData: FormData) {
  const organization = await getCurrentOrganization();
  const id = requiredString(formData, "id");

  await prisma.mission.update({
    where: {
      id,
      organizationId: organization.id,
    },
    data: {
      status: "VALIDATED",
    },
  });

  revalidatePath("/missions");
  revalidatePath("/dashboard");
}

export async function draftMissionAction(formData: FormData) {
  const organization = await getCurrentOrganization();
  const id = requiredString(formData, "id");

  await prisma.mission.update({
    where: {
      id,
      organizationId: organization.id,
    },
    data: {
      status: "DRAFT",
    },
  });

  revalidatePath("/missions");
  revalidatePath("/dashboard");
}

export async function deleteMissionAction(formData: FormData) {
  const organization = await getCurrentOrganization();
  const id = requiredString(formData, "id");

  const mission = await prisma.mission.findFirst({
    where: {
      id,
      organizationId: organization.id,
    },
    select: {
      invoiceId: true,
    },
  });

  if (!mission) {
    throw new Error("Mission introuvable.");
  }

  if (mission.invoiceId) {
    throw new Error("Cette mission est déjà liée à une facture. Suppression bloquée.");
  }

  await prisma.mission.delete({
    where: {
      id,
      organizationId: organization.id,
    },
  });

  revalidatePath("/missions");
  revalidatePath("/dashboard");
  revalidatePath("/factures");
}

export async function seedMayMissionsAction() {
  const organization = await getCurrentOrganization();

  const client = await prisma.client.findFirst({
    where: {
      organizationId: organization.id,
      legalName: {
        contains: "TALENT PRO",
        mode: "insensitive",
      },
    },
  });

  if (!client) {
    throw new Error("Ajoute d'abord le client TALENT PRO SOLUTION intérim.");
  }

  const existingCount = await prisma.mission.count({
    where: {
      organizationId: organization.id,
      date: {
        gte: new Date("2026-05-01T00:00:00.000Z"),
        lte: new Date("2026-05-31T23:59:59.999Z"),
      },
    },
  });

  if (existingCount > 0) {
    throw new Error("Les missions de mai existent déjà en base.");
  }

  const rows = [
    ["2026-05-02", "06:30", "12:30", "Carrefour Market Boulogne", 13, 0],
    ["2026-05-02", "13:30", "20:00", "Carrefour Market Ivry-sur-Seine", 13, 0],
    ["2026-05-03", "06:30", "12:30", "Carrefour Market Boulogne", 13, 0],
    ["2026-05-04", "06:30", "12:30", "Carrefour Market Boulogne", 13, 0],
    ["2026-05-05", "06:30", "12:30", "Carrefour Market Boulogne", 13, 0],
    ["2026-05-06", "07:00", "13:00", "Carrefour Étampes 91150", 13, 50],
    ["2026-05-07", "07:00", "13:00", "Carrefour Étampes 91150", 13, 0],
    ["2026-05-08", "07:00", "13:00", "Carrefour Étampes 91150", 13, 0],
    ["2026-05-09", "07:00", "13:00", "Carrefour Étampes 91150", 13, 0],
    ["2026-05-11", "06:30", "12:30", "Carrefour Market Boulogne", 13, 0],
    ["2026-05-12", "06:30", "12:30", "Carrefour Market Boulogne", 13, 0],
    ["2026-05-13", "06:30", "12:30", "Carrefour Market Boulogne", 13, 0],
    ["2026-05-14", "06:30", "12:30", "Carrefour Market Boulogne", 13, 0],
    ["2026-05-15", "06:30", "12:30", "Carrefour Market Boulogne", 13, 0],
    ["2026-05-16", "06:30", "12:30", "Carrefour Market Boulogne", 13, 0],
    ["2026-05-17", "06:30", "12:30", "Carrefour Market Boulogne", 13, 0],
    ["2026-05-23", "06:30", "12:30", "Carrefour Market Boulogne", 13, 0],
    ["2026-05-25", "06:30", "12:30", "Carrefour Market Boulogne", 13, 0],
    ["2026-05-26", "06:30", "12:30", "Carrefour Market Boulogne", 13, 0],
    ["2026-05-27", "06:30", "12:30", "Carrefour Market Boulogne", 16, 0],
    ["2026-05-28", "06:30", "12:30", "Carrefour Market Boulogne", 13, 0],
    ["2026-05-29", "06:30", "12:30", "Carrefour Market Boulogne", 13, 0],
    ["2026-05-29", "13:30", "18:30", "Carrefour Market Boulogne", 13, 0],
    ["2026-05-30", "06:30", "12:30", "Carrefour Market Boulogne", 13, 0],
  ] as const;

  await prisma.$transaction(async (tx) => {
    for (const [date, startTime, endTime, locationName, rate, fuelAmount] of rows) {
      const quantityHours = calculateHours({
        startTime,
        endTime,
      });

      const mission = await tx.mission.create({
        data: {
          organizationId: organization.id,
          clientId: client.id,
          date: new Date(`${date}T00:00:00.000Z`),
          startTime: dateAndTimeToUtcDate(date, startTime),
          endTime: dateAndTimeToUtcDate(date, endTime),
          title: "Prestation magasin",
          locationName,
          hourlyRate: new Prisma.Decimal(rate),
          quantityHours: new Prisma.Decimal(quantityHours),
          status: "VALIDATED",
          notes: rate === 16 ? "Taux exceptionnel à 16 €/h" : null,
        },
      });

      if (fuelAmount > 0) {
        await tx.expense.create({
          data: {
            organizationId: organization.id,
            missionId: mission.id,
            type: "FUEL",
            label: "Frais essence Étampes",
            amount: new Prisma.Decimal(fuelAmount),
            expenseDate: new Date(`${date}T00:00:00.000Z`),
            notes: "Frais carburant demandé pour Étampes 91150.",
          },
        });
      }
    }
  });

  revalidatePath("/missions");
  revalidatePath("/dashboard");
  revalidatePath("/factures");
}
