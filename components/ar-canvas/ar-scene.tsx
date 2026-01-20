"use client";

import { ARCanvas } from "./ARCanvas";
import { ExtendedSimulationResult } from "./ARUtils";

interface ARSceneProps {
  devices?: Array<{
    type: string;
    model: string;
    position: { x: number; y: number; z: number };
    color?: string;
  }>;
  simData?: ExtendedSimulationResult;
}

/**
 * ARScene component - now uses WebXR instead of AR.js
 * 
 * @deprecated ARMarkerDetection (AR.js) - This component now uses ARCanvas (WebXR)
 * The old ARMarkerDetection component is kept for reference but should not be used.
 */
export function ARScene({ devices, simData }: ARSceneProps) {
  // Convert devices to simData format if needed
  // For now, just use the provided simData or empty
  return (
    <ARCanvas 
      simData={simData}
      fallbackMode={false}
    />
  );
}
