const express = require('express');
const router = express.Router();
const path = require("path");
const authenticate = require('../middleware/jwtmiddleware');
const upload = require('../middleware/upload');
const User = require('../models/user');

const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  uploadProfilePic,
  getMyFriends,
  getFriends
} = require('../controllers/usercontrollers');

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/upload-profile-pic", authenticate, upload.single("profilePic"), uploadProfilePic);

router.get("/my-friends", authenticate, getMyFriends);
router.get("/friends", authenticate, getFriends);

module.exports = router;

