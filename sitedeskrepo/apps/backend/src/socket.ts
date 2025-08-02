import { Server as IOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { redisClient } from "@repo/redis";
import { prismaClient } from "@repo/db/client";
import jwt from "jsonwebtoken";

interface SocketUser {
  id: number;
  role: "ADMIN" | "AGENT" | "CUSTOMER";
  organizationId: number;
  name: string;
  email: string;
}

let io: IOServer;

export async function setupSocketHandlers(server: HTTPServer) {
  io = new IOServer(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174"], // Add more origins as needed
      credentials: true,
    },
  });

  // --- REDIS ADAPTER SETUP ---
  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();
  await pubClient.connect();
  await subClient.connect();
  io.adapter(createAdapter(pubClient, subClient));
  // --- END REDIS ADAPTER SETUP ---

  // --- JWT AUTH MIDDLEWARE ---
  io.use((socket, next) => {
    const { token } = socket.handshake.auth;
    if (!token) return next(new Error("Authentication error: No token"));
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET!) as SocketUser;
      socket.data.user = user;
      return next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as SocketUser | undefined;
    if (!user) {
      socket.disconnect(true);
      return;
    }

    // For easier access later
    const { id: userId, role, organizationId } = user;

    // --- Presence setup (AGENT only) ---
    if (role === "AGENT") {
      const key = `presence:${organizationId}:agent:${userId}`;
      redisClient.set(key, "online", { EX: 30 });
    }

    // --- Heartbeat to refresh presence (AGENT only) ---
    socket.on("heartbeat", () => {
      if (role === "AGENT") {
        const key = `presence:${organizationId}:agent:${userId}`;
        redisClient.set(key, "online", { EX: 30 });
      }
    });

    // --- Join agent/customer rooms for direct notifications ---
    if (role === "AGENT") {
      socket.join(`agent:${userId}`);
    } else if (role === "CUSTOMER") {
      socket.join(`customer:${userId}`);
    }

    // --- Join chat room ---
    socket.on("join_chat", ({ chatId }) => {
      socket.join(`chat_${chatId}`);
    });

    // --- Leave chat room ---
    socket.on("leave_chat", ({ chatId }) => {
      socket.leave(`chat_${chatId}`);
    });

    // --- Typing indicator --

    socket.on("typing", ({ chatId, senderType }) => {
      socket.to(`chat_${chatId}`).emit("typing", { chatId, senderType });
    });

    socket.on("stop_typing", ({ chatId, senderType }) => {
      socket.to(`chat_${chatId}`).emit("stop_typing", { chatId, senderType });
    });


    // --- Send message ---
    socket.on("send_message", async ({ chatId, text }) => {
      // Fetch chat to verify organization and participant validity
      const chat = await prismaClient.chat.findUnique({
        where: { id: chatId },
        select: { agentId: true, customerId: true, organizationId: true }
      });
      if (!chat) return;
      if (chat.organizationId !== organizationId) return; // tenant guard

      let senderType: "AGENT" | "CUSTOMER";
      let receiverId: number | null = null;
      let receiverType: "AGENT" | "CUSTOMER" | undefined;

      if (role === "AGENT" && chat.agentId === userId) {
        console.log("message arrived by: ", user.id, ", role: ", user.role, ", name: ", user.name);
        senderType = "AGENT";
        receiverId = chat.customerId;
        receiverType = "CUSTOMER";
      }
      else if (role === "CUSTOMER" && chat.customerId === userId) {
        //testing
        console.log("message arrived by: ", user.id, ", role: ", user.role, ", name: ", user.name);
        senderType = "CUSTOMER";
        receiverId = chat.agentId;
        receiverType = "AGENT";
      }
      else {
        return;
      }

      // if(receiverId == null)
      // {
      //   return;
      // }
      
      // Persist message
      //testing
        // console.log("message persistance trying: ", user.id, ", role: ", user.role, ", name: ", user.name);
      const message = await prismaClient.message.create({
        data: {
          chatId,
          organizationId,
          content: text,
          senderId: userId,
          senderType,
          receiverId,
          receiverType,
        }
      });

      // Emit to all in chat room
      io.to(`chat_${chatId}`).emit("receive_message", {
        id: message.id,
        chatId,
        organizationId,
        content: text,
        senderId: userId,
        senderType,
        receiverId,
        receiverType,
        createdAt: message.createdAt,
      });
    });

    socket.on("complete_chat", async ({ chatId }) => {
      const chat = await prismaClient.chat.findUnique({
        where: { id: chatId },
        select: { agentId: true, organizationId: true }
      });
      if (!chat || chat.organizationId !== organizationId) return;
      if (role !== "AGENT" || chat.agentId !== userId) return;

      // Update chat status in DB
      await prismaClient.chat.update({
        where: { id: chatId },
        data: { status: "CLOSED" }
      });

      // Notify all in the chat room
      io.to(`chat_${chatId}`).emit("chat_completed", { chatId });
    });


    // --- Disconnect handling ---
    socket.on("disconnect", () => {
      if (role === "AGENT") {
        redisClient.del(`presence:${organizationId}:agent:${userId}`);
      }
    });
  });

  return io;
}

export { io };
