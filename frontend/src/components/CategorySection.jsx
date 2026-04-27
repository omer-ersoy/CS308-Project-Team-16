import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  {
    label: "Men's",
    description: "Woody, spicy & fresh",
    query: "?gender=men",
  },
  {
    label: "Women's",
    description: "Floral, fruity & oriental",
    query: "?gender=women",
  },
  {
    label: "Gift Sets",
    description: "Curated for every occasion",
    query: "?type=gifts",
  },
  {
    label: "New Arrivals",
    description: "The latest additions",
    query: "?type=new",
  },
];

function CategorySection() {
  const navigate = useNavigate();

  return (
    <section
      className="border-b border-slate-200/80 px-6 py-10 sm:px-10 lg:px-14"
      aria-label="Browse by category"
    >
      <div className="mx-auto max-w-6xl">
        <div className="animate-rise flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="sans-ui text-[11px] tracking-[0.3em] text-slate-500 uppercase">
              Browse by category
            </p>
            <h2 className="mt-2 text-3xl font-light tracking-tight text-slate-900">
              Start from a mood, not just a menu.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-slate-600">
            Use collections as shortcuts into the catalog when you know the kind of presence you
            want, but not yet the exact bottle.
          </p>
        </div>
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {CATEGORIES.map(({ label, description, query }) => (
            <button
              key={label}
              type="button"
              onClick={() => navigate(`/collections${query}`)}
              className="group animate-rise-soft relative overflow-hidden border border-slate-200/90 bg-white/80 px-6 py-6 text-left shadow-[0_24px_45px_-38px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:border-slate-300 hover:bg-white"
            >
              <span className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-slate-100 transition group-hover:bg-[#f3ede4]" />
              <span className="sans-ui relative text-[10px] tracking-[0.26em] text-slate-400 uppercase">
                Collection
              </span>
              <span className="relative mt-4 text-xl font-light tracking-tight text-slate-800 group-hover:text-slate-950">
                {label}
              </span>
              <span className="relative mt-3 text-sm leading-7 text-slate-500">
                {description}
              </span>
              <span className="sans-ui relative mt-6 text-[11px] tracking-[0.22em] text-slate-500 uppercase">
                View selection
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategorySection;
