const Cart = require("../models/Cart");
const Order = require("../models/Order");

module.exports.checkout = async (req, res) => {
    try {
    const { items, totalPrice } = req.body
    // items = [{ productId, quantity }]

    //  Validate + update products
    for (const item of items) {
      const product = await Product.findById(item.productId)

      if (!product) {
        return res.status(404).json({ message: 'Product not found' })
      }

      if (!product.isActive) {
        return res.status(400).json({ message: 'Product is inactive' })
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: 'Insufficient stock' })
      }

      // REACTIVE STOCK
      product.stock -= item.quantity

      // TOTAL ORDERS PER PRODUCT
      product.totalOrders = (product.totalOrders || 0) + item.quantity

      // Auto deactivate if out of stock
      if (product.stock === 0) {
        product.isActive = false
      }

      await product.save()
    }

    // CREATE ORDER
    const order = await Order.create({
      userId: req.user.id,
      items,
      totalPrice,
      status: 'pending'
    })

    res.status(201).json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to create order', error })
  }
}

module.exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ userId });
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({});
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete order' })
  }
}

module.exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order already cancelled' })
    }

    //  ROLLBACK STOCK
    for (const item of order.items) {
      const product = await Product.findById(item.productId)

      if (product) {
        product.stock += item.quantity
        product.isActive = true 
        await product.save()
      }
    }

    order.status = 'cancelled'
    await order.save()

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel order' })
  }
}

module.exports.getDraftOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'draft' })
      .populate('userId', 'name email')
      .populate('items.productId', 'name price')

    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch draft orders' })
  }
}

module.exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order' })
  }
}

module.exports.getAbandonedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'abandoned' })
      .populate('userId', 'name email')
      .populate('items.productId', 'name price')

    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch abandoned orders' })
  }
}