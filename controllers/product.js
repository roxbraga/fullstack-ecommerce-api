const Product = require("../models/Product");
const { errorHandler } = require('../auth');
const auth = require("../auth");


	//  Creating Product
module.exports.addProduct = (req, res) => {
    const newProduct = new Product({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    });

    Product.findOne({ name: req.body.name })
        .then(existingProduct => {
            if (existingProduct) {
                return res.status(409).send({ message: "Product already exists" });
            }

            return newProduct.save()
                .then(result => res.status(201).send({
                    success: true,
                    product: result
                }))
                .catch(error => errorHandler(error, req, res));
        })
        .catch(error => errorHandler(error, req, res));
};

	// Retrive all products
module.exports.getAllProducts = (req, res) => {

    return Product.find({})
    .then(result => {

        if(result.length > 0) {

            return res.status(200).send(result);

        } else {

            return res.status(403).send({
            	auth: "Failed",
            	message : "Action Forbidden"
            });
        }
    })
    .catch(error => errorHandler(error, req, res));

};

	// Retrieve All active products
module.exports.getAllActiveProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true }).lean();

        // Always return an array
        return res.status(200).json(products);

    } catch (error) {
        return errorHandler(error, req, res);
    }
};


	// Retrive single product

module.exports.getProduct = (req, res) => {
    Product.findById(req.params.productId)
        .then(product => {
            if (product) return res.status(200).send(product);
            return res.status(404).send(false);
        })
        .catch(error => errorHandler(error, req, res));
};

	// Update Products info
module.exports.updateProduct = (req, res)=>{

    let updatedProduct = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    }
    return Product.findByIdAndUpdate(req.params.productId, updatedProduct)
    .then(product => {
        if (product) {

            res.status(200).send({
            	success: true,
            	message: "Product updated successfully"
            });

        } else {

            res.status(404).send({
            	error: "Product not found"
            });

        }
    })
    .catch(error => errorHandler(error, req, res));
};

	// Archive Products

module.exports.archiveProduct = (req, res) => {
    return Product.findById(req.params.productId)
        .then(product => {
            if (!product) return res.status(404).send({ error: "Product not found" });

            if (!product.isActive) {
                return res.status(200).send({
                    message: "Product already archived",
                    product: product
                });
            }

            product.isActive = false;
            return product.save().then(() => {
                return res.status(200).send({
                    success: true,
                    message: "Product archived successfully",
                    product
                });
            });
        })
        .catch(error => errorHandler(error, req, res));
};


	// Activate Product
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

module.exports.searchByName = async (req, res) => {
    try {
        const keyword = req.body.name || "";
        const results = await Product.find({ name: { $regex: keyword, $options: "i" } });
        return res.status(200).json({ success: true, results });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

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
};