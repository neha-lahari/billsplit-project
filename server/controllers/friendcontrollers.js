const User = require('../models/user');

exports.search_user = async (req, res) => {
    const searchFriend = req.query.query;
    const currentUserId = req.user.userId;

    if (!searchFriend) {
        return res.status(400).json({ message: "Search query is required" });
    }

    try {
        const members = await User.find({
            $and: [
                {
                    $or: [
                        { username: { $regex: searchFriend, $options: 'i' } },
                        { email: { $regex: searchFriend, $options: 'i' } }
                    ]
                },
                { _id: { $ne: currentUserId } } 
            ]
        }).select('-password');

        res.json(members);
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).json({ message: "Error searching users", error: err.message });
    }
};

exports.send_request = async (req, res) => {
    const senderID = req.user.userId;
    const receiverID = req.params.id;

    if (senderID.toString() === receiverID.toString())
        return res.status(400).json({ message: "Cannot send request to yourself" });

    try {
        const sender = await User.findById(senderID);
        const receiver = await User.findById(receiverID);
        if (!sender || !receiver) return res.status(404).json({ message: "User not found" });

        if (receiver.friendRequests.includes(senderID) || sender.sentRequests.includes(receiverID))
            return res.status(400).json({ message: "Request already sent" });

        if (receiver.friends.includes(senderID))
            return res.status(400).json({ message: "Already friends" });

        receiver.friendRequests.push(senderID);
        sender.sentRequests.push(receiverID);

        await receiver.save();
        await sender.save();

        res.json({ message: "Friend request sent" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error sending request", error: err.message });
    }
};

exports.accept_request = async (req, res) => {
    const myID = req.user.userId;
    const senderID = req.params.id;

    try {
        const me = await User.findById(myID);
        const sender = await User.findById(senderID);
        if (!me || !sender) return res.status(404).json({ msg: "User not found" });

        if (!me.friendRequests.includes(senderID))
            return res.status(400).json({ msg: "No request from this user" });

        me.friends.push(senderID);
        sender.friends.push(myID);

        me.friendRequests = me.friendRequests.filter(id => id.toString() !== senderID.toString());
        sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== myID.toString());

        await me.save();
        await sender.save();

        res.json({ msg: "Friend request accepted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Error accepting request", error: err.message });
    }
};

exports.reject_request = async (req, res) => {
    const myID = req.user.userId;
    const senderID = req.params.id;

    try {
        const me = await User.findById(myID);
        const sender = await User.findById(senderID);
        if (!me || !sender) return res.status(404).json({ msg: "User not found" });

        me.friendRequests = me.friendRequests.filter(id => id.toString() !== senderID.toString());
        sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== myID.toString());

        await me.save();
        await sender.save();

        res.json({ msg: "Friend request rejected" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Error rejecting request", error: err.message });
    }
};

exports.unFriend = async (req, res) => {
    const myID = req.user.userId;
    const friendID = req.params.id;

    try {
        const me = await User.findById(myID);
        const friend = await User.findById(friendID);
        if (!me || !friend) return res.status(404).json({ msg: "User not found" });

        me.friends = me.friends.filter(id => id.toString() !== friendID.toString());
        friend.friends = friend.friends.filter(id => id.toString() !== myID.toString());

        await me.save();
        await friend.save();

        res.json({ msg: "Unfriended successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Error unfriending", error: err.message });
    }
};



exports.cancel_request = async (req, res) => {
    const senderID = req.user.userId;
    const receiverID = req.params.id;

    try {
        const sender = await User.findById(senderID);
        const receiver = await User.findById(receiverID);
        if (!sender || !receiver) return res.status(404).json({ msg: "User not found" });

        sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== receiverID.toString());
        receiver.friendRequests = receiver.friendRequests.filter(id => id.toString() !== senderID.toString());

        await sender.save();
        await receiver.save();

        res.json({ msg: "Request cancelled" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Error cancelling request", error: err.message });
    }
};

exports.getFriendStatus = async (req, res) => {
    const myID = req.user.userId;

    try {
        const me = await User.findById(myID)
            .populate('friendRequests', 'username email _id')
            .populate('sentRequests', 'username email _id')
            .populate('friends', 'username email _id');

        if (!me) return res.status(404).json({ msg: "User not found" });

        res.json({
            incomingRequests: me.friendRequests || [],
            sentRequests: me.sentRequests || [],
            friends: me.friends || []
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Error fetching friend status", error: err.message });
    }
};