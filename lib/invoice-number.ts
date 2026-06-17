import { prisma } from "@/lib/prisma";

export async function generateInvoiceNumber(params: {
  organizationId: string;
  issueDate: Date;
}) {
  const year = params.issueDate.getUTCFullYear();
  const prefix = `FAC-${year}-`;

  const existingInvoices = await prisma.invoice.findMany({
    where: {
      organizationId: params.organizationId,
      number: {
        startsWith: prefix,
      },
    },
    select: {
      number: true,
    },
  });

  const maxNumber = existingInvoices.reduce((max, invoice) => {
    const suffix = invoice.number.replace(prefix, "");
    const numericValue = Number(suffix);
    return Number.isFinite(numericValue) ? Math.max(max, numericValue) : max;
  }, 0);

  return `${prefix}${String(maxNumber + 1).padStart(3, "0")}`;
}
