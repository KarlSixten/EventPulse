# EventPulse 🥁

EventPulse is a full-stack web application designed to connect users with local events and empower event creators. Users can discover public and private events, find nearby happenings, invite others, manage RSVPs, and purchase tickets for paid events. Event creators have the ability to create, edit, and delete their events.

This project was developed as an exam project for a full-stack development course focusing on Node.js, Svelte, and related technologies.

---

## ✨ Features

* **User Authentication:** Secure sign-up, login, and logout functionality.
* **Password Reset:** Users can request a password reset via email if they forget their password.
* **Event Creation & Management:** Users can create public or private events, providing details like title, description, date/time, location, and pricing information.
* **Ticketing & Payments:**
    * Event creators can set a price for their events and accept online payments.
    * Users can securely purchase tickets for paid events using **Stripe**.
    * A ticket with a unique **QR code** is sent to the user's email upon successful payment.
* **Event Discovery:**
    * Browse upcoming, past, or all events.
    * Filter events by type and search by keywords in the title or description.
    * Sort events by date, price, or distance (if location services are enabled).
    * View event details, including location on a map (for events with coordinates) using **Leaflet.js**.
* **RSVP System:** Users can RSVP to events (Going, Maybe, Not Going).
* **Invitations:** Event creators (and any user for public events) can invite other registered users to their events via email and in-app notifications.
* **Real-time Notifications:**
    * Users receive real-time notifications for event invitations.
    * Event creators of private events are notified when an invited user RSVPs.
* **Location-Based Services:**
    * Find events nearby by providing a current location.
    * Display event locations on an interactive map using **Leaflet.js**.
* **User Profiles & Event Ownership:** Users can edit or delete events they created.

---

## 🛠️ Tech Stack

### **Frontend:**

* **Svelte 5**
* **Vite:** Frontend tooling
* **Svelte Routing:** Client-side routing
* **Socket.IO Client:** For real-time WebSocket communication
* **Toastr.js:** For user notifications
* **Leaflet.js:** For interactive maps
* **Ionicons:** For UI icons
* **Plain CSS:** For styling

### **Backend:**

* **Node.js**
* **Express.js:** Web framework for Node.js
* **PostgreSQL:** Relational database
* **PostGIS:** Geospatial extension for PostgreSQL
* **Knex.js:** SQL query builder
* **Stripe:** For handling online payments
* **Socket.IO:** For real-time WebSocket communication
* **express-session:** For session management
* **bcryptjs:** For password hashing
* **Nodemailer:** For sending emails (sign-up, invitations, password resets, tickets)
* **dotenv:** For environment variable management
* **cors:** For enabling Cross-Origin Resource Sharing

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18.x or later)
* npm (usually comes with Node.js)
* PostgreSQL server with PostGIS extension enabled
* Stripe account and API keys

### Setup

1.  **Clone the repository:**
    ```bash
    git clone [http://github.com/karlsixten/eventpulse](http://github.com/karlsixten/eventpulse)
    cd eventpulse
    ```

2.  **Backend Setup:**
    * Navigate to the `server` directory: `cd server`
    * Install dependencies: `npm install`
    * Create a `.env` file and add your PostgreSQL details, session secret, email credentials, and Stripe keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).
    * Set up and seed the database:
        ```bash
        npm run resetDatabaseSeed
        ```

3.  **Frontend Setup:**
    * Navigate to the `client` directory: `cd ../client`
    * Install dependencies: `npm install`
    * Create a `.env` file and add your `VITE_STRIPE_PUBLISHABLE_KEY`.

### Running the Application

1.  **Start the development servers:**
    * From the `server` directory, run:
        ```bash
        npm run dev
        ```
    * This command concurrently starts the backend, the frontend, and the Stripe webhook listener.

2.  **Open the app:**
    * Navigate to `http://localhost:5173` in your browser.

---

## 📜 Available Scripts

### Server (`server/package.json`)

* `npm run setupDatabase`: Creates database tables.
* `npm run resetDatabaseSeed`: Drops all tables, recreates them, and seeds initial data.
* `npm run dev`: Starts the backend, frontend, and Stripe listener concurrently for development.
* `npm run prod`: Builds the client application and starts the server for production.

### Client (`client/package.json`)

* `npm run dev`: Starts the Vite development server.
* `npm run build`: Builds the frontend application for production.
* `npm run preview`: Serves the production build locally.

---

## 📝 Project Status

This is an exam project which won't be further developed (for now). While it demonstrates core functionalities, it may not be feature-complete or hardened for production use without further development.