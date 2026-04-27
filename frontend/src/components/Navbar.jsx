import { useLocation, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useAuth } from "../context/AuthContext";

const noop = () => {};

function Navbar({
  brandName = "Fragrance shop",
  cartCount = 0,
  wishlistCount = 0,
  searchValue = "",
  onSearchChange = noop,
  onClearSearch = noop,
  searchResultCount = 0,
  searchStatus = "idle",
  onCartClick = noop,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { openAuth, isLoggedIn, isAdmin } = useAuth();
  const pathname = location.pathname;

  const navButtonClass = (isActive) =>
    `sans-ui rounded-full border px-3 py-1.5 tracking-[0.24em] transition ${
      isActive
        ? "border-slate-200 bg-white text-slate-900 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.6)]"
        : "border-transparent text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-800"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(248,250,252,0.94))] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-4 sm:px-10 lg:px-14">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(21rem,28rem)] xl:items-center xl:gap-8">
          <div className="animate-rise flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="border-0 bg-transparent p-0 text-left transition"
              >
                <span className="sans-ui block text-[10px] tracking-[0.34em] text-slate-400 uppercase">
                  Curated fragrance house
                </span>
                <span className="mt-2 block text-lg font-semibold tracking-[0.28em] text-slate-900 uppercase">
                  {brandName}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <div className="sans-ui rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[10px] tracking-[0.3em] text-slate-500 uppercase shadow-[0_12px_24px_-22px_rgba(15,23,42,0.6)]">
                  Wishlist {wishlistCount}
                </div>
                <div className="sans-ui rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[10px] tracking-[0.3em] text-slate-500 uppercase shadow-[0_12px_24px_-22px_rgba(15,23,42,0.6)]">
                  Cart {cartCount}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <nav
                className="sans-ui flex flex-wrap items-center gap-2 text-[11px] tracking-[0.24em] uppercase"
                aria-label="Primary"
              >
                <button
                  type="button"
                  className={navButtonClass(pathname === "/collections")}
                  onClick={() => navigate("/collections")}
                >
                  Collections
                </button>
                <button
                  type="button"
                  className={navButtonClass(pathname === "/wishlist")}
                  onClick={() => navigate("/wishlist")}
                >
                  Wishlist
                </button>
                <button
                  type="button"
                  className={navButtonClass(pathname === "/about")}
                  onClick={() => navigate("/about")}
                >
                  About
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    className={navButtonClass(pathname.startsWith("/admin"))}
                    onClick={() => navigate("/admin")}
                  >
                    Admin
                  </button>
                )}
              </nav>

              <div className="sans-ui flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] tracking-[0.24em] text-slate-500 uppercase">
                <button
                  type="button"
                  className="rounded-full border border-transparent px-3 py-1.5 transition hover:border-slate-200 hover:bg-white hover:text-slate-800"
                  onClick={() => openAuth("login")}
                >
                  {isLoggedIn ? "My account" : "Account"}
                </button>
                <button
                  type="button"
                  className="rounded-full border border-transparent px-3 py-1.5 transition hover:border-slate-200 hover:bg-white hover:text-slate-800"
                  onClick={onCartClick}
                >
                  Open cart
                </button>
              </div>
            </div>
          </div>

          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            onClear={onClearSearch}
            resultCount={searchResultCount}
            status={searchStatus}
          />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
