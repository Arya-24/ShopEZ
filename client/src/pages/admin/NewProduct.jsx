import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import ProductForm from "./ProductForm";

export default function NewProduct() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      await api.post("/products", payload);
      navigate("/admin/products");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8" style={{ color: "var(--color-ink)" }}>
        Add a new product
      </h1>
      <ProductForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Create product" />
    </div>
  );
}