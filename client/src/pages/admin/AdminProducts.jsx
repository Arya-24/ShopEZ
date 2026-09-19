import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/products", { params: { limit: 100 } });
      setProducts(data.products);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    setDeletingId(product._id);
    try {
      await api.delete(`/products/${product._id}`);
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete product");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--color-ink)" }}>
          All products
        </h1>
        <Link
          to="/admin/products/new"
          className="px-4 py-2 rounded-md text-white text-sm font-medium"
          style={{ backgroundColor: "var(--color-clay)" }}
        >
          + Add product
        </Link>
      </div>

      {loading && <p className="text-neutral-500">Loading...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {!loading && (
        <div className="border border-[var(--color-line)] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-t border-[var(--color-line)]">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                      {product.images?.[0] && (
                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <span style={{ color: "var(--color-ink)" }}>{product.name}</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{product.category}</td>
                  <td className="px-4 py-3 text-neutral-600">₹{product.basePrice}</td>
                  <td className="px-4 py-3 text-neutral-600">{product.totalStock}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/products/${product._id}/edit`}
                      className="text-sm underline mr-4"
                      style={{ color: "var(--color-clay)" }}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product)}
                      disabled={deletingId === product._id}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50"
                    >
                      {deletingId === product._id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p className="text-neutral-500 px-4 py-6">No products yet.</p>}
        </div>
      )}
    </div>
  );
}