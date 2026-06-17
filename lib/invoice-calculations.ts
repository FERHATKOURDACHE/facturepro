import { Prisma } from "@prisma/client";

export type InvoicePreviewLine = {
  label: string;
  description?: string | null;
  quantity: number;
  unit: "HOUR" | "DAY" | "UNIT" | "FIXED_PRICE";
  unitPrice: number;
  total: number;
};

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
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

export function toDecimal(value: number | string) {
  return new Prisma.Decimal(value.toString());
}

export function calculateInvoiceTotals(lines: InvoicePreviewLine[], vatRate = 0) {
  const subtotal = roundMoney(lines.reduce((sum, line) => sum + line.total, 0));
  const vatAmount = roundMoney(subtotal * vatRate);
  const total = roundMoney(subtotal + vatAmount);

  return {
    subtotal,
    vatRate,
    vatAmount,
    total,
  };
}
