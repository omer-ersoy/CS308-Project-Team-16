import PageShell from "../components/PageShell";

function HomePage() {
  return (
    <PageShell>
      <main className="flex flex-1 flex-col px-6 py-10 sm:px-10 lg:px-14">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
          <section className="flex min-h-[40vh] flex-1 flex-col" aria-label="Featured" />
          <section className="mt-16 flex flex-col pb-8" aria-label="Introduction" />
        </div>
      </main>
    </PageShell>
  );
}

export default HomePage;
