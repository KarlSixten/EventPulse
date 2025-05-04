import bcrypt from 'bcryptjs';

const saltRounds = 12;

async function hashPassword(password) {
    return await bcrypt.hash(password, saltRounds);
}

async function passwordMatchesHashed(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword)
}

export { hashPassword, passwordMatchesHashed }