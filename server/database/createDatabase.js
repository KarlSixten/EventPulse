/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-use-before-define */
/* eslint-disable no-console */
import { pgPool } from './connection.js';
import { hashPassword } from '../util/passwordHasher.js';
import { seedUsersData, seedEventsData } from './util/seedData.js';

const deleteMode = process.argv.includes('--delete');

try {
  console.log('Setting up database...');
  console.log(`Delete mode is ${deleteMode ? 'enabled' : 'disabled'}.`);

  if (deleteMode) {
    console.log('Dropping tables...');
    await dropAllTables();
    console.log('Tables dropped.');
  }

  const timeZone = await pgPool.query('SHOW TIMEZONE');
  console.log('Timezone is:', timeZone.rows[0].TimeZone);

  console.log('Creating PostGIS extension...');
  await createPostgis();
  console.log('PostGIS created.');

  console.log('Creating tables...');
  await createTables();
  console.log('Tables created or already exists.');

  if (deleteMode) {
    console.log('Seeding the database...');
    await seed();
    console.log('Database has been seeded.');
  }
} catch (error) {
  console.log('Error while setting up database:', error);
} finally {
  console.log('Closing database connection pool...');
  await pgPool.end();
  console.log('Database connection pool closed.');
}

async function dropAllTables() {
  await pgPool.query(`
        DROP TABLE IF EXISTS users CASCADE;
        DROP TABLE IF EXISTS events CASCADE;
        DROP TABLE IF EXISTS event_invitations CASCADE;
        DROP TABLE IF EXISTS event_rsvps CASCADE;
    `);
}

async function createPostgis() {
  await pgPool.query(`
        CREATE EXTENSION IF NOT EXISTS postgis;
    `);
}

async function createTables() {
  await pgPool.query(`
        CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hashed TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        location_point GEOGRAPHY(Point, 4326),
        date_time TIMESTAMPTZ NOT NULL,
        created_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        is_private BOOLEAN NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS event_invitations (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        inviter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        invitee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
        message TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (event_id, invitee_id)
        );

        CREATE TABLE IF NOT EXISTS event_rsvps (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'going' NOT NULL CHECK (status IN ('going', 'maybe', 'not_going')),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (event_id, user_id)
        );
`);
}

async function seed() {
  // USERS
  await seedUsers();

  // EVENTS
  await seedDatabaseEvents();
}

async function seedUsers() {
  console.log('Starting user seeding...');
  for (const userData of seedUsersData) {
    const email = userData[0];
    const plainPassword = userData[1];
    const firstName = userData[2];
    const lastName = userData[3];

    try {
      const hashedPassword = await hashPassword(plainPassword);
      await pgPool.query(
        'INSERT INTO users (email, password_hashed, first_name, last_name) VALUES ($1, $2, $3, $4)',
        [email, hashedPassword, firstName, lastName],
      );
      console.log(`Processed user: ${email}`);
    } catch (error) {
      console.error(`Error inserting user "${email}":`, error);
    }
  }
  console.log('User seeding process complete.');
}

async function seedDatabaseEvents() {
  for (const eventData of seedEventsData) {
    try {
      await pgPool.query(
        'INSERT INTO events (title, description, created_by_id, location_point, date_time, is_private) VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography, $6, $7) RETURNING id',
        eventData,
      );
      console.log(`Inserted event: ${eventData[0]}`);
    } catch (error) {
      console.error(`Error inserting event "${eventData[0]}":`, error);
    }
  }
  console.log('Database seeding attempted.');
}
