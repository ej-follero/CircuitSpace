"use client";

import { ARMarkerDetection } from "./ar-marker-detection";

interface ARSceneProps {
  devices?: Array<{
    type: string;
    model: string;
    position: { x: number; y: number; z: number };
    color?: string;
  }>;
}

export function ARScene({ devices }: ARSceneProps) {
  return (
    <ARMarkerDetection
      devices={devices}
      onMarkerDetected={(markerId) => {
        console.log(`Marker detected: ${markerId}`);
      }}
      onMarkerLost={(markerId) => {
        console.log(`Marker lost: ${markerId}`);
      }}
    />
  );
}
