import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const inStock = product.totalStock > 0;
  const hasDiscount = product.discountPercent > 0;
  const finalPrice = hasDiscount
    ? Math.round(product.basePrice * (1 - product.discountPercent / 100))
    : product.basePrice;

  return (
    <Link to={`/products/${product._id}`} className="block group">
      <div className="relative aspect-square bg-neutral-100 overflow-hidden rounded-md">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">
            No image
          </div>
        )}
        {hasDiscount && (
          <span
            className="absolute top-2 left-2 text-xs font-medium text-white px-2 py-1 rounded"
            style={{ backgroundColor: "var(--color-gold)" }}
          >
            -{product.discountPercent}%
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-medium text-neutral-600">Out of stock</span>
          </div>
        )}
      </div>
      <div className="pt-3">
        <h3 className="text-sm truncate" style={{ color: "var(--color-ink)" }}>
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
            ₹{finalPrice}
          </span>
          {hasDiscount && <span className="text-xs text-neutral-400 line-through">₹{product.basePrice}</span>}
        </div>
      </div>
    </Link>
  );
}