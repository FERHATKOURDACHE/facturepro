import ExcelJS from "exceljs";
import {
  formatDate,
  formatTime,
  money,
} from "@/lib/export/invoice-data";

type InvoiceExportData = Awaited<ReturnType<typeof import("@/lib/export/invoice-data").getInvoiceExportData>>;

export async function generateInvoiceExcel(data: InvoiceExportData) {
  const { invoice } = data;
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "FacturePro";
  workbook.created = new Date();

  const summary = workbook.addWorksheet("Facture");
  const timesheet = workbook.addWorksheet("Feuille de temps");
  const payments = workbook.addWorksheet("Paiements");

  summary.columns = [
    { header: "Champ", key: "field", width: 32 },
    { header: "Valeur", key: "value", width: 60 },
  ];

  const profile = invoice.profile;

  summary.addRows([
    { field: "Numéro", value: invoice.number },
    { field: "Statut", value: invoice.status },
    { field: "Date émission", value: formatDate(invoice.issueDate) },
    { field: "Date échéance", value: formatDate(invoice.dueDate) },
    { field: "Période", value: `${formatDate(invoice.periodStart)} au ${formatDate(invoice.periodEnd)}` },
    { field: "Émetteur", value: profile?.legalName ?? data.organization.name },
    { field: "SIRET émetteur", value: profile?.siret ?? "" },
    { field: "Client", value: invoice.client.legalName },
    { field: "SIRET client", value: invoice.client.siret ?? "" },
    { field: "Sous-total", value: money(invoice.subtotal) },
    { field: "TVA", value: money(invoice.vatAmount) },
    { field: "Total", value: money(invoice.total) },
    { field: "IBAN", value: profile?.iban ?? "" },
    { field: "Mention légale", value: invoice.legalNotice ?? "" },
  ]);

  summary.addRow([]);
  summary.addRow(["Lignes de facture", ""]);

  const lineStart = summary.rowCount + 1;
  summary.addRow(["Désignation", "Description", "Quantité", "Unité", "Prix unitaire", "Total"]);

  invoice.lines.forEach((line) => {
    summary.addRow([
      line.label,
      line.description ?? "",
      money(line.quantity),
      line.unit,
      money(line.unitPrice),
      money(line.total),
    ]);
  });

  summary.getRow(1).font = { bold: true };
  summary.getColumn(2).numFmt = "#,##0.00 €";

  for (const row of summary.getRows(lineStart, invoice.lines.length + 1) ?? []) {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE5ECE7" } },
        left: { style: "thin", color: { argb: "FFE5ECE7" } },
        bottom: { style: "thin", color: { argb: "FFE5ECE7" } },
        right: { style: "thin", color: { argb: "FFE5ECE7" } },
      };
    });
  }

  timesheet.columns = [
    { header: "Date", key: "date", width: 16 },
    { header: "Début", key: "start", width: 12 },
    { header: "Fin", key: "end", width: 12 },
    { header: "Lieu", key: "location", width: 36 },
    { header: "Heures", key: "hours", width: 14 },
    { header: "Taux", key: "rate", width: 14 },
    { header: "Montant", key: "amount", width: 16 },
  ];

  invoice.missions.forEach((mission) => {
    const hours = money(mission.quantityHours);
    const rate = money(mission.hourlyRate);

    timesheet.addRow({
      date: formatDate(mission.date),
      start: formatTime(mission.startTime),
      end: formatTime(mission.endTime),
      location: mission.locationName ?? "",
      hours,
      rate,
      amount: hours * rate,
    });
  });

  timesheet.addRow([]);
  timesheet.addRow(["Total", "", "", "", { formula: `SUM(E2:E${invoice.missions.length + 1})` }, "", { formula: `SUM(G2:G${invoice.missions.length + 1})` }]);

  payments.columns = [
    { header: "Date", key: "date", width: 16 },
    { header: "Méthode", key: "method", width: 18 },
    { header: "Référence", key: "reference", width: 28 },
    { header: "Montant", key: "amount", width: 16 },
    { header: "Notes", key: "notes", width: 40 },
  ];

  invoice.payments.forEach((payment) => {
    payments.addRow({
      date: formatDate(payment.paidAt),
      method: payment.method,
      reference: payment.reference ?? "",
      amount: money(payment.amount),
      notes: payment.notes ?? "",
    });
  });

  for (const sheet of [summary, timesheet, payments]) {
    sheet.views = [{ state: "frozen", ySplit: 1 }];

    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0B7A3B" },
    };

    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = { vertical: "middle", wrapText: true };
      });
    });
  }

  timesheet.getColumn(6).numFmt = "#,##0.00 €";
  timesheet.getColumn(7).numFmt = "#,##0.00 €";
  payments.getColumn(4).numFmt = "#,##0.00 €";

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
