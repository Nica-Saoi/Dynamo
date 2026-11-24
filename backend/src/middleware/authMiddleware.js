const jwt = require("jsonwebtoken");
const cassandra = require("cassandra-driver");

const {
    getUserById,
    publicUser
} = require("../services/authService");

async function requireAuth(req, res, next) {

    const token = req.cookies?.dynamo_token;

    if (!token) {
        return res.status(401).json({
            error: "Authentication required"
        });
    }

    let decoded;
    let userId;

    try {

        decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            {
                algorithms: ["HS256"],
                issuer: "dynamo"
            }
        );

        userId = cassandra.types.Uuid.fromString(
            decoded.user_id
        );

    } catch (error) {

        return res.status(401).json({
            error: "Invalid or expired authentication"
        });
    }

    try {

        const user = await getUserById(userId);

        if (!user) {
            return res.status(401).json({
                error: "User no longer exists"
            });
        }

        req.user = publicUser(user);

        next();

    } catch (error) {

        next(error);
    }
}

module.exports = {
    requireAuth
};