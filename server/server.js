import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { connectdb } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/message.routes.js";

const app = express();
const server = http.createServer(app);

// 👉 Global socket map (userId -> socketId)
export const userSocketMap = {};

// 👉 Initialize Socket.IO
export const io = new Server(server, {
  cors: {
    origin: "*", // Change to frontend origin in production
    credentials: true,
  },
});

// 👉 Handle socket connections
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("🔌 New socket connection. userId:", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log("✅ User Connected:", userId);

    // 🔄 Broadcast all online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  } else {
    console.warn("⚠️ No userId provided in handshake!");
  }

  socket.on("disconnect", () => {
    if (userId) {
      console.log("❌ User Disconnected:", userId);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

// 👉 Middlewares
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// 👉 Routes
app.use("/api/status", (req, res) => res.send("server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// 👉 Start DB and Server
await connectdb();

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log("Server is running on PORT: " + PORT));
}

// Export for Vercel (CommonJS format)
export default server;

