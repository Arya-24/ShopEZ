import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import ProductForm from "./ProductForm";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load this product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      await api.put(`/products/${id}`, payload);
      navigate("/admin/products");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="max-w-2xl mx-auto px-4 py-10 text-neutral-500">Loading...</p>;
  if (error) return <p className="max-w-2xl mx-auto px-4 py-10 text-red-600">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8" style={{ color: "var(--color-ink)" }}>
        Edit product
      </h1>
      <ProductForm
        initialValues={product}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Save changes"
      />
    </div>
  );
}