import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function AdminSettings() {
  const [banner, setBanner] = useState("");
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await api.get("/config");
        setBanner(data.banner || "");
        setCategories(data.categories || []);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const addCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    setCategories([...categories, trimmed]);
    setNewCategory("");
  };

  const removeCategory = (cat) => {
    setCategories(categories.filter((c) => c !== cat));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await api.put("/config", { banner, categories });
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="max-w-2xl mx-auto px-4 py-10 text-neutral-500">Loading...</p>;

  const inputClass =
    "w-full border border-[var(--color-line)] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2";
  const ringStyle = { "--tw-ring-color": "var(--color-clay)" };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8" style={{ color: "var(--color-ink)" }}>
        Site settings
      </h1>

      <div className="mb-8">
        <label className="block text-sm font-medium mb-1">Homepage banner image URL</label>
        <input
          value={banner}
          onChange={(e) => setBanner(e.target.value)}
          placeholder="https://example.com/banner.jpg"
          className={inputClass}
          style={ringStyle}
        />
        {banner && (
          <img src={banner} alt="Banner preview" className="mt-3 w-full h-40 object-cover rounded-md border border-[var(--color-line)]" />
        )}
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">Categories</label>
        <div className="flex gap-2 mb-3">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
            placeholder="e.g. T-Shirts"
            className={inputClass}
            style={ringStyle}
          />
          <button
            type="button"
            onClick={addCategory}
            className="px-4 py-2 rounded-md text-white text-sm font-medium whitespace-nowrap"
            style={{ backgroundColor: "var(--color-clay)" }}
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 text-sm"
            >
              {cat}
              <button onClick={() => removeCategory(cat)} className="text-neutral-500 hover:text-red-600">
                ×
              </button>
            </span>
          ))}
          {categories.length === 0 && <p className="text-sm text-neutral-500">No categories yet.</p>}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {saved && <p className="text-sm text-green-700 mb-4">Settings saved.</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-3 rounded-md text-white font-medium disabled:opacity-60"
        style={{ backgroundColor: "var(--color-clay)" }}
      >
        {saving ? "Saving..." : "Save settings"}
      </button>
    </div>
  );
}