import { Server } from "socket.io";
import { saveMessage } from "../services/chat.service.js";
import jwt from "jsonwebtoken";

export const initChatSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Authentication Middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.token;
    if (!token) {
      return next(new Error("Authentication error. Token not found."));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error. Invalid token."));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected to chat: ${socket.user.id} (${socket.id})`);

    // Socket events debug logger
    socket.onAny((event, ...args) => {
      console.log(`[SOCKET DEBUG] Event received: "${event}" from user ${socket.user.id}`, args);
    });

    // Join conversation room
    socket.on("join_room", ({ interestId }) => {
      socket.join(interestId);
      console.log(`User ${socket.user.id} joined room: ${interestId}`);
    });

    // Handle typing events
    socket.on("typing", ({ interestId, isTyping }) => {
      socket.to(interestId).emit("typing_status", {
        userId: socket.user.id,
        isTyping,
      });
    });

    // Handle incoming messages
    socket.on("send_message", async ({ interestId, receiverId, content }) => {
      try {
        const savedMsg = await saveMessage(socket.user.id, receiverId, interestId, content);
        
        // Broadcast the message back to the sender and the receiver inside the room
        io.to(interestId).emit("receive_message", savedMsg);
      } catch (error) {
        console.error(`[SOCKET ERROR] send_message failed: ${error.message}`);
        socket.emit("error_message", { message: error.message });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.id} (${socket.id})`);
    });
  });

  return io;
};
