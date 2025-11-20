const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { errorHandler } = require('../auth');

// Retrieve user cart
module.exports.getUserCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) throw { status: 404, message: "No cart found for this user", code: "CART_NOT_FOUND" };

        const updatedCartItems = [];
        for (let item of cart.cartItems) {
            const product = await Product.findById(item.productId);
            updatedCartItems.push({
                productId: item.productId,
                quantity: item.quantity,
                subtotal: item.subtotal,
                productDetails: product ? product : null
            });
        }

        return res.json({
            message: "Cart retrieved successfully",
            cart: {
                _id: cart._id,
                id: cart.id,
                userId: cart.userId,
                totalPrice: cart.totalPrice,
                cartItems: updatedCartItems
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

        const existingProduct = cart.cartItems.find(item => item.productId.toString() === productId);
        let message = "";

        if (existingProduct) {
            existingProduct.quantity += Number(quantity);
            existingProduct.subtotal = existingProduct.quantity * productData.price;
            message = "Item quantity updated successfully";
        } else {
            cart.cartItems.push({
                productId,
                quantity: Number(quantity),
                subtotal: Number(quantity) * productData.price
            });
            message = "Item added to cart successfully";
        }

        cart.totalPrice = cart.cartItems.reduce((acc, item) => acc + item.subtotal, 0);
        await cart.save();

        const updatedCartItems = [];
        for (let item of cart.cartItems) {
            const product = await Product.findById(item.productId);
            updatedCartItems.push({
                productId: item.productId,
                quantity: item.quantity,
                subtotal: item.subtotal,
                productDetails: product ? product : null
            });
        }

        return res.json({
            message,
            cart: {
                _id: cart._id,
                id: cart.id,
                userId: cart.userId,
                totalPrice: cart.totalPrice,
                cartItems: updatedCartItems
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

        const updatedCartItems = [];
        for (let i of cart.cartItems) {
            const prod = await Product.findById(i.productId);
            updatedCartItems.push({
                productId: i.productId,
                quantity: i.quantity,
                subtotal: i.subtotal,
                productDetails: prod ? prod : null
            });
        }

        return res.json({
            message: "Item quantity updated successfully",
            cart: {
                _id: cart._id,
                id: cart.id,
                userId: cart.userId,
                totalPrice: cart.totalPrice,
                cartItems: updatedCartItems
            }
        });

    } catch (err) {
        return errorHandler(err, req, res);
    }
};
