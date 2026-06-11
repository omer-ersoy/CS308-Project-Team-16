import { useCallback, useEffect, useMemo, useState } from "react";
import PageShell from "../components/PageShell";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const ORDER_STATUS_LABELS = {
  processing: "Processing",
  "in-transit": "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const ORDER_STATUS_CLASSES = {
  processing: "border-amber-200 bg-amber-50 text-amber-700",
  "in-transit": "border-sky-200 bg-sky-50 text-sky-700",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
};

const STATUS_STEPS = ["processing", "in-transit", "delivered"];
const RETURN_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

function formatOrderDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusStepIndex(status) {
  return Math.max(STATUS_STEPS.indexOf(status), 0);
}

function getReturnEligibility(item) {
  if (item.orderStatus !== "delivered" || item.return_request_status) {
    return false;
  }

  const purchasedAt = new Date(item.orderCreatedAt);
  if (Number.isNaN(purchasedAt.getTime())) {
    return false;
  }

  return Date.now() <= purchasedAt.getTime() + RETURN_WINDOW_MS;
}

function BoughtProductStatusPage({ searchProps, cartCount = 0, wishlistCount = 0, onCartClick }) {
  const { token, isLoggedIn, openAuth } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [returnError, setReturnError] = useState("");
  const [returnReasons, setReturnReasons] = useState({});
  const [submittingReturnItemId, setSubmittingReturnItemId] = useState(null);

  const loadOrders = useCallback(
    async ({ silent = false } = {}) => {
      if (!isLoggedIn || !token) {
        setLoading(false);
        setOrders([]);
        return;
      }

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const nextOrders = await api.getMyOrders(token);
        setError("");
        setOrders(nextOrders);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isLoggedIn, token],
  );

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (!isLoggedIn || !token) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      loadOrders({ silent: true });
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [isLoggedIn, loadOrders, token]);

  const purchasedItems = useMemo(
    () =>
      orders.flatMap((order) =>
        (order.items ?? []).map((item) => ({
          ...item,
          orderId: order.id,
          orderStatus: order.status,
          orderCreatedAt: order.created_at,
        })),
      ),
    [orders],
  );

  async function handleCreateReturnRequest(item) {
    setReturnError("");
    setSubmittingReturnItemId(item.id);
    try {
      const returnRequest = await api.createReturnRequest(token, {
        order_item_id: item.id,
        quantity: item.quantity,
        reason: returnReasons[item.id] || null,
      });
      setOrders((currentOrders) =>
        currentOrders.map((order) => ({
          ...order,
          items: (order.items ?? []).map((orderItem) =>
            orderItem.id === item.id
              ? {
                  ...orderItem,
                  return_request_id: returnRequest.id,
                  return_request_status: returnRequest.status,
                }
              : orderItem,
          ),
        })),
      );
      setReturnReasons((currentReasons) => ({ ...currentReasons, [item.id]: "" }));
    } catch (err) {
      setReturnError(err.message);
    } finally {
      setSubmittingReturnItemId(null);
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
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.3em] text-slate-500 uppercase">Bought products</p>
              <h1 className="mt-3 text-4xl font-light tracking-tight text-slate-800">Product Status</h1>
            </div>
            {isLoggedIn && (
              <button
                type="button"
                onClick={() => loadOrders({ silent: true })}
                disabled={refreshing}
                className="border border-slate-300 bg-white px-5 py-3 text-xs tracking-[0.2em] text-slate-700 uppercase transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {refreshing ? "Refreshing" : "Refresh"}
              </button>
            )}
          </div>
          {returnError ? (
            <div className="mt-6 border border-red-100 bg-red-50 p-4 text-sm text-red-600">
              {returnError}
            </div>
          ) : null}

          {!isLoggedIn ? (
            <div className="mt-8 border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm text-slate-600">Sign in to view bought product statuses.</p>
              <button
                type="button"
                onClick={() => openAuth("login")}
                className="mt-5 rounded-full bg-slate-900 px-6 py-3 text-xs tracking-[0.2em] text-white uppercase"
              >
                Sign in
              </button>
            </div>
          ) : loading ? (
            <div className="mt-8 border border-slate-200 bg-white p-8 text-sm text-slate-600">
              Loading product statuses.
            </div>
          ) : error ? (
            <div className="mt-8 border border-red-100 bg-red-50 p-8 text-sm text-red-600">
              {error}
            </div>
          ) : purchasedItems.length === 0 ? (
            <div className="mt-8 border border-slate-200 bg-white p-8 text-sm text-slate-600">
              No bought products yet.
            </div>
          ) : (
            <div className="mt-8 grid gap-5">
              {purchasedItems.map((item) => {
                const currentStep = statusStepIndex(item.orderStatus);
                const canRequestReturn = getReturnEligibility(item);

                return (
                  <article key={`${item.orderId}-${item.id}`} className="border border-slate-200 bg-white p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] tracking-[0.24em] text-slate-400 uppercase">
                          Order #{item.orderId}
                        </p>
                        <h2 className="mt-2 text-xl font-medium text-slate-800">{item.product_name}</h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatOrderDate(item.orderCreatedAt)} · Quantity {item.quantity}
                        </p>
                      </div>
                      <span
                        className={`inline-flex border px-3 py-1 text-[11px] tracking-[0.18em] uppercase ${
                          ORDER_STATUS_CLASSES[item.orderStatus] ?? "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        {ORDER_STATUS_LABELS[item.orderStatus] ?? item.orderStatus}
                      </span>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      {STATUS_STEPS.map((step, index) => {
                        const isReached = index <= currentStep;

                        return (
                          <div
                            key={step}
                            className={`border px-4 py-3 text-xs tracking-[0.18em] uppercase ${
                              isReached
                                ? ORDER_STATUS_CLASSES[step]
                                : "border-slate-200 bg-slate-50 text-slate-400"
                            }`}
                          >
                            {ORDER_STATUS_LABELS[step]}
                          </div>
                        );
                      })}
                    </div>
                    {item.return_request_status ? (
                      <div className="mt-5 inline-flex border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] tracking-[0.18em] text-slate-600 uppercase">
                        Return {item.return_request_status}
                      </div>
                    ) : canRequestReturn ? (
                      <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
                        <label className="grid gap-2 text-xs tracking-[0.18em] text-slate-500 uppercase">
                          Reason
                          <textarea
                            value={returnReasons[item.id] ?? ""}
                            onChange={(event) =>
                              setReturnReasons((currentReasons) => ({
                                ...currentReasons,
                                [item.id]: event.target.value,
                              }))
                            }
                            rows={2}
                            maxLength={500}
                            className="min-h-20 resize-y border border-slate-200 px-3 py-2 text-sm normal-case tracking-normal text-slate-700 outline-none focus:border-slate-500"
                            placeholder="Optional"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleCreateReturnRequest(item)}
                          disabled={submittingReturnItemId === item.id}
                          className="border border-slate-900 bg-slate-900 px-5 py-3 text-xs tracking-[0.18em] text-white uppercase transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {submittingReturnItemId === item.id ? "Submitting" : "Request return"}
                        </button>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </PageShell>
  );
}

export default BoughtProductStatusPage;
