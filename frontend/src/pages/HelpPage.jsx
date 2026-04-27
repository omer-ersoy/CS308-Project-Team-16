import PageShell from "../components/PageShell";

function HelpPage({ searchProps, cartCount = 0, wishlistCount = 0, onCartClick }) {
  return (
    <PageShell
      searchProps={searchProps}
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      onCartClick={onCartClick}
    >
      <main className="flex-1 px-6 py-10 sm:px-10 lg:px-14">
        <section className="mx-auto max-w-6xl">
          <div className="border border-slate-200 bg-white px-8 py-10 shadow-sm sm:px-10">
            <p className="text-[11px] tracking-[0.28em] text-slate-500 uppercase">Help center</p>
            <h1 className="mt-4 text-4xl font-light tracking-tight text-slate-800 sm:text-5xl">
              How to move through the shop with ease.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">
              The site is built around calm discovery: search from the header, save favorites to your
              wishlist, and open any fragrance for the full story before you buy.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {[
              [
                "Search and browse",
                "Use the header search to filter the catalog by name, notes, or description. Clear the field anytime to see the full grid again.",
              ],
              [
                "Wishlist",
                "Heart a product to keep it on your wishlist page. Your list stays in this browser so you can compare scents before adding them to the bag.",
              ],
              [
                "Cart and checkout",
                "Open the bag icon to review quantities and remove lines. Complete checkout when your team has wired the flow to the backend.",
              ],
              [
                "Product detail",
                "Each product page gathers imagery, notes, and volume in one place so you can decide without hunting through clutter.",
              ],
            ].map(([title, text]) => (
              <article key={title} className="border border-slate-200 bg-[#f8faf9] px-7 py-7 shadow-sm">
                <p className="text-[11px] tracking-[0.24em] text-slate-400 uppercase">Topic</p>
                <h2 className="mt-3 text-2xl font-light tracking-tight text-slate-800">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </PageShell>
  );
}

export default HelpPage;
