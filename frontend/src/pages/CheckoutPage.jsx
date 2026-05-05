import { useState } from "react";
import PageShell from "../components/PageShell";
import { api } from "../lib/api";

function CheckoutPage({
  searchProps,
  cartCount = 0,
  wishlistCount = 0,
  onCartClick,
  cart,
  cartId,
  products = [],
  onCheckoutComplete,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const productsByApiId = new Map(products.map((product) => [product.apiId, product]));
  const items = cart?.items ?? [];
  const totalAmount = Number(cart?.total_amount ?? 0);

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setError("");

    try {
      await api.checkout(cartId);
      setSuccess(true);
      onCheckoutComplete?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell
      searchProps={searchProps}
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      onCartClick={onCartClick}
    >
      <main className="flex flex-1 flex-col px-6 py-12 sm:px-10 lg:px-14">
        <div className="mx-auto w-full max-w-2xl">
          <p className="text-[11px] tracking-[0.28em] text-slate-500 uppercase">Order summary</p>
          <h1 className="mt-3 text-4xl font-light tracking-tight text-slate-800">Checkout</h1>

          {success ? (
            <div className="mt-8 border border-emerald-200 bg-emerald-50 px-6 py-8 text-center">
              <p className="text-lg font-medium text-emerald-800">Order placed successfully!</p>
              <p className="mt-2 text-sm leading-7 text-emerald-700">
                Thank you for your purchase. Your order is being processed.
              </p>
            </div>
          ) : (
            <>
              {items.length === 0 ? (
                <div className="mt-8 border border-slate-200 bg-slate-50 px-5 py-6 text-sm leading-7 text-slate-600">
                  Your cart is empty.
                </div>
              ) : (
                <div className="mt-8 space-y-4">
                  {items.map((item) => {
                    const product = productsByApiId.get(item.product_id);
                    const unitPrice = Number(item.unit_price);
                    const lineTotal = unitPrice * item.quantity;

                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 border border-slate-200 bg-white px-5 py-4"
                      >
                        {product && (
                          <img
                            src={product.mainImage}
                            alt={product.name}
                            onError={(event) => {
                              event.currentTarget.src = product.fallbackImage;
                            }}
                            className="h-16 w-12 shrink-0 object-cover"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-800">
                            {product?.name ?? `Product #${item.product_id}`}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="shrink-0 text-sm font-medium text-slate-800">
                          {lineTotal.toFixed(2)} USD
                        </p>
                      </div>
                    );
                  })}

                  <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                    <span className="text-sm text-slate-600">Total</span>
                    <span className="font-medium text-slate-900">{totalAmount.toFixed(2)} USD</span>
                  </div>
                </div>
              )}

              {error && (
                <p className="mt-4 text-sm text-red-500" aria-live="polite">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={items.length === 0 || submitting}
                className="mt-8 w-full rounded-full bg-slate-900 px-4 py-3.5 text-xs font-medium tracking-[0.2em] text-white uppercase transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Placing order…" : "Place Order"}
              </button>
            </>
          )}
        </div>
      </main>
    </PageShell>
  );
}

export default CheckoutPage;
