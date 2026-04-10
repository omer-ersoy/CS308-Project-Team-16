import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7f8] text-slate-700">
      <Navbar />
      <main className="flex-1">Main</main>
      <Footer />
    </div>
  );
}

export default HomePage;
