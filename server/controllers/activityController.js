const Activity = require("../models/activity");
const User = require("../models/user");

exports.getActivities = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const userGroups = user.groups || [];

        const activities = await Activity.find({ group: { $in: userGroups } })
            .populate("user", "username")
            .populate("group", "name")
        activities.sort((a, b) => b._id - a._id);

        res.json({ activities });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.deleteActivity = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);
        if (!activity || activity.user.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Not allowed to delete this activity" });
        }
        await activity.deleteOne();
        res.json({ message: "Activity deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
