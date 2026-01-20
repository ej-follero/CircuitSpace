/**
 * AR Utilities - Type definitions for AR components
 * 
 * @deprecated ARCamera, ARMarker, and useARContext have been removed.
 * The AR implementation now uses WebXR instead of AR.js.
 * Only type definitions are kept here for compatibility.
 */

// Extend SimulationResult to include RFID data
export interface ExtendedSimulationResult {
  success: boolean
  logs: string[]
  metrics: {
    cpu: number
    memory: number
    executionTime: number
    dataTransferred: number
    errors: Array<{
      line: number
      message: string
      type: 'error' | 'warning'
    }>
  }
  errors: Array<{
    line: number
    message: string
    type: 'error' | 'warning'
  }>
  output?: Record<string, any>
  rfid?: {
    scanned: boolean
    cardId?: string
    timestamp?: number
  }
}

/**
 * @deprecated ARMarkerProps - No longer used after WebXR migration
 * Kept for type compatibility only
 */
export interface ARMarkerProps {
  children?: React.ReactNode
  type?: 'hiro' | 'kanji' | string
  size?: number
  patternUrl?: string
}

// The following AR.js functions have been removed:
// - ARCamera() - Replaced by WebXR XR component
// - ARMarker() - Replaced by WebXR image tracking
// - useARContext() - No longer needed with WebXR
