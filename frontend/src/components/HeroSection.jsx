import { useNavigate } from "react-router-dom";

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section
      className="border-b border-slate-200 bg-white px-6 py-16 sm:px-10 lg:px-14"
      aria-label="Hero"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] tracking-[0.28em] text-slate-400 uppercase">
          Curated fragrances
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-light leading-tight tracking-tight text-slate-800 sm:text-5xl">
          Discover Your <br className="hidden sm:block" />
          Signature Scent
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500">
          Explore our hand-picked collection of luxury perfumes and colognes
          crafted by the world's finest houses. From woody and spicy to floral
          and fresh, find the fragrance that speaks to you.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate("/collections")}
            className="border border-slate-800 bg-slate-800 px-6 py-2.5 text-[11px] tracking-[0.22em] text-white uppercase transition hover:bg-slate-700"
          >
            Shop Collections
          </button>
          <button
            type="button"
            onClick={() => navigate("/about")}
            className="border border-slate-300 px-6 py-2.5 text-[11px] tracking-[0.22em] text-slate-600 uppercase transition hover:border-slate-500 hover:text-slate-800"
          >
            Our Story
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
