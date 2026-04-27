import DiscountManager from "../components/DiscountManager";
import InvoiceTable from "../components/InvoiceTable";
import SalesAnalytics from "../components/SalesAnalytics";

function SalesManagerPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 sm:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl space-y-10">
        <section>
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
            Manager panel
          </p>
          <h1 className="mt-2 text-3xl font-light tracking-tight text-slate-800">
            Sales Manager Dashboard
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Manage discounts, review invoices, and analyze revenue and profit.
          </p>
        </section>

        <DiscountManager />
        <InvoiceTable />
        <SalesAnalytics />
      </div>
    </div>
  );
}

export default SalesManagerPage;