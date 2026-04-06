const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    id: { type: String },
    chatId: { type: String, required: true },
    text: { type: String }, // अब ये optional है, क्योंकि हो सकता है यूज़र सिर्फ फोटो भेजे
    sender: { type: String },
    senderName: { type: String },
    time: { type: String },
    avatar: { type: String },
    
    // --- नए फीचर्स: फाइल्स के लिए ---
    attachment: { type: String }, // फाइल का Base64 डेटा
    attachmentType: { type: String }, // 'image' या 'document'
    fileName: { type: String } // फाइल का नाम (जैसे resume.pdf)
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);