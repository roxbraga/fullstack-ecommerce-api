// [SECTION] Dependencies and Modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { errorHandler } = require('./auth');

const userRoutes = require("./routes/user");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");
const productRoutes = require("./routes/product");


// [SECTION] Environment Setup
require('dotenv').config();


// [SECTION] Server Setup
const app = express();
app.use(express.json());

const corsOptions = {
    origin: ['http://localhost:8000'],
    credentials: true,
    optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));


//[SECTION] Database Connection
mongoose.connect(process.env.MONGODB_STRING);
mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'));

app.use("/users", userRoutes);
app.use("/cart", cartRoutes);
// app.use("/order", orderRoutes);
app.use("/products", productRoutes);
app.use(errorHandler);


// [SECTION] Server Gateway Response
if (require.main === module) {
    app.listen(process.env.PORT || 3000, () =>
        console.log(`API is online on port ${process.env.PORT || 3000}`)
    );

}
// Export for testing

module.exports = { app, mongoose };