import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// @route  POST /api/orders
// @body   { shippingAddress, paymentMethod }
// @access Private
// Builds the order from the user's current cart, decrements variant stock,
// then clears the cart. All stock checks happen again here (cart may be stale).
export const placeOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: "shippingAddress and paymentMethod are required" });
    }
    const requiredAddressFields = ["fullName", "street", "city", "postalCode", "country", "phone"];
    for (const field of requiredAddressFields) {
      if (!shippingAddress[field]) {
        return res.status(400).json({ message: `shippingAddress.${field} is required` });
      }
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const orderItems = [];
    let itemsTotal = 0;

    // Validate stock and build snapshotted order items before touching the DB
    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.product);
      if (!product) {
        return res.status(404).json({ message: "A product in your cart no longer exists" });
      }

      const variant = product.variants.id(cartItem.variantId);
      if (!variant) {
        return res.status(404).json({ message: `A variant of "${product.name}" no longer exists` });
      }

      if (variant.stock < cartItem.quantity) {
        return res.status(400).json({
          message: `Only ${variant.stock} left of "${product.name}" (${variant.size}/${variant.color})`,
        });
      }

      const rawPrice = variant.priceOverride ?? product.basePrice;
      const price = product.discountPercent > 0
        ? Math.round(rawPrice * (1 - product.discountPercent / 100))
        : rawPrice;
      itemsTotal += price * cartItem.quantity;

      orderItems.push({
        product: product._id,
        variantId: variant._id,
        name: product.name,
        image: product.images?.[0],
        size: variant.size,
        color: variant.color,
        price,
        quantity: cartItem.quantity,
      });
    }

    // All validated — now actually decrement stock
    for (const cartItem of cart.items) {
      await Product.updateOne(
        { _id: cartItem.product, "variants._id": cartItem.variantId },
        { $inc: { "variants.$.stock": -cartItem.quantity } }
      );
    }

    const shippingFee = itemsTotal >= 999 ? 0 : 49; // flat example rule — adjust as needed
    const totalPrice = itemsTotal + shippingFee;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsTotal,
      shippingFee,
      totalPrice,
    });

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/orders/my
// @access Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @route  GET /api/orders/:id
// @access Private (owner or admin)
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isOwner = order.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Order not found" });
    }
    next(error);
  }
};

// @route  GET /api/orders
// @access Private/Admin
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).populate("user", "name email").skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      Order.countDocuments(filter),
    ]);

    res.json({ orders, page: Number(page), totalPages: Math.ceil(total / Number(limit)), totalOrders: total });
  } catch (error) {
    next(error);
  }
};

// @route  PUT /api/orders/:id/status
// @body   { status }
// @access Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${validStatuses.join(", ")}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    if (status === "delivered" && !order.isPaid && order.paymentMethod !== "COD") {
      order.isPaid = true;
      order.paidAt = new Date();
    }

    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Order not found" });
    }
    next(error);
  }
};