"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-organization";
import {
  calculateHours,
  dateAndTimeToUtcDate,
  toDecimal,
} from "@/lib/mission-calculations";

const MAX_IMPORTED_MISSIONS = 50;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const AiMissionImportSchema = z.object({
  date: z.string().regex(ISO_DATE_REGEX),
  startTime: z.string().regex(TIME_REGEX),
  endTime: z.string().regex(TIME_REGEX),
  locationName: z.string().max(120).nullable(),
  hourlyRate: z.number().min(0).max(10000).nullable(),
  fuelAmount: z.number().min(0).max(10000).nullable(),
  notes: z.string().max(500).nullable(),
});

const AiImportPayloadSchema = z
  .array(AiMissionImportSchema)
  .min(1)
  .max(MAX_IMPORTED_MISSIONS);

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Le champ ${key} est obligatoire.`);
  }

  return value.trim();
}

function parseAiMissionsPayload(raw: string) {
  try {
    return AiImportPayloadSchema.parse(JSON.parse(raw));
  } catch {
    throw new Error(
      `Données IA invalides ou trop volumineuses. Limite : ${MAX_IMPORTED_MISSIONS} missions.`
    );
  }
}

function parseMissionDate(date: string) {
  const parsed = new Date(`${date}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Date de mission invalide : ${date}`);
  }

  return parsed;
}

async function assertClientBelongsToOrganization(
  clientId: string,
  organizationId: string
) {
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

export async function importAiMissionsAction(formData: FormData) {
  const organization = await getCurrentOrganization();

  const clientId = requiredString(formData, "clientId");
  const missionsJson = requiredString(formData, "missionsJson");

  await assertClientBelongsToOrganization(clientId, organization.id);

  const missions = parseAiMissionsPayload(missionsJson);

  await prisma.$transaction(async (tx) => {
    let importedCount = 0;
    let expenseCount = 0;

    for (const mission of missions) {
      const hourlyRate = mission.hourlyRate ?? 13;
      const missionDate = parseMissionDate(mission.date);

      const quantityHours = calculateHours({
        startTime: mission.startTime,
        endTime: mission.endTime,
        breakMinutes: 0,
      });

      if (quantityHours <= 0 || quantityHours > 24) {
        throw new Error(
          `Durée invalide pour la mission du ${mission.date}.`
        );
      }

      const locationName = mission.locationName?.trim() || null;

      const createdMission = await tx.mission.create({
        data: {
          organizationId: organization.id,
          clientId,
          date: missionDate,
          startTime: dateAndTimeToUtcDate(mission.date, mission.startTime),
          endTime: dateAndTimeToUtcDate(mission.date, mission.endTime),
          breakMinutes: 0,
          title: locationName
            ? `Mission - ${locationName}`
            : "Mission importée par IA",
          locationName,
          address: null,
          hourlyRate: toDecimal(hourlyRate),
          quantityHours: toDecimal(quantityHours),
          status: "DRAFT",
          notes: mission.notes?.trim() || "Mission importée depuis l'assistant IA.",
        },
      });

      importedCount += 1;

      if (mission.fuelAmount && mission.fuelAmount > 0) {
        await tx.expense.create({
          data: {
            organizationId: organization.id,
            missionId: createdMission.id,
            type: "FUEL",
            label: "Frais importés par IA",
            amount: toDecimal(mission.fuelAmount),
            expenseDate: missionDate,
            notes: "Frais détectés pendant l'extraction IA.",
          },
        });

        expenseCount += 1;
      }
    }

    await tx.auditLog.create({
      data: {
        organizationId: organization.id,
        action: "ai.missions_imported",
        entityType: "Mission",
        metadata: {
          importedCount,
          expenseCount,
          clientId,
        },
      },
    });
  });

  revalidatePath("/ai");
  revalidatePath("/missions");
  revalidatePath("/dashboard");
  revalidatePath("/factures");

  redirect("/missions?saved=created");
}
