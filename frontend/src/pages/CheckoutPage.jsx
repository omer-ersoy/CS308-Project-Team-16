import PageShell from "../components/PageShell";

function CheckoutPage({ searchProps, cartCount = 0, wishlistCount = 0, onCartClick }) {
  return (
    <PageShell
      searchProps={searchProps}
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      onCartClick={onCartClick}
    >
      <main className="flex min-h-[calc(100vh-7rem)] flex-1 items-center justify-center px-6 py-16 sm:px-10 lg:px-14">
        <div className="max-w-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
          <p className="text-[11px] tracking-[0.28em] text-slate-500 uppercase">Checkout</p>
          <h1 className="mt-4 text-3xl font-light tracking-tight text-slate-700">
            Checkout page is ready.
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Your branch references this route from the main app. You can now continue wiring the
            order form and payment flow here.
          </p>
        </div>
      </main>
    </PageShell>
  );
}

export default CheckoutPage;
