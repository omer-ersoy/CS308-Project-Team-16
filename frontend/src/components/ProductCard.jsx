import { Link } from "react-router-dom";

function ProductCard({ product }) {
  const stockCount = product.stock ?? 0;
  const isOutOfStock = stockCount === 0;

  return (
    <Link
      to={`/product/${product.id}`}
      className="block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative bg-slate-100">
        <img
          src={product.mainImage}
          alt={product.name}
          onError={(event) => {
            event.currentTarget.src = product.fallbackImage;
          }}
          className="h-64 w-full object-cover"
        />

        {isOutOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white">
            Out of Stock
          </span>
        )}
      </div>

      <div className="space-y-2 p-4">
        <h3 className="text-lg font-medium text-slate-800">{product.name}</h3>

        {product.volume && (
          <p className="text-sm text-slate-500">{product.volume}</p>
        )}

        <p className="text-base font-semibold text-slate-700">
          {product.price} {product.currency}
        </p>

        {isOutOfStock ? (
          <p className="text-sm font-medium text-red-500">Out of Stock</p>
        ) : (
          <p className="text-sm text-green-600">In Stock: {stockCount}</p>
        )}
      </div>
    </Link>
  );
}

export default ProductCard;
