export const runtime = "nodejs";

import { getInvoiceExportData } from "@/lib/export/invoice-data";
import { generateInvoicePdf } from "@/lib/export/pdf";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const data = await getInvoiceExportData(id);
  const pdf = await generateInvoicePdf(data);
  const body = new Blob([pdf as BlobPart], {
    type: "application/pdf",
  });

  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${data.invoice.number}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
