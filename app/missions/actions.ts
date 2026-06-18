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


