/**
 * Socket.io Client Utilities
 * For use in React components
 */

import { io, Socket } from "socket.io-client";

export interface SocketUser {
  id: string;
  name: string;
  image?: string;
  cursor?: { line: number; column: number };
}

export interface CollaborationState {
  code: string;
  language: "javascript" | "arduino";
  participants: SocketUser[];
  cursors: Record<string, SocketUser>;
}

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "/api/socket", {
      path: "/api/socket",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinRoom(roomId: string, user: SocketUser) {
  const socket = getSocket();
  socket.emit("join-room", { roomId, user });
}

export function leaveRoom(roomId: string) {
  const socket = getSocket();
  socket.emit("leave-room", { roomId });
}

export function sendCodeChange(roomId: string, code: string) {
  const socket = getSocket();
  socket.emit("code-change", { roomId, code });
}

export function sendCursorChange(
  roomId: string,
  cursor: { line: number; column: number },
  user: SocketUser
) {
  const socket = getSocket();
  socket.emit("cursor-change", { roomId, cursor, user });
}

export function sendLanguageChange(roomId: string, language: "javascript" | "arduino") {
  const socket = getSocket();
  socket.emit("language-change", { roomId, language });
}

export function requestSimulation(roomId: string, code: string, language: string) {
  const socket = getSocket();
  socket.emit("simulation-request", { roomId, code, language });
}
