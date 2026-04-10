import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7f8] text-slate-700">
      <Navbar />
      <main className="flex-1">About</main>
      <Footer />
    </div>
  );
}

export default AboutPage;
