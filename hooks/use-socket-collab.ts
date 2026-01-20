"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
  getSocket,
  disconnectSocket,
  joinRoom,
  leaveRoom,
  sendCodeChange,
  sendCursorChange,
  sendLanguageChange,
  requestSimulation,
  type SocketUser,
  type CollaborationState,
} from "@/lib/socket/client";

export interface UseSocketCollabOptions {
  roomId: string;
  enabled?: boolean;
  onCodeChange?: (code: string) => void;
  onLanguageChange?: (language: "javascript" | "arduino") => void;
  onParticipantsChange?: (participants: SocketUser[]) => void;
  onSimulationStarted?: (data: { code: string; language: string }) => void;
}

export function useSocketCollab({
  roomId,
  enabled = true,
  onCodeChange,
  onLanguageChange,
  onParticipantsChange,
  onSimulationStarted,
}: UseSocketCollabOptions) {
  const { user } = useUser();
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<SocketUser[]>([]);
  const [cursors, setCursors] = useState<Record<string, SocketUser>>({});
  const [currentCode, setCurrentCode] = useState<string>("");
  const [currentLanguage, setCurrentLanguage] = useState<"javascript" | "arduino">("javascript");
  const codeChangeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!enabled || !user || !roomId) return;

    const socket = getSocket();
    const currentUser: SocketUser = {
      id: user.id,
      name: user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress || "Anonymous",
      image: user.imageUrl,
    };

    // Connection events
    socket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
      joinRoom(roomId, currentUser);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    // Room events
    socket.on("room-state", (state: CollaborationState) => {
      setCurrentCode(state.code);
      setCurrentLanguage(state.language);
      setParticipants(state.participants);
      setCursors(state.cursors);
    });

    socket.on("user-joined", ({ user: newUser }: { user: SocketUser }) => {
      console.log("User joined:", newUser.name);
    });

    socket.on("user-left", ({ user: leftUser }: { user: SocketUser }) => {
      console.log("User left:", leftUser.name);
    });

    socket.on("participants-updated", (updatedParticipants: SocketUser[]) => {
      setParticipants(updatedParticipants);
      onParticipantsChange?.(updatedParticipants);
    });

    // Code synchronization
    socket.on("code-updated", ({ code, socketId }: { code: string; socketId: string }) => {
      // Don't update if this change came from us
      if (socketId !== socket.id) {
        setCurrentCode(code);
        onCodeChange?.(code);
      }
    });

    socket.on("language-updated", ({ language }: { language: "javascript" | "arduino" }) => {
      setCurrentLanguage(language);
      onLanguageChange?.(language);
    });

    // Cursor tracking
    socket.on("cursor-updated", ({ socketId, cursor, user }: { socketId: string; cursor: { line: number; column: number }; user: SocketUser }) => {
      if (socketId !== socket.id) {
        setCursors((prev) => ({
          ...prev,
          [socketId]: { ...user, cursor },
        }));
      }
    });

    // Simulation events
    socket.on("simulation-started", (data: { code: string; language: string }) => {
      onSimulationStarted?.(data);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("room-state");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("participants-updated");
      socket.off("code-updated");
      socket.off("language-updated");
      socket.off("cursor-updated");
      socket.off("simulation-started");
      
      if (enabled) {
        leaveRoom(roomId);
      }
    };
  }, [roomId, enabled, user, onCodeChange, onLanguageChange, onParticipantsChange, onSimulationStarted]);

  // Debounced code change handler
  const handleCodeChange = useCallback(
    (code: string) => {
      setCurrentCode(code);
      
      // Clear existing timeout
      if (codeChangeTimeoutRef.current) {
        clearTimeout(codeChangeTimeoutRef.current);
      }

      // Debounce code changes (send after 300ms of no changes)
      codeChangeTimeoutRef.current = setTimeout(() => {
        sendCodeChange(roomId, code);
      }, 300);
    },
    [roomId]
  );

  // Expose a function to update code from external changes
  const updateCode = useCallback((code: string) => {
    setCurrentCode(code);
  }, []);

  const handleLanguageChange = useCallback(
    (language: "javascript" | "arduino") => {
      setCurrentLanguage(language);
      sendLanguageChange(roomId, language);
    },
    [roomId]
  );

  const handleCursorChange = useCallback(
    (cursor: { line: number; column: number }) => {
      if (!user) return;
      
      const currentUser: SocketUser = {
        id: user.id,
        name: user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress || "Anonymous",
        image: user.imageUrl,
        cursor,
      };
      
      sendCursorChange(roomId, cursor, currentUser);
    },
    [roomId, user]
  );

  const handleSimulationRequest = useCallback(
    (code: string, language: string) => {
      requestSimulation(roomId, code, language);
    },
    [roomId]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (codeChangeTimeoutRef.current) {
        clearTimeout(codeChangeTimeoutRef.current);
      }
      if (enabled) {
        disconnectSocket();
      }
    };
  }, [enabled]);

  return {
    isConnected,
    participants,
    cursors,
    currentCode,
    currentLanguage,
    handleCodeChange,
    handleLanguageChange,
    handleCursorChange,
    handleSimulationRequest,
  };
}
