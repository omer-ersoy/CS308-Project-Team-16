import ProductCard from "../components/ProductCard";
import PageShell from "../components/PageShell";

function WishlistPage({
  searchProps,
  products = [],
  isLoading = false,
  error = "",
  cartCount = 0,
  wishlistCount = 0,
  onCartClick,
  onToggleWishlist,
  isWishlisted,
}) {
  return (
    <PageShell
      searchProps={searchProps}
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      onCartClick={onCartClick}
    >
      <main className="flex flex-1 flex-col px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] tracking-[0.28em] text-slate-500 uppercase">Wishlist</p>
              <h1 className="mt-2 text-4xl font-light tracking-tight text-slate-900">
                Saved fragrances
              </h1>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600">
              Keep products here for quick access before you decide what to purchase.
            </p>
          </div>
          <section className="flex min-h-[40vh] flex-1 flex-col" aria-label="Wishlist products">
            {isLoading ? (
              <div className="mx-auto w-full max-w-xl border border-slate-200 bg-white/90 px-8 py-10 text-center shadow-sm backdrop-blur">
                <p className="text-[11px] tracking-[0.28em] text-slate-500 uppercase">Wishlist</p>
                <h1 className="mt-4 text-3xl font-light tracking-tight text-slate-700">Loading wishlist.</h1>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Product information is being loaded from the API.
                </p>
              </div>
            ) : error ? (
              <div className="mx-auto w-full max-w-xl border border-slate-200 bg-white/90 px-8 py-10 text-center shadow-sm backdrop-blur">
                <p className="text-[11px] tracking-[0.28em] text-slate-500 uppercase">Wishlist</p>
                <h1 className="mt-4 text-3xl font-light tracking-tight text-slate-700">Wishlist is unavailable.</h1>
                <p className="mt-4 text-sm leading-7 text-slate-600">{error}</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isWishlisted={isWishlisted?.(product.id)}
                    onToggleWishlist={onToggleWishlist}
                  />
                ))}
              </div>
            ) : (
              <div className="mx-auto w-full max-w-xl border border-slate-200 bg-white/90 px-8 py-10 text-center shadow-sm backdrop-blur">
                <p className="text-[11px] tracking-[0.28em] text-slate-500 uppercase">Wishlist</p>
                <h1 className="mt-4 text-3xl font-light tracking-tight text-slate-700">
                  Your wishlist is empty.
                </h1>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Save products from the homepage or product details to see them here.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </PageShell>
  );
}

export default WishlistPage;
