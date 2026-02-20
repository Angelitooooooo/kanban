const express = require("express");
const cors = require("cors");
require("dotenv").config();

const router = require("./router");
const { pool } = require("./db");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api", router);

app.use((req, res) => {
	res.status(404).json({ error: "Not Found" });
});

app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ error: "Internal Server Error" });
});

app.listen(port, async () => {
	try {
		const connection = await pool.getConnection();
		connection.release();
		console.log("Database connected");
	} catch (error) {
		console.error("Database connection failed:", error.message);
	}

	console.log(`Server listening on port ${port}`);
});
