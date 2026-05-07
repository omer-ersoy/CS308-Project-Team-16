import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/PageShell";

function CheckoutPage({
  searchProps,
  cartCount = 0,
  wishlistCount = 0,
  onCartClick,
  onCheckout,
  isCheckingOut = false,
  checkoutMessage = "",
}) {
  const { isLoggedIn, openAuth } = useAuth();

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState("");

  const handleMockPayment = async () => {
    setError("");

    if (!cardName.trim() || !cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
      setError("Please fill in all payment fields.");
      return;
    }

    try {
      const result = await onCheckout();
      setInvoice(result);
      setPaymentComplete(true);
    } catch (err) {
      setError(err.message || "Checkout failed.");
    }
  };

  if (!isLoggedIn) {
    return (
      <PageShell
        searchProps={searchProps}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onCartClick={onCartClick}
      >
        <main className="flex min-h-[calc(100vh-7rem)] flex-1 items-center justify-center px-6 py-16 sm:px-10 lg:px-14">
          <div className="max-w-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
              Checkout
            </p>
            <h1 className="mt-4 text-3xl font-light tracking-tight text-slate-700">
              Sign in required
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Users must log in before completing the checkout process.
            </p>

            <button
              type="button"
              onClick={openAuth}
              className="mt-6 rounded-full bg-slate-900 px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white transition hover:bg-slate-700"
            >
              Sign In to Continue
            </button>
          </div>
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell
      searchProps={searchProps}
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      onCartClick={onCartClick}
    >
      <main className="flex flex-1 flex-col px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
        <div className="mx-auto w-full max-w-3xl">
          <div className="border border-slate-200 bg-white px-8 py-10 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
              Checkout
            </p>
            <h1 className="mt-2 text-3xl font-light tracking-tight text-slate-700">
              Mock Payment Page
            </h1>

            {!paymentComplete ? (
              <>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  This is a mock payment step for the checkout flow. When payment is
                  confirmed, the system creates the order and returns invoice data.
                </p>

                <div className="mt-8 grid gap-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                      placeholder="1111 2222 3333 4444"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                        placeholder="MM/YY"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>

                {(error || checkoutMessage) && (
                  <p className="mt-4 text-sm text-rose-600">{error || checkoutMessage}</p>
                )}

                <button
                  type="button"
                  onClick={handleMockPayment}
                  disabled={isCheckingOut}
                  className="mt-8 rounded-full bg-slate-900 px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCheckingOut ? "Processing..." : "Complete Mock Payment"}
                </button>
              </>
            ) : (
              <div className="mt-6 space-y-6">
                <div className="border border-emerald-200 bg-emerald-50 px-6 py-6 text-sm leading-7 text-slate-700">
                  <p className="font-medium text-emerald-700">
                    Payment completed successfully.
                  </p>
                  <p className="mt-2">
                    Your order has been created and invoice data has been generated.
                  </p>
                </div>

                {invoice && (
                  <div className="border border-slate-200 bg-slate-50 px-6 py-6">
                    <h2 className="text-xl font-medium text-slate-800">Invoice Summary</h2>

                    <div className="mt-4 space-y-2 text-sm leading-7 text-slate-700">
                      <p><strong>Order ID:</strong> {invoice.order_id}</p>
                      <p><strong>Database Order ID:</strong> {invoice.db_order_id}</p>
                      <p><strong>Status:</strong> {invoice.status}</p>
                      <p><strong>Created At:</strong> {invoice.created_at}</p>
                      <p><strong>Item Count:</strong> {invoice.item_count}</p>
                      <p><strong>Total Amount:</strong> {invoice.total_amount} USD</p>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-slate-800">Items</h3>
                      <div className="mt-3 space-y-3">
                        {invoice.items?.map((item, index) => (
                          <div
                            key={`${item.product_id}-${index}`}
                            className="border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                          >
                            <p><strong>Product ID:</strong> {item.product_id}</p>
                            <p><strong>Quantity:</strong> {item.quantity}</p>
                            <p><strong>Unit Price:</strong> {item.unit_price} USD</p>
                            <p><strong>Line Total:</strong> {item.line_total} USD</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </PageShell>
  );
}

export default CheckoutPage;