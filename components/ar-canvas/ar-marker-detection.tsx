"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, X } from "lucide-react";

interface ARMarkerDetectionProps {
  onMarkerDetected?: (markerId: string) => void;
  onMarkerLost?: (markerId: string) => void;
  devices?: Array<{
    type: string;
    model: string;
    position: { x: number; y: number; z: number };
    color?: string;
  }>;
}

export function ARMarkerDetection({
  onMarkerDetected,
  onMarkerLost,
  devices = [],
}: ARMarkerDetectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedMarkers, setDetectedMarkers] = useState<Set<string>>(new Set());
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const arToolkitContextRef = useRef<any>(null);
  const arToolkitSourceRef = useRef<any>(null);
  const markerRootsRef = useRef<Map<string, THREE.Group>>(new Map());
  const animationFrameRef = useRef<number | null>(null);

  // Load AR.js scripts dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadARJS = async () => {
      try {
        // Check if AR.js is already loaded
        if ((window as any).THREE && (window as any).THREEx) {
          setIsInitialized(true);
          return;
        }

        // Load Three.js if not already loaded (AR.js depends on it)
        if (!(window as any).THREE) {
          // Three.js is already imported, so we just need to expose it
          (window as any).THREE = THREE;
        }

        // Load AR.js from CDN
        const arjsScript = document.createElement("script");
        arjsScript.src = "https://cdn.jsdelivr.net/npm/ar.js@2.2.2/build/ar.js";
        arjsScript.async = true;
        arjsScript.onload = () => {
          setIsInitialized(true);
        };
        arjsScript.onerror = () => {
          setError("Failed to load AR.js library");
        };
        document.head.appendChild(arjsScript);

        return () => {
          if (arjsScript.parentNode) {
            arjsScript.parentNode.removeChild(arjsScript);
          }
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize AR.js");
      }
    };

    loadARJS();
  }, []);

  // Initialize AR scene when ready
  useEffect(() => {
    if (!isInitialized || !containerRef.current || !isARActive) return;

    const container = containerRef.current;
    let arToolkitContext: any;
    let arToolkitSource: any;
    let scene: THREE.Scene;
    let camera: THREE.Camera;
    let renderer: THREE.WebGLRenderer;
    let video: HTMLVideoElement;

    const initAR = async () => {
      try {
        // Get video element
        video = videoRef.current!;

        // Initialize Three.js scene
        scene = new THREE.Scene();
        sceneRef.current = scene;

        // Create camera (AR.js will control this)
        camera = new THREE.Camera();
        cameraRef.current = camera;
        scene.add(camera);

        // Create renderer
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          precision: "mediump",
        });
        renderer.setClearColor(0x000000, 0);
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        rendererRef.current = renderer;
        container.appendChild(renderer.domElement);

        // Initialize AR.js source (handles video)
        const THREEx = (window as any).THREEx;
        if (!THREEx || !THREEx.ArToolkitSource) {
          throw new Error("AR.js not properly loaded. Please refresh the page.");
        }

        arToolkitSource = new THREEx.ArToolkitSource({
          sourceType: "webcam",
        });

        arToolkitSource.init(() => {
          arToolkitSource.onResizeElement();
          arToolkitSource.onResize();
        });

        arToolkitSourceRef.current = arToolkitSource;

        // Initialize AR.js context (handles marker detection)
        arToolkitContext = new THREEx.ArToolkitContext({
          cameraParametersUrl: "https://cdn.jsdelivr.net/npm/ar.js@2.2.2/data/data/camera_para.dat",
          detectionMode: "mono",
          maxDetectionRate: 60,
          canvasWidth: 640,
          canvasHeight: 480,
          imageSmoothingEnabled: true,
        });

        arToolkitContext.init(() => {
          camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
        });

        arToolkitContextRef.current = arToolkitContext;

        // Create AR.js marker controls for Hiro pattern
        const markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, camera, {
          type: "pattern",
          patternUrl: "https://cdn.jsdelivr.net/npm/ar.js@2.2.2/data/data/patt.hiro",
        });

        // Create AR.js marker controls for Kanji pattern
        const markerControls2 = new THREEx.ArMarkerControls(arToolkitContext, camera, {
          type: "pattern",
          patternUrl: "https://cdn.jsdelivr.net/npm/ar.js@2.2.2/data/data/patt.kanji",
        });

        // Create marker roots for different marker patterns
        // Hiro marker (default pattern)
        const hiroMarkerRoot = new THREE.Group();
        hiroMarkerRoot.userData.markerId = "hiro";
        scene.add(hiroMarkerRoot);
        markerRootsRef.current.set("hiro", hiroMarkerRoot);

        // Kanji marker
        const kanjiMarkerRoot = new THREE.Group();
        kanjiMarkerRoot.userData.markerId = "kanji";
        scene.add(kanjiMarkerRoot);
        markerRootsRef.current.set("kanji", kanjiMarkerRoot);

        // Add 3D devices to markers
        devices.forEach((device, index) => {
          const markerId = index === 0 ? "hiro" : "kanji";
          const markerRoot = markerRootsRef.current.get(markerId);
          if (markerRoot) {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({
              color: device.color || 0x00ff00,
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
              device.position.x,
              device.position.y,
              device.position.z
            );
            mesh.userData.deviceType = device.type;
            markerRoot.add(mesh);
          }
        });

        // Add default IoT devices if none provided
        if (devices.length === 0) {
          const hiroRoot = markerRootsRef.current.get("hiro");
          if (hiroRoot) {
            // ESP32 representation
            const esp32Geometry = new THREE.BoxGeometry(2, 1, 0.5);
            const esp32Material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
            const esp32 = new THREE.Mesh(esp32Geometry, esp32Material);
            esp32.position.set(0, 0.5, 0);
            hiroRoot.add(esp32);

            // RFID reader representation
            const rfidGeometry = new THREE.BoxGeometry(1, 0.5, 0.3);
            const rfidMaterial = new THREE.MeshStandardMaterial({ color: 0x0066ff });
            const rfidReader = new THREE.Mesh(rfidGeometry, rfidMaterial);
            rfidReader.position.set(1.5, 0.5, 0);
            hiroRoot.add(rfidReader);
          }
        }

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // Animation loop
        const animate = () => {
          animationFrameRef.current = requestAnimationFrame(animate);

          if (arToolkitSource && arToolkitSource.ready !== false) {
            arToolkitContext.update(arToolkitSource.domElement);
            scene.visible = camera.visible;

            // Check for detected markers
            const detected = new Set<string>();
            markerRootsRef.current.forEach((root, markerId) => {
              if (root.visible) {
                detected.add(markerId);
                if (!detectedMarkers.has(markerId)) {
                  onMarkerDetected?.(markerId);
                }
              } else {
                if (detectedMarkers.has(markerId)) {
                  onMarkerLost?.(markerId);
                }
              }
            });
            setDetectedMarkers(detected);
          }

          renderer.render(scene, camera);
        };
        animate();

        // Handle window resize
        const handleResize = () => {
          if (container && arToolkitSource) {
            arToolkitSource.onResizeElement();
            arToolkitSource.onResize();
            renderer.setSize(container.clientWidth, container.clientHeight);
            if (arToolkitContext) {
              arToolkitContext.arController.setProjectionMatrix();
            }
          }
        };
        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize AR");
        console.error("AR initialization error:", err);
      }
    };

    initAR();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current && container.contains(rendererRef.current.domElement)) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      if (video && video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isInitialized, isARActive, devices, detectedMarkers, onMarkerDetected, onMarkerLost]);

  const handleStartAR = async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsARActive(true);
      }
    } catch (err) {
      setError("Failed to access camera. Please ensure camera permissions are granted.");
      console.error("Camera access error:", err);
    }
  };

  const handleStopAR = () => {
    setIsARActive(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setDetectedMarkers(new Set());
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AR Marker Detection</CardTitle>
            <CardDescription>
              Point your camera at AR markers to visualize IoT devices
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {!isARActive ? (
              <Button onClick={handleStartAR} size="sm" disabled={!isInitialized}>
                <Camera className="mr-2 h-4 w-4" />
                Start AR
              </Button>
            ) : (
              <Button onClick={handleStopAR} size="sm" variant="destructive">
                <X className="mr-2 h-4 w-4" />
                Stop AR
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div
            ref={containerRef}
            className="relative h-96 w-full overflow-hidden rounded bg-black"
            style={{ minHeight: "400px" }}
          >
            {isARActive && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 h-full w-full object-cover"
                style={{ display: "none" }} // Hidden, AR.js handles rendering
              />
            )}
            {!isInitialized && !error && (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {error && (
              <div className="flex h-full items-center justify-center text-destructive">
                <div className="text-center">
                  <p className="font-semibold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              {isARActive
                ? detectedMarkers.size > 0
                  ? `Detected ${detectedMarkers.size} marker(s): ${Array.from(detectedMarkers).join(", ")}`
                  : "Point your camera at an AR marker (Hiro or Kanji pattern)"
                : isInitialized
                ? "Click 'Start AR' to begin marker detection"
                : "Loading AR.js library..."}
            </p>
            {!isARActive && isInitialized && (
              <div className="rounded-lg bg-muted p-3 text-xs">
                <p className="font-semibold mb-1">AR Marker Instructions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Print or display an AR marker pattern (Hiro or Kanji)</li>
                  <li>Click &quot;Start AR&quot; to activate your camera</li>
                  <li>Point camera at the marker to see 3D devices</li>
                  <li>
                    <a
                      href="https://jeromeetienne.github.io/AR.js/data/images/HIRO.jpg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Download Hiro Marker
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
