const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { errorHandler } = require('../auth');

// Helper function: populate cart items with product details using one DB query
const populateCartItems = async (cartItems) => {
    if (!cartItems || cartItems.length === 0) return [];

    const productIds = cartItems.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = Object.fromEntries(products.map(p => [p._id.toString(), p]));

    return cartItems.map(item => ({
        _id: item._id,
        productId: item.productId,
        quantity: item.quantity,
        subtotal: item.subtotal,
        productDetails: productMap[item.productId.toString()] || null
    }));
};

// Get user cart
module.exports.getUserCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            // Return empty cart if user has no cart
            cart = { cartItems: [], totalPrice: 0, _id: null, userId: req.user.id };
        }

        const updatedCartItems = await populateCartItems(cart.cartItems);

        return res.json({
            message: "Cart retrieved successfully",
            cart: {
                _id: cart._id,
                id: cart.id,
                userId: cart.userId,
                totalPrice: cart.totalPrice,
                cartItems: updatedCartItems,
            }
        });
    } catch (err) {
        return errorHandler(err, req, res);
    }
};

// Add to cart
module.exports.addToCart = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        const productData = await Product.findById(productId);
        if (!productData) throw { status: 404, message: "Product not found", code: "PRODUCT_NOT_FOUND" };

        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) cart = new Cart({ userId: req.user.id, cartItems: [] });

        const existingItem = cart.cartItems.find(i => i.productId.toString() === productId);
        let message = "";

        if (existingItem) {
            existingItem.quantity += Number(quantity);
            existingItem.subtotal = existingItem.quantity * productData.price;
            message = "Item quantity updated successfully";
        } else {
            cart.cartItems.push({
                productId,
                quantity: Number(quantity),
                subtotal: Number(quantity) * productData.price
            });
            message = "Item added to cart successfully";
        }

        cart.totalPrice = cart.cartItems.reduce((acc, i) => acc + i.subtotal, 0);
        await cart.save();

        const updatedCartItems = await populateCartItems(cart.cartItems);

        return res.json({
            message,
            updated: true,
            cart: {
                _id: cart._id,
                id: cart.id,
                userId: cart.userId,
                totalPrice: cart.totalPrice,
                cartItems: updatedCartItems,
            }
        });

    } catch (err) {
        return errorHandler(err, req, res);
    }
};

// Update cart quantity
module.exports.updateCartQuantity = async (req, res) => {
    const { productId, newQuantity } = req.body;

    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) throw { status: 404, message: "Cart not found", code: "CART_NOT_FOUND" };

        const item = cart.cartItems.find(i => i.productId.toString() === productId);
        if (!item) throw { status: 404, message: "Product not in cart", code: "PRODUCT_NOT_IN_CART" };

        const productData = await Product.findById(productId);
        if (!productData) throw { status: 404, message: "Product not found", code: "PRODUCT_NOT_FOUND" };

        item.quantity = Number(newQuantity);
        item.subtotal = item.quantity * productData.price;

        cart.totalPrice = cart.cartItems.reduce((acc, i) => acc + i.subtotal, 0);
        await cart.save();

        const updatedCartItems = await populateCartItems(cart.cartItems);

        return res.json({
            message: "Item quantity updated successfully",
            updated: true,
            cart: {
                _id: cart._id,
                id: cart.id,
                userId: cart.userId,
                totalPrice: cart.totalPrice,
                cartItems: updatedCartItems,
            }
        });

    } catch (err) {
        return errorHandler(err, req, res);
    }
};
