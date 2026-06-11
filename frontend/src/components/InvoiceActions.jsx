import { useMemo } from "react";
import {
  buildInvoicePdfDataUrl,
  enrichInvoiceItems,
  formatInvoiceDate,
  orderToInvoice,
} from "../lib/invoicePdf";

function money(value) {
  return `${Number(value ?? 0).toFixed(2)} USD`;
}

function InvoicePrintLayout({ invoice, items }) {
  return (
    <div className="invoice-print-area hidden p-8 text-slate-900">
      <h1 className="text-2xl font-semibold">Fragrance Shop Invoice</h1>
      <p className="mt-2 text-sm text-slate-600">{invoice.order_id}</p>

      <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <p className="font-medium uppercase tracking-[0.18em] text-slate-500">Customer</p>
          <p className="mt-2">{invoice.customer_name}</p>
          <p>{invoice.customer_email}</p>
        </div>
        <div>
          <p className="font-medium uppercase tracking-[0.18em] text-slate-500">Order details</p>
          <p className="mt-2">Date: {formatInvoiceDate(invoice.created_at)}</p>
          <p>Status: {invoice.status}</p>
          <p>Items: {invoice.item_count}</p>
        </div>
      </div>

      <table className="mt-8 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-300 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
            <th className="py-2 pr-4">Product</th>
            <th className="py-2 pr-4">Qty</th>
            <th className="py-2 pr-4">Unit</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={`${item.product_id}-${index}`} className="border-b border-slate-100">
              <td className="py-3 pr-4">{item.product_name}</td>
              <td className="py-3 pr-4">{item.quantity}</td>
              <td className="py-3 pr-4">{money(item.unit_price)}</td>
              <td className="py-3 text-right">{money(item.line_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 text-right">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total</p>
        <p className="mt-2 text-xl font-semibold">{money(invoice.total_amount)}</p>
      </div>
    </div>
  );
}

function InvoiceActions({
  invoice,
  order = null,
  customer = {},
  productsByApiId = null,
  compact = false,
}) {
  const normalizedInvoice = useMemo(() => {
    if (invoice) {
      return invoice;
    }
    if (order) {
      return orderToInvoice(order, customer);
    }
    return null;
  }, [customer, invoice, order]);

  const items = useMemo(
    () => enrichInvoiceItems(normalizedInvoice, productsByApiId),
    [normalizedInvoice, productsByApiId],
  );

  if (!normalizedInvoice) {
    return null;
  }

  const pdfUrl = buildInvoicePdfDataUrl(normalizedInvoice, productsByApiId);
  const downloadName = `${normalizedInvoice.order_id}-invoice.pdf`;

  const buttonClass = compact
    ? "rounded-lg border border-slate-300 px-3 py-2 text-xs uppercase tracking-[0.16em] text-slate-700 transition hover:border-slate-500"
    : "rounded-full border border-slate-300 bg-white px-5 py-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-700 transition hover:border-slate-500 hover:text-slate-950";

  return (
    <>
      <InvoicePrintLayout invoice={normalizedInvoice} items={items} />
      <div className="flex flex-wrap gap-3">
        <a href={pdfUrl} download={downloadName} className={buttonClass}>
          Download PDF
        </a>
        <button type="button" onClick={() => window.print()} className={buttonClass}>
          Print Invoice
        </button>
      </div>
    </>
  );
}

export default InvoiceActions;
