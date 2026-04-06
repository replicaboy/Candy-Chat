const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // --- OTP Verification Fields (जो मिसिंग थे) ---
    otp: { type: String },
    isVerified: { type: Boolean, default: false },
    
    // --- Profile & Friends Fields ---
    name: { type: String, default: 'Agent' },
    avatar: { type: String, default: '' },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);