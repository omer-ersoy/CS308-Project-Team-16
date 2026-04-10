import Footer from "./Footer";
import Navbar from "./Navbar";

function PageShell({ children, searchProps }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7f8] text-slate-700">
      <Navbar {...(searchProps ?? {})} />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  );
}

export default PageShell;
