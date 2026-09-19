import Product from "../models/Product.js";

// @route  GET /api/products
// @query  ?category=&search=&page=&limit=
// @access Public
export const getProducts = async (req, res, next) => {
  try {
    const { category, gender, search, page = 1, limit = 12 } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (gender) filter.gender = gender;
    if (search) filter.name = { $regex: search, $options: "i" };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalProducts: total,
    });
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/products/:id
// @access Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    // Malformed ObjectId throws a CastError — treat it as "not found" rather than a 500
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Product not found" });
    }
    next(error);
  }
};

// @route  POST /api/products
// @access Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, category, gender, basePrice, images, variants, discountPercent } = req.body;

    if (!name || !description || !category || basePrice == null || !variants?.length) {
      return res.status(400).json({
        message: "name, description, category, basePrice, and at least one variant are required",
      });
    }

    const product = await Product.create({
      name,
      description,
      category,
      gender,
      basePrice,
      images,
      variants,
      discountPercent,
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/products/:id
// @access Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatableFields = [
      "name",
      "description",
      "category",
      "gender",
      "basePrice",
      "images",
      "variants",
      "discountPercent",
    ];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Product not found" });
    }
    next(error);
  }
};

// @route  DELETE /api/products/:id
// @access Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Product not found" });
    }
    next(error);
  }
};