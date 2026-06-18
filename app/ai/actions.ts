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

const AiMissionImportSchema = z.object({
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  locationName: z.string().nullable(),
  hourlyRate: z.number().nullable(),
  fuelAmount: z.number().nullable(),
  notes: z.string().nullable(),
});

const AiImportPayloadSchema = z.array(AiMissionImportSchema);

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Le champ ${key} est obligatoire.`);
  }

  return value.trim();
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

  const missions = AiImportPayloadSchema.parse(JSON.parse(missionsJson));

  if (missions.length === 0) {
    throw new Error("Aucune mission à importer.");
  }

  await prisma.$transaction(async (tx) => {
    for (const mission of missions) {
      const hourlyRate = mission.hourlyRate ?? 13;

      const quantityHours = calculateHours({
        startTime: mission.startTime,
        endTime: mission.endTime,
        breakMinutes: 0,
      });

      const createdMission = await tx.mission.create({
        data: {
          organizationId: organization.id,
          clientId,
          date: new Date(`${mission.date}T00:00:00.000Z`),
          startTime: dateAndTimeToUtcDate(mission.date, mission.startTime),
          endTime: dateAndTimeToUtcDate(mission.date, mission.endTime),
          breakMinutes: 0,
          title: mission.locationName
            ? `Mission - ${mission.locationName}`
            : "Mission importée par IA",
          locationName: mission.locationName,
          address: null,
          hourlyRate: toDecimal(hourlyRate),
          quantityHours: toDecimal(quantityHours),
          status: "DRAFT",
          notes: mission.notes ?? "Mission importée depuis l’assistant IA.",
        },
      });

      if (mission.fuelAmount && mission.fuelAmount > 0) {
        await tx.expense.create({
          data: {
            organizationId: organization.id,
            missionId: createdMission.id,
            type: "FUEL",
            label: "Frais importés par IA",
            amount: toDecimal(mission.fuelAmount),
            expenseDate: new Date(`${mission.date}T00:00:00.000Z`),
            notes: "Frais détectés pendant l’extraction IA.",
          },
        });
      }
    }
  });

  revalidatePath("/ai");
  revalidatePath("/missions");
  revalidatePath("/dashboard");
  revalidatePath("/factures");

  redirect("/missions?saved=created");
}
