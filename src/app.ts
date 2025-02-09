import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import pool from "./db";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes (Move API logic later)
app.get("/", async (_, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query("SELECT version()");
        client.release();
        console.log(result.rows[0]);
        res.json({ message: "Backend is running!", version: result.rows[0].version });
    } catch (err) {
        console.error("Database Connection Error:", err);
        res.status(500).json({ error: "Database connection failed", details: (err as Error).message });
    }
});

app.get("/api/messages", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM messages");
        console.log(result.rows);
        res.json(result.rows);
    } catch (err) {
        const error = err as Error;
        console.error("Database Error:", error.message);
        res.status(500).json({ error: "Database query failed", details: error.message });
    }
});

export default app;
