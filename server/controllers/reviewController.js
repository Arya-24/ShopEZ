import Review from "../models/Review.js";
import Product from "../models/Product.js";

// Recalculates and saves a product's ratingAverage and numReviews from its reviews
const syncProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const numReviews = reviews.length;
  const ratingAverage = numReviews === 0 ? 0 : reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews;

  await Product.findByIdAndUpdate(productId, {
    numReviews,
    ratingAverage: Math.round(ratingAverage * 10) / 10, // round to 1 decimal
  });
};

// @route  GET /api/products/:id/reviews
// @access Public
export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/products/:id/reviews
// @body   { rating, comment }
// @access Private
export const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: "rating and comment are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "rating must be between 1 and 5" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const alreadyReviewed = await Review.findOne({ product: req.params.id, user: req.user._id });
    if (alreadyReviewed) {
      return res.status(400).json({ message: "You've already reviewed this product" });
    }

    const review = await Review.create({
      product: req.params.id,
      user: req.user._id,
      userName: req.user.name,
      rating,
      comment,
    });

    await syncProductRating(req.params.id);

    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You've already reviewed this product" });
    }
    next(error);
  }
};

// @route  DELETE /api/products/:id/reviews/:reviewId
// @access Private (review owner or admin)
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const isOwner = review.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await review.deleteOne();
    await syncProductRating(req.params.id);

    res.json({ message: "Review deleted" });
  } catch (error) {
    next(error);
  }
};