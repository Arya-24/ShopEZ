import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const statusColors = {
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function Profile() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders/my");
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load your orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6" style={{ color: "var(--color-ink)" }}>
        Your profile
      </h1>

      <div className="border border-[var(--color-line)] rounded-lg p-5 mb-10">
        <div className="space-y-1 text-sm">
          <p>
            <span className="text-neutral-500">Name: </span>
            <span style={{ color: "var(--color-ink)" }}>{user?.name}</span>
          </p>
          <p>
            <span className="text-neutral-500">Email: </span>
            <span style={{ color: "var(--color-ink)" }}>{user?.email}</span>
          </p>
          {user?.role === "admin" && (
            <p>
              <span className="text-neutral-500">Role: </span>
              <span style={{ color: "var(--color-clay)" }}>Admin</span>
            </p>
          )}
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-ink)" }}>
        Order history
      </h2>

      {loading && <p className="text-neutral-500">Loading orders...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p className="text-neutral-500">
          You haven't placed any orders yet.{" "}
          <Link to="/products" className="underline" style={{ color: "var(--color-clay)" }}>
            Start shopping
          </Link>
        </p>
      )}

      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="block border border-[var(--color-line)] rounded-lg p-4 hover:border-[var(--color-clay)] transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                  {order.items.length} item{order.items.length !== 1 && "s"} · ₹{order.totalPrice}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {new Date(order.createdAt).toLocaleDateString()} · {order.paymentMethod}
                </p>
                <p className="text-xs text-neutral-400 mt-1">#{order._id.slice(-8)}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
                {order.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}