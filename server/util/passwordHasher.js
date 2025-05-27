import bcrypt from 'bcryptjs';

const saltRounds = 12;

async function hashPassword(password) {
  return bcrypt.hash(password, saltRounds);
}

async function passwordMatchesHashed(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

export { hashPassword, passwordMatchesHashed };
