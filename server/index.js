require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

const passport = require("./config/passport");

app.use(
    session({
        secret: process.env.secret,
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/friends", require("./routes/friends"));
app.use("/api/groups", require("./routes/grouproutes"));
app.use("/api/expenses", require("./routes/expensess"));
app.use("/api/group", require("./routes/balances"));
app.use("/api/activity", require("./routes/activityRoutes"));

// Test route
app.get("/", (req, res) => {
    res.send("Hello World from Express + MongoDB!");
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
