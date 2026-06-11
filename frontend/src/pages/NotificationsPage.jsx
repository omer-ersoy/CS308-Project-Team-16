import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";

function money(value) {
  return `${Number(value ?? 0).toFixed(2)} USD`;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

function NotificationsPage({
  searchProps,
  discountNotifications = [],
  refundNotifications = [],
  loading = false,
  error = "",
  onRefresh,
  onMarkAllRead,
  cartCount = 0,
  wishlistCount = 0,
  onCartClick,
}) {
  const notifications = [
    ...discountNotifications.map((notification) => ({
      ...notification,
      type: "discount",
      sortDate: notification.created_at,
    })),
    ...refundNotifications.map((notification) => ({
      ...notification,
      type: "refund",
      sortDate: notification.created_at,
    })),
  ].sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  return (
    <PageShell
      searchProps={searchProps}
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      onCartClick={onCartClick}
    >
      <main className="flex-1 px-6 py-10 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.3em] text-slate-500 uppercase">Customer panel</p>
              <h1 className="mt-3 text-4xl font-light tracking-tight text-slate-800">Notifications</h1>
              <p className="mt-2 text-sm text-slate-600">Discount and refund updates for your account.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className="border border-emerald-300 bg-emerald-50 px-5 py-3 text-xs tracking-[0.2em] text-emerald-800 uppercase transition hover:border-emerald-500"
                >
                  Mark all read
                </button>
              ) : null}
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className="border border-slate-300 bg-white px-5 py-3 text-xs tracking-[0.2em] text-slate-700 uppercase transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Refreshing" : "Refresh"}
              </button>
            </div>
          </div>

          {error ? (
            <div className="mt-8 border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</div>
          ) : null}

          {loading ? (
            <div className="mt-8 border border-slate-200 bg-white p-8 text-sm text-slate-600">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="mt-8 border border-slate-200 bg-white p-8 text-sm text-slate-600">No notifications yet.</div>
          ) : (
            <div className="mt-8 grid gap-4">
              {notifications.map((notification) => {
                const unreadClass = notification.is_read
                  ? "border-slate-200 bg-white"
                  : "border-emerald-300 bg-emerald-50 shadow-sm";

                if (notification.type === "discount") {
                  return (
                    <Link
                      key={`discount-${notification.id}`}
                      to={`/product/${notification.product_id}`}
                      className={`block border p-5 transition hover:border-slate-400 ${unreadClass}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] tracking-[0.2em] text-emerald-700 uppercase">
                            Discount
                          </p>
                          <h2 className="mt-2 text-xl font-medium text-slate-800">{notification.product_name}</h2>
                          <p className="mt-2 text-sm text-slate-600">
                            {Number(notification.discount_rate).toFixed(2)}% discount applied.
                          </p>
                          <p className="mt-1 text-sm text-slate-500">{formatDate(notification.created_at)}</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">
                          {money(notification.original_price)} to {money(notification.discounted_price)}
                        </p>
                      </div>
                    </Link>
                  );
                }

                return (
                  <article key={`refund-${notification.id}`} className={`border p-5 ${unreadClass}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] tracking-[0.2em] text-sky-700 uppercase">
                          Refund {notification.status}
                        </p>
                        <h2 className="mt-2 text-xl font-medium text-slate-800">{notification.product_name}</h2>
                        <p className="mt-2 text-sm text-slate-600">
                          Refund request RR-{notification.return_request_id} was {notification.status}.
                        </p>
                        {notification.decision_note ? (
                          <p className="mt-2 text-sm text-slate-500">{notification.decision_note}</p>
                        ) : null}
                        <p className="mt-1 text-sm text-slate-500">{formatDate(notification.created_at)}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">
                        {money(notification.refund_amount)}
                      </p>
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

export default NotificationsPage;
