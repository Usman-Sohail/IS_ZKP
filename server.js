const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const app = express();
const cors = require("cors");

// Enable CORS middleware
app.use(cors());

// Middleware to parse JSON request body
app.use(express.json());

// Schnorr key generation
const generateSchnorrKeys = () => {
  const p = 23; // Large prime (use secure values in production)
  const g = 5;  // Generator
  const privateKey = Math.floor(Math.random() * (p - 2)) + 1; // Random private key
  const publicKey = BigInt(g) ** BigInt(privateKey) % BigInt(p); // y = g^x mod p
  return { p, g, privateKey, publicKey };
};

// Directory for user data
const usersDirectory = path.join(__dirname, "users");
if (!fs.existsSync(usersDirectory)) {
  fs.mkdirSync(usersDirectory);
}

// Current challenge for verification
let currentChallenge = null;

// Signup Route
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  const userFilePath = path.join(usersDirectory, `${username}.json`);
  if (fs.existsSync(userFilePath)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const { p, g, privateKey, publicKey } = generateSchnorrKeys();

  const userData = { username, password: hashedPassword, privateKey, publicKey, p, g };
  try {
    fs.writeFileSync(userFilePath, JSON.stringify(userData, null, 2));
    return res.status(200).json({
      message: "Account created",
      privateKey, // Share only the private key with the user
    });
  } catch (error) {
    console.error("Error saving user data:", error);
    return res.status(500).json({ message: "Error creating account" });
  }
});

// Login Start Phase (Challenge Generation)
app.post("/login/start", (req, res) => {
  const { username } = req.body;

  const userFilePath = path.join(usersDirectory, `${username}.json`);
  if (!fs.existsSync(userFilePath)) {
    return res.status(400).json({ message: "Username not found" });
  }

  const userData = JSON.parse(fs.readFileSync(userFilePath, "utf8"));
  currentChallenge = Math.floor(Math.random() * userData.p); // Random challenge

  return res.json({
    publicKey: userData.publicKey,
    p: userData.p,
    g: userData.g,
    challenge: currentChallenge,
  });
});

// Login Verify Phase (Challenge Response)
app.post("/login/verify", (req, res) => {
  const { username, r, s } = req.body;

  const userFilePath = path.join(usersDirectory, `${username}.json`);
  if (!fs.existsSync(userFilePath)) {
    return res.status(400).json({ message: "Username not found" });
  }

  const userData = JSON.parse(fs.readFileSync(userFilePath, "utf8"));
  const { p, g, publicKey } = userData;

  // Verification: g^s mod p == r * (y^challenge mod p) mod p
  const left = BigInt(g) ** BigInt(s) % BigInt(p);
  const right =
    (BigInt(r) * BigInt(publicKey) ** BigInt(currentChallenge) % BigInt(p)) % BigInt(p);

  if (left === right) {
    return res.json({ message: "Login successful" });
  } else {
    return res.status(400).json({ message: "Invalid proof" });
  }
});

// Start the server
app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
