const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Get user cart
module.exports.getUserCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.id }).populate("cartItems.productId");

        if (!cart) {
            return res.status(200).json({ cartItems: [], totalPrice: 0 });
        }

        return res.status(200).json({
            cartItems: cart.cartItems,
            totalPrice: cart.totalPrice
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to get cart", error: error.message });
    }
};

// Add to cart
module.exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        const qty = parseInt(quantity);
        if (!productId || isNaN(qty) || qty <= 0) {
            return res.status(400).json({ message: "Invalid product or quantity" });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        let cart = await Cart.findOne({ userId });
        if (!cart) cart = new Cart({ userId, cartItems: [], totalPrice: 0 });

        const item = cart.cartItems.find(i => i.productId.toString() === productId);

        if (item) {
            item.quantity += qty;
            item.subtotal = item.quantity * product.price;
        } else {
            cart.cartItems.push({
                productId,
                quantity: qty,
                subtotal: qty * product.price
            });
        }

        cart.totalPrice = cart.cartItems.reduce((sum, i) => sum + i.subtotal, 0);
        await cart.save();

        return res.status(200).json({ message: "Item added to cart", cart: { cartItems: cart.cartItems, totalPrice: cart.totalPrice } });

    } catch (error) {
        return res.status(500).json({ message: "Failed to add to cart", error: error.message });
    }
};

// Update quantity
module.exports.updateCartQuantity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        const qty = parseInt(quantity);
        if (!productId || isNaN(qty) || qty < 0) {
            return res.status(400).json({ message: "Invalid product or quantity" });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const item = cart.cartItems.find(i => i.productId.toString() === productId);
        if (!item) return res.status(404).json({ message: "Item not found" });

        if (qty === 0) {
            cart.cartItems = cart.cartItems.filter(i => i.productId.toString() !== productId);
        } else {
            const product = await Product.findById(productId);
            item.quantity = qty;
            item.subtotal = qty * product.price;
        }

        cart.totalPrice = cart.cartItems.reduce((sum, i) => sum + i.subtotal, 0);
        await cart.save();

        return res.status(200).json({ message: "Cart updated", cart: { cartItems: cart.cartItems, totalPrice: cart.totalPrice } });

    } catch (error) {
        return res.status(500).json({ message: "Failed to update cart", error: error.message });
    }
};

// Remove item
module.exports.removeCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        let cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const itemExists = cart.cartItems.some(i => i.productId.toString() === productId);
        if (!itemExists) return res.status(404).json({ message: "Item not found in cart" });

        cart.cartItems = cart.cartItems.filter(i => i.productId.toString() !== productId);
        cart.totalPrice = cart.cartItems.reduce((sum, i) => sum + i.subtotal, 0);
        await cart.save();

        return res.status(200).json({ message: "Item removed from cart successfully", cart: { cartItems: cart.cartItems, totalPrice: cart.totalPrice } });

    } catch (error) {
        return res.status(500).json({ message: "Failed to remove item", error: error.message });
    }
};

// Clear entire cart
module.exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        let cart = await Cart.findOne({ userId });
        if (!cart) cart = new Cart({ userId, cartItems: [], totalPrice: 0 });

        cart.cartItems = [];
        cart.totalPrice = 0;
        await cart.save();

        return res.status(200).json({ message: "Cart cleared successfully", cart: { cartItems: [], totalPrice: 0 } });

    } catch (error) {
        return res.status(500).json({ message: "Failed to clear cart", error: error.message });
    }
};
