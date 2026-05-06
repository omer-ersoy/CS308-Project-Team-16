import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "../api";

function mockJsonResponse(data, init = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    text: vi.fn().mockResolvedValue(data === null ? "" : JSON.stringify(data)),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("api client", () => {
  it("sends authenticated review creation requests as JSON", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(mockJsonResponse({ id: 9 }));

    const result = await api.createProductReview("token-123", 3, {
      rating: 5,
      comment: "Lovely",
    });

    expect(result).toEqual({ id: 9 });
    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/api/products/3/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token-123",
      },
      body: JSON.stringify({ rating: 5, comment: "Lovely" }),
    });
  });

  it("sends admin review moderation requests to the admin endpoint", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(mockJsonResponse({ status: "approved" }));

    await api.updateAdminReview("admin-token", 7, { status: "approved" });

    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/api/admin/reviews/7", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer admin-token",
      },
      body: JSON.stringify({ status: "approved" }),
    });
  });

  it("does not add a JSON content type for empty delete requests", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(mockJsonResponse(null, { status: 204 }));

    const result = await api.deleteProductReview("token-123", 3, 11);

    expect(result).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/api/products/3/reviews/11", {
      method: "DELETE",
      headers: {
        Authorization: "Bearer token-123",
      },
      body: undefined,
    });
  });

  it("surfaces backend error details", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockJsonResponse({ detail: "Admin access required" }, { ok: false, status: 403 }),
    );

    await expect(api.listAdminUsers("customer-token")).rejects.toThrow("Admin access required");
  });
});
