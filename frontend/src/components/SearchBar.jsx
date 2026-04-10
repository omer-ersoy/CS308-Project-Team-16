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
  let helperText = "Start typing to search by product name, feature, or description.";

  if (status === "success") {
    statusLabel = "Results ready";
    helperText = `Showing results for "${trimmedValue}".`;
  }

  if (status === "empty") {
    statusLabel = "No matches";
    helperText = `No products found for "${trimmedValue}".`;
  }

  return (
    <div className="w-full max-w-md">
      <label htmlFor="site-search" className="sr-only">
        Search products
      </label>
      <div className="flex items-center gap-3 border border-slate-200 bg-slate-50 px-4 py-3">
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
          placeholder="Search products"
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />

        <button
          type="button"
          onClick={onClear}
          disabled={!hasValue}
          className="shrink-0 text-[11px] tracking-[0.2em] text-slate-500 uppercase transition hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Clear search"
        >
          Clear
        </button>
      </div>

      <div aria-live="polite" className="mt-2">
        <div className="flex items-center justify-between gap-4 text-[11px] tracking-[0.18em] text-slate-500 uppercase">
          <span>Search status: {statusLabel}</span>
          <span>{resultLabel}</span>
        </div>
        <p className="mt-2 text-sm text-slate-600">{helperText}</p>
      </div>
    </div>
  );
}

export default SearchBar;
