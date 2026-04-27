import { Link } from "react-router-dom";

function ProductCard({ product }) {
  const stockCount = product.stock ?? 0;
  const isOutOfStock = stockCount === 0;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group animate-rise-soft block overflow-hidden border border-slate-200/90 bg-white/88 shadow-[0_30px_60px_-45px_rgba(15,23,42,0.42)] transition hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-[0_36px_80px_-48px_rgba(15,23,42,0.5)]"
    >
      <div className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fafb,#eef2f2)]">
        <div className="absolute inset-x-8 top-6 h-28 rounded-full bg-white/70 blur-2xl" />
        <img
          src={product.mainImage}
          alt={product.name}
          onError={(event) => {
            event.currentTarget.src = product.fallbackImage;
          }}
          className="relative h-72 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />

        {isOutOfStock && (
          <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-[10px] tracking-[0.2em] text-white uppercase">
            Out of Stock
          </span>
        )}
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="sans-ui text-[10px] tracking-[0.26em] text-slate-400 uppercase">Signature bottle</p>
            <h3 className="mt-2 text-2xl font-light tracking-tight text-slate-900">{product.name}</h3>
          </div>
          <p className="text-sm font-medium text-slate-700">
            {product.price} {product.currency}
          </p>
        </div>

        {product.volume && (
          <p className="sans-ui text-[11px] tracking-[0.2em] text-slate-500 uppercase">{product.volume}</p>
        )}

        <p className="text-sm leading-7 text-slate-600 line-clamp-2">{product.shortDescription}</p>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          {isOutOfStock ? (
            <p className="text-sm font-medium text-red-500">Out of stock</p>
          ) : (
            <p className="text-sm text-emerald-700">In stock: {stockCount}</p>
          )}
          <span className="sans-ui text-[11px] tracking-[0.22em] text-slate-500 uppercase transition group-hover:text-slate-900">
            View product
          </span>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
