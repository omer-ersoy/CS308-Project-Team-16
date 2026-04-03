import ProductPage from "./pages/ProductPage";
import { getProductById, products } from "./data/products";

function App() {
  const currentProduct = getProductById("bleu-de-chanel") ?? products[0];

  if (!currentProduct) {
    return <div className="p-8 text-slate-700">Product not found.</div>;
  }

  return <ProductPage product={currentProduct} />;
}

export default App;
