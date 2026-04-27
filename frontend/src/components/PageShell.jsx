import Footer from "./Footer";
import Navbar from "./Navbar";

function PageShell({ children, searchProps, cartCount = 0, onCartClick }) {
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(254,252,247,0.9),_rgba(244,247,248,0.92)_28%,_#edf2f1_68%,_#e7eeed_100%)] text-slate-700">
      <Navbar {...(searchProps ?? {})} cartCount={cartCount} onCartClick={onCartClick} />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  );
}

export default PageShell;
