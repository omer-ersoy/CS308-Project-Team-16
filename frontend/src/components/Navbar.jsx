import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useAuth } from "../context/AuthContext";

const noop = () => {};

function Navbar({
  brandName = "Fragrance shop",
  cartCount = 0,
  searchValue = "",
  onSearchChange = noop,
  onClearSearch = noop,
  searchResultCount = 0,
  searchStatus = "idle",
}) {
  const navigate = useNavigate();
  const { openAuth, isLoggedIn } = useAuth();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[64%_36%]">
      <header className="bg-[#f4f7f8] px-6 pt-5 sm:px-10 lg:px-14">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[11px] tracking-[0.28em] text-slate-500 uppercase">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="border-0 bg-transparent p-0 text-sm font-semibold tracking-[0.2em] text-slate-700"
          >
            {brandName}
          </button>
          <nav className="flex items-center gap-5">
            <button
              type="button"
              className="cursor-pointer hover:text-slate-800"
              onClick={() => navigate("/collections")}
            >
              Collections
            </button>
            <button
              type="button"
              className="cursor-pointer hover:text-slate-800"
              onClick={() => navigate("/about")}
            >
              About
            </button>
          </nav>
        </div>
      </header>

      <header className="border-l border-slate-200 bg-white px-6 py-5 sm:px-10">
        <div className="flex flex-col gap-5 lg:items-end">
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            onClear={onClearSearch}
            resultCount={searchResultCount}
            status={searchStatus}
          />

          <div className="flex flex-wrap justify-end gap-x-6 gap-y-2 text-[11px] tracking-[0.28em] text-slate-500 uppercase">
            <button
              type="button"
              className="cursor-pointer hover:text-slate-800"
              onClick={() => openAuth("login")}
            >
              {isLoggedIn ? "My account" : "Account"}
            </button>
            <button type="button" className="cursor-pointer hover:text-slate-800">
              Cart ({cartCount})
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Navbar;
