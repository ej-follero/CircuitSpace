"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";

export function ARScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || isInitialized) return;

    // Capture the container ref value at the start of the effect
    const container = containerRef.current;
    let animationFrameId: number | null = null;

    try {
      // Initialize Three.js scene
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(
        container.clientWidth,
        container.clientHeight
      );
      container.appendChild(renderer.domElement);

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      // Add a simple 3D model (ESP32 representation)
      const geometry = new THREE.BoxGeometry(2, 1, 0.5);
      const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
      const esp32 = new THREE.Mesh(geometry, material);
      esp32.position.set(0, 0, -5);
      scene.add(esp32);

      // Add RFID reader representation
      const rfidGeometry = new THREE.BoxGeometry(1, 0.5, 0.3);
      const rfidMaterial = new THREE.MeshStandardMaterial({ color: 0x0066ff });
      const rfidReader = new THREE.Mesh(rfidGeometry, rfidMaterial);
      rfidReader.position.set(2, 0, -5);
      scene.add(rfidReader);

      // Animation loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        esp32.rotation.y += 0.01;
        rfidReader.rotation.y += 0.005;
        renderer.render(scene, camera);
      };
      animate();

      setIsInitialized(true);

      // Cleanup
      return () => {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }
        if (container && renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize AR scene");
    }
  }, [isInitialized]);

  const handleStartAR = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // In a real implementation, you'd integrate AR.js here
      // For now, we'll just show a message
      alert("AR camera access granted. AR.js integration would go here.");
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      setError("Failed to access camera for AR");
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AR Visualization</CardTitle>
            <CardDescription>3D device visualization</CardDescription>
          </div>
          <Button onClick={handleStartAR} size="sm">
            <Camera className="mr-2 h-4 w-4" />
            Start AR
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="h-96 w-full rounded bg-black"
          style={{ minHeight: "400px" }}
        >
          {!isInitialized && !error && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {error && (
            <div className="flex h-full items-center justify-center text-destructive">
              {error}
            </div>
          )}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {isInitialized
            ? "3D scene loaded. Click 'Start AR' to enable marker-based AR."
            : "Loading 3D scene..."}
        </p>
      </CardContent>
    </Card>
  );
}
