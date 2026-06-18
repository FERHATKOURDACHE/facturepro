"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MissionStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-organization";
import {
  calculateHours,
  dateAndTimeToUtcDate,
  toDecimal,
} from "@/lib/mission-calculations";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

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
  defaultValue = 0,
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

function dateFromInput(value: string) {
  if (!ISO_DATE_REGEX.test(value)) {
    throw new Error("Format de date invalide.");
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Date invalide.");
  }

  return date;
}

function timeFromInput(value: string) {
  if (!TIME_REGEX.test(value)) {
    throw new Error("Format horaire invalide. Format attendu : HH:mm.");
  }

  return value;
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
    select: {
      id: true,
    },
  });

  if (!client) {
    throw new Error("Client introuvable pour cette organisation.");
  }

  return client;
}

async function getEditableMission(id: string, organizationId: string) {
  const mission = await prisma.mission.findFirst({
    where: {
      id,
      organizationId,
    },
    select: {
      id: true,
      status: true,
      invoiceId: true,
      title: true,
    },
  });

  if (!mission) {
    throw new Error("Mission introuvable.");
  }

  if (
    mission.invoiceId ||
    mission.status === MissionStatus.INVOICED ||
    mission.status === MissionStatus.PAID
  ) {
    throw new Error("Cette mission est déjà liée à une facture. Modification bloquée.");
  }

  if (mission.status === MissionStatus.CANCELLED) {
    throw new Error("Cette mission est annulée. Modification bloquée.");
  }

  return mission;
}

function buildMissionPayload(formData: FormData) {
  const date = requiredString(formData, "date");
  const startTime = timeFromInput(requiredString(formData, "startTime"));
  const endTime = timeFromInput(requiredString(formData, "endTime"));

  const breakMinutes = Math.round(
    numberFromForm(formData, "breakMinutes", 0, {
      min: 0,
      max: 720,
    })
  );

  const hourlyRate = numberFromForm(formData, "hourlyRate", 13, {
    min: 0,
    max: 10000,
  });

  const fuelAmount = numberFromForm(formData, "fuelAmount", 0, {
    min: 0,
    max: 10000,
  });

  const quantityHours = calculateHours({
    startTime,
    endTime,
    breakMinutes,
  });

  if (quantityHours <= 0 || quantityHours > 24) {
    throw new Error("Durée de mission invalide.");
  }

  return {
    date,
    missionDate: dateFromInput(date),
    startTime,
    endTime,
    breakMinutes,
    hourlyRate,
    fuelAmount,
    quantityHours,
    title: requiredString(formData, "title"),
    locationName: optionalString(formData.get("locationName")),
    address: optionalString(formData.get("address")),
    notes: optionalString(formData.get("notes")),
    fuelLabel: optionalString(formData.get("fuelLabel")) ?? "Frais carburant",
  };
}

export async function createMissionAction(formData: FormData) {
  const organization = await getCurrentOrganization();

  const clientId = requiredString(formData, "clientId");
  await assertClientBelongsToOrganization(clientId, organization.id);

  const payload = buildMissionPayload(formData);

  await prisma.$transaction(async (tx) => {
    const mission = await tx.mission.create({
      data: {
        organizationId: organization.id,
        clientId,
        date: payload.missionDate,
        startTime: dateAndTimeToUtcDate(payload.date, payload.startTime),
        endTime: dateAndTimeToUtcDate(payload.date, payload.endTime),
        breakMinutes: payload.breakMinutes,
        title: payload.title,
        locationName: payload.locationName,
        address: payload.address,
        hourlyRate: toDecimal(payload.hourlyRate),
        quantityHours: toDecimal(payload.quantityHours),
        status: MissionStatus.DRAFT,
        notes: payload.notes,
      },
    });

    if (payload.fuelAmount > 0) {
      await tx.expense.create({
        data: {
          organizationId: organization.id,
          missionId: mission.id,
          type: "FUEL",
          label: payload.fuelLabel,
          amount: toDecimal(payload.fuelAmount),
          expenseDate: payload.missionDate,
          notes: "Frais ajouté depuis la mission.",
        },
      });
    }

    await tx.auditLog.create({
      data: {
        organizationId: organization.id,
        action: "mission.created",
        entityType: "Mission",
        entityId: mission.id,
        metadata: {
          clientId,
          title: payload.title,
          date: payload.date,
          quantityHours: payload.quantityHours,
          fuelAmount: payload.fuelAmount,
        },
      },
    });
  });

  revalidatePath("/missions");
  revalidatePath("/dashboard");
  revalidatePath("/factures");

  redirect("/missions?saved=created");
}

export async function updateMissionAction(formData: FormData) {
  const organization = await getCurrentOrganization();

  const id = requiredString(formData, "id");
  const clientId = requiredString(formData, "clientId");

  await assertClientBelongsToOrganization(clientId, organization.id);
  const mission = await getEditableMission(id, organization.id);

  const payload = buildMissionPayload(formData);

  await prisma.$transaction(async (tx) => {
    await tx.mission.update({
      where: {
        id,
        organizationId: organization.id,
      },
      data: {
        clientId,
        date: payload.missionDate,
        startTime: dateAndTimeToUtcDate(payload.date, payload.startTime),
        endTime: dateAndTimeToUtcDate(payload.date, payload.endTime),
        breakMinutes: payload.breakMinutes,
        title: payload.title,
        locationName: payload.locationName,
        address: payload.address,
        hourlyRate: toDecimal(payload.hourlyRate),
        quantityHours: toDecimal(payload.quantityHours),
        notes: payload.notes,
      },
    });

    await tx.auditLog.create({
      data: {
        organizationId: organization.id,
        action: "mission.updated",
        entityType: "Mission",
        entityId: id,
        metadata: {
          previousTitle: mission.title,
          nextTitle: payload.title,
          clientId,
          date: payload.date,
          quantityHours: payload.quantityHours,
        },
      },
    });
  });

  revalidatePath("/missions");
  revalidatePath("/dashboard");
  revalidatePath("/factures");

  redirect("/missions?saved=updated");
}

export async function validateMissionAction(formData: FormData) {
  const organization = await getCurrentOrganization();
  const id = requiredString(formData, "id");

  const mission = await getEditableMission(id, organization.id);

  if (mission.status !== MissionStatus.DRAFT) {
    throw new Error("Seule une mission en brouillon peut être validée.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.mission.update({
      where: {
        id,
        organizationId: organization.id,
      },
      data: {
        status: MissionStatus.VALIDATED,
      },
    });

    await tx.auditLog.create({
      data: {
        organizationId: organization.id,
        action: "mission.validated",
        entityType: "Mission",
        entityId: id,
        metadata: {
          previousStatus: mission.status,
          nextStatus: MissionStatus.VALIDATED,
        },
      },
    });
  });

  revalidatePath("/missions");
  revalidatePath("/dashboard");
  revalidatePath("/factures");

  redirect("/missions?saved=validated");
}

export async function validateDraftMissionsAction() {
  const organization = await getCurrentOrganization();

  const result = await prisma.$transaction(async (tx) => {
    const draftMissions = await tx.mission.findMany({
      where: {
        organizationId: organization.id,
        status: MissionStatus.DRAFT,
        invoiceId: null,
      },
      select: {
        id: true,
      },
    });

    if (draftMissions.length === 0) {
      return { count: 0 };
    }

    const updateResult = await tx.mission.updateMany({
      where: {
        organizationId: organization.id,
        status: MissionStatus.DRAFT,
        invoiceId: null,
      },
      data: {
        status: MissionStatus.VALIDATED,
      },
    });

    await tx.auditLog.create({
      data: {
        organizationId: organization.id,
        action: "mission.drafts_validated",
        entityType: "Mission",
        metadata: {
          count: updateResult.count,
        },
      },
    });

    return { count: updateResult.count };
  });

  revalidatePath("/missions");
  revalidatePath("/dashboard");
  revalidatePath("/factures");

  redirect(
    result.count > 0
      ? "/missions?saved=drafts_validated"
      : "/missions?saved=no_drafts"
  );
}

export async function draftMissionAction(formData: FormData) {
  const organization = await getCurrentOrganization();
  const id = requiredString(formData, "id");

  const mission = await getEditableMission(id, organization.id);

  if (mission.status !== MissionStatus.VALIDATED) {
    throw new Error("Seule une mission validée peut être remise en brouillon.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.mission.update({
      where: {
        id,
        organizationId: organization.id,
      },
      data: {
        status: MissionStatus.DRAFT,
      },
    });

    await tx.auditLog.create({
      data: {
        organizationId: organization.id,
        action: "mission.drafted",
        entityType: "Mission",
        entityId: id,
        metadata: {
          previousStatus: mission.status,
          nextStatus: MissionStatus.DRAFT,
        },
      },
    });
  });

  revalidatePath("/missions");
  revalidatePath("/dashboard");
  revalidatePath("/factures");

  redirect("/missions?saved=draft");
}

export async function deleteMissionAction(formData: FormData) {
  const organization = await getCurrentOrganization();
  const id = requiredString(formData, "id");

  const mission = await getEditableMission(id, organization.id);

  await prisma.$transaction(async (tx) => {
    await tx.expense.deleteMany({
      where: {
        missionId: id,
        organizationId: organization.id,
        invoiceId: null,
      },
    });

    await tx.mission.delete({
      where: {
        id,
        organizationId: organization.id,
      },
    });

    await tx.auditLog.create({
      data: {
        organizationId: organization.id,
        action: "mission.deleted",
        entityType: "Mission",
        entityId: id,
        metadata: {
          title: mission.title,
          previousStatus: mission.status,
        },
      },
    });
  });

  revalidatePath("/missions");
  revalidatePath("/dashboard");
  revalidatePath("/factures");

  redirect("/missions?saved=deleted");
}
