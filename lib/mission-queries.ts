import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-organization";

type MissionWithRelations = Awaited<ReturnType<typeof getRawMissions>>[number];

async function getRawMissions(organizationId: string) {
  return prisma.mission.findMany({
    where: {
      organizationId,
    },
    include: {
      client: true,
      expenses: true,
      invoice: {
        select: {
          number: true,
          status: true,
        },
      },
    },
    orderBy: [
      { date: "desc" },
      { startTime: "desc" },
    ],
  });
}

export async function getMissionPageData() {
  const organization = await getCurrentOrganization();

  const [clients, missions] = await Promise.all([
    prisma.client.findMany({
      where: {
        organizationId: organization.id,
      },
      orderBy: {
        legalName: "asc",
      },
    }),
    getRawMissions(organization.id),
  ]);

  const totalHours = missions.reduce(
    (sum, mission) => sum + Number(mission.quantityHours),
    0
  );

  const totalServices = missions.reduce(
    (sum, mission) =>
      sum + Number(mission.quantityHours) * Number(mission.hourlyRate),
    0
  );

  const totalExpenses = missions.reduce(
    (sum, mission) =>
      sum + mission.expenses.reduce((expenseSum, expense) => expenseSum + Number(expense.amount), 0),
    0
  );

  const validatedCount = missions.filter((mission) => mission.status === "VALIDATED").length;
  const invoicedCount = missions.filter((mission) => mission.status === "INVOICED").length;

  const weeklyTotals = buildWeeklyTotals(missions);
  const locationTotals = buildLocationTotals(missions);

  return {
    organization,
    clients,
    missions,
    stats: {
      totalHours,
      totalServices,
      totalExpenses,
      totalWithExpenses: totalServices + totalExpenses,
      missionCount: missions.length,
      validatedCount,
      invoicedCount,
    },
    weeklyTotals,
    locationTotals,
  };
}

function getIsoWeek(date: Date) {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNumber = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  return {
    year: utcDate.getUTCFullYear(),
    week: weekNumber,
  };
}

function buildWeeklyTotals(missions: MissionWithRelations[]) {
  const map = new Map<string, { label: string; hours: number; amount: number; count: number }>();

  for (const mission of missions) {
    const iso = getIsoWeek(mission.date);
    const key = `${iso.year}-W${iso.week}`;
    const existing = map.get(key) ?? {
      label: `Semaine ${iso.week} - ${iso.year}`,
      hours: 0,
      amount: 0,
      count: 0,
    };

    existing.hours += Number(mission.quantityHours);
    existing.amount += Number(mission.quantityHours) * Number(mission.hourlyRate);
    existing.count += 1;

    map.set(key, existing);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value);
}

function buildLocationTotals(missions: MissionWithRelations[]) {
  const map = new Map<string, { location: string; hours: number; amount: number; count: number }>();

  for (const mission of missions) {
    const location = mission.locationName ?? "Lieu non renseigné";
    const existing = map.get(location) ?? {
      location,
      hours: 0,
      amount: 0,
      count: 0,
    };

    existing.hours += Number(mission.quantityHours);
    existing.amount += Number(mission.quantityHours) * Number(mission.hourlyRate);
    existing.count += 1;

    map.set(location, existing);
  }

  return Array.from(map.values()).sort((a, b) => b.hours - a.hours);
}
