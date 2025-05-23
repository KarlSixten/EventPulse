import { Router } from "express";
import db from '../../database/connection.js'
import { hashPassword, passwordMatchesHashed } from "../../util/passwordHasher.js";

// import ville skulle bruges i prod/real-world, derfor beholdt
// eslint-disable-next-line no-unused-vars
import { sendSignUpConfirmationEmail } from "../../util/nodeMailer.js";

const router = Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.get("/api/auth/me", (req, res) => {
    if (req.session && req.session.user && req.session.user.id) {
        res.send({
            isAuthenticated: true,
            user: req.session.user
        });
    } else {
        res.send({
            isAuthenticated: false,
            user: null
        });
    }
});

router.post("/api/auth/sign-up", async (req, res) => {
    if (!req.body || !req.body.email || !req.body.password || !req.body.firstName || !req.body.lastName) {
        return res.status(400).send({ message: "Email, password, first and last name are required" });
    }

    const originalEmail = req.body.email;
    const { password, firstName, lastName } = req.body;

    if (!emailRegex.test(originalEmail)) {
        return res.status(400).send({ message: "Invalid email format" });
    }

    const normalizedEmail = originalEmail.trim().toLowerCase();

    try {
        const existingUser = await db('users')
            .where({ email: normalizedEmail })
            .first();

        if (existingUser) {
            return res.status(409).send({ message: `User with email ${normalizedEmail} already exists` });
        } else {
            const hashedPassword = await hashPassword(password); //

            await db('users').insert({
                email: normalizedEmail,
                password_hashed: hashedPassword,
                first_name: firstName,
                last_name: lastName
            });

            // Commented out to lessen spam
            // sendSignUpConfirmationEmail(firstName, normalizedEmail);

            return res.status(201).send({ message: "User created" });
        }
    } catch (error) {
        console.error("Database error during sign-up:", error);
        return res.status(500).send({ message: 'Database error during sign-up' });
    }
});

router.post("/api/auth/login", async (req, res) => {

    if (!req.body || !req.body.email || !req.body.password) {
        return res.status(400).send({ message: "Email and password are required" });
    }

    const originalEmail = req.body.email;
    const { password } = req.body;

    if (!emailRegex.test(originalEmail)) {
        return res.status(400).send({ message: "Invalid email format" });
    }

    const normalizedEmail = originalEmail.trim().toLowerCase();

    try {
        const user = await db('users')
            .where({ email: normalizedEmail })
            .first();

        if (!user) {
            return res.status(401).send({ message: "Invalid email or password" });
        }

        if (!await passwordMatchesHashed(password, user.password_hashed)) {
            return res.status(401).send({ message: "Invalid email or password" });
        }

        const userInfo = {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name
        }

        req.session.user = userInfo;

        return res.status(200).send({
            message: "Login successful",
            user: userInfo
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).send({ message: 'An internal error occurred during login' });
    }
});

router.post("/api/auth/logout", (req, res) => {
    if (req.session) {
        req.session.destroy(error => {
            if (error) {
                console.error('Error destroying session:', error);
                return res.status(500).send({ message: 'Logout failed. Please try again.' });
            }

            res.status(200).send({ message: 'Logout successful' });
        });
    } else {
        console.log('Logout attempt but no active session found.');
        res.status(200).send({ message: 'No active session to logout from.' });
    }
});

export default router;