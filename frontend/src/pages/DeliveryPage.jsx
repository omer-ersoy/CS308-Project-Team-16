import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const STATUS_STEPS = ["processing", "in-transit", "delivered"];

const STATUS_LABELS = {
  processing: "Processing",
  "in-transit": "In Transit",
  delivered: "Delivered",
};

const STATUS_COLORS = {
  processing: "bg-amber-100 text-amber-800",
  "in-transit": "bg-blue-100 text-blue-800",
  delivered: "bg-emerald-100 text-emerald-800",
};

function DeliveryPage() {
  const { token, isLoggedIn, currentUser, openAuth } = useAuth();
  const navigate = useNavigate();
  const isAuthorized = isLoggedIn && (currentUser?.role === "admin" || currentUser?.role === "delivery");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingRef, setUpdatingRef] = useState(null);
  const [updateError, setUpdateError] = useState("");

  const loadOrders = useCallback(() => {
    if (!isAuthorized || !token) return;
    setLoading(true);
    setError("");
    api
      .listOrders(token)
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAuthorized, token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (orderRef, newStatus) => {
    setUpdatingRef(orderRef);
    setUpdateError("");
    try {
      const updated = await api.updateOrderStatus(token, orderRef, newStatus);
      setOrders((current) =>
        current.map((order) => (order.order_ref === orderRef ? updated : order)),
      );
    } catch (err) {
      setUpdateError(err.message);
    } finally {
      setUpdatingRef(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
        <div className="w-full max-w-sm border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
          <p className="text-[11px] tracking-[0.28em] text-slate-500 uppercase">Delivery Department</p>
          <h1 className="mt-3 text-2xl font-light tracking-tight text-slate-700">Sign in required</h1>
          <button
            type="button"
            onClick={() => openAuth("login")}
            className="mt-6 rounded-full bg-slate-900 px-5 py-3 text-xs tracking-[0.2em] text-white uppercase"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
        <div className="w-full max-w-sm border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
          <p className="text-[11px] tracking-[0.28em] text-slate-500 uppercase">Delivery Department</p>
          <h1 className="mt-3 text-2xl font-light tracking-tight text-slate-700">Access denied</h1>
          <p className="mt-3 text-sm text-slate-500">
            This page is only accessible to delivery department staff.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 rounded-full bg-slate-900 px-5 py-3 text-xs tracking-[0.2em] text-white uppercase"
          >
            Go home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 sm:px-10 lg:px-14">
      <div className="mx-auto max-w-5xl space-y-8">
        <section>
          <p className="text-[11px] tracking-[0.28em] text-slate-500 uppercase">Delivery Department</p>
          <h1 className="mt-2 text-3xl font-light tracking-tight text-slate-800">Order Management</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            View and update the shipping status for all orders. Move each order through{" "}
            <em>processing</em>, <em>in-transit</em>, and <em>delivered</em>.
          </p>
        </section>

        {loading && (
          <p className="text-sm text-slate-500">Loading orders…</p>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {updateError && (
          <p className="text-sm text-red-600">{updateError}</p>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="border border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-500">
            No orders yet.
          </div>
        )}

        {orders.map((order) => (
          <div key={order.order_ref} className="border border-slate-200 bg-white px-6 py-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-medium text-slate-800">{order.order_ref}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(order.created_at).toLocaleString()} · {order.item_count} item{order.item_count === 1 ? "" : "s"} · {Number(order.total_amount).toFixed(2)} USD
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[11px] tracking-[0.18em] uppercase ${STATUS_COLORS[order.status] ?? "bg-slate-100 text-slate-600"}`}
              >
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>

            <ul className="mt-4 space-y-1 border-t border-slate-100 pt-4 text-sm text-slate-600">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>Product #{item.product_id} × {item.quantity}</span>
                  <span>{(Number(item.unit_price) * item.quantity).toFixed(2)} USD</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-xs tracking-[0.18em] text-slate-500 uppercase">Update status:</span>
              {STATUS_STEPS.map((step) => (
                <button
                  key={step}
                  type="button"
                  disabled={order.status === step || updatingRef === order.order_ref}
                  onClick={() => handleStatusChange(order.order_ref, step)}
                  className={`rounded-full border px-3 py-1.5 text-[11px] tracking-[0.18em] uppercase transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    order.status === step
                      ? "border-slate-700 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-600 hover:border-slate-500"
                  }`}
                >
                  {STATUS_LABELS[step]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DeliveryPage;
