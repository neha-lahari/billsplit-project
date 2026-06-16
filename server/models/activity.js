const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
        groupName: { type: String },
        type: {
            type: String,
            enum: ["expense_added", "expense_deleted", "group_created", "group_deleted"],
            required: true,
        },
        amount: Number,
    },
    { timestamps: true, }
);

module.exports = mongoose.model("Activity", activitySchema);
