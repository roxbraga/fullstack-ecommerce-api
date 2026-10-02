// [SECTION] Dependencies and Modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { errorHandler } = require("./auth");

const userRoutes = require("./routes/user");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");
const productRoutes = require("./routes/product");

// [SECTION] Environment Setup
require("dotenv").config();

// [SECTION] Server Setup
const app = express();

app.use(express.json());

// const corsOptions = {
//     origin: [
//         "https://fullstack-ecommerce-app-v41g.onrender.com"
//     ],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     optionsSuccessStatus: 204
// };
// app.use(cors(corsOptions));

// console.log("FRONTEND_URL >>>", process.env.FRONTEND_URL);

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))


// [SECTION] Database Connection
mongoose.connect(process.env.MONGODB_STRING);

mongoose.connection.once("open", () => {
    console.log("Now connected to MongoDB Atlas.");
});

app.get("/", (req, res) => {
    res.status(200).json({
        message: "API is working!"
    });
});

// [SECTION] Routes
app.use("/users", userRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/products", productRoutes);

// [SECTION] Error Handler
app.use(errorHandler);

// [SECTION] Server Gateway Response
if (require.main === module) {
    app.listen(process.env.PORT || 3000, () =>
        console.log(
            `API is online on port ${process.env.PORT || 3000}`
        )
    );
}

// Export for testing
module.exports = { app, mongoose };