const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "nimi",   // your password
    database: "eventDB"
});

db.connect(err => {
    if (err) {
        console.log("DB Error:", err);
    } else {
        console.log("MySQL Connected ✅");

        // Initialization for Task 10, 11, 12 tables
        const createStudentsTable = `
            CREATE TABLE IF NOT EXISTS students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                age INT NOT NULL,
                course VARCHAR(255) NOT NULL
            );
        `;

        const createEventsTable = `
            CREATE TABLE IF NOT EXISTS events_crud (
                id INT AUTO_INCREMENT PRIMARY KEY,
                event_name VARCHAR(255) NOT NULL,
                event_date DATE NOT NULL,
                location VARCHAR(255) NOT NULL,
                description TEXT
            );
        `;

        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL
            );
        `;

        db.query(createStudentsTable, (err) => {
            if(err) console.log("Error creating students table:", err);
        });

        db.query(createEventsTable, (err) => {
            if(err) console.log("Error creating events_crud table:", err);
        });

        db.query(createUsersTable, (err) => {
            if(err) console.log("Error creating users table:", err);
        });
    }
});

module.exports = db;