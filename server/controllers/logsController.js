const fs = require("fs/promises");
const path = require("path");

const saveLog = async (req, res) => {
	const { message } = req.body;

	if (typeof message !== "string" || message.trim() === "") {
		return res.status(400).json({ error: "message is required" });
	}

	const trimmedMessage = message.trim();
	if (trimmedMessage.includes("\n") || trimmedMessage.includes("\r")) {
		return res.status(400).json({ error: "message must be a single line" });
	}

	const timestamp = new Date().toISOString();
	const logsDirectory = path.join(__dirname, "../logs");
	const logFile = path.join(logsDirectory, `logs-${timestamp.slice(0, 10)}.txt`);

	try {
		await fs.mkdir(logsDirectory, { recursive: true });
		await fs.appendFile(logFile, `[${timestamp}] ${trimmedMessage}\n`, "utf8");
		return res.status(201).json({ message: "Log saved", timestamp });
	} catch (error) {
		console.error("Failed to save log:", error);
		return res.status(500).json({ error: "Failed to save log" });
	}
};

module.exports = { saveLog };
