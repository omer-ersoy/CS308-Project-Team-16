import { useCallback, useEffect, useMemo, useState } from "react";
import PageShell from "../components/PageShell";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const tabs = [
  { id: "products", label: "Products" },
  { id: "categories", label: "Categories" },
  { id: "stock", label: "Stock" },
];

const emptyProduct = {
  name: "",
  model: "",
  serial_number: "",
  description: "",
  quantity_in_stock: "0",
  price: "",
  warranty_status: "",
  distributor_info: "",
  category_id: "",
};

function ProductManagerPage({ onCatalogChange }) {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [editingProductId, setEditingProductId] = useState(null);
  const [stockDrafts, setStockDrafts] = useState({});
  const [busyKey, setBusyKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [nextProducts, nextCategories] = await Promise.all([
        api.listProductManagerProducts(token),
        api.listProductManagerCategories(token),
      ]);
      setProducts(nextProducts);
      setCategories(nextCategories);
      setStockDrafts(
        Object.fromEntries(
          nextProducts.map((product) => [product.id, String(product.quantity_in_stock)]),
        ),
      );
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const runAction = async (key, action, successMessage) => {
    setBusyKey(key);
    setError("");
    setNotice("");
    try {
      await action();
      await loadData();
      onCatalogChange?.();
      setNotice(successMessage);
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusyKey("");
    }
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...productForm,
      category_id: Number(productForm.category_id),
      price: Number(productForm.price),
    };
    if (!editingProductId) {
      payload.quantity_in_stock = Number(productForm.quantity_in_stock);
    } else {
      delete payload.quantity_in_stock;
    }

    await runAction(
      "product-form",
      () =>
        editingProductId
          ? api.updateProductManagerProduct(token, editingProductId, payload)
          : api.createProductManagerProduct(token, payload),
      editingProductId ? "Product updated." : "Product created.",
    );
    setEditingProductId(null);
    setProductForm(emptyProduct);
  };

  const startProductEdit = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      model: product.model,
      serial_number: product.serial_number,
      description: product.description,
      quantity_in_stock: String(product.quantity_in_stock),
      price: String(product.price),
      warranty_status: product.warranty_status,
      distributor_info: product.distributor_info,
      category_id: String(product.category_id),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = (product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    runAction(
      `delete-product-${product.id}`,
      () => api.deleteProductManagerProduct(token, product.id),
      "Product deleted.",
    );
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    await runAction(
      "category-form",
      () => api.createProductManagerCategory(token, categoryForm),
      "Category created.",
    );
    setCategoryForm({ name: "", description: "" });
  };

  const deleteCategory = (category) => {
    if (!window.confirm(`Delete ${category.name}?`)) return;
    runAction(
      `delete-category-${category.id}`,
      () => api.deleteProductManagerCategory(token, category.id),
      "Category deleted.",
    );
  };

  const updateStock = (product) => {
    runAction(
      `stock-${product.id}`,
      () =>
        api.updateProductManagerStock(
          token,
          product.id,
          Number(stockDrafts[product.id]),
        ),
      `${product.name} stock updated.`,
    );
  };

  return (
    <PageShell>
      <main className="flex-1 px-6 py-10 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] tracking-[0.3em] text-slate-500 uppercase">
            Product manager
          </p>
          <h1 className="mt-3 text-4xl font-light tracking-tight text-slate-800">
            Catalog operations
          </h1>
          <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 text-xs tracking-[0.2em] uppercase ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {error && <p className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
          {notice && <p className="mt-6 border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{notice}</p>}
          {loading ? (
            <p className="mt-8 border border-slate-200 bg-white p-8 text-sm text-slate-600">Loading catalog...</p>
          ) : (
            <>
              {activeTab === "products" && (
                <section className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
                  <form onSubmit={handleProductSubmit} className="space-y-4 border border-slate-200 bg-white p-6">
                    <h2 className="text-xl font-medium text-slate-800">
                      {editingProductId ? "Edit product" : "Add product"}
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        ["name", "Product name"],
                        ["model", "Model"],
                        ["serial_number", "Serial number"],
                        ["price", "Price"],
                        ["warranty_status", "Warranty"],
                        ["distributor_info", "Distributor"],
                      ].map(([name, placeholder]) => (
                        <input
                          key={name}
                          name={name}
                          type={name === "price" ? "number" : "text"}
                          min={name === "price" ? "0.01" : undefined}
                          step={name === "price" ? "0.01" : undefined}
                          value={productForm[name]}
                          onChange={(event) =>
                            setProductForm((current) => ({
                              ...current,
                              [event.target.name]: event.target.value,
                            }))
                          }
                          placeholder={placeholder}
                          className="border border-slate-200 px-3 py-2 text-sm"
                          required
                        />
                      ))}
                      {!editingProductId && (
                        <input
                          name="quantity_in_stock"
                          type="number"
                          min="0"
                          value={productForm.quantity_in_stock}
                          onChange={(event) =>
                            setProductForm((current) => ({
                              ...current,
                              quantity_in_stock: event.target.value,
                            }))
                          }
                          placeholder="Initial stock"
                          className="border border-slate-200 px-3 py-2 text-sm"
                          required
                        />
                      )}
                      <select
                        value={productForm.category_id}
                        onChange={(event) =>
                          setProductForm((current) => ({
                            ...current,
                            category_id: event.target.value,
                          }))
                        }
                        className="border border-slate-200 bg-white px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      value={productForm.description}
                      onChange={(event) =>
                        setProductForm((current) => ({ ...current, description: event.target.value }))
                      }
                      rows="4"
                      placeholder="Description"
                      className="w-full border border-slate-200 px-3 py-2 text-sm"
                      required
                    />
                    <div className="flex gap-3">
                      <button disabled={busyKey === "product-form"} className="bg-slate-900 px-5 py-3 text-xs tracking-[0.18em] text-white uppercase disabled:opacity-50">
                        {editingProductId ? "Save product" : "Add product"}
                      </button>
                      {editingProductId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProductId(null);
                            setProductForm(emptyProduct);
                          }}
                          className="border border-slate-300 px-5 py-3 text-xs uppercase"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="overflow-x-auto border border-slate-200 bg-white">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                        <tr><th className="p-4">Product</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4">Actions</th></tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="border-b border-slate-100">
                            <td className="p-4"><strong>{product.name}</strong><div className="text-xs text-slate-500">{product.serial_number}</div></td>
                            <td className="p-4">{categoryNames.get(product.category_id)}</td>
                            <td className="p-4">${Number(product.price).toFixed(2)}</td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <button onClick={() => startProductEdit(product)} className="border border-slate-300 px-3 py-2 text-xs uppercase">Edit</button>
                                <button onClick={() => deleteProduct(product)} disabled={busyKey === `delete-product-${product.id}`} className="border border-red-200 px-3 py-2 text-xs text-red-700 uppercase">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {activeTab === "categories" && (
                <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                  <form onSubmit={handleCategorySubmit} className="space-y-4 border border-slate-200 bg-white p-6">
                    <h2 className="text-xl font-medium text-slate-800">Create category</h2>
                    <input value={categoryForm.name} onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))} placeholder="Category name" className="w-full border border-slate-200 px-3 py-2 text-sm" required />
                    <textarea value={categoryForm.description} onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" rows="4" className="w-full border border-slate-200 px-3 py-2 text-sm" />
                    <button disabled={busyKey === "category-form"} className="bg-slate-900 px-5 py-3 text-xs tracking-[0.18em] text-white uppercase disabled:opacity-50">Create category</button>
                  </form>
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <article key={category.id} className="flex items-center justify-between border border-slate-200 bg-white p-5">
                        <div><h3 className="font-medium text-slate-800">{category.name}</h3><p className="mt-1 text-sm text-slate-500">{category.description || "No description"}</p></div>
                        <button onClick={() => deleteCategory(category)} disabled={busyKey === `delete-category-${category.id}`} className="border border-red-200 px-3 py-2 text-xs text-red-700 uppercase">Delete</button>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {activeTab === "stock" && (
                <section className="mt-8 overflow-x-auto border border-slate-200 bg-white">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                      <tr><th className="p-4">Product</th><th className="p-4">Serial</th><th className="p-4">Quantity</th><th className="p-4">Action</th></tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b border-slate-100">
                          <td className="p-4 font-medium">{product.name}</td>
                          <td className="p-4 text-slate-500">{product.serial_number}</td>
                          <td className="p-4"><input type="number" min="0" value={stockDrafts[product.id] ?? ""} onChange={(event) => setStockDrafts((current) => ({ ...current, [product.id]: event.target.value }))} className="w-28 border border-slate-200 px-3 py-2" /></td>
                          <td className="p-4"><button onClick={() => updateStock(product)} disabled={busyKey === `stock-${product.id}`} className="bg-slate-900 px-4 py-2 text-xs text-white uppercase disabled:opacity-50">Update stock</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </PageShell>
  );
}

export default ProductManagerPage;
