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
      className="border-b border-slate-200 bg-[#f4f7f8] px-6 py-10 sm:px-10 lg:px-14"
      aria-label="Browse by category"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] tracking-[0.28em] text-slate-500 uppercase">
          Browse by category
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.map(({ label, description, query }) => (
            <button
              key={label}
              type="button"
              onClick={() => navigate(`/collections${query}`)}
              className="group flex flex-col gap-1 border border-slate-200 bg-white px-5 py-5 text-left transition hover:border-slate-400 hover:shadow-sm"
            >
              <span className="text-sm font-medium tracking-wide text-slate-700 group-hover:text-slate-900">
                {label}
              </span>
              <span className="text-[11px] leading-5 text-slate-400">
                {description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategorySection;
