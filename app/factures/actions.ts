
"use server";

import { revalidatePath } from "next/cache";
import { InvoiceStatus, PaymentMethod } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-organization";
import { generateInvoiceNumber } from "@/lib/invoice-number";
import {
  calculateInvoiceTotals,
  roundMoney,
  toDecimal,
  type InvoicePreviewLine,
} from "@/lib/invoice-calculations";

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
    throw new Error(`Le champ ${ key } doit être un nombre.`);
  }

  return numberValue;
}

function dateFromInput(value: string, endOfDay = false) {
  return new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
}

function addDays(date: Date, days: number) {
  const clone = new Date(date);
  clone.setUTCDate(clone.getUTCDate() + days);
  return clone;
}

const PAYMENT_METHODS = new Set<PaymentMethod>([
  PaymentMethod.BANK_TRANSFER,
  PaymentMethod.CARD,
  PaymentMethod.CASH,
  PaymentMethod.CHECK,
  PaymentMethod.OTHER,
]);

function paymentMethodFromForm(formData: FormData) {
  const method =
    optionalString(formData.get("method")) ?? PaymentMethod.BANK_TRANSFER;

  if (!PAYMENT_METHODS.has(method as PaymentMethod)) {
    throw new Error("Méthode de paiement invalide.");
  }

  return method as PaymentMethod;
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

export async function createInvoiceFromValidatedMissionsAction(
  formData: FormData
) {
  const organization = await getCurrentOrganization();

  const clientId = requiredString(formData, "clientId");
  const client = await assertClientBelongsToOrganization(
    clientId,
    organization.id
  );

  const profileId = optionalString(formData.get("profileId"));
  const periodStart = dateFromInput(requiredString(formData, "periodStart"));
  const periodEnd = dateFromInput(requiredString(formData, "periodEnd"), true);
  const issueDate = dateFromInput(requiredString(formData, "issueDate"));
  const dueDate = addDays(issueDate, client.paymentTermsDays ?? 30);

  const customNumber = optionalString(formData.get("number"));
  const number =
    customNumber ??
    (await generateInvoiceNumber({
      organizationId: organization.id,
      issueDate,
    }));

  const paidHoursDeduction = numberFromForm(formData, "paidHoursDeduction", 0);
  const paidHoursDeductionRate = numberFromForm(
    formData,
    "paidHoursDeductionRate",
    13
  );

  const deductionLabel =
    optionalString(formData.get("deductionLabel")) ??
    "Déduction des heures déjà réglées";

  const profile = profileId
    ? await prisma.companyProfile.findFirst({
        where: {
          id: profileId,
          organizationId: organization.id,
        },
      })
    : await prisma.companyProfile.findFirst({
        where: {
          organizationId: organization.id,
          isDefault: true,
        },
      });

  const legalNotice =
    optionalString(formData.get("legalNotice")) ??
    profile?.invoiceLegalNotice ??
    "TVA non applicable - article 293 B du CGI";

  const missions = await prisma.mission.findMany({
    where: {
      organizationId: organization.id,
      clientId,
      status: "VALIDATED",
      invoiceId: null,
      date: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
    include: {
      expenses: true,
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  if (missions.length === 0) {
    throw new Error("Aucune mission validée non facturée sur cette période.");
  }

  const lines: InvoicePreviewLine[] = [];
  const serviceGroups = new Map<
    string,
    { rate: number; quantity: number; amount: number }
  >();

  for (const mission of missions) {
    const rate = Number(mission.hourlyRate);
    const key = rate.toFixed(2);
    const quantity = Number(mission.quantityHours);

    const existing = serviceGroups.get(key) ?? {
      rate,
      quantity: 0,
      amount: 0,
    };

    existing.quantity = roundMoney(existing.quantity + quantity);
    existing.amount = roundMoney(existing.amount + quantity * rate);

    serviceGroups.set(key, existing);
  }

  for (const group of Array.from(serviceGroups.values()).sort(
    (a, b) => a.rate - b.rate
  )) {
    lines.push({
      label: `Prestations de services - ${
  group.rate
  .toFixed(2)
  .replace(".", ",")
} €/h`,
description: `${missions.length} mission(s) validée(s) sur la période`,
  quantity: group.quantity,
    unit: "HOUR",
      unitPrice: group.rate,
        total: group.amount,
    });
  }

const expenseGroups = new Map<string, { label: string; amount: number }>();

for (const mission of missions) {
  for (const expense of mission.expenses) {
    const existing = expenseGroups.get(expense.label) ?? {
      label: expense.label,
      amount: 0,
    };

    existing.amount = roundMoney(existing.amount + Number(expense.amount));
    expenseGroups.set(expense.label, existing);
  }
}

for (const expense of expenseGroups.values()) {
  lines.push({
    label: expense.label,
    description: "Frais liés aux missions de la période",
    quantity: 1,
    unit: "FIXED_PRICE",
    unitPrice: expense.amount,
    total: expense.amount,
  });
}

if (paidHoursDeduction > 0) {
  lines.push({
    label: deductionLabel,
    description: `${paidHoursDeduction} heure(s) déjà payée(s) × ${paidHoursDeductionRate
      .toFixed(2)
      .replace(".", ",")} €/h`,
    quantity: paidHoursDeduction,
    unit: "HOUR",
    unitPrice: -paidHoursDeductionRate,
    total: -roundMoney(paidHoursDeduction * paidHoursDeductionRate),
  });
}

const totals = calculateInvoiceTotals(lines, 0);

if (totals.total < 0) {
  throw new Error("Le total de la facture ne peut pas être négatif.");
}

await prisma.$transaction(async (tx) => {
  const invoice = await tx.invoice.create({
    data: {
      organizationId: organization.id,
      profileId: profile?.id,
      clientId,
      number,
      issueDate,
      dueDate,
      periodStart,
      periodEnd,
      status: "READY",
      currency: organization.currency,
      subtotal: toDecimal(totals.subtotal),
      vatRate: toDecimal(totals.vatRate),
      vatAmount: toDecimal(totals.vatAmount),
      total: toDecimal(totals.total),
      paidHoursDeduction: toDecimal(paidHoursDeduction),
      paidAmountDeduction: toDecimal(
        roundMoney(paidHoursDeduction * paidHoursDeductionRate)
      ),
      notes: optionalString(formData.get("notes")),
      legalNotice,
      lines: {
        create: lines.map((line, index) => ({
          label: line.label,
          description: line.description,
          quantity: toDecimal(line.quantity),
          unit: line.unit,
          unitPrice: toDecimal(line.unitPrice),
          vatRate: toDecimal(0),
          total: toDecimal(line.total),
          lineOrder: index + 1,
        })),
      },
    },
  });

  await tx.mission.updateMany({
    where: {
      id: {
        in: missions.map((mission) => mission.id),
      },
      organizationId: organization.id,
    },
    data: {
      invoiceId: invoice.id,
      status: "INVOICED",
    },
  });

  await tx.expense.updateMany({
    where: {
      missionId: {
        in: missions.map((mission) => mission.id),
      },
      organizationId: organization.id,
    },
    data: {
      invoiceId: invoice.id,
    },
  });

  await tx.auditLog.create({
    data: {
      organizationId: organization.id,
      action: "invoice.created_from_missions",
      entityType: "Invoice",
      entityId: invoice.id,
      metadata: {
        number,
        clientId,
        missionCount: missions.length,
        total: totals.total,
        paidHoursDeduction,
      },
    },
  });
});

revalidatePath("/factures");
revalidatePath("/missions");
revalidatePath("/dashboard");
}

export async function updateInvoiceStatusAction(formData: FormData) {
  const organization = await getCurrentOrganization();
  const id = requiredString(formData, "id");
  const status = requiredString(formData, "status") as InvoiceStatus;

  await prisma.invoice.update({
    where: {
      id,
      organizationId: organization.id,
    },
    data: {
      status,
    },
  });

  revalidatePath("/factures");
  revalidatePath("/dashboard");
}

export async function registerInvoicePaymentAction(formData: FormData) {
  const organization = await getCurrentOrganization();
  const id = requiredString(formData, "id");
  const amount = numberFromForm(formData, "amount", 0);
  const method = paymentMethodFromForm(formData);
  const paidAtInput = optionalString(formData.get("paidAt"));
  const paidAt = paidAtInput ? dateFromInput(paidAtInput) : new Date();

  if (Number.isNaN(paidAt.getTime())) {
    throw new Error("Date d'encaissement invalide.");
  }

  if (amount <= 0) {
    throw new Error("Le montant du paiement doit être supérieur à zéro.");
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      id,
      organizationId: organization.id,
    },
  });

  if (!invoice) {
    throw new Error("Facture introuvable.");
  }

  if (invoice.status === "CANCELLED") {
    throw new Error("Impossible d'enregistrer un paiement sur une facture annulée.");
  }

  const invoiceTotal = Number(invoice.total);

  await prisma.$transaction(async (tx) => {
    const paidTotalBefore = await tx.payment.aggregate({
      where: {
        invoiceId: id,
        organizationId: organization.id,
      },
      _sum: {
        amount: true,
      },
    });

    const alreadyPaid = Number(paidTotalBefore._sum.amount ?? 0);
    const remainingAmount = roundMoney(invoiceTotal - alreadyPaid);
    const totalAfterPayment = roundMoney(alreadyPaid + amount);

    if (remainingAmount <= 0) {
      throw new Error("Cette facture est déjà entièrement payée.");
    }

    if (totalAfterPayment > invoiceTotal + 0.01) {
      throw new Error(
        "Le montant dépasse le reste à payer (" +
          remainingAmount.toFixed(2).replace(".", ",") +
          " €)."
      );
    }

    await tx.payment.create({
      data: {
        organizationId: organization.id,
        invoiceId: id,
        amount: toDecimal(amount),
        method,
        paidAt,
        reference: optionalString(formData.get("reference")),
        notes: optionalString(formData.get("notes")),
      },
    });

    await tx.invoice.update({
      where: {
        id,
        organizationId: organization.id,
      },
      data: {
        status: totalAfterPayment >= invoiceTotal ? "PAID" : "PARTIALLY_PAID",
      },
    });
  });

  revalidatePath("/factures");
  revalidatePath("/dashboard");
  revalidatePath("/urssaf");
}

export async function cancelInvoiceAction(formData: FormData) {
  const organization = await getCurrentOrganization();
  const id = requiredString(formData, "id");

  const invoice = await prisma.invoice.findFirst({
    where: {
      id,
      organizationId: organization.id,
    },
    include: {
      missions: true,
    },
  });

  if (!invoice) {
    throw new Error("Facture introuvable.");
  }

  if (invoice.status === "PAID" || invoice.status === "PARTIALLY_PAID") {
    throw new Error(
      "Impossible d'annuler une facture déjà payée ou partiellement payée."
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.mission.updateMany({
      where: {
        invoiceId: id,
        organizationId: organization.id,
      },
      data: {
        invoiceId: null,
        status: "VALIDATED",
      },
    });

    await tx.expense.updateMany({
      where: {
        invoiceId: id,
        organizationId: organization.id,
      },
      data: {
        invoiceId: null,
      },
    });

    await tx.invoice.update({
      where: {
        id,
        organizationId: organization.id,
      },
      data: {
        status: "CANCELLED",
      },
    });
  });

  revalidatePath("/factures");
  revalidatePath("/missions");
  revalidatePath("/dashboard");
}

