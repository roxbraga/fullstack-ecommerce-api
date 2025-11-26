const Product = require("../models/Product");
const { errorHandler } = require('../auth');
const auth = require("../auth");


// Creating Product
module.exports.addProduct = async (req, res) => {
    try {
        const { name, description, price } = req.body;

        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            return res.status(409).send({ message: "Product already exists" });
        }

        const newProduct = new Product({
            name,
            description,
            price
        });

        const result = await newProduct.save();

        return res.status(201).send({
            success: true,
            product: result
        });

    } catch (error) {
        return errorHandler(error, req, res);
    }
};


// Retrieve all products
module.exports.getAllProducts = (req, res) => {
    Product.find({})
        .then(result => {
            return res.status(200).send(result); 
        })
        .catch(error => errorHandler(error, req, res));
};

// Retrieve all active products (already async)
module.exports.getAllActiveProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true }).lean();
        return res.status(200).json(products);
    } catch (error) {
        return errorHandler(error, req, res);
    }
}

// Retrieve single product
module.exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);

        if (product) return res.status(200).send(product);

        return res.status(404).send(false);

    } catch (error) {
        return errorHandler(error, req, res);
    }
};


// Update Product info
module.exports.updateProduct = async (req, res) => {
    try {
        const updatedProduct = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price
        };

        const product = await Product.findByIdAndUpdate(
            req.params.productId,
            updatedProduct
        );

        if (product) {
            return res.status(200).send({
                success: true,
                message: "Product updated successfully"
            });
        }

        return res.status(404).send({ error: "Product not found" });

    } catch (error) {
        return errorHandler(error, req, res);
    }
};


// Archive Product
module.exports.archiveProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(404).send({ error: "Product not found" });
        }

        if (!product.isActive) {
            return res.status(200).send({
                message: "Product already archived",
                product
            });
        }

        product.isActive = false;
        await product.save();

        return res.status(200).send({
            success: true,
            message: "Product archived successfully",
            product
        });

    } catch (error) {
        return errorHandler(error, req, res);
    }
};


// Activate Product (already async)
module.exports.activateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);

        if (!product) return res.status(404).send({ error: "Product not found" });

        if (product.isActive) {
            return res.status(200).send({
                success: true,
                message: "Product already active",
                product
            });
        }

        product.isActive = true;
        await product.save();

        return res.status(200).send({
            success: true,
            message: "Product activated successfully",
            product
        });

    } catch (error) {
        return errorHandler(error, req, res);
    }
};


// Search by name
module.exports.searchByName = async (req, res) => {
    try {
        const keyword = req.body.name || "";
        const results = await Product.find({
            name: { $regex: keyword, $options: "i" }
        });

        return res.status(200).json({ success: true, results });

    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};


// Search by price
module.exports.searchByPrice = async (req, res) => {
    try {
        const min = Number(req.body.minPrice) || 0;
        const max = Number(req.body.maxPrice) || 999999;

        const results = await Product.find({
            price: { $gte: min, $lte: max }
        });

        return res.status(200).json({ success: true, results });

    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}