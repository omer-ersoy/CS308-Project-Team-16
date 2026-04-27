import { useMemo, useState } from "react";

const sampleProducts = [
  { id: "p1", name: "Bleu de Chanel", price: 210, currency: "USD" },
  { id: "p2", name: "Dior Sauvage", price: 180, currency: "USD" },
  { id: "p3", name: "YSL Libre", price: 165, currency: "USD" },
];

function DiscountManager() {
  const [selectedProductId, setSelectedProductId] = useState(sampleProducts[0].id);
  const [discountRate, setDiscountRate] = useState(10);
  const [message, setMessage] = useState("");

  const selectedProduct = useMemo(
    () => sampleProducts.find((product) => product.id === selectedProductId),
    [selectedProductId]
  );

  const discountedPrice = useMemo(() => {
    if (!selectedProduct) return 0;
    const rate = Number(discountRate) || 0;
    return (selectedProduct.price * (1 - rate / 100)).toFixed(2);
  }, [selectedProduct, discountRate]);

  const handleApplyDiscount = () => {
    setMessage("Discount applied. Interested users have been notified.");
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
          Discount management
        </p>
        <h2 className="mt-2 text-2xl font-light tracking-tight text-slate-800">
          Apply Discount to Products
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Select product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-500"
            >
              {sampleProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Discount rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={discountRate}
              onChange={(e) => setDiscountRate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-500"
            />
          </div>

          <button
            type="button"
            onClick={handleApplyDiscount}
            className="rounded-xl bg-slate-800 px-5 py-3 text-sm uppercase tracking-[0.22em] text-white transition hover:bg-slate-700"
          >
            Apply Discount
          </button>
        </div>

        <div className="rounded-2xl bg-slate-50 p-5">
          <h3 className="text-lg font-medium text-slate-800">Price Preview</h3>

          {selectedProduct && (
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-700">Product:</span>{" "}
                {selectedProduct.name}
              </p>
              <p>
                <span className="font-medium text-slate-700">Current price:</span>{" "}
                {selectedProduct.price} {selectedProduct.currency}
              </p>
              <p>
                <span className="font-medium text-slate-700">Discount:</span>{" "}
                {discountRate}%
              </p>
              <p className="text-base font-semibold text-slate-800">
                New price: {discountedPrice} {selectedProduct.currency}
              </p>
            </div>
          )}

          {message && (
            <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default DiscountManager;