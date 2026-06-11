import { useCallback, useEffect, useMemo, useState } from "react";
import PageShell from "../components/PageShell";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const reviewStatuses = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const reviewStatusLabels = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const reviewStatusClasses = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

const reviewRatings = [1, 2, 3, 4, 5];

function formatReviewDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

function ProductManagerReviewsPage({ searchProps, cartCount = 0, wishlistCount = 0, onCartClick }) {
  const { token, isLoggedIn } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState("");
  const [error, setError] = useState("");

  const productNameById = useMemo(
    () => new Map(products.map((product) => [product.id, product.name])),
    [products],
  );

  const loadReviews = useCallback(async () => {
    if (!isLoggedIn || !token) {
      setReviews([]);
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [nextReviews, nextProducts] = await Promise.all([
        api.listProductManagerReviews(token),
        api.listProductManagerProducts(token),
      ]);
      setReviews(Array.isArray(nextReviews) ? nextReviews : []);
      setProducts(Array.isArray(nextProducts) ? nextProducts : []);
      setReviewDrafts(
        Object.fromEntries(
          (Array.isArray(nextReviews) ? nextReviews : []).map((review) => [
            review.id,
            {
              rating: String(review.rating),
              comment: review.comment,
              status: review.status ?? "pending",
            },
          ]),
        ),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, token]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  function handleReviewDraftChange(reviewId, field, value) {
    setReviewDrafts((currentDrafts) => ({
      ...currentDrafts,
      [reviewId]: {
        ...currentDrafts[reviewId],
        [field]: value,
      },
    }));
  }

  async function updateReview(reviewId, payload, key) {
    setSavingKey(key);
    setError("");
    try {
      const updatedReview = await api.updateReviewStatus(token, reviewId, payload);
      setReviews((currentReviews) =>
        currentReviews.map((review) => (review.id === updatedReview.id ? updatedReview : review)),
      );
      setReviewDrafts((currentDrafts) => ({
        ...currentDrafts,
        [updatedReview.id]: {
          rating: String(updatedReview.rating),
          comment: updatedReview.comment,
          status: updatedReview.status,
        },
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingKey("");
    }
  }

  function handleSetReviewStatus(reviewId, status) {
    return updateReview(reviewId, { status }, `review-status-${reviewId}-${status}`);
  }

  function handleSaveReview(reviewId) {
    const draft = reviewDrafts[reviewId];
    if (!draft) return;

    return updateReview(
      reviewId,
      {
        rating: Number(draft.rating),
        comment: draft.comment,
        status: draft.status,
      },
      `review-${reviewId}`,
    );
  }

  return (
    <PageShell
      searchProps={searchProps}
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      onCartClick={onCartClick}
    >
      <main className="flex-1 px-6 py-10 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.3em] text-slate-500 uppercase">Product manager</p>
              <h1 className="mt-3 text-4xl font-light tracking-tight text-slate-800">Review moderation</h1>
              <p className="mt-2 text-sm text-slate-600">Approve or reject customer product comments.</p>
            </div>
            <button
              type="button"
              onClick={loadReviews}
              disabled={loading}
              className="border border-slate-300 bg-white px-5 py-3 text-xs tracking-[0.2em] text-slate-700 uppercase transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Refreshing" : "Refresh"}
            </button>
          </div>

          {error ? (
            <div className="mt-8 border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</div>
          ) : null}

          {loading ? (
            <div className="mt-8 border border-slate-200 bg-white p-8 text-sm text-slate-600">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="mt-8 border border-slate-200 bg-white p-8 text-sm text-slate-600">No product reviews yet.</div>
          ) : (
            <div className="mt-8 space-y-4">
              {reviews.map((review) => {
                const draft = reviewDrafts[review.id] ?? {
                  rating: String(review.rating),
                  comment: review.comment,
                  status: review.status ?? "pending",
                };

                return (
                  <article key={review.id} className="border border-slate-200 bg-white p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-medium text-slate-800">
                          {productNameById.get(review.product_id) ?? `Product #${review.product_id}`}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {review.user_full_name} · {formatReviewDate(review.updated_at)}
                        </p>
                        <span
                          className={`mt-3 inline-flex border px-3 py-1 text-[11px] tracking-[0.18em] uppercase ${
                            reviewStatusClasses[review.status] ?? "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          {reviewStatusLabels[review.status] ?? review.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        <select
                          value={draft.status}
                          onChange={(event) => handleReviewDraftChange(review.id, "status", event.target.value)}
                          className="border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
                        >
                          {reviewStatuses.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                        <select
                          value={draft.rating}
                          onChange={(event) => handleReviewDraftChange(review.id, "rating", event.target.value)}
                          className="border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
                        >
                          {reviewRatings.map((rating) => (
                            <option key={rating} value={String(rating)}>
                              {rating} star{rating === 1 ? "" : "s"}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <textarea
                      value={draft.comment}
                      onChange={(event) => handleReviewDraftChange(review.id, "comment", event.target.value)}
                      rows="4"
                      maxLength="2000"
                      className="mt-4 w-full border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-slate-500"
                    />

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleSetReviewStatus(review.id, "approved")}
                        disabled={review.status === "approved" || savingKey === `review-status-${review.id}-approved`}
                        className="bg-emerald-600 px-5 py-3 text-xs tracking-[0.2em] text-white uppercase disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetReviewStatus(review.id, "rejected")}
                        disabled={review.status === "rejected" || savingKey === `review-status-${review.id}-rejected`}
                        className="bg-red-600 px-5 py-3 text-xs tracking-[0.2em] text-white uppercase disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveReview(review.id)}
                        disabled={savingKey === `review-${review.id}`}
                        className="bg-slate-900 px-5 py-3 text-xs tracking-[0.2em] text-white uppercase disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Save
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </PageShell>
  );
}

export default ProductManagerReviewsPage;
