import { Router } from 'express';
import db from '../../database/connection.js';
import { hashPassword, passwordMatchesHashed } from '../../util/passwordHasher.js';

// import ville skulle bruges i prod/real-world, derfor beholdt
// eslint-disable-next-line no-unused-vars
import { sendSignUpConfirmationEmail, sendResetPasswordEmail } from '../../util/nodeMailer.js';

const router = Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.get('/me', (req, res) => {
  const hasValidSession = !!(req.session && req.session.user && req.session.user.id);

  return res.send({
    data: {
      isAuthenticated: hasValidSession,
      user: hasValidSession ? req.session.user : null,
    },
  });
});

router.post('/sign-up', async (req, res) => {
  const {
    email, password, firstName, lastName,
  } = req.body || {};

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).send({ message: 'Email, password, first and last name are required' });
  }

  const originalEmail = email;

  if (!emailRegex.test(originalEmail)) {
    return res.status(400).send({ message: 'Invalid email format' });
  }

  const normalizedEmail = originalEmail.trim().toLowerCase();

  try {
    const existingUser = await db('users')
      .where({ email: normalizedEmail })
      .first();

    if (existingUser) {
      return res.status(409).send({ message: `User with email ${normalizedEmail} already exists` });
    }
    const hashedPassword = await hashPassword(password);

    await db('users').insert({
      email: normalizedEmail,
      password_hashed: hashedPassword,
      first_name: firstName,
      last_name: lastName,
    });

    // Commented out to lessen spam
    await sendSignUpConfirmationEmail(firstName, normalizedEmail);

    return res.status(201).send({ message: 'User created' });
  } catch (error) {
    return res.status(500).send({ message: 'Database error during sign-up' });
  }
});

router.post('/login', async (req, res) => {
  if (!req.body || !req.body.email || !req.body.password) {
    return res.status(400).send({ message: 'Email and password are required' });
  }

  const originalEmail = req.body.email;
  const { password } = req.body;

  const normalizedEmail = originalEmail.trim().toLowerCase();
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).send({ message: 'Invalid email format' });
  }

  try {
    const user = await db('users')
      .where({ email: normalizedEmail })
      .first();

    if (!user) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    if (!await passwordMatchesHashed(password, user.password_hashed)) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    const userInfo = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    };

    req.session.user = userInfo;

    return res.status(200).send({
      message: 'Login successful',
      data: {
        user: userInfo,
      },
    });
  } catch (error) {
    return res.status(500).send({ message: 'An internal error occurred during login' });
  }
});

router.post('/logout', async (req, res) => {
  if (req.session && req.session.user) {
    try {
      req.session.destroy();
      return res.status(200).send({ message: 'Logout successful' });
    } catch (error) {
      return res.status(500).send({ message: 'Logout failed. Please try again.' });
    }
  } else {
    return res.status(200).send({ message: 'No active session to logout from.' });
  }
});

router.post('/forgot-password', async (req, res) => {
  if (!req.body || !req.body.email) {
    return res.status(400).send({ message: 'Email for account is required' });
  }

  const { email } = req.body;

  const normalizedEmail = email.trim().toLowerCase();

  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).send({ message: 'Invalid email format' });
  }

  let createdToken;

  try {
    const user = await db('users')
      .where({ email: normalizedEmail })
      .first();

    if (!user) {
      return res.status(409).send({ message: `User with email ${normalizedEmail} does not exists` });
    }

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 time frem
    // eslint-disable-next-line max-len
    const expiresAtTimestamp = Math.floor(expiresAt.getTime() / 1000); // ms siden epoch, divider med 1000 for at få sekunder

    [createdToken] = await db('tokens').insert({
      email: normalizedEmail,
      expires_at: expiresAtTimestamp,
    }).returning(['uuid', 'email', 'expires_at as expiresAt']);
  } catch (error) {
    return res.status(500).send({ message: 'A database error occured' });
  }

  await sendResetPasswordEmail(createdToken);

  return res.send({ message: `Reset link sent to ${email}` });
});

router.post('/reset-password', async (req, res) => {
  if (!req.body || !req.body.newPassword) {
    return res.status(400).send({ message: 'New password for account is required' });
  }

  const { newPassword } = req.body;
  const tokenUuid = req.query.token;

  if (!tokenUuid) {
    return res.status(400).send({ message: 'Invalid token' });
  }

  try {
    const token = await db('tokens')
      .where({ uuid: tokenUuid })
      .first();

    const now = new Date();

    if (!token || token.expiresAt < now) {
      return res.status(400).send({ message: 'Invalid or expired token' });
    }

    const tokenEmail = token.email;
    const hashedPassword = await hashPassword(newPassword);

    await db('users')
      .where({ email: tokenEmail })
      .update({ password_hashed: hashedPassword })
      .returning('*');

    await db('tokens').where({ id: token.id }).del();

    return res.send({ message: 'Password has been reset.' });
  } catch (error) {
    return res.status(500).send({ message: 'Database error' });
  }
});

export default router;
