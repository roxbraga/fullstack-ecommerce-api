const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

// Checkout
module.exports.checkout = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({
        message: "No items selected for checkout"
      });
    }

    const products = [];
    let totalPrice = 0;

    // Validate products first
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          message: "Product is inactive"
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`
        });
      }

      const subtotal = product.price * item.quantity;

      products.push({
        productId: product._id,
        quantity: item.quantity,
        subtotal
      });

      totalPrice += subtotal;
    }

    // Update stock after validation
    for (const item of items) {
      const product = await Product.findById(item.productId);

      product.stock -= item.quantity;
      product.totalOrders =
        (product.totalOrders || 0) + item.quantity;

      // Automatically deactivate when out of stock
      if (product.stock === 0) {
        product.isActive = false;
      }

      await product.save();
    }

    // Create order
    const order = await Order.create({
      userId: req.user.id,
      products,
      totalPrice,
      status: "Pending"
    });

    // Remove checked-out products from cart
    const cart = await Cart.findOne({
      userId: req.user.id
    });

    if (cart) {
      const checkedOutIds = items.map(
        item => item.productId.toString()
      );

      cart.cartItems = cart.cartItems.filter(
        item =>
          !checkedOutIds.includes(
            item.productId.toString()
          )
      );

      cart.totalPrice = cart.cartItems.reduce(
        (sum, item) => sum + item.subtotal,
        0
      );

      await cart.save();
    }

    return res.status(201).json(order);

  } catch (error) {
    console.error("Checkout error:", error);

    return res.status(500).json({
      message: "Failed to create order",
      error: error.message
    });
  }
};


// Get logged-in user's orders
module.exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user.id
    })
      .populate(
        "products.productId",
        "name price image"
      )
      .sort({
        orderedOn: -1
      });

    return res.status(200).json(orders);

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message
    });
  }
};


// Get all orders
module.exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate(
        "userId",
        "name email"
      )
      .populate(
        "products.productId",
        "name price image"
      )
      .sort({
        orderedOn: -1
      });

    return res.status(200).json(orders);

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message
    });
  }
};


// Delete order
module.exports.deleteOrder = async (req, res) => {
  try {
    const order =
      await Order.findByIdAndDelete(
        req.params.id
      );

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete order",
      error: error.message
    });
  }
};


// Cancel order
module.exports.cancelOrder = async (req, res) => {
  try {
    const order =
      await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    if (
      order.status.toLowerCase() ===
      "cancelled"
    ) {
      return res.status(400).json({
        message: "Order already cancelled"
      });
    }

    // Restore product stock
    for (const item of order.products) {
      const product =
        await Product.findById(
          item.productId
        );

      if (product) {
        product.stock += item.quantity;

        product.isActive = true;

        await product.save();
      }
    }

    order.status = "Cancelled";

    await order.save();

    return res.status(200).json(order);

  } catch (error) {
    console.error(
      "Cancel order error:",
      error
    );

    return res.status(500).json({
      message: "Failed to cancel order",
      error: error.message
    });
  }
};


// Get draft orders
module.exports.getDraftOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await Order.find({
        status: "Draft"
      })
        .populate(
          "userId",
          "name email"
        )
        .populate(
          "products.productId",
          "name price image"
        )
        .sort({
          orderedOn: -1
        });

    return res.status(200).json(orders);

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch draft orders",
      error: error.message
    });
  }
};


// Update order status
module.exports.updateOrderStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    const order =
      await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        {
          new: true
        }
      )
        .populate(
          "userId",
          "name email"
        )
        .populate(
          "products.productId",
          "name price image"
        );

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    return res.status(200).json(order);

  } catch (error) {
    return res.status(500).json({
      message: "Failed to update order",
      error: error.message
    });
  }
};


// Get abandoned orders
module.exports.getAbandonedOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await Order.find({
        status: "Abandoned"
      })
        .populate(
          "userId",
          "name email"
        )
        .populate(
          "products.productId",
          "name price image"
        )
        .sort({
          orderedOn: -1
        });

    return res.status(200).json(orders);

  } catch (error) {
    return res.status(500).json({
      message:
        "Failed to fetch abandoned orders",
      error: error.message
    });
  }
};