import { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const DELIVERY_STATUSES = new Set(["processing", "in-transit"]); // adjust as needed

function formatAddress(address) {
  if (!address) return "";
  if (typeof address === "string") return address;
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postal_code ?? address.postcode,
    address.country,
  ].filter(Boolean);
  return parts.join(", ");
}

function formatOrderDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

function ProductManagerDeliveryPage({ searchProps, cartCount = 0, wishlistCount = 0, onCartClick }) {
  const { token, isLoggedIn } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn || !token) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError("");

    (async () => {
      try {
        const allOrders = await (api.listOrdersForManager
          ? api.listOrdersForManager(token)
          : api.getAllOrders
          ? api.getAllOrders(token)
          : api.listOrders
          ? api.listOrders(token)
          : api.getOrders
          ? api.getOrders(token)
          : Promise.resolve([]));

        if (!isMounted) return;

        const deliveries = (allOrders ?? []).filter((o) => DELIVERY_STATUSES.has(o.status));

        setOrders(deliveries);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.message ?? String(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, token]);

  return (
    <PageShell
      searchProps={searchProps}
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      onCartClick={onCartClick}
    >
      <main className="flex-1 px-6 py-10 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] tracking-[0.3em] text-slate-500 uppercase">Manager panel</p>
          <h1 className="mt-3 text-4xl font-light tracking-tight text-slate-800">Delivery list</h1>
          <p className="mt-2 text-sm text-slate-600">Orders to be delivered and customer shipping addresses.</p>

          {loading ? (
            <div className="mt-8 border border-slate-200 bg-white p-8 text-sm text-slate-600">Loading deliveries...</div>
          ) : error ? (
            <div className="mt-8 border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">{error}</div>
          ) : orders.length === 0 ? (
            <div className="mt-8 border border-slate-200 bg-white p-8 text-sm text-slate-600">No deliveries found.</div>
          ) : (
            <div className="mt-8 space-y-6">
              {orders.map((order) => (
                <article key={order.id} className="border border-slate-200 bg-white p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] tracking-[0.24em] text-slate-400 uppercase">Order #{order.id}</p>
                      <p className="mt-1 text-sm text-slate-500">{formatOrderDate(order.created_at)}</p>
                      <p className="mt-2 text-sm text-slate-700"><strong>Customer:</strong> {order.customer_name ?? order.customer?.name ?? order.customer_email ?? "N/A"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Status</p>
                      <p className="mt-1 font-medium text-slate-900">{String(order.status)}</p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-700 space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Shipping address</p>
                      <p className="mt-1">{formatAddress(order.shipping_address ?? order.customer?.address ?? order.customer_address)}</p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 uppercase">Items</p>
                      <div className="mt-1">
                        {(order.items || []).map((it) => (
                          <div key={it.id} className="flex items-center justify-between">
                            <span>{it.product_name} × {it.quantity}</span>
                            <span>{Number(it.unit_price * it.quantity).toFixed(2)} USD</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </PageShell>
  );
}

export default ProductManagerDeliveryPage;
