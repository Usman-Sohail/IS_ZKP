import React, { useState } from "react";
import "./Login.css";
import studentStudying from "./studentStudying.svg";

const Login = () => {
  const [username, setUsername] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    // Send login request to the backend
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, privateKey }),
    });

    const data = await response.json();

    if (data.message === "Login successful") {
      alert("Login successful!");
      // Redirect to dashboard or other page
    } else {
      setError(data.message); // Show error message
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={studentStudying} alt="Student Studying" className="student-image" />
      </div>

      <div className="login-right">
        <h2 className="login-title">Log In</h2>

        <div className="input-field">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="input-field">
          <input
            type="text"
            placeholder="Private Key"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>

        <p className="signup-text">
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;