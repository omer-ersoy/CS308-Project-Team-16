import { useMemo, useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import SiteHeader from "./components/SiteHeader";
import ProductPage from "./pages/ProductPage";
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
  const currentProduct = filteredProducts[0] ?? null;
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

  if (!currentProduct) {
    return (
      <AuthProvider>
        <div className="min-h-screen bg-[#f4f7f8] text-slate-700">
          <SiteHeader {...searchProps} />
          <main className="flex min-h-[calc(100vh-7rem)] items-center justify-center px-6 py-16 sm:px-10 lg:px-14">
            <div className="max-w-xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
              <p className="text-[11px] tracking-[0.28em] text-slate-500 uppercase">
                Search results
              </p>
              <h1 className="mt-4 text-3xl font-light tracking-tight text-slate-700">
                No products found.
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                No matches for "{searchValue.trim()}". Try a different product
                name, feature, or description.
              </p>
            </div>
          </main>
        </div>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <ProductPage product={currentProduct} searchProps={searchProps} />
    </AuthProvider>
  );
}

export default App;
