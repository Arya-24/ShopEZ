import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusColors = {
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/orders", { params: filter ? { status: filter } : {} });
      setOrders(data.orders);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleStatusChange = async (order, status) => {
    setUpdatingId(order._id);
    try {
      const { data } = await api.put(`/orders/${order._id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === order._id ? data : o)));
    } catch (err) {
      setError(err.response?.data?.message || "Could not update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--color-ink)" }}>
          All orders
        </h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-[var(--color-line)] rounded-md px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-neutral-500">Loading...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {!loading && orders.length === 0 && <p className="text-neutral-500">No orders found.</p>}

      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order._id} className="border border-[var(--color-line)] rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link to={`/orders/${order._id}`} className="text-sm font-medium underline" style={{ color: "var(--color-ink)" }}>
                  #{order._id.slice(-8)}
                </Link>
                <p className="text-sm text-neutral-600 mt-1">
                  {order.user?.name} · {order.user?.email}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {order.items.length} item{order.items.length !== 1 && "s"} · ₹{order.totalPrice} ·{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
                  {order.status}
                </span>
                <select
                  value={order.status}
                  disabled={updatingId === order._id}
                  onChange={(e) => handleStatusChange(order, e.target.value)}
                  className="border border-[var(--color-line)] rounded-md px-2 py-1 text-sm disabled:opacity-50"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}