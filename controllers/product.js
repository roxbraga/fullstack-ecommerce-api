const Product = require("../models/Product");
const { errorHandler } = require('../auth');
const auth = require("../auth");

// ADMIN GUARD
function ensureAdmin(req, res) {
  if (!req.user || !req.user.isAdmin) {
    res.status(403).json({ message: 'Admin access only' });
    return false;
  }
  return true;
}

// Creating Product
module.exports.addProduct = async (req, res) => {
     if (!ensureAdmin(req, res)) return;

  try {
    const { name, description, price, category, image, stock, isActive } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        message: 'Name, price, and category are required'
      });
    }

    const product = new Product({
      name,
      description: description || '',
      price,
      category,
      image: image || '',
      stock: stock ?? 0,
      quantity: 0,
      isActive: isActive ?? true
    });

    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to create product',
      error: err.message
    });
  }
};


// Retrieve all products
module.exports.getAllProducts = async (req, res) => {
    if (!ensureAdmin(req, res)) return;

  try {
    //  ACTIVE ONLY
    const products = await Product.find({ isActive: true });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
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
    if (!ensureAdmin(req, res)) return;

  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      message: 'Product updated successfully',
      product
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to update product',
      error: err.message
    });
  }
};


// Archive Product
module.exports.archiveProduct = async (req, res) => {
     if (!ensureAdmin(req, res)) return;

  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      message: 'Product archived successfully',
      product
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to archive product',
      error: err.message
    });
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