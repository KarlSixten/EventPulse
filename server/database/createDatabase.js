import db from './connection.js';
import { hashPassword } from '../util/passwordHasher.js';

const deleteMode = process.argv.includes('--delete');

console.log('Setting up database...');
console.log(`Delete mode is ${deleteMode ? "enabled" : "disabled"}.`);


try {
    if (deleteMode) {
        console.log('Dropping users table...');
        await db.query(`DROP TABLE IF EXISTS users CASCADE`);
        console.log('Users table dropped.');
    }

    console.log('Creating users table if it does not exist...');
    await db.query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hashed TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL
)`);
    console.log('Users table created or already exists.');

    if (deleteMode) {
        console.log("Seeding the database...")
        await seed()
        console.log("Database has been seeded.")
    }

} catch (error) {
    console.log("Error while setting up database:", error);
} finally {
    console.log('Closing database connection pool...');
    await db.end();
    console.log('Database connection pool closed.');
}

async function seed() {
    await db.query('INSERT INTO users (email, password_hashed, first_name, last_name) VALUES ($1, $2, $3, $4)', [
        'admin@admin.com',
        await hashPassword('admin'),
        'admin',
        'admin']);
    await db.query('INSERT INTO users (email, password_hashed, first_name, last_name) VALUES ($1, $2, $3, $4)', [
        'karlsixten@gmail.com',
        await hashPassword('password'),
        'Karl',
        'Bjarnø']);
}