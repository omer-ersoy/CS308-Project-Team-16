import PageShell from "../components/PageShell";

function AboutPage({ searchProps, cartCount = 0, onCartClick }) {
  return (
    <PageShell searchProps={searchProps} cartCount={cartCount} onCartClick={onCartClick}>
      <main className="flex-1 px-6 py-10 sm:px-10 lg:px-14">About</main>
    </PageShell>
  );
}

export default AboutPage;
