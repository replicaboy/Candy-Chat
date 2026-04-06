const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    id: { type: String },           // मैसेज की यूनिक ID
    chatId: { type: String, required: true }, // कौन से ग्रुप/यूज़र का मैसेज है
    text: { type: String, required: true },   // असली मैसेज
    sender: { type: String },       // 'me' या 'other' (अभी के लिए)
    senderName: { type: String },   // भेजने वाले का नाम
    time: { type: String },         // समय
    avatar: { type: String }        // प्रोफाइल फोटो (Base64)
}, { timestamps: true }); // timestamps से मैसेज कब बना, वो टाइम सेव हो जाएगा

module.exports = mongoose.model('Message', messageSchema);