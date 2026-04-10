import PageShell from "../components/PageShell";

function AboutPage({ searchProps }) {
  return (
    <PageShell searchProps={searchProps}>
      <main className="flex-1 px-6 py-10 sm:px-10 lg:px-14">About</main>
    </PageShell>
  );
}

export default AboutPage;
