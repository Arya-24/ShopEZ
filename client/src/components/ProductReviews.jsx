import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Stars({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          disabled={!onChange}
          className={`text-xl leading-none ${n <= value ? "text-amber-400" : "text-neutral-300"} ${
            onChange ? "cursor-pointer" : "cursor-default"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({ productId, ratingAverage, numReviews }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products/${productId}/reviews`);
      setReviews(data);
    } catch {
      // non-critical — reviews just won't show
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const userAlreadyReviewed = user && reviews.some((r) => r.user === user._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (rating === 0) {
      setError("Please select a star rating");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/products/${productId}/reviews`, { rating, comment });
      setRating(0);
      setComment("");
      fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm("Delete this review?")) return;
    try {
      await api.delete(`/products/${productId}/reviews/${reviewId}`);
      fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete review");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-semibold" style={{ color: "var(--color-ink)" }}>
          Reviews
        </h2>
        {numReviews > 0 && (
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Stars value={Math.round(ratingAverage)} />
            <span>
              {ratingAverage.toFixed(1)} ({numReviews} review{numReviews !== 1 && "s"})
            </span>
          </div>
        )}
      </div>

      {!userAlreadyReviewed && (
        <form onSubmit={handleSubmit} className="border border-[var(--color-line)] rounded-lg p-4 mb-8 max-w-lg">
          <p className="text-sm font-medium mb-2">Leave a review</p>
          <Stars value={rating} onChange={setRating} />
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you think of this product?"
            className="w-full border border-[var(--color-line)] rounded-md px-3 py-2 text-sm mt-3 focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": "var(--color-clay)" }}
          />
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 px-5 py-2 rounded-md text-white text-sm font-medium disabled:opacity-60"
            style={{ backgroundColor: "var(--color-clay)" }}
          >
            {submitting ? "Submitting..." : user ? "Submit review" : "Log in to review"}
          </button>
        </form>
      )}

      {loading && <p className="text-neutral-500 text-sm">Loading reviews...</p>}

      {!loading && reviews.length === 0 && (
        <p className="text-neutral-500 text-sm">No reviews yet — be the first to leave one.</p>
      )}

      <div className="space-y-4 max-w-2xl">
        {reviews.map((review) => (
          <div key={review._id} className="border-b border-[var(--color-line)] pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                  {review.userName}
                </p>
                <Stars value={review.rating} />
              </div>
              {user && (user._id === review.user || user.role === "admin") && (
                <button onClick={() => handleDelete(review._id)} className="text-xs text-red-600 hover:underline">
                  Delete
                </button>
              )}
            </div>
            <p className="text-sm text-neutral-600 mt-2">{review.comment}</p>
            <p className="text-xs text-neutral-400 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}