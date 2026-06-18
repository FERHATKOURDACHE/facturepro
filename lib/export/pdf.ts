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

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;

function safeText(value: unknown) {
  return String(value ?? "-")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u202f/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\u20ac/g, "EUR")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[•]/g, "-")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function drawText(page: PDFPage, text: unknown, options: TextOptions) {
  const cleaned = safeText(text);

  page.drawText(cleaned.length > 0 ? cleaned : "-", {
    x: options.x,
    y: options.y,
    size: options.size ?? 10,
    font: options.font,
    color: options.color ?? rgb(0.07, 0.09, 0.15),
    maxWidth: options.maxWidth,
  });
}

function drawWrappedText(
  page: PDFPage,
  text: unknown,
  options: TextOptions & { lineHeight?: number }
) {
  const cleaned = safeText(text);
  const size = options.size ?? 10;
  const lineHeight = options.lineHeight ?? size + 4;
  const maxWidth = options.maxWidth ?? 240;
  const font = options.font;
  const words = cleaned.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    const width = font?.widthOfTextAtSize(candidate, size) ?? candidate.length * size * 0.5;

    if (width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);

  lines.forEach((line, index) => {
    drawText(page, line, {
      ...options,
      y: options.y - index * lineHeight,
      maxWidth,
    });
  });

  return lines.length * lineHeight;
}

function unitLabel(unit: string) {
  if (unit === "HOUR") return "Heures";
  if (unit === "DAY") return "Jours";
  if (unit === "UNIT") return "Unites";
  if (unit === "FIXED_PRICE") return "Forfait";

  return unit;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "Brouillon",
    READY: "Prete",
    SENT: "Envoyee",
    PARTIALLY_PAID: "Partiellement payee",
    PAID: "Payee",
    OVERDUE: "En retard",
    CANCELLED: "Annulee",
  };

  return labels[status] ?? status;
}

function paymentMethodLabel(method: string) {
  const labels: Record<string, string> = {
    BANK_TRANSFER: "Virement",
    CARD: "Carte",
    CASH: "Especes",
    CHECK: "Cheque",
    OTHER: "Autre",
  };

  return labels[method] ?? method;
}

function addressBlock(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" - ");
}

export async function generateInvoicePdf(data: InvoiceExportData) {
  const { invoice, organization } = data;
  const profile = invoice.profile;
  const client = invoice.client;

  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function ensureSpace(height = 80) {
    if (y < MARGIN + height) {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  }

  function sectionTitle(title: string) {
    ensureSpace(40);
    drawText(page, title, {
      x: MARGIN,
      y,
      size: 12,
      font: bold,
      color: rgb(0.04, 0.35, 0.19),
    });
    y -= 22;
  }

  drawText(page, "FACTURE", {
    x: MARGIN,
    y,
    size: 24,
    font: bold,
    color: rgb(0.05, 0.07, 0.12),
  });

  drawText(page, invoice.number, {
    x: PAGE_WIDTH - 230,
    y: y + 4,
    size: 16,
    font: bold,
    color: rgb(0.05, 0.07, 0.12),
  });

  y -= 34;

  drawText(page, `Statut : ${statusLabel(invoice.status)}`, {
    x: MARGIN,
    y,
    size: 10,
    font: bold,
    color: rgb(0.04, 0.35, 0.19),
  });

  drawText(page, `Emise le : ${formatDate(invoice.issueDate)}`, {
    x: PAGE_WIDTH - 230,
    y,
    size: 10,
    font: regular,
  });

  y -= 16;

  drawText(page, `Echeance : ${formatDate(invoice.dueDate)}`, {
    x: PAGE_WIDTH - 230,
    y,
    size: 10,
    font: regular,
  });

  y -= 32;

  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 1,
    color: rgb(0.86, 0.9, 0.88),
  });

  y -= 28;

  sectionTitle("Emetteur");

  drawText(page, profile?.legalName ?? organization.name, {
    x: MARGIN,
    y,
    size: 12,
    font: bold,
  });
  y -= 15;

  const profileAddress = addressBlock([
    profile?.addressLine1,
    profile?.addressLine2,
    profile?.postalCode,
    profile?.city,
    profile?.country,
  ]);

  if (profileAddress) {
    y -= drawWrappedText(page, profileAddress, {
      x: MARGIN,
      y,
      size: 9,
      font: regular,
      maxWidth: 230,
      lineHeight: 12,
    });
  }

  const profileDetails = [
    profile?.siret ? `SIRET : ${profile.siret}` : null,
    profile?.siren ? `SIREN : ${profile.siren}` : null,
    profile?.email ? `Email : ${profile.email}` : null,
    profile?.phone ? `Tel : ${profile.phone}` : null,
  ].filter(Boolean);

  for (const detail of profileDetails) {
    drawText(page, detail, { x: MARGIN, y, size: 9, font: regular });
    y -= 12;
  }

  y -= 12;

  sectionTitle("Client");

  drawText(page, client.legalName, {
    x: MARGIN,
    y,
    size: 12,
    font: bold,
  });
  y -= 15;

  const clientAddress = addressBlock([
    client.addressLine1,
    client.addressLine2,
    client.postalCode,
    client.city,
    client.country,
  ]);

  if (clientAddress) {
    y -= drawWrappedText(page, clientAddress, {
      x: MARGIN,
      y,
      size: 9,
      font: regular,
      maxWidth: 260,
      lineHeight: 12,
    });
  }

  const clientDetails = [
    client.siret ? `SIRET : ${client.siret}` : null,
    client.email ? `Email : ${client.email}` : null,
    client.phone ? `Tel : ${client.phone}` : null,
  ].filter(Boolean);

  for (const detail of clientDetails) {
    drawText(page, detail, { x: MARGIN, y, size: 9, font: regular });
    y -= 12;
  }

  y -= 15;

  sectionTitle("Periode et lignes");

  drawText(page, `Periode : ${formatDate(invoice.periodStart)} au ${formatDate(invoice.periodEnd)}`, {
    x: MARGIN,
    y,
    size: 10,
    font: regular,
  });
  y -= 22;

  const headers = [
    ["Ligne", MARGIN],
    ["Qte", 285],
    ["Unite", 340],
    ["PU", 405],
    ["Total", 485],
  ] as const;

  headers.forEach(([label, x]) => {
    drawText(page, label, { x, y, size: 9, font: bold, color: rgb(0.29, 0.33, 0.41) });
  });

  y -= 14;

  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 0.7,
    color: rgb(0.86, 0.9, 0.88),
  });

  y -= 16;

  for (const line of invoice.lines) {
    ensureSpace(48);

    const quantity = money(line.quantity);
    const quantityLabel =
      line.unit === "HOUR" ? formatHours(quantity) : String(quantity);

    drawWrappedText(page, line.label, {
      x: MARGIN,
      y,
      size: 9,
      font: bold,
      maxWidth: 220,
      lineHeight: 11,
    });

    if (line.description) {
      drawWrappedText(page, line.description, {
        x: MARGIN,
        y: y - 13,
        size: 8,
        font: regular,
        color: rgb(0.39, 0.45, 0.55),
        maxWidth: 220,
        lineHeight: 10,
      });
    }

    drawText(page, quantityLabel, { x: 285, y, size: 9, font: regular });
    drawText(page, unitLabel(line.unit), { x: 340, y, size: 9, font: regular });
    drawText(page, formatCurrency(money(line.unitPrice)), { x: 405, y, size: 9, font: regular });
    drawText(page, formatCurrency(money(line.total)), { x: 485, y, size: 9, font: bold });

    y -= line.description ? 36 : 24;
  }

  y -= 10;

  const paidAmount = invoice.payments.reduce(
    (sum, payment) => sum + money(payment.amount),
    0
  );
  const remainingAmount = Math.max(0, money(invoice.total) - paidAmount);

  ensureSpace(100);

  const totalX = 360;

  drawText(page, "Sous-total", { x: totalX, y, size: 10, font: regular });
  drawText(page, formatCurrency(money(invoice.subtotal)), { x: 485, y, size: 10, font: regular });
  y -= 16;

  drawText(page, `TVA (${Math.round(money(invoice.vatRate) * 100)}%)`, {
    x: totalX,
    y,
    size: 10,
    font: regular,
  });
  drawText(page, formatCurrency(money(invoice.vatAmount)), { x: 485, y, size: 10, font: regular });
  y -= 16;

  drawText(page, "Total", { x: totalX, y, size: 12, font: bold });
  drawText(page, formatCurrency(money(invoice.total)), { x: 485, y, size: 12, font: bold });
  y -= 16;

  drawText(page, "Deja paye", { x: totalX, y, size: 10, font: regular });
  drawText(page, formatCurrency(paidAmount), { x: 485, y, size: 10, font: regular });
  y -= 16;

  drawText(page, "Reste a payer", { x: totalX, y, size: 11, font: bold, color: rgb(0.04, 0.35, 0.19) });
  drawText(page, formatCurrency(remainingAmount), { x: 485, y, size: 11, font: bold, color: rgb(0.04, 0.35, 0.19) });

  y -= 34;

  if (invoice.missions.length > 0) {
    sectionTitle("Missions rattachees");

    for (const mission of invoice.missions) {
      ensureSpace(24);
      drawText(
        page,
        `${formatDate(mission.date)} - ${formatTime(mission.startTime)} / ${formatTime(mission.endTime)} - ${mission.locationName ?? "Mission"} - ${formatHours(money(mission.quantityHours))}`,
        { x: MARGIN, y, size: 9, font: regular, maxWidth: 500 }
      );
      y -= 14;
    }

    y -= 10;
  }

  if (invoice.payments.length > 0) {
    sectionTitle("Paiements");

    for (const payment of invoice.payments) {
      ensureSpace(24);
      drawText(
        page,
        `${formatDate(payment.paidAt)} - ${paymentMethodLabel(payment.method)} - ${formatCurrency(money(payment.amount))}${payment.reference ? ` - Ref: ${payment.reference}` : ""}`,
        { x: MARGIN, y, size: 9, font: regular, maxWidth: 500 }
      );
      y -= 14;
    }

    y -= 10;
  }

  if (invoice.legalNotice || profile?.invoiceLegalNotice) {
    sectionTitle("Mention legale");
    drawWrappedText(page, invoice.legalNotice ?? profile?.invoiceLegalNotice ?? "", {
      x: MARGIN,
      y,
      size: 9,
      font: regular,
      color: rgb(0.39, 0.45, 0.55),
      maxWidth: PAGE_WIDTH - MARGIN * 2,
      lineHeight: 12,
    });
  }

  return pdf.save();
}
