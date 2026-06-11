import { useEffect, useState } from "react";
import { api } from "../lib/api";

function money(value) {
  return `${Number(value ?? 0).toFixed(2)} USD`;
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function RefundEvaluation({ token = "" }) {
  const [requests, setRequests] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [evaluatingId, setEvaluatingId] = useState(null);

  async function loadRequests() {
    if (!token) {
      setRequests([]);
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const data = await api.listReturnRequests(token, { statusFilter: "pending" });
      setRequests(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!token) {
        setRequests([]);
        return;
      }

      setLoading(true);
      setMessage("");
      try {
        const data = await api.listReturnRequests(token, { statusFilter: "pending" });
        if (isMounted) {
          setRequests(data);
        }
      } catch (error) {
        if (isMounted) {
          setMessage(error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function handleEvaluate(requestId, action) {
    setEvaluatingId(requestId);
    setMessage("");
    try {
      const payload = { decision_note: notes[requestId] || null };
      const updatedRequest =
        action === "approve"
          ? await api.approveReturnRequest(token, requestId, payload)
          : await api.rejectReturnRequest(token, requestId, payload);
      setRequests((currentRequests) =>
        currentRequests.filter((request) => request.id !== updatedRequest.id),
      );
      setNotes((currentNotes) => ({ ...currentNotes, [requestId]: "" }));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setEvaluatingId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
            Refunds
          </p>
          <h2 className="mt-2 text-2xl font-light tracking-tight text-slate-800">
            Evaluate Return Requests
          </h2>
        </div>
        <button
          type="button"
          onClick={loadRequests}
          disabled={loading}
          className="rounded-xl border border-slate-300 px-5 py-3 text-sm uppercase tracking-[0.22em] text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {message && (
        <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {message}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-slate-50 px-5 py-6 text-sm text-slate-600">
          Loading return requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 px-5 py-6 text-sm text-slate-600">
          No pending return requests.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                <th className="px-4">Request</th>
                <th className="px-4">Customer</th>
                <th className="px-4">Product</th>
                <th className="px-4">Refund</th>
                <th className="px-4">Reason</th>
                <th className="px-4">Decision</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="rounded-2xl bg-slate-50 text-sm text-slate-700">
                  <td className="px-4 py-4 font-medium">
                    RR-{request.id}
                    <span className="mt-1 block text-xs font-normal text-slate-500">
                      {formatDate(request.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {request.customer_name ?? `Customer #${request.customer_id ?? "-"}`}
                    <span className="mt-1 block text-xs text-slate-500">
                      {request.customer_email ?? ""}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {request.product_name}
                    <span className="mt-1 block text-xs text-slate-500">
                      Qty {request.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-4">{money(request.refund_amount)}</td>
                  <td className="max-w-xs px-4 py-4 text-slate-600">
                    {request.reason || "-"}
                  </td>
                  <td className="min-w-72 px-4 py-4">
                    <div className="grid gap-3">
                      <textarea
                        value={notes[request.id] ?? ""}
                        onChange={(event) =>
                          setNotes((currentNotes) => ({
                            ...currentNotes,
                            [request.id]: event.target.value,
                          }))
                        }
                        rows={2}
                        maxLength={500}
                        placeholder="Decision note"
                        className="min-h-16 resize-y rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-500"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEvaluate(request.id, "approve")}
                          disabled={evaluatingId === request.id}
                          className="rounded-xl bg-emerald-700 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEvaluate(request.id, "reject")}
                          disabled={evaluatingId === request.id}
                          className="rounded-xl border border-rose-200 px-4 py-2 text-xs uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default RefundEvaluation;
