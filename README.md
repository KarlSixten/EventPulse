# EventPulse 🥁

EventPulse is a full-stack web application designed to connect users with local events and empower event creators. Users can discover public and private events, find nearby happenings, invite others, and manage RSVPs. Event creators have the ability to create, edit, and delete their events.

This project was developed as an exam project for a full-stack development course focusing on Node.js, Svelte, and related technologies.

---

## ✨ Features

* **User Authentication:** Secure sign-up, login, and logout functionality.
* **Event Creation & Management:** Users can create public or private events, providing details like title, description, date/time, and location.
* **Event Discovery:**
    * Browse upcoming, past, or all events.
    * Sort events by date or distance (if location services are enabled).
    * View event details, including location on a map (for events with coordinates).
* **RSVP System:** Users can RSVP to events (Going, Maybe, Not Going).
* **Invitations:** Event creators can invite other registered users to their events.
* **Real-time Notifications:** Users receive real-time notifications for event invitations using WebSockets.
* **Location-Based Services:**
    * Find events nearby.
    * Display event locations on an interactive map (using Leaflet).
* **User Profiles & Event Ownership:** Users can edit or delete events they created.

---

## 🛠️ Tech Stack

**Frontend:**

* **Svelte 5:**
* **Vite:**
* **Svelte Routing:** Client-side routing for Svelte.
* **Socket.IO Client:** For real-time WebSocket communication.
* **Toastr.js:** For user notifications.
* **Leaflet.js:** For interactive maps.
* **Ionicons:** For UI icons.
* **Plain CSS:**

**Backend:**

* **Node.js:**
* **Express.js:**
* **PostgreSQL:** For database.
* **PostGIS:** Geospatial extension for PostgreSQL.
* **Knex.js:** SQL query builder for Node.js.
* **Socket.IO:** For real-time WebSocket communication.
* **express-session:** For session management.
* **bcryptjs:** For password hashing.
* **Nodemailer:** For sending emails (e.g., sign-up confirmations, invitations - currently commented out in parts).

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18.x or later recommended)
* npm (usually comes with Node.js)
* PostgreSQL server installed and running with the PostGIS extension enabled.

### Setup

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone http://github.com/karlsixten/eventpulse
    cd eventpulse
    ```

2.  **Backend Setup:**
    * Navigate to the server directory:
        ```bash
        cd server
        ```
    * Install dependencies:
        ```bash
        npm install
        ```
    * Create a `.env` file in the `server` directory by copying `.env.example`
    * Ensure your PostgreSQL database (`eventpulse` or your chosen name) exists and the user has permissions.
    * Set up the database schema and seed initial data:
        ```bash
        npm run resetDatabase # This will drop existing tables and re-seed
        # OR for a fresh setup without deleting:
        # npm run setupDatabase
        ```
        *(These scripts are defined in `server/package.json`)*

3.  **Frontend Setup:**
    * Navigate to the client directory from the project root:
        ```bash
        cd ../client
        # Or from server: cd ../client
        ```
    * Install dependencies:
        ```bash
        npm install
        ```

### Running the Application

1.  **Start the Backend Server:**
    * In the `server` directory:
        ```bash
        node app.js
        ```

2.  **Start the Frontend Development Server:**
    * In the `client` directory:
        ```bash
        npm run dev
        ```
        *(This script is defined in `client/package.json`)*
    * Vite will typically start the development server on `http://localhost:5173`.

Open your browser and navigate to `http://localhost:5173` (or your client's port).

---

## 📜 Available Scripts

### Server (`server/package.json`)

* `npm run setupDatabase`: Creates database tables and PostGIS extension if they don't exist.
* `npm run resetDatabase`: Drops all tables, recreates them, and seeds data. Useful for a clean start.
* `npm run clearInvites`: (If you keep this script) Potentially for clearing or re-initializing the `event_invitations` table.

## 📝 Project Status

This is an exam project. While it demonstrates core functionalities, it may not be feature-complete or hardened for production use without further development (e.g., comprehensive error handling, security hardening, advanced features).

---