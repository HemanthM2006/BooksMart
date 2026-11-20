const mongoose = require("mongoose");
const { randomBytes, scrypt, timingSafeEqual } = require("node:crypto");
const { promisify } = require("node:util");

const derive = promisify(scrypt);
const accountSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false }
}, { timestamps: true });

async function hashPassword(password) {
    const salt = randomBytes(16).toString("hex");
    const key = await derive(password, salt, 64);
    return `scrypt:${salt}:${key.toString("hex")}`;
}

async function verifyPassword(password, encoded) {
    const match = /^scrypt:([0-9a-f]{32}):([0-9a-f]{128})$/.exec(encoded);
    if (!match) return false;
    const key = await derive(password, match[1], 64);
    return timingSafeEqual(key, Buffer.from(match[2], "hex"));
}

const accounts = {
    user: mongoose.model("User", accountSchema, "users"),
    admin: mongoose.model("Admin", accountSchema, "admins")
};

module.exports = { accounts, hashPassword, verifyPassword };
