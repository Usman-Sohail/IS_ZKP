const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch"); // Use `node-fetch` to make HTTP requests from the client side

const performClientComputation = async (username, privateKey) => {
  try {
    // Step 1: Request the challenge and Schnorr parameters from the server
    const response = await fetch("http://localhost:5000/login/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    const { p, g, challenge, publicKey } = await response.json();

    // Step 2: Compute the client's response
    const r = Math.floor(Math.random() * p); // Random value
    const s = (r + privateKey * challenge) % p; // Schnorr's response formula

    // Step 3: Save the response and r to a file
    const fileData = { username, r, s };
    const filePath = path.join(__dirname, "response.json");
    fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));

    console.log("Response saved to response.json. Submit this file to the server for verification.");
  } catch (error) {
    console.error("Error during client computation:", error);
  }
};

// Example usage
const username = "testUser";
const privateKey = 7; // Replace with the actual private key
performClientComputation(username, privateKey);
