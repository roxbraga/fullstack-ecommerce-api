const Cart = require("../models/Cart");
const Order = require("../models/Order");

// Checkout - create an order from cart
module.exports.checkout = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ userId }).populate("cartItems.productId");

        if (!cart || cart.cartItems.length === 0) {
            return res.status(400).json({ message: "No items in cart to checkout" });
        }

        const newOrder = new Order({
            userId,
            products: cart.cartItems.map(item => ({
                productId: item.productId._id,
                quantity: item.quantity,
                subtotal: item.subtotal
            })),
            totalPrice: cart.totalPrice
        });

        const savedOrder = await newOrder.save();

        // Clear the cart after checkout
        cart.cartItems = [];
        cart.totalPrice = 0;
        await cart.save();

        return res.status(201).json({
            message: "Order placed successfully",
            order: savedOrder
        });

    } catch (error) {
        console.error("Checkout Error:", error);
        return res.status(500).json({ message: "Failed to checkout", error: error.message });
    }
};

// Get orders for logged-in user
module.exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ userId }).populate("products.productId");

        return res.status(200).json({ orders });

    } catch (error) {
        console.error("Get My Orders Error:", error);
        return res.status(500).json({ message: "Failed to fetch orders", error: error.message });
    }
};

// Get all orders (Admin only)
module.exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate("products.productId").populate("userId", "firstName lastName email");

        return res.status(200).json({ orders });

    } catch (error) {
        console.error("Get All Orders Error:", error);
        return res.status(500).json({ message: "Failed to fetch all orders", error: error.message });
    }
};
