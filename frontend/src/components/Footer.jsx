import { useNavigate } from "react-router-dom";

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="flex flex-col gap-8 px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-14">
        <p className="text-[11px] tracking-[0.28em] text-slate-500 uppercase">
          © {new Date().getFullYear()} Fragrance shop
        </p>
        <nav
          className="flex flex-wrap items-center gap-5 text-[11px] tracking-[0.28em] text-slate-500 uppercase"
          aria-label="Footer"
        >
          <button
            type="button"
            className="cursor-pointer hover:text-slate-800"
            onClick={() => navigate("/about")}
          >
            About
          </button>
          <button type="button" className="cursor-pointer hover:text-slate-800">
            Help
          </button>
          <button type="button" className="cursor-pointer hover:text-slate-800">
            Contact
          </button>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
