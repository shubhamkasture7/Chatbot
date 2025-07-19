import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


// Route: POST /chat
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;


  if (!userMessage || typeof userMessage !== "string") {
    return res.status(400).json({ reply: "Invalid message input." });
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: userMessage }],
            },
          ],
        }),
      }
    );

    const data = await geminiRes.json();
    // console.log("Gemini Response:", JSON.stringify(data, null, 2));

    if (data.error) {
      return res.status(500).json({ reply: "Gemini API error: " + data.error.message });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No reply generated.";
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ reply: "Internal server error." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
