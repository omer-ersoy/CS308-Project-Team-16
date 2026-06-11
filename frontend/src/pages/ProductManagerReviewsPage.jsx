import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export default function ProductManagerReviewsPage() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const data = await api.listPendingReviews(token);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleAction = useCallback(async (id, status) => {
    setActionLoading((s) => ({ ...s, [id]: true }));
    try {
      await api.updateReviewStatus(token, id, { status });
      setReviews((current) => current.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message ?? String(err));
    } finally {
      setActionLoading((s) => { const next = { ...s }; delete next[id]; return next; });
    }
  }, [token]);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-medium">Pending Reviews</h2>
        <p className="mt-4 text-sm text-gray-600">Loading reviews…</p>
      </div>
    );
  }

  return (
    <main className="p-6">
      <div className="max-w-4xl">
        <h2 className="text-2xl font-semibold">Pending Reviews</h2>
        {error && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>}
        {reviews.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">No pending reviews.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {reviews.map((review) => (
              <li key={review.id} className="border rounded p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-slate-500">Product ID: {review.product_id}</div>
                    <div className="mt-1 text-lg font-medium">{review.user_full_name}</div>
                    <div className="text-sm text-slate-600 mt-1">Rating: {review.rating} / 5</div>
                    <p className="mt-3 text-sm text-gray-800 whitespace-pre-wrap">{review.comment}</p>
                    <div className="mt-2 text-xs text-slate-400">Submitted: {new Date(review.created_at).toLocaleString()}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => handleAction(review.id, "approved")} disabled={Boolean(actionLoading[review.id])} className="px-3 py-1.5 bg-green-600 text-white rounded">Approve</button>
                    <button onClick={() => handleAction(review.id, "rejected")} disabled={Boolean(actionLoading[review.id])} className="px-3 py-1.5 bg-red-600 text-white rounded">Reject</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
