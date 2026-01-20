"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Wifi, WifiOff } from "lucide-react";
import { useSocketCollab } from "@/hooks/use-socket-collab";
import type { SocketUser } from "@/lib/socket/client";

interface CollabRoomProps {
  roomId: string;
  projectId?: string;
  enabled?: boolean;
  onCodeChange?: (code: string) => void;
  onLanguageChange?: (language: "javascript" | "arduino") => void;
}

export function CollabRoom({
  roomId,
  projectId,
  enabled = true,
  onCodeChange,
  onLanguageChange,
}: CollabRoomProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(true);

  const {
    isConnected,
    participants,
    handleCodeChange,
    handleLanguageChange,
  } = useSocketCollab({
    roomId,
    enabled: enabled && isOpen,
    onCodeChange: (code) => {
      handleCodeChange(code);
      onCodeChange?.(code);
    },
    onLanguageChange: (language) => {
      handleLanguageChange(language);
      onLanguageChange?.(language);
    },
    onParticipantsChange: (participants) => {
      console.log("Participants updated:", participants);
    },
  });

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 rounded-full bg-primary p-3 shadow-lg hover:bg-primary/90"
      >
        <Users className="h-5 w-5 text-primary-foreground" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm shadow-lg sm:w-80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">Collaboration</CardTitle>
            {isConnected ? (
              <Badge variant="outline" className="gap-1">
                <Wifi className="h-3 w-3 text-green-500" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <WifiOff className="h-3 w-3 text-gray-500" />
                Disconnected
              </Badge>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>
        <CardDescription className="text-xs">
          Room: {roomId.slice(0, 8)}...
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Users className="h-3 w-3" />
              Participants ({participants.length})
            </div>
            <div className="space-y-1">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-2 rounded-md p-2 text-sm hover:bg-muted"
                >
                  {participant.image ? (
                    <Image
                      src={participant.image}
                      alt={participant.name}
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-full"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs">
                      {participant.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="flex-1 truncate">{participant.name}</span>
                  {participant.id === user?.id && (
                    <Badge variant="secondary" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
