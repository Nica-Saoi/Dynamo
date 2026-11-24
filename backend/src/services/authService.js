const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cassandra = require("cassandra-driver");

const { client } = require("../config/database");

const SALT_ROUNDS = 12;

function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

function normalizeUsername(username) {
    return username.trim().toLowerCase();
}

function publicUser(user) {
    return {
        user_id: user.user_id,
        author_id: user.author_id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
    };
}

function createError(message, status) {
    const error = new Error(message);
    error.status = status;
    return error;
}

// Register a new user
async function registerUser(username, email, password) {

    if (
        typeof username !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
    ) {
        throw createError("Invalid registration data", 400);
    }

    username = normalizeUsername(username);
    email = normalizeEmail(email);

    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
        throw createError("Invalid username", 400);
    }

    if (
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        throw createError("Invalid email address", 400);
    }

    if (
        password.length < 12 ||
        Buffer.byteLength(password, "utf8") > 72
    ) {
        throw createError(
            "Password must be at least 12 characters and at most 72 bytes",
            400
        );
    }

    const userId = cassandra.types.Uuid.random();
    const authorId = cassandra.types.Uuid.random();

    const passwordHash = await bcrypt.hash(
        password,
        SALT_ROUNDS
    );

    const createdAt = new Date();

    // Reserve the email address
    const emailResult = await client.execute(
        `INSERT INTO users_by_email (email, user_id)
         VALUES (?, ?) IF NOT EXISTS`,
        [email, userId],
        { prepare: true }
    );

    if (!emailResult.wasApplied()) {
        throw createError("Email is already registered", 409);
    }

    // Reserve the username
    const usernameResult = await client.execute(
        `INSERT INTO users_by_username (username, user_id)
         VALUES (?, ?) IF NOT EXISTS`,
        [username, userId],
        { prepare: true }
    );

    if (!usernameResult.wasApplied()) {

        await client.execute(
            `DELETE FROM users_by_email
             WHERE email = ? IF user_id = ?`,
            [email, userId],
            { prepare: true }
        );

        throw createError("Username is already taken", 409);
    }

    // Create the user and associated author profile
    const queries = [
        {
            query: `
                INSERT INTO users_by_id (
                    user_id,
                    author_id,
                    username,
                    email,
                    password_hash,
                    created_at
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `,
            params: [
                userId,
                authorId,
                username,
                email,
                passwordHash,
                createdAt
            ]
        },
        {
            query: `
                INSERT INTO authors_by_id (
                    author_id,
                    author_name
                )
                VALUES (?, ?)
            `,
            params: [authorId, username]
        },
        {
            query: `
                INSERT INTO authors_by_user (
                    user_id,
                    author_id
                )
                VALUES (?, ?)
            `,
            params: [userId, authorId]
        },
        {
            query: `
                INSERT INTO authors_by_name (
                    author_name_normalized,
                    author_id,
                    author_name
                )
                VALUES (?, ?, ?)
            `,
            params: [username, authorId, username]
        }
    ];

    await client.batch(queries, {
        prepare: true,
        logged: true
    });

    return publicUser({
        user_id: userId,
        author_id: authorId,
        username,
        email,
        created_at: createdAt
    });
}

// Retrieve a user by ID
async function getUserById(userId) {

    const result = await client.execute(
        `SELECT * FROM users_by_id
         WHERE user_id = ?`,
        [userId],
        { prepare: true }
    );

    return result.first();
}

// Verify login credentials
async function loginUser(email, password) {

    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        Buffer.byteLength(password, "utf8") > 72
    ) {
        throw createError("Invalid credentials", 401);
    }

    email = normalizeEmail(email);

    const result = await client.execute(
        `SELECT user_id FROM users_by_email
         WHERE email = ?`,
        [email],
        { prepare: true }
    );

    const account = result.first();

    if (!account) {
        throw createError("Invalid credentials", 401);
    }

    const user = await getUserById(account.user_id);

    if (!user) {
        throw createError("Invalid credentials", 401);
    }

    const validPassword = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!validPassword) {
        throw createError("Invalid credentials", 401);
    }

    return publicUser(user);
}

// Generate an authentication token
function generateToken(user) {

    return jwt.sign(
        {
            user_id: user.user_id.toString()
        },
        process.env.JWT_SECRET,
        {
            algorithm: "HS256",
            expiresIn: "1h",
            issuer: "dynamo"
        }
    );
}

module.exports = {
    registerUser,
    loginUser,
    getUserById,
    generateToken,
    publicUser
};