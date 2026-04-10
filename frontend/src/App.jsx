import { useMemo, useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import SiteHeader from "./components/SiteHeader";
import ProductCard from "./components/ProductCard";
import { products } from "./data/products";

function App() {
  const [searchValue, setSearchValue] = useState("");
  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredProducts = useMemo(() => {
    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) => {
      const searchableContent = [
        product.name,
        product.volume,
        product.shortDescription,
        product.details,
        ...product.features,
      ];

      return searchableContent.some((field) =>
        field.toLowerCase().includes(normalizedSearch),
      );
    });
  }, [normalizedSearch]);
  const searchStatus = normalizedSearch
    ? filteredProducts.length > 0
      ? "success"
      : "empty"
    : "idle";
  const searchProps = {
    searchValue,
    onSearchChange: setSearchValue,
    onClearSearch: () => setSearchValue(""),
    searchResultCount: filteredProducts.length,
    searchStatus,
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#f4f7f8] text-slate-700">
        <SiteHeader {...searchProps} />
        <main className="px-6 py-10 sm:px-10 lg:px-14">
          {filteredProducts.length === 0 ? (
            <div className="mx-auto max-w-xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
              <p className="text-[11px] tracking-[0.28em] text-slate-500 uppercase">
                {normalizedSearch ? "Search results" : "Product catalog"}
              </p>
              <h1 className="mt-4 text-3xl font-light tracking-tight text-slate-700">
                {normalizedSearch ? "No products found." : "No products to show."}
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {normalizedSearch
                  ? `No matches for "${searchValue.trim()}". Try a different product name, feature, or description.`
                  : "Products will appear here once they are added to the catalog."}
              </p>
            </div>
          ) : (
            <section
              aria-label="Product list"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </section>
          )}
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
