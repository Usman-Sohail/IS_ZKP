import React, { useState } from "react";
import "./Login.css";
import studentStudying from "./studentStudying.svg";

const Login = () => {
  const [username, setUsername] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    // Start Schnorr protocol
    const startResponse = await fetch("http://localhost:5000/login/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const startData = await startResponse.json();

    if (!startResponse.ok) {
      setError(startData.message);
      return;
    }

    const { publicKey, p, g, challenge } = startData;

    // Generate random `k` and commitment `r`
    const k = Math.floor(Math.random() * (p - 2)) + 1;
    const r = BigInt(g) ** BigInt(k) % BigInt(p);

    // Compute response `s = k + challenge * privateKey mod (p-1)`
    const s = (k + challenge * parseInt(privateKey)) % (p - 1);

    
    // Send proof to server
    const verifyResponse = await fetch("http://localhost:5000/login/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, r: r.toString(), s }),
    });
    const verifyData = await verifyResponse.json();

    if (verifyData.message === "Login successful") {
      alert("Login successful!");
    } else {
      setError(verifyData.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img
          src={studentStudying}
          alt="Student Studying"
          className="student-image"
        />
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
