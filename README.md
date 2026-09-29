# EventConnect 🎉

A full-stack Event Management Application built with React, Node.js, Express, MongoDB, and MySQL.

---

## 🌟 Features

- **Event Discovery & Exploration**: Browse upcoming events, filter by category/location, and view details.
- **Booking Management**: Multi-tier booking support:
  - **MongoDB / Cloud Storage**: Persistent document storage for events and bookings.
  - **MySQL Database Integration**: Relational booking tables with real-time status and CRUD operations.
  - **Resilient Fallback Mode**: Automatic local fallback storage if external databases are offline.
- **Student & Attendee Management**: Register, view, and manage student attendee profiles.
- **Authentication**: Secure JWT-based authentication with cookie and header support.
- **Responsive & Modern UI**: Built with React, Vite, and modern CSS with glassmorphism and interactive effects.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), React Router, Lucide Icons, Vanilla CSS
- **Backend**: Node.js, Express 5
- **Databases**: MongoDB (Mongoose) & MySQL (`mysql2`)
- **Authentication**: JWT & bcryptjs

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)
- (Optional) MongoDB Atlas URI or local MongoDB
- (Optional) MySQL Server / XAMPP

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Nimisha-2310/Event.git
   cd Event
   ```

2. **Install dependencies:**
   ```bash
   npm run install-all
   ```
   *(This installs dependencies for both backend and the React client).*

3. **Configure Environment Variables:**
   Create a `.env` file in the `server` directory:
   ```bash
   cp server/.env.example server/.env
   ```
   Update `server/.env` with your database credentials and secret key:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   MYSQL_HOST=127.0.0.1
   MYSQL_USER=root
   MYSQL_PASSWORD=
   MYSQL_PORT=3306
   MYSQL_DATABASE=EventConnectDB
   ```

---

### Running the Application

#### Development Mode (Concurrently runs backend & client):
```bash
npm run dev
```
- Client runs on: `http://localhost:5173`
- Backend API runs on: `http://localhost:5000`

#### Backend Only:
```bash
npm run server
```

#### Frontend Only:
```bash
npm run client
```

#### Production Build:
```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # UI components (Navbar, Footer, etc.)
│   │   ├── pages/          # Application views & pages
│   │   └── utils/          # API helpers
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express backend
│   ├── config/             # Database connection & failover logic
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes (auth, events, students, bookings)
│   ├── server.js           # Server entry point
│   └── .env.example
├── package.json            # Root scripts & dependencies
└── README.md
```

---

## 📄 License

ISC
