const User = require("../models/User");
const bcrypt = require("bcrypt");
const auth = require("../auth");
const { errorHandler } = require('../auth'); 


// REGISTER USER
module.exports.registerUser = (req, res) => {

    // Invalid email format
    if (!req.body.email.includes("@")){
        return res.status(400).json({ message: "invalid email" });
    }
    // Invalid mobile number length
    else if (req.body.mobileNo.length !== 11){
        return res.status(400).json({ message: "invalid mobile number" });
    }
    // Password too short
    else if (req.body.password.length < 8) {
        return res.status(400).json({ message: "password must be at least 8 characters" });
    } 
    // All validations passed
    else {
        let newUser = new User({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            password : bcrypt.hashSync(req.body.password, 10),
            isAdmin: req.body.isAdmin,
            mobileNo : req.body.mobileNo,
        });

        return newUser.save()
        .then((result) => res.status(201).json({ message: "User registered successfully", user: result }))
        .catch(error => errorHandler(error, req, res));
    }
};

// LOGIN USER
module.exports.loginUser = (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    if (!email.includes("@")) {
        return res.status(400).json({ message: "invalid email" });
    }

    return User.findOne({ email })
    .then(result => {
        if (!result) {
            return res.status(404).json({ message: "email not found" });
        }

        const isPasswordCorrect = bcrypt.compareSync(password, result.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "email and password do not match" });
        }

        return res.status(200).json({ message: "Login successful", access: auth.createAccessToken(result) });
    })
    .catch(error => errorHandler(error, req, res));
};

// GET PROFILE
module.exports.getProfile = (req,res) => {
    return User.findById(req.user.id)
    .then(user => {
        if (!user) return res.status(404).json({ message: "user not found" });
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

        if (!newPassword) {
            return res.status(400).json({ message: "New password is required" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { password: hashedPassword },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "user not found" });
        }

        return res.status(200).json({ message: "password reset successfully" });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// ADMIN UPDATE USER
module.exports.adminUpdateUser = (req, res) => {
    const { userId, updates } = req.body;

    if (!userId || !updates) {
        return res.status(400).json({ message: "userId and updates are required" });
    }

    return User.findByIdAndUpdate(userId, updates, { new: true })
        .then(updatedUser => {
            if (!updatedUser) {
                return res.status(404).json({ message: "user not found" });
            }

            updatedUser.password = "";
            return res.status(200).json({
                message: "User updated successfully",
                updatedUser
            });
        })
        .catch(error => errorHandler(error, req, res));
};
