const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');


// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Signup और OTP भेजना
exports.signup = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP

        user = new User({
            email,
            password: hashedPassword,
            otp,
            otpExpires: Date.now() + 10 * 60 * 1000 // 10 minutes expiry
        });

        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP for Registration',
            text: `Your OTP is: ${otp}. It is valid for 10 minutes.`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'OTP sent to email. Please verify.' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// OTP Verify करना
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        // 1. सीधा User को ढूंढो
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: "User not found. Please sign up again." });
        }

        // --- डिबगिंग के लिए ---
        console.log("DB OTP:", user.otp, " | User OTP:", otp);

        // 2. Type-Safe Comparison
        if (String(user.otp) !== String(otp)) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // 3. OTP सही है! अब उसे Verify कर दो
        user.isVerified = true; 
        user.otp = undefined; // सिक्योरिटी के लिए पुराना OTP मिटा दो
        await user.save();

        res.status(200).json({ message: "Email verified successfully!" });

    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ message: "Server error during verification" });
    }
};

// Login 
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
        if (!user.isVerified) return res.status(400).json({ message: 'Please verify your email first' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, message: 'Logged in successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};