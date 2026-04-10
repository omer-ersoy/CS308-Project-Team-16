export function matchesProductSearch(product, query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const searchableContent = [
    product.name,
    product.volume,
    product.shortDescription,
    product.details,
    ...(product.features ?? []),
  ].filter(Boolean);

  return searchableContent.some((field) =>
    field.toLowerCase().includes(normalizedQuery),
  );
}

export function filterProducts(products, query) {
  return products.filter((product) => matchesProductSearch(product, query));
}
