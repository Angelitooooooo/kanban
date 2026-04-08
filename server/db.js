const mysql = require("mysql2/promise");
const knex = require("knex");
require("dotenv").config();

const connection = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "admin",
  database: process.env.DB_NAME || "kanban_system"
};

const pool = mysql.createPool({
  ...connection,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const knexConfig = {
  client: "mysql2",
  connection,
  migrations: {
    directory: "./migrations"
  },
  seeds: {
    directory: "./seeds"
  }
};

const db = knex(knexConfig);

module.exports = knexConfig;
module.exports.pool = pool;
module.exports.db = db;
module.exports.knexConfig = knexConfig;
