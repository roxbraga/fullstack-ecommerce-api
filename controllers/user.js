const User = require("../models/User");
const bcrypt = require("bcrypt");
const auth = require("../auth");
const { errorHandler } = require("../auth");

// REGISTER USER
module.exports.registerUser = async (req, res) => {
    try {
        const { email, password, mobileNo, firstName, lastName } = req.body;

        if (!email || !email.includes("@")) {
            return res.status(400).json({ error: "Invalid email" });
        }

        if (!mobileNo || mobileNo.length !== 11 || isNaN(mobileNo)) {
            return res.status(400).json({ error: "Mobile number invalid" });
        }

        if (!password || typeof password !== "string" || password.trim().length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "Email already registered" });
        }

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: bcrypt.hashSync(password, 10),
            isAdmin: false,
            mobileNo
        });

        const result = await newUser.save();

        return res.status(201).json({
            message: "Registered successfully",
            user: result
        });

    } catch (error) {
        return errorHandler(error, req, res);
    }
};

// LOGIN USER
module.exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !email.includes("@")) {
            return res.status(400).json({ error: "Invalid email" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "No account found with this email" });

        const isPasswordCorrect = bcrypt.compareSync(password, user.password);
        if (!isPasswordCorrect) return res.status(401).json({ error: "Email and password do not match" });

        return res.status(200).json({
            message: "Login successful",
            access: auth.createAccessToken(user)
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// GET USER PROFILE
module.exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });

        return res.status(200).json(user);
    } catch (error) {
        return errorHandler(error, req, res);
    }
};

// RESET PASSWORD
module.exports.updatePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { password: hashedPassword },
            { new: true }
        );

        if (!updatedUser) return res.status(404).json({ error: "User not found" });

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
};

// SET USER AS ADMIN
module.exports.setAsAdmin = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { isAdmin: true },
            { new: true }
        );

        if (!updatedUser) return res.status(404).json({ error: "User not found" });

        return res.status(200).json({
            message: "User promoted to admin",
            user: updatedUser
        });
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
};
