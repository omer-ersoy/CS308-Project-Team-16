import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProductPage from "./pages/ProductPage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import CollectionsPage from "./pages/CollectionsPage";
import { getProductById, products } from "./data/products";
import { filterProducts } from "./utils/filterProducts";

function ProductRoute({ searchProps }) {
  const { productId } = useParams();
  const product = getProductById(productId ?? "");

  if (!product) {
    return <div className="p-8 text-slate-700">Product not found.</div>;
  }

  return <ProductPage product={product} searchProps={searchProps} />;
}

function SearchEmptyLayout({ searchProps, searchValue }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7f8] text-slate-700">
      <Navbar {...searchProps} />
      <main className="flex min-h-[calc(100vh-7rem)] flex-1 items-center justify-center px-6 py-16 sm:px-10 lg:px-14">
        <div className="max-w-xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
          <p className="text-[11px] tracking-[0.28em] text-slate-500 uppercase">Search results</p>
          <h1 className="mt-4 text-3xl font-light tracking-tight text-slate-700">No products found.</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            No matches for &quot;{searchValue.trim()}&quot;. Try a different product name, feature, or
            description.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const [searchValue, setSearchValue] = useState("");
  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredProducts = useMemo(() => {
    return filterProducts(products, normalizedSearch);
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

  const showSearchEmpty = Boolean(normalizedSearch) && filteredProducts.length === 0;

  return (
    <AuthProvider>
      <BrowserRouter>
        {showSearchEmpty ? (
          <SearchEmptyLayout searchProps={searchProps} searchValue={searchValue} />
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                <HomePage searchProps={searchProps} products={filteredProducts} />
              }
            />
            <Route path="/about" element={<AboutPage searchProps={searchProps} />} />
            <Route path="/collections" element={<CollectionsPage searchProps={searchProps} />} />
            <Route path="/product/:productId" element={<ProductRoute searchProps={searchProps} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
