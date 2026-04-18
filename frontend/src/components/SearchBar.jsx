function SearchBar({
  value,
  onChange,
  onClear,
  resultCount,
  status,
}) {
  const trimmedValue = value.trim();
  const hasValue = trimmedValue.length > 0;
  const resultLabel = `${resultCount} result${resultCount === 1 ? "" : "s"}`;

  let statusLabel = "Ready";
  let helperText = "Search by product name, scent family, feature, or description.";

  if (status === "success") {
    statusLabel = "Results ready";
    helperText = `Showing results for "${trimmedValue}".`;
  }

  if (status === "empty") {
    statusLabel = "No matches";
    helperText = `No products found for "${trimmedValue}".`;
  }

  return (
    <div className="w-full max-w-2xl xl:justify-self-end">
      <label
        htmlFor="site-search"
        className="mb-2 block text-[10px] tracking-[0.32em] text-slate-400 uppercase"
      >
        Search products
      </label>
      <div className="overflow-hidden rounded-[1.8rem] border border-slate-200/90 bg-white shadow-[0_22px_50px_-34px_rgba(15,23,42,0.45)]">
        <div className="flex min-h-15 items-center gap-3 px-4 sm:px-5">
          <svg
            className="h-4 w-4 shrink-0 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>

          <input
            id="site-search"
            type="search"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Try oud, citrus, woody, musk..."
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />

          {hasValue ? (
            <button
              type="button"
              onClick={onClear}
              className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] tracking-[0.2em] text-slate-500 uppercase transition hover:border-slate-300 hover:text-slate-800"
              aria-label="Clear search"
            >
              Clear
            </button>
          ) : (
            <span className="hidden shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-[10px] tracking-[0.2em] text-slate-400 uppercase sm:inline-flex">
              Live search
            </span>
          )}
        </div>

        <div className="grid gap-2 border-t border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.6),rgba(255,255,255,0.9))] px-4 py-3 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-5">
          <span className="inline-flex w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[10px] tracking-[0.22em] text-slate-500 uppercase">
            {statusLabel}
          </span>
          <p className="text-sm leading-6 text-slate-600">{helperText}</p>
          <div
            aria-live="polite"
            className="text-[11px] tracking-[0.18em] text-slate-500 uppercase sm:text-right"
          >
            {resultLabel}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
