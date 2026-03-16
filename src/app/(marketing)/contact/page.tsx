"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder — no backend yet
    setSubmitted(true);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    fontSize: "15px",
    border: "1.5px solid #E0E0E0",
    borderRadius: "10px",
    outline: "none",
    color: "#1a1a1a",
    backgroundColor: "#FAFAFA",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  return (
    <div style={{ maxWidth: "560px", margin: "0 auto", padding: "80px 24px" }}>
      <h1 style={{ fontSize: "36px", fontWeight: 900, color: "#1a1a1a", marginBottom: "8px" }}>Contact us</h1>
      <p style={{ fontSize: "16px", color: "#717171", marginBottom: "40px" }}>
        Have a question or feedback? We&apos;d love to hear from you.
      </p>

      {submitted ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p style={{ fontSize: "24px", marginBottom: "12px" }}>Thanks!</p>
          <p style={{ fontSize: "16px", color: "#717171" }}>We&apos;ll get back to you soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#555" }}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your name"
              style={inputStyle}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#555" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#555" }}>Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              placeholder="How can we help?"
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "14px",
              backgroundColor: "#C4664A",
              color: "#fff",
              fontWeight: 700,
              fontSize: "15px",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            Send message
          </button>
        </form>
      )}
    </div>
  );
}
