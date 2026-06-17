import { Prisma } from "@prisma/client";

export function parseTimeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error("Format d'heure invalide. Utilise HH:mm.");
  }

  return hours * 60 + minutes;
}

export function calculateHours(params: {
  startTime: string;
  endTime: string;
  breakMinutes?: number;
}) {
  const startMinutes = parseTimeToMinutes(params.startTime);
  const endMinutes = parseTimeToMinutes(params.endTime);
  const breakMinutes = params.breakMinutes ?? 0;

  if (endMinutes <= startMinutes) {
    throw new Error("L'heure de fin doit être après l'heure de début.");
  }

  if (breakMinutes < 0) {
    throw new Error("La pause ne peut pas être négative.");
  }

  const workedMinutes = endMinutes - startMinutes - breakMinutes;

  if (workedMinutes <= 0) {
    throw new Error("La durée travaillée doit être supérieure à zéro.");
  }

  return Math.round((workedMinutes / 60) * 100) / 100;
}

export function dateAndTimeToUtcDate(date: string, time: string) {
  return new Date(`${date}T${time}:00.000Z`);
}

export function toDecimal(value: number | string) {
  return new Prisma.Decimal(value.toString());
}

export function formatDateFr(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatTimeUtc(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatHours(value: number) {
  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 60);
  return minutes === 0 ? `${hours}h` : `${hours}h${String(minutes).padStart(2, "0")}`;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}
