/**
 * Socket.io Server Setup
 * For Next.js App Router, we need a custom server setup
 * This file exports utilities for Socket.io integration
 */

import { Server as SocketIOServer, Socket } from "socket.io";
import type { Server as HTTPServer } from "http";

export interface SocketUser {
  id: string;
  name: string;
  image?: string;
  cursor?: { line: number; column: number };
}

export interface CollaborationState {
  code: string;
  language: "javascript" | "arduino";
  cursors: Record<string, SocketUser>;
  participants: SocketUser[];
}

export function initializeSocketIO(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const rooms = new Map<string, CollaborationState>();

  io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join-room", async (data: { roomId: string; user: SocketUser }) => {
      const { roomId, user } = data;
      
      socket.join(roomId);
      
      // Initialize room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          code: "",
          language: "javascript",
          cursors: {},
          participants: [],
        });
      }

      const room = rooms.get(roomId)!;
      
      // Add user to participants
      if (!room.participants.find((p) => p.id === user.id)) {
        room.participants.push(user);
      }
      
      room.cursors[socket.id] = { ...user, cursor: user.cursor };

      // Notify others of new participant
      socket.to(roomId).emit("user-joined", { user, socketId: socket.id });

      // Send current state to new user
      socket.emit("room-state", {
        code: room.code,
        language: room.language,
        participants: room.participants,
        cursors: room.cursors,
      });

      // Broadcast updated participant list
      io.to(roomId).emit("participants-updated", room.participants);
    });

    socket.on("code-change", (data: { roomId: string; code: string }) => {
      const { roomId, code } = data;
      const room = rooms.get(roomId);
      
      if (room) {
        room.code = code;
        // Broadcast to others in room (excluding sender)
        socket.to(roomId).emit("code-updated", { code, socketId: socket.id });
      }
    });

    socket.on("cursor-change", (data: { roomId: string; cursor: { line: number; column: number }; user: SocketUser }) => {
      const { roomId, cursor, user } = data;
      const room = rooms.get(roomId);
      
      if (room) {
        room.cursors[socket.id] = { ...user, cursor };
        // Broadcast to others in room
        socket.to(roomId).emit("cursor-updated", { socketId: socket.id, cursor, user });
      }
    });

    socket.on("language-change", (data: { roomId: string; language: "javascript" | "arduino" }) => {
      const { roomId, language } = data;
      const room = rooms.get(roomId);
      
      if (room) {
        room.language = language;
        // Broadcast to others in room
        socket.to(roomId).emit("language-updated", { language, socketId: socket.id });
      }
    });

    socket.on("simulation-request", async (data: { roomId: string; code: string; language: string }) => {
      const { roomId, code, language } = data;
      
      // Broadcast simulation request to all participants
      io.to(roomId).emit("simulation-started", {
        socketId: socket.id,
        code,
        language,
      });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      
      // Remove user from all rooms
      rooms.forEach((room, roomId) => {
        const participantIndex = room.participants.findIndex(
          (p) => room.cursors[socket.id]?.id === p.id
        );
        
        if (participantIndex !== -1) {
          const user = room.participants[participantIndex];
          room.participants.splice(participantIndex, 1);
          delete room.cursors[socket.id];
          
          // Notify others
          socket.to(roomId).emit("user-left", { user, socketId: socket.id });
          io.to(roomId).emit("participants-updated", room.participants);
        }
      });
    });
  });

  return io;
}
