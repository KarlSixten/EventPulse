import db from './connection.js';
import { hashPassword } from '../util/passwordHasher.js';

const deleteMode = process.argv.includes('--delete');

try {
    console.log('Setting up database...');
    console.log(`Delete mode is ${deleteMode ? "enabled" : "disabled"}.`);

    if (deleteMode) {
        console.log('Dropping tables...');
        await dropAllTables();
        console.log('Tables dropped.');
    }

    const timeZone = await db.query('SHOW TIMEZONE');
    console.log('Timezone is:', timeZone.rows[0].TimeZone)

    console.log('Creating PostGIS extension...');
    await createPostgis();
    console.log('PostGIS created.');

    console.log('Creating tables...');
    await createTables();
    console.log('Tables created or already exists.');

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

async function dropAllTables() {
    await db.query(`
        DROP TABLE IF EXISTS users CASCADE;
        DROP TABLE IF EXISTS events CASCADE;
    `);
}

async function createPostgis() {
    await db.query(`
        CREATE EXTENSION IF NOT EXISTS postgis;
    `)
}

async function createTables() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hashed TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL);

        CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        location_point GEOGRAPHY(Point, 4326),
        date_time TIMESTAMPTZ NOT NULL,
        created_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
        )
`);
}

async function seed() {
    // USERS
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

    // EVENTS
    await db.query('INSERT INTO events (title, description, created_by_id, location_point, date_time) VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography, $6)',
        [
            'testEvent',
            'This is a test event',
            1,
            55,
            12,
            "2025-06-25T18:30"
        ]);
    await db.query('INSERT INTO events (title, description, created_by_id, location_point, date_time) VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography, $6)',
        [
            'Another Test event',
            'This is also a test event',
            2,
            56,
            13,
            "2025-06-28T19:00"
        ]);
}