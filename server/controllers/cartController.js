import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Helper: finds a specific variant sub-document on a product and checks stock
const findVariantOrThrow = async (productId, variantId, requestedQty) => {
  const product = await Product.findById(productId);
  if (!product) {
    const err = new Error("Product not found");
    err.status = 404;
    throw err;
  }

  const variant = product.variants.id(variantId);
  if (!variant) {
    const err = new Error("Product variant not found");
    err.status = 404;
    throw err;
  }

  if (variant.stock < requestedQty) {
    const err = new Error(`Only ${variant.stock} in stock for this variant`);
    err.status = 400;
    throw err;
  }

  return { product, variant };
};

// @route  GET /api/cart
// @access Private
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name images basePrice variants"
    );

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json(cart);
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/cart
// @body   { productId, variantId, quantity }
// @access Private
export const addToCart = async (req, res, next) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;

    if (!productId || !variantId) {
      return res.status(400).json({ message: "productId and variantId are required" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId && item.variantId.toString() === variantId
    );
    const newQuantity = (existingItem?.quantity || 0) + Number(quantity);

    // Validates product/variant exist and there's enough stock for the combined quantity
    await findVariantOrThrow(productId, variantId, newQuantity);

    if (existingItem) {
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({ product: productId, variantId, quantity: Number(quantity) });
    }

    await cart.save();
    const populated = await cart.populate("items.product", "name images basePrice variants");
    res.status(201).json(populated);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    next(error);
  }
};

// @route  PUT /api/cart
// @body   { productId, variantId, quantity }
// @access Private
export const updateCartItem = async (req, res, next) => {
  try {
    const { productId, variantId, quantity } = req.body;

    if (!productId || !variantId || quantity == null) {
      return res.status(400).json({ message: "productId, variantId, and quantity are required" });
    }
    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1 — use the remove endpoint to delete an item" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId && item.variantId.toString() === variantId
    );
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    await findVariantOrThrow(productId, variantId, quantity);

    item.quantity = Number(quantity);
    await cart.save();
    const populated = await cart.populate("items.product", "name images basePrice variants");
    res.json(populated);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    next(error);
  }
};

// @route  DELETE /api/cart/:productId/:variantId
// @access Private
export const removeCartItem = async (req, res, next) => {
  try {
    const { productId, variantId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => !(item.product.toString() === productId && item.variantId.toString() === variantId)
    );

    await cart.save();
    const populated = await cart.populate("items.product", "name images basePrice variants");
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/cart
// @access Private
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: "Cart cleared" });
  } catch (error) {
    next(error);
  }
};