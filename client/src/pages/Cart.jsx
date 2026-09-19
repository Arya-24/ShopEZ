import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/cart");
      setCart(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load your cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const getVariant = (item) => item.product?.variants?.find((v) => v._id === item.variantId);
  const getPrice = (item) => {
    const variant = getVariant(item);
    const raw = variant?.priceOverride ?? item.product?.basePrice ?? 0;
    const discount = item.product?.discountPercent || 0;
    return discount > 0 ? Math.round(raw * (1 - discount / 100)) : raw;
  };

  const updateQuantity = async (item, quantity) => {
    if (quantity < 1) return;
    try {
      const { data } = await api.put("/cart", {
        productId: item.product._id,
        variantId: item.variantId,
        quantity,
      });
      setCart(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not update quantity");
    }
  };

  const removeItem = async (item) => {
    try {
      const { data } = await api.delete(`/cart/${item.product._id}/${item.variantId}`);
      setCart(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not remove item");
    }
  };

  if (loading) return <p className="max-w-4xl mx-auto px-4 py-10 text-neutral-500">Loading your cart...</p>;
  if (error) return <p className="max-w-4xl mx-auto px-4 py-10 text-red-600">{error}</p>;

  const items = cart?.items || [];
  const total = items.reduce((sum, item) => sum + getPrice(item) * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-neutral-500 mb-4">Your cart is empty.</p>
        <Link to="/products" className="underline" style={{ color: "var(--color-clay)" }}>
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8" style={{ color: "var(--color-ink)" }}>
        Your cart
      </h1>

      <div className="space-y-4">
        {items.map((item) => {
          const variant = getVariant(item);
          const price = getPrice(item);
          const hasDiscount = item.product?.discountPercent > 0;

          return (
            <div
              key={`${item.product._id}-${item.variantId}`}
              className="flex gap-4 border border-[var(--color-line)] rounded-lg p-4"
            >
              <div className="w-20 h-20 bg-neutral-100 rounded-md overflow-hidden flex-shrink-0">
                {item.product?.images?.[0] && (
                  <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                )}
              </div>

              <div className="flex-1">
                <p className="font-medium" style={{ color: "var(--color-ink)" }}>
                  {item.product?.name}
                </p>
                {variant && (
                  <p className="text-sm text-neutral-500">
                    {variant.size !== "N/A" && `Size: ${variant.size}`}
                    {variant.size !== "N/A" && variant.color !== "N/A" && " · "}
                    {variant.color !== "N/A" && `Color: ${variant.color}`}
                  </p>
                )}
                <p className="text-sm text-neutral-700 mt-1">
                  ₹{price}
                  {hasDiscount && (
                    <span className="text-neutral-400 line-through ml-2">₹{item.product.basePrice}</span>
                  )}
                </p>

                <div className="flex items-center gap-3 mt-3">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item, Number(e.target.value))}
                    className="w-16 border border-[var(--color-line)] rounded-md px-2 py-1 text-sm"
                  />
                  <button onClick={() => removeItem(item)} className="text-sm text-red-600 hover:underline">
                    Remove
                  </button>
                </div>
              </div>

              <p className="font-medium" style={{ color: "var(--color-ink)" }}>
                ₹{price * item.quantity}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-[var(--color-line)] pt-6">
        <p className="text-lg font-semibold" style={{ color: "var(--color-ink)" }}>
          Total: ₹{total}
        </p>
        <button
          onClick={() => navigate("/checkout")}
          className="px-6 py-3 rounded-md text-white font-medium"
          style={{ backgroundColor: "var(--color-clay)" }}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}