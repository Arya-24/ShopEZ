import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ProductReviews from "../components/ProductReviews";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addStatus, setAddStatus] = useState(null); // "adding" | "added" | error string

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
        // Pre-select the first available size/color combo
        const firstVariant = data.variants[0];
        if (firstVariant) {
          setSelectedSize(firstVariant.size);
          setSelectedColor(firstVariant.color);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Could not load this product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <p className="max-w-6xl mx-auto px-4 py-10 text-neutral-500">Loading...</p>;
  if (error) return <p className="max-w-6xl mx-auto px-4 py-10 text-red-600">{error}</p>;
  if (!product) return null;

  const sizes = [...new Set(product.variants.map((v) => v.size))];
  const colors = [...new Set(product.variants.map((v) => v.color))];

  const matchedVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );
  const rawPrice = matchedVariant?.priceOverride ?? product.basePrice;
  const hasDiscount = product.discountPercent > 0;
  const price = hasDiscount ? Math.round(rawPrice * (1 - product.discountPercent / 100)) : rawPrice;

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!matchedVariant) {
      setAddStatus("This size/color combination isn't available");
      return;
    }

    setAddStatus("adding");
    try {
      await api.post("/cart", {
        productId: product._id,
        variantId: matchedVariant._id,
        quantity,
      });
      setAddStatus("added");
    } catch (err) {
      setAddStatus(err.response?.data?.message || "Could not add to cart");
    }
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
      <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">No image</div>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--color-ink)" }}>
          {product.name}
        </h1>
        {product.numReviews > 0 && (
          <p className="text-sm text-amber-500 mt-1">
            {"★".repeat(Math.round(product.ratingAverage))}
            {"☆".repeat(5 - Math.round(product.ratingAverage))}{" "}
            <span className="text-neutral-500">
              {product.ratingAverage.toFixed(1)} ({product.numReviews})
            </span>
          </p>
        )}
        <div className="flex items-baseline gap-3 mt-2">
          <p className="text-lg text-neutral-800">₹{price}</p>
          {hasDiscount && (
            <>
              <p className="text-sm text-neutral-400 line-through">₹{rawPrice}</p>
              <span
                className="text-xs font-medium text-white px-2 py-0.5 rounded"
                style={{ backgroundColor: "var(--color-gold)" }}
              >
                -{product.discountPercent}%
              </span>
            </>
          )}
        </div>
        <p className="text-neutral-500 mt-4 max-w-md">{product.description}</p>

        {sizes.length > 0 && sizes[0] !== "N/A" && (
          <div className="mt-6">
            <p className="text-sm font-medium mb-2">Size</p>
            <div className="flex gap-2 flex-wrap">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1.5 rounded-md border text-sm ${
                    selectedSize === size
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-[var(--color-line)] text-neutral-700"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {colors.length > 0 && colors[0] !== "N/A" && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Color</p>
            <div className="flex gap-2 flex-wrap">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 py-1.5 rounded-md border text-sm ${
                    selectedColor === color
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-[var(--color-line)] text-neutral-700"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Quantity</p>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="w-20 border border-[var(--color-line)] rounded-md px-3 py-1.5 text-sm"
          />
        </div>

        {matchedVariant ? (
          <p className="text-sm text-neutral-500 mt-4">
            {matchedVariant.stock > 0 ? `${matchedVariant.stock} in stock` : "Out of stock"}
          </p>
        ) : (
          <p className="text-sm text-red-600 mt-4">This combination isn't available</p>
        )}

        <button
          onClick={handleAddToCart}
          disabled={!matchedVariant || matchedVariant.stock === 0 || addStatus === "adding"}
          className="mt-6 px-6 py-3 rounded-md text-white font-medium disabled:opacity-50"
          style={{ backgroundColor: "var(--color-clay)" }}
        >
          {addStatus === "adding" ? "Adding..." : "Add to cart"}
        </button>

        {addStatus === "added" && <p className="text-sm text-green-700 mt-2">Added to cart.</p>}
        {addStatus && addStatus !== "adding" && addStatus !== "added" && (
          <p className="text-sm text-red-600 mt-2">{addStatus}</p>
        )}
      </div>
      </div>

      <ProductReviews productId={product._id} ratingAverage={product.ratingAverage} numReviews={product.numReviews} />
    </div>
  );
}