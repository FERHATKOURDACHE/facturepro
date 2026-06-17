import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-organization";

export async function getInvoiceExportData(invoiceId: string) {
  const organization = await getCurrentOrganization();

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      organizationId: organization.id,
    },
    include: {
      client: true,
      profile: true,
      lines: {
        orderBy: {
          lineOrder: "asc",
        },
      },
      missions: {
        orderBy: [
          { date: "asc" },
          { startTime: "asc" },
        ],
      },
      expenses: true,
      payments: true,
    },
  });

  if (!invoice) {
    throw new Error("Facture introuvable.");
  }

  return {
    organization,
    invoice,
  };
}

export function money(value: unknown) {
  return Number(value ?? 0);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function formatDate(date: Date | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatTime(date: Date | null) {
  if (!date) return "-";

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
