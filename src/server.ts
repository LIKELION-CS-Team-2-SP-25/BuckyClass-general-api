import http from "http";
import { Server } from "socket.io";
import app from "./app";
import pool from "./db";

const PORT = process.env.PORT || 5000;
const isLocal = process.env.SERVER_ENV === "local";
const SERVER_URL = isLocal ? "http://localhost:5000" : "https://your-backend-service.onrender.com";

// Create an HTTP Server using Express
const server = http.createServer(app);

// WebSockets Setup
const io = new Server(server, {
    cors: { origin: "*" },
});

interface ChatMessage {
    text: string;
}

io.on("connection", (socket) => {
    console.log(`✅ A user connected: ${socket.id}`);

    // Handle incoming messages
    socket.on("sendMessage", async (message: ChatMessage) => {
        console.log("📩 Received message:", message);

        try {
            await pool.query("INSERT INTO messages (text) VALUES ($1)", [message]);
            io.emit("receiveMessage", message); // Send message to all clients
        } catch (err) {
            const error = err as Error;
            console.error("Database Insert Error:", error.message);
        }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.id}`);
    });
});

// Start the Server
server.listen(PORT, () => {
    console.log(`Server running on ${SERVER_URL}`);
});
