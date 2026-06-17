export const runtime = "nodejs";

import { getInvoiceExportData } from "@/lib/export/invoice-data";
import { generateInvoiceExcel } from "@/lib/export/excel";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const data = await getInvoiceExportData(id);
  const buffer = await generateInvoiceExcel(data);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${data.invoice.number}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
