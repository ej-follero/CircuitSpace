/**
 * Custom Next.js Server with Socket.io Support
 * Run with: node server.js
 */

const { createServer } = require("http");
const { parse } = require("url");
const { readFileSync } = require("fs");
const { join } = require("path");
const next = require("next");
// Note: Socket.io server initialization

let io = null;

function initializeSocketIO(httpServer) {
  const { Server: SocketIOServer } = require("socket.io");
  
  io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const rooms = new Map();

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join-room", async (data) => {
      const { roomId, user } = data;
      
      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          code: "",
          language: "javascript",
          cursors: {},
          participants: [],
        });
      }

      const room = rooms.get(roomId);
      
      if (!room.participants.find((p) => p.id === user.id)) {
        room.participants.push(user);
      }
      
      room.cursors[socket.id] = { ...user, cursor: user.cursor };

      socket.to(roomId).emit("user-joined", { user, socketId: socket.id });

      socket.emit("room-state", {
        code: room.code,
        language: room.language,
        participants: room.participants,
        cursors: room.cursors,
      });

      io.to(roomId).emit("participants-updated", room.participants);
    });

    socket.on("code-change", (data) => {
      const { roomId, code } = data;
      const room = rooms.get(roomId);
      
      if (room) {
        room.code = code;
        socket.to(roomId).emit("code-updated", { code, socketId: socket.id });
      }
    });

    socket.on("cursor-change", (data) => {
      const { roomId, cursor, user } = data;
      const room = rooms.get(roomId);
      
      if (room) {
        room.cursors[socket.id] = { ...user, cursor };
        socket.to(roomId).emit("cursor-updated", { socketId: socket.id, cursor, user });
      }
    });

    socket.on("language-change", (data) => {
      const { roomId, language } = data;
      const room = rooms.get(roomId);
      
      if (room) {
        room.language = language;
        socket.to(roomId).emit("language-updated", { language, socketId: socket.id });
      }
    });

    socket.on("simulation-request", async (data) => {
      const { roomId, code, language } = data;
      io.to(roomId).emit("simulation-started", {
        socketId: socket.id,
        code,
        language,
      });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      
      rooms.forEach((room, roomId) => {
        const participantIndex = room.participants.findIndex(
          (p) => room.cursors[socket.id]?.id === p.id
        );
        
        if (participantIndex !== -1) {
          const user = room.participants[participantIndex];
          room.participants.splice(participantIndex, 1);
          delete room.cursors[socket.id];
          
          socket.to(roomId).emit("user-left", { user, socketId: socket.id });
          io.to(roomId).emit("participants-updated", room.participants);
        }
      });
    });
  });

  return io;
}

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      
      // Handle manifest.json explicitly
      if (parsedUrl.pathname === '/manifest.json') {
        try {
          const manifestPath = join(process.cwd(), 'public', 'manifest.json');
          const manifestContent = readFileSync(manifestPath, 'utf-8');
          res.setHeader('Content-Type', 'application/manifest+json');
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          res.statusCode = 200;
          res.end(manifestContent);
          return;
        } catch (err) {
          console.error('Error serving manifest.json:', err);
          res.statusCode = 404;
          res.end('Manifest not found');
          return;
        }
      }
      
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Initialize Socket.io
  initializeSocketIO(httpServer);

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
