import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProductPage from "./pages/ProductPage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import CollectionsPage from "./pages/CollectionsPage";
import { getProductById, products } from "./data/products";

function ProductRoute() {
  const { productId } = useParams();
  const product = getProductById(productId ?? "") ?? products[0];

  if (!product) {
    return <div className="p-8 text-slate-700">Product not found.</div>;
  }

  return <ProductPage product={product} />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/product/:productId" element={<ProductRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
