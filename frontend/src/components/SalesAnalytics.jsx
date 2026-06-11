import { useState } from "react";
import { api } from "../lib/api";

function money(value) {
  return `${Number(value ?? 0).toFixed(2)} USD`;
}

function SalesAnalytics({ token = "" }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ startDate: "", endDate: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [revenueSummary, setRevenueSummary] = useState(null);
  const [profitLossSummary, setProfitLossSummary] = useState(null);

  async function loadAnalytics(filters) {
    if (!token) {
      setRevenueSummary(null);
      setProfitLossSummary(null);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const [revenue, profitLoss] = await Promise.all([
        api.getRevenueSummary(token, filters),
        api.getProfitLossSummary(token, filters),
      ]);
      setRevenueSummary(revenue);
      setProfitLossSummary(profitLoss);
    } catch (error) {
      setMessage(error.message);
      setRevenueSummary(null);
      setProfitLossSummary(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextFilters = { startDate, endDate };
    setAppliedFilters(nextFilters);
    loadAnalytics(nextFilters);
  }

  function handleClearFilters() {
    setStartDate("");
    setEndDate("");
    const nextFilters = { startDate: "", endDate: "" };
    setAppliedFilters(nextFilters);
    loadAnalytics(nextFilters);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
          Revenue analysis
        </p>
        <h2 className="mt-2 text-2xl font-light tracking-tight text-slate-800">
          Revenue and Profit Overview
        </h2>
      </div>

      <form className="mb-6 grid gap-4 md:grid-cols-[1fr_1fr_auto_auto]" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">
            Start date
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-500"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">
            End date
          </span>
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-500"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="self-end rounded-xl bg-slate-800 px-5 py-3 text-sm uppercase tracking-[0.22em] text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Calculating..." : "Calculate"}
        </button>

        <button
          type="button"
          onClick={handleClearFilters}
          disabled={loading || (!startDate && !endDate && !appliedFilters.startDate && !appliedFilters.endDate)}
          className="self-end rounded-xl border border-slate-300 px-5 py-3 text-sm uppercase tracking-[0.22em] text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Clear
        </button>
      </form>

      {message && (
        <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Revenue</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-800">
            {revenueSummary ? money(revenueSummary.total_revenue) : "—"}
          </h3>
          {revenueSummary && (
            <p className="mt-2 text-xs text-slate-500">
              {revenueSummary.order_count} orders
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Profit</p>
          <h3 className="mt-3 text-2xl font-semibold text-emerald-700">
            {profitLossSummary ? money(profitLossSummary.total_profit) : "—"}
          </h3>
          {profitLossSummary && (
            <p className="mt-2 text-xs text-slate-500">
              Net: {money(profitLossSummary.net_profit)}
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Loss</p>
          <h3 className="mt-3 text-2xl font-semibold text-rose-700">
            {profitLossSummary ? money(profitLossSummary.total_loss) : "—"}
          </h3>
          {profitLossSummary && (
            <p className="mt-2 text-xs text-slate-500">
              Cost: {money(profitLossSummary.total_cost)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
        Revenue chart placeholder
      </div>
    </section>
  );
}

export default SalesAnalytics;
