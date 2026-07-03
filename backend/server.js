import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import authRoutes from "./src/routes/auth.routes.js";
import listingRoutes from "./src/routes/listing.routes.js";
import tenantRoutes from "./src/routes/tenant.routes.js";
import interestRoutes from "./src/routes/interest.routes.js";
import chatRoutes from "./src/routes/chat.routes.js";
import compatibilityRoutes from "./src/routes/compatibility.routes.js";
import { initChatSocket } from "./src/sockets/chat.socket.js";
import uploadRoutes from "./src/routes/upload.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";

import helmet from "helmet";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const server = createServer(app);

// Enable CORS at the very top so all preflights and errors contain headers
app.use(cors());

// Enable security headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Prevents conflicts with local assets and scripts
  })
);

// Configure Rate Limiting: Max 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 10000,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all API routes
app.use("/api", apiLimiter);

app.use(express.json());

// API Request/Response Logger for debugging
app.use((req, res, next) => {
  console.log(`[API REQUEST] ${req.method} ${req.url}`);
  const originalSend = res.send;
  res.send = function (body) {
    console.log(`[API RESPONSE] ${req.method} ${req.url} - Status: ${res.statusCode}`);
    return originalSend.apply(this, arguments);
  };
  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "Rent & Flatmate Finder API Running 🚀",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/api/interests", interestRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/compatibility", compatibilityRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);

// Initialize Socket.IO
initChatSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});