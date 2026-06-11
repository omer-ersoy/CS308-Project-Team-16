import { useCallback, useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const DELIVERY_STATUSES = [
  { value: "processing", label: "Processing" },
  { value: "in-transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

function money(value) {
  return `${Number(value ?? 0).toFixed(2)} USD`;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

function toDatetimeLocalValue(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

function ProductManagerDeliveryPage({ searchProps, cartCount = 0, wishlistCount = 0, onCartClick }) {
  const { token, isLoggedIn } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const loadDeliveries = useCallback(async () => {
    if (!isLoggedIn || !token) {
      setDeliveries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await api.listProductManagerDeliveries(token);
      setDeliveries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, token]);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  async function handleStatusChange(delivery, orderStatus) {
    setBusyId(delivery.id);
    setError("");
    try {
      const updatedDelivery = await api.updateProductManagerDelivery(token, delivery.id, {
        order_status: orderStatus,
      });
      setDeliveries((currentDeliveries) =>
        currentDeliveries.map((item) => (item.id === updatedDelivery.id ? updatedDelivery : item)),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handlePurchaseDateChange(delivery, value) {
    if (!value) return;

    const nextDate = new Date(value);
    if (Number.isNaN(nextDate.getTime())) {
      setError("Invalid purchase date.");
      return;
    }

    setBusyId(delivery.id);
    setError("");
    try {
      const updatedDelivery = await api.updateProductManagerDelivery(token, delivery.id, {
        order_created_at: nextDate.toISOString(),
      });
      setDeliveries((currentDeliveries) =>
        currentDeliveries.map((item) => (item.id === updatedDelivery.id ? updatedDelivery : item)),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <PageShell
      searchProps={searchProps}
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      onCartClick={onCartClick}
    >
      <main className="flex-1 px-6 py-10 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.3em] text-slate-500 uppercase">Product manager</p>
              <h1 className="mt-3 text-4xl font-light tracking-tight text-slate-800">Delivery list</h1>
              <p className="mt-2 text-sm text-slate-600">Orders to be delivered and customer shipping addresses.</p>
            </div>
            <button
              type="button"
              onClick={loadDeliveries}
              disabled={loading}
              className="border border-slate-300 bg-white px-5 py-3 text-xs tracking-[0.2em] text-slate-700 uppercase transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Refreshing" : "Refresh"}
            </button>
          </div>

          {error ? (
            <div className="mt-8 border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</div>
          ) : null}

          {loading ? (
            <div className="mt-8 border border-slate-200 bg-white p-8 text-sm text-slate-600">Loading deliveries...</div>
          ) : deliveries.length === 0 ? (
            <div className="mt-8 border border-slate-200 bg-white p-8 text-sm text-slate-600">No deliveries found.</div>
          ) : (
            <div className="mt-8 overflow-x-auto border border-slate-200 bg-white">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
                  <tr>
                    <th className="p-4">Delivery ID</th>
                    <th className="p-4">Customer ID</th>
                    <th className="p-4">Product ID</th>
                    <th className="p-4">Product name</th>
                    <th className="p-4">Quantity</th>
                    <th className="p-4">Total price</th>
                    <th className="p-4">Delivery address</th>
                    <th className="p-4">Purchase date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id} className="border-b border-slate-100">
                      <td className="p-4 font-medium">DEL-{delivery.id}</td>
                      <td className="p-4">{delivery.customer_id ?? "-"}</td>
                      <td className="p-4">{delivery.product_id ?? "-"}</td>
                      <td className="p-4 font-medium text-slate-800">{delivery.product_name ?? "-"}</td>
                      <td className="p-4">{delivery.quantity}</td>
                      <td className="p-4">{money(delivery.total_price)}</td>
                      <td className="max-w-xs p-4 text-slate-600">{delivery.delivery_address}</td>
                      <td className="p-4">
                        <label className="sr-only" htmlFor={`delivery-date-${delivery.id}`}>
                          Purchase date
                        </label>
                        <input
                          id={`delivery-date-${delivery.id}`}
                          type="datetime-local"
                          value={toDatetimeLocalValue(delivery.order_created_at ?? delivery.created_at)}
                          disabled={busyId === delivery.id}
                          onChange={(event) => handlePurchaseDateChange(delivery, event.target.value)}
                          title={formatDate(delivery.order_created_at ?? delivery.created_at)}
                          className="min-w-52 border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </td>
                      <td className="p-4">
                        <label className="sr-only" htmlFor={`delivery-status-${delivery.id}`}>
                          Delivery status
                        </label>
                        <select
                          id={`delivery-status-${delivery.id}`}
                          value={delivery.order_status ?? (delivery.completion_status ? "delivered" : "processing")}
                          disabled={busyId === delivery.id}
                          onChange={(event) => handleStatusChange(delivery, event.target.value)}
                          className="min-w-36 border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {DELIVERY_STATUSES.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                        {busyId === delivery.id ? (
                          <span className="ml-3 text-xs tracking-[0.16em] text-slate-400 uppercase">Saving</span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </PageShell>
  );
}

export default ProductManagerDeliveryPage;
