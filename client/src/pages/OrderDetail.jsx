import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

const statusColors = {
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load this order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <p className="max-w-3xl mx-auto px-4 py-10 text-neutral-500">Loading order...</p>;
  if (error) return <p className="max-w-3xl mx-auto px-4 py-10 text-red-600">{error}</p>;
  if (!order) return null;

  const { shippingAddress: addr } = order;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between mb-2">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--color-ink)" }}>
          Order confirmed
        </h1>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
          {order.status}
        </span>
      </div>
      <p className="text-sm text-neutral-500 mb-8">
        Order ID: {order._id} · Placed {new Date(order.createdAt).toLocaleDateString()}
      </p>

      <div className="space-y-3 mb-8">
        {order.items.map((item, i) => (
          <div key={i} className="flex gap-4 border border-[var(--color-line)] rounded-lg p-4">
            <div className="w-16 h-16 bg-neutral-100 rounded-md overflow-hidden flex-shrink-0">
              {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1">
              <p className="font-medium" style={{ color: "var(--color-ink)" }}>
                {item.name}
              </p>
              <p className="text-sm text-neutral-500">
                {item.size !== "N/A" && `Size: ${item.size}`}
                {item.size !== "N/A" && item.color !== "N/A" && " · "}
                {item.color !== "N/A" && `Color: ${item.color}`}
              </p>
              <p className="text-sm text-neutral-600 mt-1">
                ₹{item.price} × {item.quantity}
              </p>
            </div>
            <p className="font-medium">₹{item.price * item.quantity}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <h2 className="font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Shipping to
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {addr.fullName}
            <br />
            {addr.street}
            <br />
            {addr.city}
            {addr.state && `, ${addr.state}`} {addr.postalCode}
            <br />
            {addr.country}
            <br />
            {addr.phone}
          </p>
        </div>

        <div>
          <h2 className="font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Payment
          </h2>
          <div className="text-sm text-neutral-600 space-y-1">
            <p>Method: {order.paymentMethod}</p>
            <p>Status: {order.isPaid ? "Paid" : "Not paid"}</p>
            <div className="flex justify-between pt-2 mt-2 border-t border-[var(--color-line)]">
              <span>Items</span>
              <span>₹{order.itemsTotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{order.shippingFee === 0 ? "Free" : `₹${order.shippingFee}`}</span>
            </div>
            <div className="flex justify-between font-semibold" style={{ color: "var(--color-ink)" }}>
              <span>Total</span>
              <span>₹{order.totalPrice}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex gap-4">
        <Link to="/products" className="text-sm underline" style={{ color: "var(--color-clay)" }}>
          Continue shopping
        </Link>
        <Link to="/profile" className="text-sm underline" style={{ color: "var(--color-clay)" }}>
          View all orders
        </Link>
      </div>
    </div>
  );
}