import { useEffect, useState } from "react";
import api from "../../api/axios";

const emptyVariant = { size: "", color: "", stock: 0, priceOverride: "" };
const GENDERS = ["Unisex", "Men", "Women", "Kids"];

export default function ProductForm({ initialValues, onSubmit, submitting, submitLabel }) {
  const [name, setName] = useState(initialValues?.name || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [category, setCategory] = useState(initialValues?.category || "");
  const [gender, setGender] = useState(initialValues?.gender || "Unisex");
  const [categories, setCategories] = useState([]);
  const [basePrice, setBasePrice] = useState(initialValues?.basePrice || "");
  const [discountPercent, setDiscountPercent] = useState(initialValues?.discountPercent || 0);
  const [imagesText, setImagesText] = useState((initialValues?.images || []).join("\n"));
  const [variants, setVariants] = useState(
    initialValues?.variants?.length
      ? initialValues.variants.map((v) => ({
          size: v.size === "N/A" ? "" : v.size,
          color: v.color === "N/A" ? "" : v.color,
          stock: v.stock,
          priceOverride: v.priceOverride ?? "",
        }))
      : [{ ...emptyVariant }]
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/config").then(({ data }) => setCategories(data.categories || []));
  }, []);

  const updateVariant = (index, field, value) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  const addVariant = () => setVariants((prev) => [...prev, { ...emptyVariant }]);
  const removeVariant = (index) => setVariants((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (variants.length === 0) {
      setError("At least one variant is required");
      return;
    }

    const payload = {
      name,
      description,
      category,
      gender,
      basePrice: Number(basePrice),
      discountPercent: Number(discountPercent) || 0,
      images: imagesText.split("\n").map((s) => s.trim()).filter(Boolean),
      variants: variants.map((v) => ({
        size: v.size || "N/A",
        color: v.color || "N/A",
        stock: Number(v.stock) || 0,
        ...(v.priceOverride !== "" && { priceOverride: Number(v.priceOverride) }),
      })),
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const inputClass =
    "w-full border border-[var(--color-line)] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2";
  const ringStyle = { "--tw-ring-color": "var(--color-clay)" };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div>
        <label className="block text-sm mb-1">Product name</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} style={ringStyle} />
      </div>

      <div>
        <label className="block text-sm mb-1">Description</label>
        <textarea
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
          style={ringStyle}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Category</label>
          {categories.length > 0 ? (
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
              style={ringStyle}
            >
              <option value="">Select a category...</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          ) : (
            <>
              <input required value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} style={ringStyle} />
              <p className="text-xs text-neutral-500 mt-1">
                No categories set up yet — add some under Admin → Settings for a dropdown here.
              </p>
            </>
          )}
        </div>
        <div>
          <label className="block text-sm mb-1">Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputClass} style={ringStyle}>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Base price (₹)</label>
        <input
          required
          type="number"
          min={0}
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
          className={inputClass}
          style={ringStyle}
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Discount % (optional)</label>
        <input
          type="number"
          min={0}
          max={100}
          value={discountPercent}
          onChange={(e) => setDiscountPercent(e.target.value)}
          className={inputClass}
          style={ringStyle}
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Image URLs (one per line)</label>
        <textarea
          rows={2}
          placeholder="https://example.com/image1.jpg"
          value={imagesText}
          onChange={(e) => setImagesText(e.target.value)}
          className={inputClass}
          style={ringStyle}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Variants</label>
          <button
            type="button"
            onClick={addVariant}
            className="text-sm underline"
            style={{ color: "var(--color-clay)" }}
          >
            + Add variant
          </button>
        </div>

        <div className="space-y-2">
          {variants.map((variant, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-center">
              <input
                placeholder="Size (e.g. M)"
                value={variant.size}
                onChange={(e) => updateVariant(i, "size", e.target.value)}
                className={inputClass}
                style={ringStyle}
              />
              <input
                placeholder="Color (e.g. Black)"
                value={variant.color}
                onChange={(e) => updateVariant(i, "color", e.target.value)}
                className={inputClass}
                style={ringStyle}
              />
              <input
                type="number"
                min={0}
                placeholder="Stock"
                value={variant.stock}
                onChange={(e) => updateVariant(i, "stock", e.target.value)}
                className={inputClass}
                style={ringStyle}
              />
              <input
                type="number"
                min={0}
                placeholder="Price override"
                value={variant.priceOverride}
                onChange={(e) => updateVariant(i, "priceOverride", e.target.value)}
                className={inputClass}
                style={ringStyle}
              />
              <button
                type="button"
                onClick={() => removeVariant(i)}
                disabled={variants.length === 1}
                className="text-red-600 text-sm disabled:opacity-30"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          Leave size or color blank for products without that option. Price override is optional — leave blank to use the base price.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-3 rounded-md text-white font-medium disabled:opacity-60"
        style={{ backgroundColor: "var(--color-clay)" }}
      >
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}