'use client'

import { Canvas } from '@react-three/fiber'
import { ExtendedSimulationResult } from './ARUtils'
import { IoTDevice } from './devices/IoTDevice'
import { Leva } from 'leva'
import { Suspense, useState, useEffect } from 'react'
import { Loader, OrbitControls } from '@react-three/drei'
import { createXRStore, XR, useXR } from '@react-three/xr'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { downloadMarker } from '@/lib/ar-markers'
import { Button } from '@/components/ui/button'
import { Download, RotateCcw } from 'lucide-react'

interface ARCanvasProps {
  simData?: ExtendedSimulationResult
  fallbackMode?: boolean
  onFallbackChange?: (fallback: boolean) => void
}

// Component to handle WebXR image tracking and hit-testing
function ImageTrackedDevice({ simData }: { simData?: ExtendedSimulationResult }) {
  const groupRef = useRef<THREE.Group>(null)
  const xrState = useXR()
  const { gl } = useThree()

  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Check if in XR session
    const isPresenting = xrState?.mode === 'immersive-ar'
    if (!isPresenting || !gl.xr) {
      // Not in AR mode, hide or position elsewhere
      return
    }

    const session = gl.xr.getSession()
    if (!session) return

    // Try image tracking first (if available)
    if ('trackedImages' in session) {
      const trackedImages = (session as any).trackedImages
      if (trackedImages && trackedImages.size > 0) {
        for (const trackedImage of trackedImages.values()) {
          if (trackedImage.trackingState === 'tracked') {
            const pose = trackedImage.imageSpace
            if (pose && groupRef.current) {
              const transform = pose.transform
              const position = transform.position
              const orientation = transform.orientation
              groupRef.current.position.set(position.x, position.y, position.z)
              groupRef.current.quaternion.set(orientation.x, orientation.y, orientation.z, orientation.w)
              return // Successfully tracked
            }
          }
        }
      }
    }

    // Fallback: Position device at fixed distance in front of camera
    // This works even without image tracking
    if (groupRef.current) {
      groupRef.current.position.set(0, 0, -1) // 1 meter in front
      groupRef.current.rotation.set(0, 0, 0)
    }
  })

  return (
    <group ref={groupRef}>
      <IoTDevice simData={simData} />
    </group>
  )
}

export function ARCanvas({ simData, fallbackMode: initialFallback, onFallbackChange }: ARCanvasProps) {
  const [fallbackMode, setFallbackMode] = useState(initialFallback || false)
  const [isXRSupported, setIsXRSupported] = useState<boolean | null>(null)

  // Create XR store for WebXR v6 API
  const xrStore = useMemo(() => {
    return createXRStore({
      // Enable hand and controller tracking by default
      hand: true,
      controller: true,
    })
  }, [])

  // Prepare image tracking for Hiro marker (load once)
  const [trackedImageBitmap, setTrackedImageBitmap] = useState<ImageBitmap | null>(null)
  
  useEffect(() => {
    // Load marker image for tracking
    const loadMarker = async () => {
      try {
        const response = await fetch('/markers/hiro.jpg')
        const blob = await response.blob()
        const imageBitmap = await createImageBitmap(blob)
        setTrackedImageBitmap(imageBitmap)
      } catch (error) {
        console.warn('Failed to load marker image for tracking:', error)
      }
    }
    loadMarker()
  }, [])

  useEffect(() => {
    // Check WebXR support
    if (typeof navigator !== 'undefined' && 'xr' in navigator) {
      navigator.xr?.isSessionSupported('immersive-ar').then((supported) => {
        setIsXRSupported(supported)
        if (!supported && initialFallback === undefined) {
          setFallbackMode(true)
        }
      }).catch(() => {
        setIsXRSupported(false)
        setFallbackMode(true)
      })
    } else {
      setIsXRSupported(false)
      setFallbackMode(true)
    }
  }, [initialFallback])

  const handleDownloadMarker = async () => {
    try {
      await downloadMarker('hiro')
    } catch (error) {
      console.error('Failed to download marker:', error)
    }
  }

  const toggleMode = () => {
    const newMode = !fallbackMode
    setFallbackMode(newMode)
    onFallbackChange?.(newMode)
  }

  return (
    <div className="w-full h-screen relative bg-black">
      <Leva collapsed />
      
      {/* AR Button - only show if WebXR is supported and not in fallback mode */}
      {!fallbackMode && isXRSupported && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={async () => {
              try {
                // Configure session options with image tracking if available
                const sessionOptions: XRSessionInit = {
                  requiredFeatures: ['local-floor'],
                  optionalFeatures: ['hand-tracking', 'hit-test'],
                }
                
                // Add image tracking if marker loaded
                if (trackedImageBitmap) {
                  (sessionOptions as any).trackedImages = [
                    {
                      image: trackedImageBitmap,
                      widthInMeters: 0.1, // Marker size in meters (10cm)
                    },
                  ]
                }
                
                // Enter AR with session options
                await (xrStore as any).enterAR(sessionOptions)
                console.log('WebXR AR session started')
              } catch (error) {
                console.error('Failed to start WebXR AR session:', error)
              }
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Enter AR
          </button>
        </div>
      )}

      <Canvas
        camera={{ fov: 60, position: [0, 0, 5] }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {!fallbackMode && isXRSupported ? (
            <XR store={xrStore}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[1, 1, 1]} intensity={0.8} />
              
              {/* WebXR Image Tracking - device will be positioned at tracked marker */}
              {/* Hand and controller rendering is handled by the store configuration */}
              <ImageTrackedDevice simData={simData} />
            </XR>
          ) : (
            <>
              <ambientLight intensity={0.6} />
              <directionalLight position={[1, 1, 1]} intensity={0.8} />
              <IoTDevice simData={simData} />
              <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
            </>
          )}
        </Suspense>
      </Canvas>
      
      <div className="absolute top-4 left-4 text-white bg-black/70 px-4 py-2 rounded-lg backdrop-blur-sm z-10 space-y-2 max-w-sm">
        {fallbackMode ? (
          <p className="text-sm">3D Orbit Mode (No AR)</p>
        ) : isXRSupported === false ? (
          <div className="space-y-2">
            <p className="text-sm text-yellow-400">WebXR not detected - using 3D mode</p>
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer hover:text-white">Enable WebXR on Desktop</summary>
              <div className="mt-2 space-y-1 pl-2 border-l-2 border-yellow-400/30">
                <p><strong>Chrome/Edge:</strong></p>
                <p>1. Go to <code className="bg-black/50 px-1 rounded">chrome://flags/#webxr-incubations</code></p>
                <p>2. Enable &quot;WebXR Incubations&quot;</p>
                <p>3. Restart browser</p>
                <p className="mt-2"><strong>Firefox:</strong></p>
                <p>1. Go to <code className="bg-black/50 px-1 rounded">about:config</code></p>
                <p>2. Set <code className="bg-black/50 px-1 rounded">dom.vr.webxr.enabled</code> to <code className="bg-black/50 px-1 rounded">true</code></p>
                <p className="mt-2 text-yellow-300">Note: Desktop WebXR requires a camera and may have limited AR features.</p>
              </div>
            </details>
          </div>
        ) : (
          <p className="text-sm">WebXR AR Mode - Click AR button to start</p>
        )}
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadMarker}
            className="text-xs"
            suppressHydrationWarning
          >
            <Download className="h-3 w-3 mr-1" />
            Marker
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={toggleMode}
            className="text-xs"
            suppressHydrationWarning
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            {fallbackMode ? 'AR Mode' : '3D Mode'}
          </Button>
        </div>
        {isXRSupported === false && (
          <p className="text-xs text-muted-foreground mt-2">
            Best experience: Use mobile device (iOS Safari 15+ or Android Chrome) or enable WebXR flags above.
          </p>
        )}
      </div>
      <Loader />
    </div>
  )
}
