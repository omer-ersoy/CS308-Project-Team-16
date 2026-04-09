import { useAuth } from "../context/AuthContext";

function SiteHeader({ brandName = "Fragrance shop", cartCount = 0 }) {
  const { openAuth, isLoggedIn } = useAuth();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[64%_36%]">
      <header className="bg-[#f4f7f8] px-6 pt-5 sm:px-10 lg:px-14">
        <div className="grid grid-cols-3 items-center text-[11px] tracking-[0.28em] text-slate-500 uppercase">
          <nav className="flex items-center gap-5">
            <button type="button" className="cursor-pointer hover:text-slate-800">
              Shop
            </button>
            <button type="button" className="cursor-pointer hover:text-slate-800">
              Collections
            </button>
            <button type="button" className="cursor-pointer hover:text-slate-800">
              About
            </button>
          </nav>
          <div className="justify-self-center text-sm font-semibold tracking-[0.2em] text-slate-700">{brandName}</div>
          <div />
        </div>
      </header>

      <header className="border-l border-slate-200 bg-white px-6 pt-5 sm:px-10">
        <div className="flex justify-end text-[11px] tracking-[0.28em] text-slate-500 uppercase">
          <button type="button" className="cursor-pointer hover:text-slate-800">
            Search
          </button>
          <button
            type="button"
            className="ml-6 cursor-pointer hover:text-slate-800"
            onClick={() => openAuth("login")}
          >
            {isLoggedIn ? "My account" : "Account"}
          </button>
          <button type="button" className="ml-6 cursor-pointer hover:text-slate-800">
            Cart ({cartCount})
          </button>
        </div>
      </header>
    </div>
  );
}

export default SiteHeader;
