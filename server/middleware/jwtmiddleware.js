const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).json({ message: "no token provided" });

    }
    const token = header.split(' ')[1];
    jwt.verify(token, process.env.JWT_secret, (err, user) => {
        if (err) {
            return res.status(401).json({ message: 'invalid token' });
        }
        req.user = user;
        next();
    });

}
module.exports = authenticate;

