import { useEffect, useState } from "react";
import PageShell from "../components/PageShell";

function ProductPage({ product, searchProps, cartCount = 0, onCartClick, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.mainImage ?? product.thumbnails?.[0]);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");
  const [cartSubmitting, setCartSubmitting] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setSelectedImage(product.mainImage ?? product.thumbnails?.[0]);
    setDetailsOpen(true);
    setCartMessage("");
    setCartError("");
  }, [product]);

  const decreaseQuantity = () => setQuantity((current) => Math.max(1, current - 1));
  const stockCount = product.stock ?? 0;
  const increaseQuantity = () =>
    setQuantity((current) => Math.min(stockCount || 1, current + 1));
  const thumbnails = product.thumbnails ?? [];
  const totalPrice = product.price * quantity;

  const handleAddToCart = async () => {
    if (!onAddToCart) {
      return;
    }

    setCartSubmitting(true);
    setCartMessage("");
    setCartError("");

    try {
      await onAddToCart(product, quantity);
      setCartMessage(`${quantity} item${quantity === 1 ? "" : "s"} added to cart.`);
      onCartClick?.();
    } catch (error) {
      setCartError(error.message);
    } finally {
      setCartSubmitting(false);
    }
  };

  return (
    <PageShell searchProps={searchProps} cartCount={cartCount} onCartClick={onCartClick}>
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[64%_36%]">
        <section className="relative px-6 pb-8 pt-0 sm:px-10 lg:px-14">
          <div className="mt-10 grid grid-cols-[56px_1fr] gap-8 sm:grid-cols-[70px_1fr] lg:mt-14">
            <div className="flex flex-col gap-3">
              {thumbnails.map((thumbnail, index) => (
                <button
                  type="button"
                  key={`${index}-${thumbnail}`}
                  className={`flex h-12 w-12 items-center justify-center overflow-hidden border bg-white sm:h-14 sm:w-14 ${selectedImage === thumbnail ? "border-slate-700" : "border-slate-300 hover:border-slate-500"}`}
                  onClick={() => setSelectedImage(thumbnail)}
                >
                  <img
                    src={thumbnail}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    onError={(event) => {
                      event.currentTarget.src = product.fallbackImage;
                    }}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center">
              <img
                src={selectedImage}
                alt={product.name}
                onError={(event) => {
                  event.currentTarget.src = product.fallbackImage;
                }}
                className="h-[440px] w-[280px] object-contain sm:h-[500px] sm:w-[320px]"
              />
            </div>
          </div>
        </section>

        <aside className="border-l border-slate-200 bg-white px-6 pb-10 pt-0 sm:px-10">
          <div className="mx-auto mt-10 max-w-md">
            <h1 className="text-4xl font-light tracking-tight text-slate-700">{product.name}</h1>
            <p className="mt-3 text-sm tracking-widest text-slate-500 uppercase">
              {product.volume} - {product.price} {product.currency}
            </p>

            <p className="mt-8 text-lg leading-relaxed text-slate-600">{product.shortDescription}</p>

            <ul className="mt-6 space-y-2 text-sm text-slate-600">
              {product.features.map((feature) => (
                <li key={feature}>- {feature}</li>
              ))}
            </ul>

            <div className="mt-10 flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-sm text-slate-500">Quantity</span>
              <div className="flex items-center gap-4 text-sm">
                <button type="button" className="text-slate-400 hover:text-slate-700" onClick={decreaseQuantity}>
                  -
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  className="text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={increaseQuantity}
                  disabled={stockCount === 0 || quantity >= stockCount}
                >
                  +
                </button>
              </div>
            </div>

            {stockCount === 0 ? (
              <p className="mt-4 text-sm font-medium text-red-500">Out of Stock</p>
            ) : (
              <p className="mt-4 text-sm text-green-600">In Stock: {stockCount}</p>
            )}

            <button
              type="button"
              className="mt-4 w-full bg-slate-700 px-4 py-3 text-xs tracking-[0.25em] text-white uppercase disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleAddToCart}
              disabled={stockCount === 0 || cartSubmitting}
            >
              {stockCount === 0
                ? "Out of Stock"
                : cartSubmitting
                  ? "Adding"
                  : `Add to Cart - ${totalPrice} ${product.currency}`}
            </button>

            {cartMessage && (
              <p className="mt-3 text-sm text-green-600" aria-live="polite">
                {cartMessage}
              </p>
            )}
            {cartError && (
              <p className="mt-3 text-sm text-red-500" aria-live="polite">
                {cartError}
              </p>
            )}

            <button type="button" className="mt-4 w-full text-center text-xs tracking-[0.22em] text-slate-500 uppercase underline underline-offset-4 hover:text-slate-700">
              Find Nearest Store
            </button>

            <div className="mt-10 border-t border-slate-200 pt-6">
              <button
                type="button"
                onClick={() => setDetailsOpen((open) => !open)}
                className="flex w-full items-start justify-between gap-4 text-left"
                aria-expanded={detailsOpen}
                aria-controls="product-details-content"
              >
                <h2 className="text-3xl font-light text-slate-700">Product Details</h2>
                <span className="shrink-0 text-xl text-slate-400 transition hover:text-slate-600" aria-hidden>
                  {detailsOpen ? "−" : "+"}
                </span>
              </button>
              <div
                id="product-details-content"
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${detailsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              >
                <div className="overflow-hidden">
                  <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600">{product.details}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

export default ProductPage;
