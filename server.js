const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const cors = require('cors');

// Enable CORS middleware
app.use(cors());

// Middleware to parse JSON request body
app.use(express.json());

// Utility function to generate a secure private key
const generatePrivateKey = () => {
  return crypto.randomBytes(16).toString("hex");
};

// Define the directory to store user data
const usersDirectory = path.join(__dirname, "users");

// Create the 'users' directory if it doesn't exist
if (!fs.existsSync(usersDirectory)) {
  fs.mkdirSync(usersDirectory);
}

// Signup Route
app.post("/signup", async (req, res) => {
  try {
    console.log("Received data:", req.body); // Log request body

    const { username, password } = req.body;

    if (!username || typeof username !== "string" || username.trim() === "") {
      console.error("Invalid username");
      return res.status(400).json({ message: "Invalid username" });
    }
    if (!password || typeof password !== "string" || password.trim() === "") {
      console.error("Invalid password");
      return res.status(400).json({ message: "Invalid password" });
    }

    const userFilePath = path.join(usersDirectory, `${username}.json`);
    console.log("User file path:", userFilePath); // Log file path

    if (fs.existsSync(userFilePath)) {
      console.error("Username already exists");
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed password:", hashedPassword); // Log hashed password

    const privateKey = generatePrivateKey();
    console.log("Generated private key:", privateKey); // Log private key

    const userData = { username, password: hashedPassword, privateKey };

    fs.writeFileSync(userFilePath, JSON.stringify(userData, null, 2));
    console.log("User data saved successfully");

    return res.status(200).json({ message: "Account created", privateKey });
  } catch (error) {
    console.error("Error in /signup route:", error);
    return res.status(500).json({ message: "Error creating account" });
  }
});

// Login Route
app.post("/login", (req, res) => {
  const { username, privateKey } = req.body;

  // Validate inputs
  if (!username || typeof username !== 'string' || username.trim() === '') {
    return res.status(400).json({ message: "Invalid username" });
  }
  if (!privateKey || typeof privateKey !== 'string' || privateKey.trim() === '') {
    return res.status(400).json({ message: "Private key is required" });
  }

  // Check if user file exists
  const userFilePath = path.join(usersDirectory, `${username}.json`);

  if (!fs.existsSync(userFilePath)) {
    return res.status(400).json({ message: "Username not found" });
  }

  // Read the user file
  const userData = JSON.parse(fs.readFileSync(userFilePath, "utf8"));

  // Check if the provided private key matches the stored one
  if (userData.privateKey === privateKey) {
    return res.json({ message: "Login successful" });
  } else {
    return res.status(400).json({ message: "Invalid private key" });
  }
});

// Start the server
app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
