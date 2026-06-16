const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },

    password: {
        type: String,
        required: function () {
            return !this.googleId;
        }
    },

    googleId: { type: String, unique: true, sparse: true },
    isGoogleUser: { type: Boolean, default: false },

    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],

    profilePic: {
        type: String,
        default: ""
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,

}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
