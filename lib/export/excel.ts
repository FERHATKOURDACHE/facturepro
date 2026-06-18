import ExcelJS from "exceljs";
import {
  formatCurrency,
  formatDate,
  formatHours,
  formatTime,
  money,
} from "@/lib/export/invoice-data";

type InvoiceExportData = Awaited<
  ReturnType<typeof import("@/lib/export/invoice-data").getInvoiceExportData>
>;

function unitLabel(unit: string) {
  if (unit === "HOUR") return "Heures";
  if (unit === "DAY") return "Jours";
  if (unit === "UNIT") return "Unités";
  if (unit === "FIXED_PRICE") return "Forfait";

  return unit;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "Brouillon",
    READY: "Prête",
    SENT: "Envoyée",
    PARTIALLY_PAID: "Partiellement payée",
    PAID: "Payée",
    OVERDUE: "En retard",
    CANCELLED: "Annulée",
  };

  return labels[status] ?? status;
}

function paymentMethodLabel(method: string) {
  const labels: Record<string, string> = {
    BANK_TRANSFER: "Virement bancaire",
    CARD: "Carte bancaire",
    CASH: "Espèces",
    CHECK: "Chèque",
    OTHER: "Autre",
  };

  return labels[method] ?? method;
}

function styleHeader(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F172A" },
  };
  row.alignment = { vertical: "middle" };
}

function autoFitColumns(sheet: ExcelJS.Worksheet) {
  sheet.columns.forEach((column) => {
    let maxLength = 12;

    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const value = String(cell.value ?? "");
      maxLength = Math.max(maxLength, value.length + 2);
    });

    column.width = Math.min(maxLength, 42);
  });
}

export async function generateInvoiceExcel(data: InvoiceExportData) {
  const { invoice, organization } = data;
  const profile = invoice.profile;
  const client = invoice.client;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "FacturePro";
  workbook.created = new Date();

  const summary = workbook.addWorksheet("Facture");
  summary.views = [{ state: "frozen", ySplit: 1 }];

  summary.addRow(["Facture", invoice.number]);
  summary.addRow(["Statut", statusLabel(invoice.status)]);
  summary.addRow(["Organisation", organization.name]);
  summary.addRow(["Émetteur", profile?.legalName ?? organization.name]);
  summary.addRow(["Client", client.legalName]);
  summary.addRow(["Date émission", formatDate(invoice.issueDate)]);
  summary.addRow(["Date échéance", formatDate(invoice.dueDate)]);
  summary.addRow([
    "Période",
    `${formatDate(invoice.periodStart)} au ${formatDate(invoice.periodEnd)}`,
  ]);
  summary.addRow([]);

  const paidAmount = invoice.payments.reduce(
    (sum, payment) => sum + money(payment.amount),
    0
  );
  const remainingAmount = Math.max(0, money(invoice.total) - paidAmount);

  summary.addRow(["Sous-total", money(invoice.subtotal)]);
  summary.addRow(["TVA", money(invoice.vatAmount)]);
  summary.addRow(["Total", money(invoice.total)]);
  summary.addRow(["Déjà payé", paidAmount]);
  summary.addRow(["Reste à payer", remainingAmount]);

  summary.getColumn(1).font = { bold: true };
  summary.getColumn(2).numFmt = '#,##0.00 €';
  summary.getCell("A1").font = { bold: true, size: 18 };
  summary.getCell("B1").font = { bold: true, size: 18 };
  autoFitColumns(summary);

  const lines = workbook.addWorksheet("Lignes");
  lines.addRow([
    "Ordre",
    "Libellé",
    "Description",
    "Quantité",
    "Unité",
    "Prix unitaire",
    "Total",
  ]);
  styleHeader(lines.getRow(1));

  invoice.lines.forEach((line, index) => {
    lines.addRow([
      index + 1,
      line.label,
      line.description ?? "",
      line.unit === "HOUR" ? formatHours(money(line.quantity)) : money(line.quantity),
      unitLabel(line.unit),
      money(line.unitPrice),
      money(line.total),
    ]);
  });

  lines.getColumn(6).numFmt = '#,##0.00 €';
  lines.getColumn(7).numFmt = '#,##0.00 €';
  autoFitColumns(lines);

  const missions = workbook.addWorksheet("Missions");
  missions.addRow([
    "Date",
    "Début",
    "Fin",
    "Lieu",
    "Titre",
    "Heures",
    "Taux horaire",
  ]);
  styleHeader(missions.getRow(1));

  invoice.missions.forEach((mission) => {
    missions.addRow([
      formatDate(mission.date),
      formatTime(mission.startTime),
      formatTime(mission.endTime),
      mission.locationName ?? "",
      mission.title,
      formatHours(money(mission.quantityHours)),
      money(mission.hourlyRate),
    ]);
  });

  missions.getColumn(7).numFmt = '#,##0.00 €';
  autoFitColumns(missions);

  const payments = workbook.addWorksheet("Paiements");
  payments.addRow(["Date", "Méthode", "Montant", "Référence", "Notes"]);
  styleHeader(payments.getRow(1));

  invoice.payments.forEach((payment) => {
    payments.addRow([
      formatDate(payment.paidAt),
      paymentMethodLabel(payment.method),
      money(payment.amount),
      payment.reference ?? "",
      payment.notes ?? "",
    ]);
  });

  payments.getColumn(3).numFmt = '#,##0.00 €';
  autoFitColumns(payments);

  const legal = workbook.addWorksheet("Mentions");
  legal.addRow(["Mention légale"]);
  styleHeader(legal.getRow(1));
  legal.addRow([invoice.legalNotice ?? profile?.invoiceLegalNotice ?? ""]);
  legal.addRow([]);
  legal.addRow(["Notes"]);
  legal.addRow([invoice.notes ?? ""]);
  autoFitColumns(legal);

  const buffer = await workbook.xlsx.writeBuffer();

  return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer as ArrayBuffer);
}
