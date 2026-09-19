import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const emptyAddress = {
  fullName: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  phone: "",
};

export default function Checkout() {
  const navigate = useNavigate();
  const [address, setAddress] = useState(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [cart, setCart] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { data } = await api.get("/cart");
        setCart(data);
        if (data.items.length === 0) navigate("/cart");
      } catch {
        setError("Could not load your cart");
      }
    };
    fetchCart();
  }, [navigate]);

  const handleChange = (field) => (e) => setAddress({ ...address, [field]: e.target.value });

  const getVariant = (item) => item.product?.variants?.find((v) => v._id === item.variantId);

  const itemsTotal = (cart?.items || []).reduce((sum, item) => {
    const variant = getVariant(item);
    const raw = variant?.priceOverride ?? item.product?.basePrice ?? 0;
    const discount = item.product?.discountPercent || 0;
    const price = discount > 0 ? Math.round(raw * (1 - discount / 100)) : raw;
    return sum + price * item.quantity;
  }, 0);
  const shippingFee = itemsTotal >= 999 ? 0 : 49;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPlacing(true);
    setError(null);
    try {
      const { data } = await api.post("/orders", { shippingAddress: address, paymentMethod });
      navigate(`/orders/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not place your order");
      setPlacing(false);
    }
  };

  const inputClass =
    "w-full border border-[var(--color-line)] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2";
  const ringStyle = { "--tw-ring-color": "var(--color-clay)" };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 grid md:grid-cols-[1fr_280px] gap-10">
      <div>
        <h1 className="text-2xl font-semibold mb-6" style={{ color: "var(--color-ink)" }}>
          Checkout
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Full name</label>
            <input required value={address.fullName} onChange={handleChange("fullName")} className={inputClass} style={ringStyle} />
          </div>

          <div>
            <label className="block text-sm mb-1">Street address</label>
            <input required value={address.street} onChange={handleChange("street")} className={inputClass} style={ringStyle} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">City</label>
              <input required value={address.city} onChange={handleChange("city")} className={inputClass} style={ringStyle} />
            </div>
            <div>
              <label className="block text-sm mb-1">State</label>
              <input value={address.state} onChange={handleChange("state")} className={inputClass} style={ringStyle} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Postal code</label>
              <input required value={address.postalCode} onChange={handleChange("postalCode")} className={inputClass} style={ringStyle} />
            </div>
            <div>
              <label className="block text-sm mb-1">Country</label>
              <input required value={address.country} onChange={handleChange("country")} className={inputClass} style={ringStyle} />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Phone</label>
            <input required value={address.phone} onChange={handleChange("phone")} className={inputClass} style={ringStyle} />
          </div>

          <div className="pt-2">
            <p className="text-sm font-medium mb-2">Payment method</p>
            <div className="space-y-2">
              {["COD", "Card", "UPI"].map((method) => (
                <label key={method} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  {method === "COD" ? "Cash on delivery" : method}
                </label>
              ))}
            </div>
            {paymentMethod !== "COD" && (
              <p className="text-xs text-neutral-500 mt-2">
                Online payment isn't wired up yet — this will record the order as unpaid for now.
              </p>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={placing}
            className="w-full rounded-md py-3 text-white font-medium disabled:opacity-60"
            style={{ backgroundColor: "var(--color-clay)" }}
          >
            {placing ? "Placing order..." : "Place order"}
          </button>
        </form>
      </div>

      <aside className="border border-[var(--color-line)] rounded-lg p-5 h-fit">
        <h2 className="font-medium mb-4" style={{ color: "var(--color-ink)" }}>
          Order summary
        </h2>
        <div className="space-y-2 text-sm text-neutral-600">
          <div className="flex justify-between">
            <span>Items</span>
            <span>₹{itemsTotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shippingFee === 0 ? "Free" : `₹${shippingFee}`}</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t border-[var(--color-line)]" style={{ color: "var(--color-ink)" }}>
            <span>Total</span>
            <span>₹{itemsTotal + shippingFee}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}