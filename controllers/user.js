const User = require("../models/User");
const bcrypt = require("bcrypt");
const auth = require("../auth");
const { errorHandler } = require('../auth'); 


// REGISTER USER
module.exports.registerUser = (req, res) => {

    const { email, password, mobileNo, firstName, lastName, isAdmin } = req.body;

    // Email validation
    if (!email || !email.includes("@")){
        return res.status(400).json({ error: "Invalid email" });
    }

    // Mobile number validation
    if (!mobileNo || mobileNo.length < 10 || mobileNo.length > 15 || !/^\d+$/.test(mobileNo)) {
    return res.status(400).json({ error: "Mobile number invalid" });
}

    // Password length validation
    if (!password || password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    let newUser = new User({
        firstName,
        lastName,
        email,
        password: bcrypt.hashSync(password, 10),
        isAdmin: isAdmin || false,
        mobileNo
    });

    return newUser.save()
        .then((result) => res.status(201).json({ 
            message: "Registered successfully", 
            user: result 
        }))
        .catch(error => errorHandler(error, req, res));
};


// LOGIN USER
module.exports.loginUser = (req, res) => {
    const { email, password } = req.body;

    if (!email.includes("@")) {
        return res.status(400).json({ error: "Invalid email" });
    }

    return User.findOne({ email })
    .then(result => {
        if (!result) {
            return res.status(404).json({ error: "No email found" });
        }

        const isPasswordCorrect = bcrypt.compareSync(password, result.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: "Email and password do not match" });
        }

        return res.status(200).json({ 
            message: "Login successful", 
            access: auth.createAccessToken(result) 
        });
    })
    .catch(error => res.status(500).json({ error: "failed in find" }));
};


// GET PROFILE
module.exports.getProfile = (req,res) => {
    return User.findById(req.user.id)
    .then(user => {
        if (!user) return res.status(404).json({ error: "User not found" });
        user.password = "";
        return res.status(200).json(user);
    })
    .catch(error => errorHandler(error, req, res));
};


// RESET PASSWORD
module.exports.updatePassword = async (req, res) => {
    try {
        const userId = req.user.id; 
        const { newPassword } = req.body;

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { password: hashedPassword },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({ message: "Password reset successfully" });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({ error: "Server error" });
    }
};


// SET AS ADMIN
module.exports.setAsAdmin = async (req, res) => {
    try {
        const userId = req.params.id;

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { isAdmin: true }, 
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({ 
            message: "User promoted to admin", 
            user: updatedUser 
        });

    } catch (error) {
        console.error("Set Admin Error:", error);
        return res.status(500).json({ error: "Server error" });
    }
};
