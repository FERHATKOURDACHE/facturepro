import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
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

type TextOptions = {
  x: number;
  y: number;
  size?: number;
  font?: PDFFont;
  color?: ReturnType<typeof rgb>;
  maxWidth?: number;
};

function drawText(page: PDFPage, text: string, options: TextOptions) {
  page.drawText(safeText(text), {
    x: options.x,
    y: options.y,
    size: options.size ?? 10,
    font: options.font,
    color: options.color ?? rgb(0.07, 0.09, 0.15),
    maxWidth: options.maxWidth,
  });
}

function safeText(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u202f/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/€/g, "EUR")
    .replace(/’/g, "'")
    .replace(/‘/g, "'")
    .replace(/“/g, '"')
    .replace(/”/g, '"')
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "OE")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "C")
    .replace(/–/g, "-")
    .replace(/—/g, "-")
    .replace(/[^\x20-\x7E\n\r\t]/g, "");
}

function truncate(text: string, max = 90) {
  const clean = safeText(text);
  return clean.length > max ? `${clean.slice(0, max - 3)}...` : clean;
}

function drawBox(page: PDFPage, params: {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  lines: string[];
  regular: PDFFont;
  bold: PDFFont;
}) {
  page.drawRectangle({
    x: params.x,
    y: params.y,
    width: params.width,
    height: params.height,
    color: rgb(0.97, 0.99, 0.97),
    borderColor: rgb(0.84, 0.91, 0.86),
    borderWidth: 1,
  });

  drawText(page, params.title.toUpperCase(), {
    x: params.x + 12,
    y: params.y + params.height - 18,
    size: 8,
    font: params.bold,
    color: rgb(0.04, 0.48, 0.23),
  });

  let currentY = params.y + params.height - 34;
  for (const line of params.lines.filter(Boolean)) {
    drawText(page, truncate(line, 42), {
      x: params.x + 12,
      y: currentY,
      size: 8,
      font: params.regular,
      maxWidth: params.width - 24,
    });
    currentY -= 13;
  }
}

export async function generateInvoicePdf(data: InvoiceExportData) {
  const { invoice } = data;

  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([595.28, 841.89]);
  const dark = rgb(0.07, 0.09, 0.15);
  const primary = rgb(0.04, 0.48, 0.23);
  const light = rgb(0.95, 0.98, 0.96);
  const muted = rgb(0.4, 0.45, 0.52);

  page.drawRectangle({
    x: 0,
    y: 735,
    width: 595.28,
    height: 106.89,
    color: light,
  });

  drawText(page, "FACTURE", {
    x: 42,
    y: 785,
    size: 26,
    font: bold,
    color: primary,
  });

  drawText(page, invoice.number, {
    x: 42,
    y: 762,
    size: 15,
    font: bold,
    color: dark,
  });

  drawText(page, `Date emission : ${formatDate(invoice.issueDate)}`, {
    x: 378,
    y: 782,
    size: 8,
    font: regular,
    color: muted,
  });

  drawText(page, `Echeance : ${formatDate(invoice.dueDate)}`, {
    x: 378,
    y: 768,
    size: 8,
    font: regular,
    color: muted,
  });

  const profile = invoice.profile;

  drawBox(page, {
    x: 42,
    y: 620,
    width: 245,
    height: 95,
    title: "Emetteur",
    regular,
    bold,
    lines: [
      profile?.legalName ?? data.organization.name,
      profile ? `${profile.addressLine1}, ${profile.postalCode} ${profile.city}` : "",
      profile?.siret ? `SIRET : ${profile.siret}` : "",
      profile?.ape ? `APE : ${profile.ape}` : "",
      profile?.email ? `Email : ${profile.email}` : "",
      profile?.phone ? `Telephone : ${profile.phone}` : "",
    ],
  });

  drawBox(page, {
    x: 308,
    y: 620,
    width: 245,
    height: 95,
    title: "Destinataire",
    regular,
    bold,
    lines: [
      invoice.client.legalName,
      `${invoice.client.addressLine1}, ${invoice.client.postalCode ?? ""} ${invoice.client.city ?? ""}`,
      invoice.client.siret ? `SIRET : ${invoice.client.siret}` : "",
      invoice.client.ape ? `APE : ${invoice.client.ape}` : "",
      invoice.client.email ? `Email : ${invoice.client.email}` : "",
    ],
  });

  drawText(page, "Detail des prestations", {
    x: 42,
    y: 585,
    size: 12,
    font: bold,
    color: dark,
  });

  let y = 555;
  page.drawRectangle({
    x: 42,
    y,
    width: 510,
    height: 24,
    color: dark,
  });

  const headers = [
    ["Designation", 52, 562],
    ["Qte", 285, 562],
    ["Unite", 350, 562],
    ["PU", 415, 562],
    ["Total", 493, 562],
  ];

  for (const [label, x, yy] of headers) {
    drawText(page, String(label), {
      x: Number(x),
      y: Number(yy),
      size: 8,
      font: bold,
      color: rgb(1, 1, 1),
    });
  }

  y -= 30;

  for (const line of invoice.lines) {
    if (y < 120) {
      page = pdf.addPage([595.28, 841.89]);
      y = 780;
    }

    page.drawRectangle({
      x: 42,
      y: y - 6,
      width: 510,
      height: 28,
      color: rgb(0.98, 0.99, 0.98),
      borderColor: rgb(0.9, 0.93, 0.9),
      borderWidth: 0.5,
    });

    drawText(page, truncate(line.label, 58), {
      x: 52,
      y: y + 7,
      size: 8,
      font: bold,
    });

    if (line.description) {
      drawText(page, truncate(line.description, 62), {
        x: 52,
        y: y - 4,
        size: 7,
        font: regular,
        color: muted,
      });
    }

    drawText(page, line.unit === "HOUR" ? formatHours(money(line.quantity)) : String(money(line.quantity)), {
      x: 285,
      y: y + 2,
      size: 8,
      font: regular,
    });

    drawText(page, line.unit, {
      x: 350,
      y: y + 2,
      size: 8,
      font: regular,
    });

    drawText(page, formatCurrency(money(line.unitPrice)), {
      x: 410,
      y: y + 2,
      size: 8,
      font: regular,
    });

    drawText(page, formatCurrency(money(line.total)), {
      x: 485,
      y: y + 2,
      size: 8,
      font: bold,
    });

    y -= 34;
  }

  y -= 10;

  const totalRows = [
    ["Sous-total", money(invoice.subtotal)],
    ["TVA", money(invoice.vatAmount)],
    ["Total a payer", money(invoice.total)],
  ];

  for (const [label, value] of totalRows) {
    const isTotal = label === "Total a payer";
    page.drawRectangle({
      x: 350,
      y,
      width: 202,
      height: 24,
      color: isTotal ? primary : rgb(0.97, 0.99, 0.97),
    });

    drawText(page, String(label), {
      x: 362,
      y: y + 8,
      size: isTotal ? 10 : 8,
      font: isTotal ? bold : regular,
      color: isTotal ? rgb(1, 1, 1) : muted,
    });

    drawText(page, formatCurrency(Number(value)), {
      x: 462,
      y: y + 8,
      size: isTotal ? 10 : 8,
      font: bold,
      color: isTotal ? rgb(1, 1, 1) : dark,
    });

    y -= 26;
  }

  if (y < 180) {
    page = pdf.addPage([595.28, 841.89]);
    y = 780;
  }

  drawText(page, "Feuille de temps rattachee", {
    x: 42,
    y: y - 10,
    size: 12,
    font: bold,
  });

  y -= 35;

  for (const mission of invoice.missions) {
    if (y < 80) {
      page = pdf.addPage([595.28, 841.89]);
      y = 780;
    }

    page.drawRectangle({
      x: 42,
      y: y - 6,
      width: 510,
      height: 22,
      color: rgb(0.97, 0.99, 0.97),
    });

    drawText(page, formatDate(mission.date), {
      x: 52,
      y,
      size: 8,
      font: regular,
    });

    drawText(page, `${formatTime(mission.startTime)} - ${formatTime(mission.endTime)}`, {
      x: 126,
      y,
      size: 8,
      font: regular,
    });

    drawText(page, truncate(mission.locationName ?? "-", 45), {
      x: 226,
      y,
      size: 8,
      font: regular,
    });

    drawText(page, formatHours(money(mission.quantityHours)), {
      x: 500,
      y,
      size: 8,
      font: bold,
    });

    y -= 25;
  }

  if (profile?.iban) {
    if (y < 90) {
      page = pdf.addPage([595.28, 841.89]);
      y = 780;
    }

    page.drawRectangle({
      x: 42,
      y: y - 36,
      width: 510,
      height: 42,
      color: rgb(1, 0.98, 0.92),
    });

    drawText(page, "Coordonnees bancaires", {
      x: 54,
      y: y - 10,
      size: 9,
      font: bold,
    });

    drawText(page, `IBAN : ${profile.iban}`, {
      x: 54,
      y: y - 25,
      size: 8,
      font: regular,
    });

    y -= 55;
  }

  if (invoice.legalNotice) {
    drawText(page, truncate(invoice.legalNotice, 110), {
      x: 42,
      y: Math.max(y, 45),
      size: 8,
      font: regular,
      color: muted,
    });
  }

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
