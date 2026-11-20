const express = require("express");
const { randomBytes } = require("node:crypto");

const { accounts, verifyPassword } = require("../models/Account");

const router = express.Router();
const sessions = new Map();
const lifetime = 8 * 60 * 60 * 1000;
const cookieOptions = {
    httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/api"
};

function sessionId(req) {
    return /(?:^|;\s*)booksmart_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || "")?.[1];
}

function currentRole(req) {
    const session = sessions.get(sessionId(req));
    return session && session.expires > Date.now() ? session.role : null;
}

router.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});

router.post("/login", async (req, res) => {
    const { role, email, password } = req.body || {};
    if (!["user", "admin"].includes(role) || typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({ message: "Enter your account type, email and password." });
    }
    try {
        const account = await accounts[role].findOne({ email: email.trim().toLowerCase() })
            .select("+passwordHash").lean();
        if (!account || !(await verifyPassword(password, account.passwordHash))) {
            return res.status(401).json({ message: "Check your account type, email and password." });
        }
    } catch {
        return res.status(503).json({ message: "Sign-in is temporarily unavailable. Please try again." });
    }
    const id = randomBytes(32).toString("hex");
    sessions.delete(sessionId(req));
    sessions.set(id, { role, expires: Date.now() + lifetime });
    res.cookie("booksmart_session", id, { ...cookieOptions, maxAge: lifetime });
    res.json({ role });
});

router.get("/session", (req, res) => res.json({ role: currentRole(req) }));

router.post("/logout", (req, res) => {
    sessions.delete(sessionId(req));
    res.clearCookie("booksmart_session", cookieOptions).sendStatus(204);
});

setInterval(() => {
    for (const [id, session] of sessions) {
        if (session.expires <= Date.now()) sessions.delete(id);
    }
}, 60 * 1000).unref();

function requireAdmin(req, res, next) {
    const role = currentRole(req);
    if (role !== "admin") {
        return res.status(role ? 403 : 401).json({ message: "Sign in as an admin to manage books." });
    }
    next();
}

module.exports = { router, requireAdmin };
