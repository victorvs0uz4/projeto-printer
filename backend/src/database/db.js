const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'printmanager.sqlite');
const db = new sqlite3.Database(dbPath);

const initDB = () => {
    db.serialize(() => {
        // Create users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            requires_password_change BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Create printers table
        db.run(`CREATE TABLE IF NOT EXISTS printers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            location TEXT,
            price_per_copy REAL NOT NULL DEFAULT 0.00,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Create print_jobs table
        db.run(`CREATE TABLE IF NOT EXISTS print_jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id INTEGER NOT NULL,
            printer_id INTEGER,
            username TEXT,
            pages INTEGER,
            copies INTEGER,
            total_cost REAL,
            printed_at DATETIME,
            FOREIGN KEY(printer_id) REFERENCES printers(id)
        )`);

        // Insert admin user with hashed '123alterar' and flag to requires change
        db.run(`INSERT OR IGNORE INTO users (username, password_hash, requires_password_change) VALUES ('admin', '$argon2id$v=19$m=65536,t=3,p=4$/hbJr9ucPINl9uO9i+LW+g$JGhAylnmzk9MkzoY9j8PRCxDgjBD4fkYQIHMsPVBDAs', 1)`);
        
        // Insert some default printers for testing purposes
        db.run(`INSERT OR IGNORE INTO printers (name, location, price_per_copy) VALUES ('HP_LaserJet_400', 'RH - 2º Andar', 0.15)`);
        db.run(`INSERT OR IGNORE INTO printers (name, location, price_per_copy) VALUES ('Brother_MFC', 'Financeiro', 0.10)`);
    });
};

initDB();

module.exports = db;
