import { AuthProvider } from "./context/AuthContext";
import ProductPage from "./pages/ProductPage";
import { getProductById, products } from "./data/products";

function App() {
  const currentProduct = getProductById("bleu-de-chanel") ?? products[0];

  if (!currentProduct) {
    return <div className="p-8 text-slate-700">Product not found.</div>;
  }

  return (
    <AuthProvider>
      <ProductPage product={currentProduct} />
    </AuthProvider>
  );
}

export default App;
