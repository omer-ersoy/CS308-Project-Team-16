const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api";

async function request(path, options = {}) {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers ?? {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body:
      options.body && typeof options.body !== "string"
        ? JSON.stringify(options.body)
        : options.body,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.detail ?? `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  listProducts() {
    return request("/products");
  },

  listCategories() {
    return request("/categories");
  },

  getCart(cartId) {
    return request(`/carts/${cartId}`);
  },

  addCartItem(cartId, productId, quantity) {
    return request(`/carts/${cartId}/items`, {
      method: "POST",
      body: {
        product_id: productId,
        quantity,
      },
    });
  },

  removeCartItem(cartId, itemId) {
    return request(`/carts/${cartId}/items/${itemId}`, {
      method: "DELETE",
    });
  },

  login(email, password) {
    return request("/auth/login", {
      method: "POST",
      body: {
        email,
        password,
      },
    });
  },

  register(payload) {
    return request("/auth/register", {
      method: "POST",
      body: payload,
    });
  },

  getCurrentUser(token) {
    return request("/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
