const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const http = require('http'); 
const { Server } = require('socket.io'); 

const authRoutes = require('./routes/authRoutes');
const Message = require('./models/Message'); // <-- नया: Message Model इम्पोर्ट किया

const app = express();
const server = http.createServer(app); 

// Socket.io सेटअप
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// Middleware (limit बढ़ा दी है क्योंकि Base64 फोटो का साइज़ बड़ा होता है)
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
// --- नया: पुरानी चैट्स मंगाने का API ---
app.get('/api/messages/:chatId', async (req, res) => {
    try {
        // डेटाबेस से उस chatId के सारे मैसेज ढूंढो
        const messages = await Message.find({ chatId: req.params.chatId });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

// Socket.io Connection
io.on('connection', (socket) => {
    console.log('🔥 A User Connected:', socket.id);

    // जब कोई मैसेज भेजे
    socket.on('send_message', async (data) => {
        try {
            // 1. मैसेज को MongoDB में सेव करो
            const newMessage = new Message(data);
            await newMessage.save();

            // 2. बाकी सबको भेज दो
            socket.broadcast.emit('receive_message', data);
        } catch (error) {
            console.log("Error saving message:", error);
        }
    });

    socket.on('disconnect', () => {
        console.log('❌ User Disconnected:', socket.id);
    });
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));