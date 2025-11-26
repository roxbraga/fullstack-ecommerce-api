const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Get user cart
module.exports.getUserCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.id }).populate("cartItems.productId");

        if (!cart) {
            return res.status(200).json({ cartItems: [], totalPrice: 0 });
        }

        return res.status(200).json(cart);
    } catch (error) {
        return res.status(500).json({ message: "Failed to get cart", error: error.message });
    }
};

// Add to cart
module.exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        let cart = await Cart.findOne({ userId });
        if (!cart) cart = new Cart({ userId, cartItems: [], totalPrice: 0 });

        const item = cart.cartItems.find(i => i.productId.toString() === productId);

        if (item) {
            item.quantity += quantity;
            item.subtotal = item.quantity * product.price;
        } else {
            cart.cartItems.push({
                productId,
                quantity,
                subtotal: quantity * product.price
            });
        }

        cart.totalPrice = cart.cartItems.reduce((sum, i) => sum + i.subtotal, 0);
        await cart.save();

        return res.status(200).json({ message: "Item added to cart", cart });

    } catch (error) {
        return res.status(500).json({ message: "Failed to add to cart", error: error.message });
    }
};

// Update quantity
module.exports.updateCartQuantity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        let cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const item = cart.cartItems.find(i => i.productId.toString() === productId);
        if (!item) return res.status(404).json({ message: "Item not found" });

        const product = await Product.findById(productId);
        item.quantity = quantity;
        item.subtotal = quantity * product.price;

        cart.totalPrice = cart.cartItems.reduce((sum, i) => sum + i.subtotal, 0);
        await cart.save();

        return res.status(200).json({ message: "Quantity updated", cart });

    } catch (error) {
        return res.status(500).json({ message: "Failed to update quantity", error: error.message });
    }
};

// Remove item - PATCH /cart/:productId/remove-from-cart
module.exports.removeCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;

        let cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const itemExists = cart.cartItems.some(i => i.productId.toString() === productId);
        if (!itemExists) {
            return res.status(404).json({
                message: "Item not found in cart"
            });
        }

        cart.cartItems = cart.cartItems.filter(i => i.productId.toString() !== productId);

        cart.totalPrice = cart.cartItems.reduce((sum, i) => sum + i.subtotal, 0);
        await cart.save();

        return res.status(200).json({
            message: "Item removed from cart successfully",
            cart
        });

    } catch (error) {
        return res.status(500).json({ message: "Failed to remove item", error: error.message });
    }
};

// Clear entire cart - PUT /cart/clear-cart
module.exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        let cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.cartItems = [];
        cart.totalPrice = 0;
        await cart.save();

        return res.status(200).json({
            message: "Cart cleared successfully",
            cart
        });

    } catch (error) {
        return res.status(500).json({ message: "Failed to clear cart", error: error.message });
    }
};
