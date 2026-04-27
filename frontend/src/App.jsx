import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import CartDrawer from "./components/CartDrawer";
import PageShell from "./components/PageShell";
import ProductPage from "./pages/ProductPage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import CollectionsPage from "./pages/CollectionsPage";
import AdminPage from "./pages/AdminPage";
import WishlistPage from "./pages/WishlistPage";
import { api } from "./lib/api";
import { adaptProduct } from "./lib/productAdapter";

const CART_ID = 1;
const WISHLIST_STORAGE_KEY = "wishlist-product-ids";

function getCartItemCount(cart) {
  return cart?.items?.reduce((total, item) => total + item.quantity, 0) ?? 0;
}

function StateLayout({
  searchProps,
  cartCount,
  wishlistCount,
  onCartClick,
  eyebrow,
  title,
  description,
}) {
  return (
    <PageShell
      searchProps={searchProps}
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      onCartClick={onCartClick}
    >
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

function ProductRoute({
  searchProps,
  products,
  isLoading,
  cartCount,
  wishlistCount,
  onCartClick,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}) {
  const { productId } = useParams();
  const product = products.find((item) => item.id === productId);

  if (isLoading) {
    return (
        <StateLayout
          searchProps={searchProps}
          cartCount={cartCount}
          wishlistCount={wishlistCount}
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
          wishlistCount={wishlistCount}
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
      wishlistCount={wishlistCount}
      onCartClick={onCartClick}
      onAddToCart={onAddToCart}
      isWishlisted={isWishlisted(product.id)}
      onToggleWishlist={onToggleWishlist}
    />
  );
}

function SearchEmptyLayout({ searchProps, searchValue, cartCount, wishlistCount, onCartClick }) {
  return (
    <PageShell
      searchProps={searchProps}
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      onCartClick={onCartClick}
    >
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

function AdminRoute({ searchProps, cartCount, wishlistCount, onCartClick, onCatalogChange }) {
  const { isLoggedIn, isAdmin } = useAuth();

  if (!isLoggedIn || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminPage
      searchProps={searchProps}
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      onCartClick={onCartClick}
      onCatalogChange={onCatalogChange}
    />
  );
}

function AppContent() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [catalogReloadKey, setCatalogReloadKey] = useState(0);
  const [catalogStatus, setCatalogStatus] = useState("loading");
  const [catalogError, setCatalogError] = useState("");
  const [cart, setCart] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [removingItemId, setRemovingItemId] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [wishlistIds, setWishlistIds] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setWishlistIds(parsed.map((id) => String(id)));
      }
    } catch {
      setWishlistIds([]);
    }
  }, []);

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
  }, [catalogReloadKey]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    const validIds = new Set(products.map((product) => product.id));
    setWishlistIds((current) => {
      const filtered = current.filter((id) => validIds.has(id));
      return filtered.length === current.length ? current : filtered;
    });
  }, [products]);

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
  const wishlistCount = wishlistIds.length;
  const isAdminRoute = location.pathname.startsWith("/admin");
  const showSearchEmpty =
    !isAdminRoute &&
    !isCatalogLoading &&
    !catalogError &&
    Boolean(normalizedSearch) &&
    filteredProducts.length === 0;

  const handleAddToCart = useCallback(async (product, quantity) => {
    const updatedCart = await api.addCartItem(CART_ID, product.apiId, quantity);
    setCart(updatedCart);
    return updatedCart;
  }, []);

  const handleCatalogChange = useCallback(() => {
    setCatalogReloadKey((current) => current + 1);
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

  const handleToggleWishlist = useCallback((productId) => {
    setWishlistIds((current) => {
      if (current.includes(productId)) {
        return current.filter((id) => id !== productId);
      }
      return [productId, ...current];
    });
  }, []);

  const wishlistProductSet = useMemo(() => new Set(wishlistIds), [wishlistIds]);

  const isWishlisted = useCallback(
    (productId) => wishlistProductSet.has(productId),
    [wishlistProductSet],
  );

  const wishlistProducts = useMemo(() => {
    const byId = new Map(products.map((product) => [product.id, product]));
    return wishlistIds.map((id) => byId.get(id)).filter(Boolean);
  }, [products, wishlistIds]);

  const filteredWishlistProducts = useMemo(() => {
    if (!normalizedSearch) {
      return wishlistProducts;
    }

    const filteredIds = new Set(filteredProducts.map((product) => product.id));
    return wishlistProducts.filter((product) => filteredIds.has(product.id));
  }, [filteredProducts, normalizedSearch, wishlistProducts]);

  return (
    <>
      {showSearchEmpty ? (
        <SearchEmptyLayout
          searchProps={searchProps}
          searchValue={searchValue}
          cartCount={cartCount}
          wishlistCount={wishlistCount}
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
                wishlistCount={wishlistCount}
                onCartClick={() => setCartOpen(true)}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={isWishlisted}
              />
            }
          />
          <Route
            path="/about"
            element={
              <AboutPage
                searchProps={searchProps}
                cartCount={cartCount}
                wishlistCount={wishlistCount}
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
                wishlistCount={wishlistCount}
                onCartClick={() => setCartOpen(true)}
              />
            }
          />
          <Route
            path="/wishlist"
            element={
              <WishlistPage
                searchProps={searchProps}
                products={filteredWishlistProducts}
                isLoading={isCatalogLoading}
                error={catalogError}
                cartCount={cartCount}
                wishlistCount={wishlistCount}
                onCartClick={() => setCartOpen(true)}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={isWishlisted}
              />
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
                wishlistCount={wishlistCount}
                onCartClick={() => setCartOpen(true)}
                onAddToCart={handleAddToCart}
                isWishlisted={isWishlisted}
                onToggleWishlist={handleToggleWishlist}
              />
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute
                searchProps={searchProps}
                cartCount={cartCount}
                wishlistCount={wishlistCount}
                onCartClick={() => setCartOpen(true)}
                onCatalogChange={handleCatalogChange}
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
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
