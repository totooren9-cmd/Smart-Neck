import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini API client on server-side only
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("WARNING: GEMINI_API_KEY is not configured. AI troubleshooting will not be available.");
  }

  // API Route for Gemini troubleshooting
  app.post("/api/troubleshoot", async (req, res) => {
    try {
      const { message, code, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      if (!ai) {
        return res.status(500).json({ 
          error: "ระบบ AI Troubleshooting ยังไม่ได้ตั้งค่าคีย์ API (GEMINI_API_KEY) กรุณาตรวจสอบแท็บ Settings > Secrets" 
        });
      }

      const systemInstruction = `You are an expert IoT and Embedded Systems Engineer who specializes in helping students build projects using Arduino IDE, ESP32, and the MPU6050 accelerometer/gyroscope.
Your purpose is to help high school students (around Grade 8) build their "Text Neck Syndrome Posture Warning Device".
This device uses:
- ESP32 microcontroller
- MPU6050 sensor (attached to glasses temple/arm to measure neck tilt angle)
- Vibration coin motor (attached to waistband/pants or near ESP32, which vibrates when neck tilts > 15 degrees for > 10 seconds)
- TP4056 USB-C charging module + 3.7V LiPo Battery
- Switch
- (Optional) LED status modules (Green for safe posture, Red for bad posture warning)
- LINE Notify / LINE Official Account integration for notification updates.

Always respond in Thai language, using clear, encouraging, friendly, and jargon-free terms suitable for Thai Grade 8 students (มัธยมศึกษาปีที่ 2).
Help them debug compile errors, verify pin connections (e.g., SDA is GPIO 21, SCL is GPIO 22, Vibration is GPIO 13, LEDs), and configure Wi-Fi and LINE Notify.
Do not write extremely long paragraphs. Use clear bullet points, bold text, and code snippets when needed. Keep it highly practical.`;

      // Build chat contents from history
      const formattedContents: any[] = [];
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          formattedContents.push({
            role: turn.role === "user" ? "user" : "model",
            parts: [{ text: turn.text }]
          });
        }
      }

      // Add the latest message
      let promptText = message;
      if (code) {
        promptText += `\n\nนี่คือโค้ด ESP32 ในปัจจุบันของฉันเพื่อใช้ประกอบการพิจารณา:\n\`\`\`cpp\n${code}\n\`\`\``;
      }
      formattedContents.push({
        role: "user",
        parts: [{ text: promptText }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ reply: response.text });
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      res.status(500).json({ error: err.message || "An error occurred while contacting the AI." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
