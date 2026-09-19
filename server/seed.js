// Run this once to populate your database with categories + sample products.
// Usage (from the server folder): node seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";
import SiteConfig from "./models/SiteConfig.js";

dotenv.config();

const categories = ["T-Shirts", "Shoes", "Dresses", "Accessories", "Jackets"];

// Using picsum.photos as placeholder images — swap these for real product photo URLs later.
const products = [
  {
    name: "Classic Cotton T-Shirt",
    description: "Soft, breathable everyday tee in a relaxed fit.",
    category: "T-Shirts",
    gender: "Unisex",
    basePrice: 499,
    discountPercent: 10,
    images: ["https://picsum.photos/seed/tshirt1/600/600"],
    variants: [
      { size: "S", color: "Black", stock: 20 },
      { size: "M", color: "Black", stock: 15 },
      { size: "L", color: "Black", stock: 10 },
      { size: "M", color: "White", stock: 12 },
      { size: "L", color: "White", stock: 8 },
    ],
  },
  {
    name: "Graphic Print Tee",
    description: "Bold graphic print on premium combed cotton.",
    category: "T-Shirts",
    gender: "Men",
    basePrice: 699,
    images: ["https://picsum.photos/seed/tshirt2/600/600"],
    variants: [
      { size: "M", color: "Navy", stock: 10 },
      { size: "L", color: "Navy", stock: 10 },
      { size: "XL", color: "Navy", stock: 5 },
    ],
  },
  {
    name: "Running Sneakers",
    description: "Lightweight sneakers with cushioned soles for daily runs.",
    category: "Shoes",
    gender: "Unisex",
    basePrice: 2499,
    discountPercent: 15,
    images: ["https://picsum.photos/seed/shoe1/600/600"],
    variants: [
      { size: "7", color: "White", stock: 8 },
      { size: "8", color: "White", stock: 10 },
      { size: "9", color: "White", stock: 10 },
      { size: "8", color: "Black", stock: 6 },
      { size: "9", color: "Black", stock: 6 },
    ],
  },
  {
    name: "Canvas Slip-Ons",
    description: "Easy slip-on canvas shoes for everyday wear.",
    category: "Shoes",
    gender: "Women",
    basePrice: 1499,
    images: ["https://picsum.photos/seed/shoe2/600/600"],
    variants: [
      { size: "6", color: "Beige", stock: 7 },
      { size: "7", color: "Beige", stock: 9 },
      { size: "8", color: "Beige", stock: 5 },
    ],
  },
  {
    name: "Floral Summer Dress",
    description: "Light, flowy floral dress perfect for warm days.",
    category: "Dresses",
    gender: "Women",
    basePrice: 1899,
    discountPercent: 20,
    images: ["https://picsum.photos/seed/dress1/600/600"],
    variants: [
      { size: "S", color: "Yellow", stock: 6 },
      { size: "M", color: "Yellow", stock: 8 },
      { size: "L", color: "Yellow", stock: 4 },
    ],
  },
  {
    name: "Denim Jacket",
    description: "Classic denim jacket with a slightly oversized fit.",
    category: "Jackets",
    gender: "Unisex",
    basePrice: 2199,
    images: ["https://picsum.photos/seed/jacket1/600/600"],
    variants: [
      { size: "M", color: "Blue", stock: 8 },
      { size: "L", color: "Blue", stock: 8 },
      { size: "XL", color: "Blue", stock: 4 },
    ],
  },
  {
    name: "Leather Belt",
    description: "Genuine leather belt with a brushed metal buckle.",
    category: "Accessories",
    gender: "Men",
    basePrice: 899,
    images: ["https://picsum.photos/seed/belt1/600/600"],
    variants: [
      { size: "32", color: "Brown", stock: 10 },
      { size: "34", color: "Brown", stock: 10 },
      { size: "36", color: "Brown", stock: 6 },
    ],
  },
  {
    name: "Canvas Tote Bag",
    description: "Durable canvas tote, roomy enough for daily essentials.",
    category: "Accessories",
    gender: "Unisex",
    basePrice: 599,
    images: ["https://picsum.photos/seed/bag1/600/600"],
    variants: [{ size: "N/A", color: "Natural", stock: 25 }],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Upsert categories into the singleton site config, merging with any existing ones
    const config = await SiteConfig.getSingleton();
    const merged = [...new Set([...config.categories, ...categories])];
    config.categories = merged;
    await config.save();
    console.log(`Categories set: ${merged.join(", ")}`);

    // Insert products (skipping ones that already exist by name, so this is safe to re-run)
    let inserted = 0;
    for (const p of products) {
      const exists = await Product.findOne({ name: p.name });
      if (exists) continue;
      await Product.create(p);
      inserted++;
    }
    console.log(`Inserted ${inserted} new product(s) (${products.length - inserted} already existed)`);

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seed();