function InvoiceTable() {
  const invoices = [
    { id: "INV-1001", customer: "Ayşe Yılmaz", date: "2026-04-20", total: 320, status: "Paid" },
    { id: "INV-1002", customer: "Mehmet Kaya", date: "2026-04-22", total: 180, status: "Paid" },
    { id: "INV-1003", customer: "Elif Demir", date: "2026-04-25", total: 410, status: "Pending" },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
          Invoices
        </p>
        <h2 className="mt-2 text-2xl font-light tracking-tight text-slate-800">
          View and Export Invoices
        </h2>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <input
          type="date"
          className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-500"
        />
        <input
          type="date"
          className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-500"
        />
        <button
          type="button"
          className="rounded-xl border border-slate-300 px-5 py-3 text-sm uppercase tracking-[0.22em] text-slate-700 transition hover:bg-slate-50"
        >
          Filter Invoices
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <th className="px-4">Invoice ID</th>
              <th className="px-4">Customer</th>
              <th className="px-4">Date</th>
              <th className="px-4">Total</th>
              <th className="px-4">Status</th>
              <th className="px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="rounded-2xl bg-slate-50 text-sm text-slate-700">
                <td className="px-4 py-4 font-medium">{invoice.id}</td>
                <td className="px-4 py-4">{invoice.customer}</td>
                <td className="px-4 py-4">{invoice.date}</td>
                <td className="px-4 py-4">{invoice.total} USD</td>
                <td className="px-4 py-4">{invoice.status}</td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-700"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-slate-800 px-3 py-2 text-xs uppercase tracking-[0.18em] text-white"
                    >
                      Download PDF
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default InvoiceTable;