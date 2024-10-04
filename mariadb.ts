// Get the client
import mysql from "mysql2/promise";

// Create the connection to database
const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    dateStrings: true,
});

export default connection;
