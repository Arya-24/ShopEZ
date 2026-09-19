import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { getProductReviews, addReview, deleteReview } from "../controllers/reviewController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);

router.get("/:id/reviews", getProductReviews);
router.post("/:id/reviews", protect, addReview);
router.delete("/:id/reviews/:reviewId", protect, deleteReview);

router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;