import React, { useState } from "react";
import "./Signup.css";
import studentStudying from "./studentStudying.svg";

// Utility function to trigger the download of the private key file
const downloadPrivateKeyFile = (privateKey) => {
  const blob = new Blob([privateKey], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "privateKey.txt";
  link.click();
};

const Signup = () => {
  
  const [username, setUsername] = useState("usman");
  const [password, setPassword] = useState("123");
  const [confirmPassword, setConfirmPassword] = useState("123");

  const handleSignup = async () => {
    // Check if passwords match
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Send the signup request to the backend
    const response = await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.message === "Account created") {
      // Download private key file
      downloadPrivateKeyFile(data.privateKey);
      alert("Account created successfully!");
    } else {
      alert("Error during signup");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-left">
        <img src={studentStudying} alt="Student Studying" className="student-image" />
      </div>

      <div className="signup-right">
        <h2 className="signup-title">Sign Up</h2>

        <div className="input-field">
          <input
            type="text"
            placeholder="User Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="input-field">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="input-field">
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button className="signup-btn" type="button" onClick={handleSignup}>
          Create Account
        </button>

        <p className="signup-text">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
