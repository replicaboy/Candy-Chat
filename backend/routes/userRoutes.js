const express = require('express');
const User = require('../models/User');
const router = express.Router();

// 1. अपनी प्रोफाइल, दोस्त और आई हुई रिक्वेस्ट देखना
router.get('/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email })
            .populate('friends', 'email name avatar') // दोस्तों की डिटेल्स लाओ
            .populate('friendRequests', 'email name avatar'); // रिक्वेस्ट भेजने वालों की डिटेल्स लाओ
        res.json(user);
    } catch (err) { res.status(500).json({ error: "Server Error" }); }
});

// 2. किसी को Friend Request भेजना (ईमेल के ज़रिए)
router.post('/request', async (req, res) => {
    const { myEmail, targetEmail } = req.body;
    try {
        const myUser = await User.findOne({ email: myEmail });
        const targetUser = await User.findOne({ email: targetEmail });

        if (!targetUser) return res.status(404).json({ message: "User not found!" });
        if (targetUser.email === myEmail) return res.status(400).json({ message: "You cannot add yourself!" });

        // अगर पहले से रिक्वेस्ट नहीं भेजी है और दोस्त नहीं हैं, तभी रिक्वेस्ट भेजो
        if (!targetUser.friendRequests.includes(myUser._id) && !targetUser.friends.includes(myUser._id)) {
            targetUser.friendRequests.push(myUser._id);
            await targetUser.save();
        }
        res.json({ message: "Friend request sent!" });
    } catch (err) { res.status(500).json({ error: "Server Error" }); }
});

// 3. Friend Request Accept करना
router.post('/accept', async (req, res) => {
    const { myEmail, requesterEmail } = req.body;
    try {
        const me = await User.findOne({ email: myEmail });
        const requester = await User.findOne({ email: requesterEmail });

        // दोनों को एक-दूसरे की फ्रेंड लिस्ट में डाल दो
        if (!me.friends.includes(requester._id)) me.friends.push(requester._id);
        if (!requester.friends.includes(me._id)) requester.friends.push(me._id);

        // रिक्वेस्ट लिस्ट में से उसे हटा दो
        me.friendRequests = me.friendRequests.filter(id => id.toString() !== requester._id.toString());

        await me.save();
        await requester.save();

        res.json({ message: "Friend added successfully!" });
    } catch (err) { res.status(500).json({ error: "Server Error" }); }
});

// 4. Profile Update करना (Name और DP)
router.put('/update', async (req, res) => {
    const { email, name, avatar } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // अगर नाम या फोटो आया है, तो उसे डेटाबेस में अपडेट कर दो
        if (name) user.name = name;
        if (avatar) user.avatar = avatar;

        await user.save();
        res.json({ message: "Profile updated in DB!", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;