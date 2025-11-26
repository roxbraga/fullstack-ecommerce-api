const Cart = require("../models/Cart");
const Order = require("../models/Order");

module.exports.checkout = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ error: "No Items to Checkout" });
        }

        if (cart.cartItems.length === 0) {
            return res.status(400).json({ message: "No Items to Checkout" });
        }

        const newOrder = new Order({
            userId: userId,
            products: cart.cartItems,
            totalPrice: cart.totalPrice
        });

        const savedOrder = await newOrder.save();

        cart.cartItems = [];
        cart.totalPrice = 0;
        await cart.save();

        return res.status(201).json({
            message: "Ordered Successfully",
            order: savedOrder
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

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
