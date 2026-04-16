import ProductCard from "../components/ProductCard";
import PageShell from "../components/PageShell";
import HeroSection from "../components/HeroSection";
import CategorySection from "../components/CategorySection";
import SortControls from "../components/SortControls";

function HomePage({ searchProps, sortOption = "default", onSortChange, products = [] }) {
  const hasProducts = products.length > 0;
  const isSearching = searchProps?.searchStatus !== "idle";

  return (
    <PageShell searchProps={searchProps}>
      {!isSearching && <HeroSection />}
      {!isSearching && <CategorySection />}
      <main className="flex flex-1 flex-col px-6 py-10 sm:px-10 lg:px-14">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
          {!isSearching && (
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] tracking-[0.28em] text-slate-500 uppercase">
                  Featured products
                </p>
                <h2 className="mt-2 text-2xl font-light tracking-tight text-slate-700">
                  Our Selection
                </h2>
              </div>

              <SortControls
                sortOption={sortOption}
                onSortChange={onSortChange}
              />
            </div>
          )}
          <section className="flex min-h-[40vh] flex-1 flex-col" aria-label="Products">
            {hasProducts ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="mx-auto w-full max-w-xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
                <p className="text-[11px] tracking-[0.28em] text-slate-500 uppercase">Product catalog</p>
                <h1 className="mt-4 text-3xl font-light tracking-tight text-slate-700">No products to show.</h1>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Products will appear here once they are added to the catalog.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </PageShell>
  );
}

export default HomePage;
