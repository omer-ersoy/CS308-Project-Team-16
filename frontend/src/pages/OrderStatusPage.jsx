import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import { api } from "../lib/api";

const STATUS_STEPS = ["processing", "in-transit", "delivered"];

const STATUS_LABELS = {
  processing: "Processing",
  "in-transit": "In Transit",
  delivered: "Delivered",
};

const STATUS_DESCRIPTIONS = {
  processing: "Your order has been received and is being prepared for shipment.",
  "in-transit": "Your order is on its way to you.",
  delivered: "Your order has been delivered. Enjoy!",
};

function StatusTimeline({ currentStatus }) {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="mt-8">
      <ol className="flex items-start gap-0">
        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <li key={step} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-center">
                {index > 0 && (
                  <div
                    className={`h-0.5 flex-1 ${isCompleted || isActive ? "bg-slate-700" : "bg-slate-200"}`}
                  />
                )}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium ${
                    isCompleted
                      ? "border-slate-700 bg-slate-700 text-white"
                      : isActive
                        ? "border-slate-700 bg-white text-slate-700"
                        : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {isCompleted ? "✓" : index + 1}
                </div>
                {index < STATUS_STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 ${isCompleted ? "bg-slate-700" : "bg-slate-200"}`}
                  />
                )}
              </div>
              <span
                className={`text-center text-[11px] tracking-[0.18em] uppercase ${
                  isActive ? "font-medium text-slate-800" : "text-slate-400"
                }`}
              >
                {STATUS_LABELS[step]}
              </span>
            </li>
          );
        })}
      </ol>
      {currentStatus && (
        <p className="mt-4 text-center text-sm text-slate-600">
          {STATUS_DESCRIPTIONS[currentStatus]}
        </p>
      )}
    </div>
  );
}

function OrderStatusPage({ searchProps, cartCount = 0, wishlistCount = 0, onCartClick }) {
  const { orderRef } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderRef) return;
    setLoading(true);
    setError("");
    api
      .getOrder(orderRef)
      .then(setOrder)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [orderRef]);

  return (
    <PageShell
      searchProps={searchProps}
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      onCartClick={onCartClick}
    >
      <main className="flex min-h-[calc(100vh-7rem)] flex-1 items-center justify-center px-6 py-16 sm:px-10 lg:px-14">
        <div className="w-full max-w-xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
          <p className="text-[11px] tracking-[0.28em] text-slate-500 uppercase">Order tracking</p>
          <h1 className="mt-3 text-3xl font-light tracking-tight text-slate-700">
            {orderRef}
          </h1>

          {loading && (
            <p className="mt-6 text-sm text-slate-500">Loading order details…</p>
          )}

          {error && (
            <p className="mt-6 text-sm text-red-600">{error}</p>
          )}

          {order && (
            <>
              <StatusTimeline currentStatus={order.status} />

              <div className="mt-10 border-t border-slate-200 pt-6">
                <p className="text-[11px] tracking-[0.24em] text-slate-500 uppercase">
                  Order summary
                </p>
                <ul className="mt-4 space-y-3">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between text-sm text-slate-600">
                      <span>
                        Product #{item.product_id} × {item.quantity}
                      </span>
                      <span>
                        {(Number(item.unit_price) * item.quantity).toFixed(2)} USD
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-medium text-slate-800">
                  <span>Total</span>
                  <span>{Number(order.total_amount).toFixed(2)} USD</span>
                </div>
              </div>

              <p className="mt-6 text-xs text-slate-400">
                Placed: {new Date(order.created_at).toLocaleString()}
              </p>
            </>
          )}
        </div>
      </main>
    </PageShell>
  );
}

export default OrderStatusPage;
