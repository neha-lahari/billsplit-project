const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

//google login
router.get(
    "/google/login",
    passport.authenticate("google-login", { scope: ["profile", "email"] })
);

router.get(
    "/google/login/callback",
    passport.authenticate("google-login", { session: false }),
    async (req, res) => {
        try {
            const email = req.user.emails[0].value;
            const user = await User.findOne({ email });

            if (!user) {
                return res.send(`
                    <script>
                        window.opener.postMessage(
                            { error: "No account found with this email." },
                            "http://localhost:3000"
                        );
                        window.close();
                    </script>
                `);
            }

            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_secret,
                { expiresIn: "7d" }
            );

            res.send(`
                <script>
                    window.opener.postMessage(
                        {
                            token: "${token}",
                            user: {
                                username: "${user.username}",
                                email: "${user.email}",
                                id: "${user._id}"
                            }
                        },
                        "http://localhost:3000"
                    );
                    window.close();
                </script>
            `);
        } catch (err) {
            res.send(`
                <script>
                    window.opener.postMessage(
                        { error: "Server error during Google login." },
                        "http://localhost:3000"
                    );
                    window.close();
                </script>
            `);
        }
    }
);

//google register
router.get(
    "/google/register",
    passport.authenticate("google-register", { scope: ["profile", "email"] })
);
router.get(
    "/google/register/callback",
    passport.authenticate("google-register", { session: false }),
    async (req, res) => {
        try {
            const email = req.user.emails[0].value;
            const existingUser = await User.findOne({ email });

            if (existingUser) {
                return res.send(`
                    <script>
                        window.opener.postMessage(
                            { error: "Account already exists with this email." },
                            "http://localhost:3000"
                        );
                        window.close();
                    </script>
                `);
            }

            const newUser = await User.create({
                username: req.user.displayName,
                email,
                googleId: req.user.id,
            });

            const token = jwt.sign(
                { userId: newUser._id },
                process.env.JWT_secret,
                { expiresIn: "7d" }
            );

            res.send(`
                <script>
                    window.opener.postMessage(
                        {
                            token: "${token}",
                            user: {
                                username: "${newUser.username}",
                                email: "${newUser.email}",
                                id: "${newUser._id}"
                            }
                        },
                        "http://localhost:3000"
                    );
                    window.close();
                </script>
            `);
        } catch (err) {
            res.send(`
                <script>
                    window.opener.postMessage(
                        { error: "Server error during Google registration." },
                        "http://localhost:3000"
                    );
                    window.close();
                </script>
            `);
        }
    }
);


//failure route
router.get("/google/failure", (req, res) => {
    res.status(400).json({ error: "Authentication failed." });
});

module.exports = router;