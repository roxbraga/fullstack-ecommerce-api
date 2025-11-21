const Product = require("../models/Product");

module.exports.addProduct = async (req, res) => {
    try {
        const newProduct = new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price
        });

        const product = await newProduct.save();
        return res.status(201).json({ product });
    } catch (error) {
        return res.status(500).json({ message: "Failed to add product", error: error.message });
    }
};

module.exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ message: "Failed to retrieve products", error: error.message });
    }
};

module.exports.getAllActiveProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true });
        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ message: "Failed to retrieve active products", error: error.message });
    }
};

module.exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json(product);
    } catch (error) {
        return res.status(500).json({ message: "Failed to retrieve product", error: error.message });
    }
};

// Update product
module.exports.updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.productId,
            req.body,
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({
            message: "Product updated",
            product: updatedProduct
        });

    } catch (error) {
        return res.status(500).json({ message: "Update failed", error: error.message });
    }
};

// Archive product
module.exports.archiveProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);

        if (!product) return res.status(404).json({ message: "Product not found" });
        if (product.isActive === false) {
            return res.status(200).json({
                message: "Product already archived",
                product
            });
        }

        product.isActive = false;
        await product.save();

        return res.status(200).json({
            message: "Product archived",
            product
        });

    } catch (error) {
        return res.status(500).json({ message: "Archive failed", error: error.message });
    }
};

// Activate product
module.exports.activateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);

        if (!product) return res.status(404).json({ message: "Product not found" });
        if (product.isActive === true) {
            return res.status(200).json({
                message: "Product already active",
                product
            });
        }

        product.isActive = true;
        await product.save();

        return res.status(200).json({
            message: "Product activated",
            product
        });

    } catch (error) {
        return res.status(500).json({ message: "Activate failed", error: error.message });
    }
};


// SEARCH: Name
module.exports.searchByName = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";

        const products = await Product.find({
            name: { $regex: keyword, $options: "i" }
        });

        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ message: "Search failed", error: error.message });
    }
};

// SEARCH: Price Range
module.exports.searchByPriceRange = async (req, res) => {
    try {
        const min = Number(req.query.min) || 0;
        const max = Number(req.query.max) || 999999;

        const products = await Product.find({
            price: { $gte: min, $lte: max }
        });

        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ message: "Search failed", error: error.message });
    }
};
