import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import CartDrawer from "./components/CartDrawer";
import PageShell from "./components/PageShell";
import ProductPage from "./pages/ProductPage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import CollectionsPage from "./pages/CollectionsPage";
import { api } from "./lib/api";
import { adaptProduct } from "./lib/productAdapter";
import SalesManagerPage from "./pages/SalesManagerPage";

const CART_ID = 1;

function getCartItemCount(cart) {
  return cart?.items?.reduce((total, item) => total + item.quantity, 0) ?? 0;
}

function StateLayout({ searchProps, cartCount, onCartClick, eyebrow, title, description }) {
  return (
    <PageShell searchProps={searchProps} cartCount={cartCount} onCartClick={onCartClick}>
      <main className="flex min-h-[calc(100vh-7rem)] flex-1 items-center justify-center px-6 py-16 sm:px-10 lg:px-14">
        <div className="max-w-xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
          <p className="text-[11px] tracking-[0.28em] text-slate-500 uppercase">{eyebrow}</p>
          <h1 className="mt-4 text-3xl font-light tracking-tight text-slate-700">{title}</h1>
          {description && (
            <p className="mt-4 text-sm leading-7 text-slate-600">{description}</p>
          )}
        </div>
      </main>
    </PageShell>
  );
}

function ProductRoute({ searchProps, products, isLoading, cartCount, onCartClick, onAddToCart }) {
  const { productId } = useParams();
  const product = products.find((item) => item.id === productId);

  if (isLoading) {
    return (
      <StateLayout
        searchProps={searchProps}
        cartCount={cartCount}
        onCartClick={onCartClick}
        eyebrow="Product catalog"
        title="Loading product."
        description="Product information is being loaded from the API."
      />
    );
  }

  if (!product) {
    return (
      <StateLayout
        searchProps={searchProps}
        cartCount={cartCount}
        onCartClick={onCartClick}
        eyebrow="Product catalog"
        title="Product not found."
        description="This product is not available in the current catalog."
      />
    );
  }

  return (
    <ProductPage
      product={product}
      searchProps={searchProps}
      cartCount={cartCount}
      onCartClick={onCartClick}
      onAddToCart={onAddToCart}
    />
  );
}

function SearchEmptyLayout({ searchProps, searchValue, cartCount, onCartClick }) {
  return (
    <PageShell searchProps={searchProps} cartCount={cartCount} onCartClick={onCartClick}>
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
    </PageShell>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [catalogStatus, setCatalogStatus] = useState("loading");
  const [catalogError, setCatalogError] = useState("");
  const [cart, setCart] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [removingItemId, setRemovingItemId] = useState(null);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      setCatalogStatus("loading");
      setCatalogError("");

      try {
        const [apiProducts, apiCategories, initialCart] = await Promise.all([
          api.listProducts(),
          api.listCategories(),
          api.getCart(CART_ID),
        ]);

        if (!isMounted) {
          return;
        }

        const categoriesById = new Map(apiCategories.map((category) => [category.id, category]));
        setProducts(
          apiProducts.map((product) =>
            adaptProduct(product, categoriesById.get(product.category_id)),
          ),
        );
        setCart(initialCart);
        setCatalogStatus("success");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setCatalogError(error.message);
        setCatalogStatus("error");
      }
    }

    loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

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
  }, [normalizedSearch, products]);

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

  const isCatalogLoading = catalogStatus === "loading";
  const cartCount = getCartItemCount(cart);
  const showSearchEmpty =
    !isCatalogLoading && !catalogError && Boolean(normalizedSearch) && filteredProducts.length === 0;

  const handleAddToCart = useCallback(async (product, quantity) => {
    const updatedCart = await api.addCartItem(CART_ID, product.apiId, quantity);
    setCart(updatedCart);
    return updatedCart;
  }, []);

  const handleRemoveCartItem = useCallback(async (itemId) => {
    setRemovingItemId(itemId);

    try {
      const updatedCart = await api.removeCartItem(CART_ID, itemId);
      setCart(updatedCart);
      return updatedCart;
    } finally {
      setRemovingItemId(null);
    }
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        {showSearchEmpty ? (
          <SearchEmptyLayout
            searchProps={searchProps}
            searchValue={searchValue}
            cartCount={cartCount}
            onCartClick={() => setCartOpen(true)}
          />
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  searchProps={searchProps}
                  products={filteredProducts}
                  isLoading={isCatalogLoading}
                  error={catalogError}
                  cartCount={cartCount}
                  onCartClick={() => setCartOpen(true)}
                />
              }
            />
            <Route
              path="/about"
              element={
                <AboutPage
                  searchProps={searchProps}
                  cartCount={cartCount}
                  onCartClick={() => setCartOpen(true)}
                />
              }
            />
            <Route
              path="/collections"
              element={
                <CollectionsPage
                  searchProps={searchProps}
                  cartCount={cartCount}
                  onCartClick={() => setCartOpen(true)}
                />
              }
            />
            <Route
              path="/sales-manager"
              element={
                <SalesManagerPage />
              }
            />
            <Route
              path="/product/:productId"
              element={
                <ProductRoute
                  searchProps={searchProps}
                  products={products}
                  isLoading={isCatalogLoading}
                  cartCount={cartCount}
                  onCartClick={() => setCartOpen(true)}
                  onAddToCart={handleAddToCart}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
        <CartDrawer
          open={cartOpen}
          cart={cart}
          products={products}
          removingItemId={removingItemId}
          onClose={() => setCartOpen(false)}
          onRemoveItem={handleRemoveCartItem}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
