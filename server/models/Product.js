import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    size: {
      type: String, // e.g. "S", "M", "L", "42", or "N/A" if not applicable
      default: "N/A",
    },
    color: {
      type: String, // e.g. "Red", "Black", or "N/A" if not applicable
      default: "N/A",
    },
    sku: {
      type: String, // unique code for this specific variant, useful for inventory
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    priceOverride: {
      type: Number, // optional: if this variant costs more/less than the base price
      min: 0,
    },
  },
  { _id: true } // keep the auto _id so cart/order items can reference a specific variant
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex", "Kids"],
      default: "Unisex",
    },
    basePrice: {
      type: Number,
      required: [true, "Base price is required"],
      min: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    images: {
      type: [String], // array of image URLs
      default: [],
    },
    variants: {
      type: [variantSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "A product must have at least one variant",
      },
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Virtual: total stock across all variants (handy for "in stock" checks/listing)
productSchema.virtual("totalStock").get(function () {
  return this.variants.reduce((sum, v) => sum + v.stock, 0);
});
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

const Product = mongoose.model("Product", productSchema);
export default Product;