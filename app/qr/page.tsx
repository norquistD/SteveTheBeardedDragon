"use client";

import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRPage() {
  const [text, setText] = useState("https://dylannorquist.codes");

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Generate a QR Code</h1>

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text or URL"
        style={{ padding: "0.5rem", width: "100%", maxWidth: "400px" }}
      />

      <div style={{ marginTop: "2rem" }}>
        <QRCodeCanvas
          value={text}
          size={256} // size in pixels
          includeMargin={true}
          level="H" // error correction: L, M, Q, H
        />
      </div>
    </main>
  );
}
