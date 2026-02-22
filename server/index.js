const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const router = require("./router");
const { pool } = require("./db");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
});
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Make io accessible to routes
app.set('io', io);

app.use("/api", router);

app.use((req, res) => {
	res.status(404).json({ error: "Not Found" });
});

app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ error: "Internal Server Error" });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
	console.log('Client connected:', socket.id);
	
	socket.on('disconnect', () => {
		console.log('Client disconnected:', socket.id);
	});
});

server.listen(port, async () => {
	try {
		const connection = await pool.getConnection();
		connection.release();
		console.log("Database connected");
	} catch (error) {
		console.error("Database connection failed:", error.message);
	}

	console.log(`Server listening on port ${port}`);
});

module.exports = { io };
