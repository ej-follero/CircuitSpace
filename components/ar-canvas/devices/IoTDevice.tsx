'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ExtendedSimulationResult } from '../ARUtils'

interface IoTDeviceProps {
  simData?: ExtendedSimulationResult
}

export function IoTDevice({ simData }: IoTDeviceProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const ledBlinkRef = useRef(0)
  const particlesRef = useRef<THREE.Points | null>(null)
  const esp32MeshRef = useRef<THREE.Mesh | null>(null)
  const rfidMeshRef = useRef<THREE.Mesh | null>(null)

  // Create ESP32 and RFID models as primitives (fallback)
  // In production, you can replace these with useGLTF-loaded models
  useEffect(() => {
    // ESP32 representation
    const esp32Geometry = new THREE.BoxGeometry(2, 1, 0.5)
    const esp32Material = new THREE.MeshStandardMaterial({ 
      color: 0x00ff00,
      emissive: 0x002200,
      emissiveIntensity: 0.3
    })
    const esp32Mesh = new THREE.Mesh(esp32Geometry, esp32Material)
    esp32Mesh.position.set(0, 0, 0)
    groupRef.current.add(esp32Mesh)
    esp32MeshRef.current = esp32Mesh

    // RFID reader representation
    const rfidGeometry = new THREE.BoxGeometry(1, 0.5, 0.3)
    const rfidMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x0066ff,
      emissive: 0x001133,
      emissiveIntensity: 0.2
    })
    const rfidMesh = new THREE.Mesh(rfidGeometry, rfidMaterial)
    rfidMesh.position.set(0.2, 0, 0)
    groupRef.current.add(rfidMesh)
    rfidMeshRef.current = rfidMesh

    return () => {
      // Cleanup
      if (esp32MeshRef.current) {
        esp32MeshRef.current.geometry.dispose()
        if (esp32MeshRef.current.material instanceof THREE.Material) {
          esp32MeshRef.current.material.dispose()
        }
      }
      if (rfidMeshRef.current) {
        rfidMeshRef.current.geometry.dispose()
        if (rfidMeshRef.current.material instanceof THREE.Material) {
          rfidMeshRef.current.material.dispose()
        }
      }
    }
  }, [])

  // Create particle system for error visualization
  useEffect(() => {
    if (!simData?.metrics?.errors?.length) return

    const particleCount = 100
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 4
      positions[i3 + 1] = Math.random() * 2
      positions[i3 + 2] = (Math.random() - 0.5) * 4
      
      // Red particles for errors
      colors[i3] = 1
      colors[i3 + 1] = 0.2
      colors[i3 + 2] = 0.2
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    })

    const points = new THREE.Points(geometry, material)
    points.position.set(0, 1.5, 0)
    groupRef.current.add(points)
    particlesRef.current = points

    return () => {
      if (particlesRef.current) {
        groupRef.current.remove(particlesRef.current)
        particlesRef.current.geometry.dispose()
        if (particlesRef.current.material instanceof THREE.Material) {
          particlesRef.current.material.dispose()
        }
      }
    }
  }, [simData?.metrics?.errors])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Idle rotation
    groupRef.current.rotation.y += delta * 0.5

    // LED blink animation on RFID scan
    if (simData?.rfid?.scanned) {
      ledBlinkRef.current += delta * 10
      const intensity = Math.sin(ledBlinkRef.current) * 0.5 + 0.5
      
      // Animate ESP32 LED (emissive material)
      if (esp32MeshRef.current) {
        const material = esp32MeshRef.current.material as THREE.MeshStandardMaterial
        material.emissive.setHSL(0.3, 1, intensity * 0.5)
        material.emissiveIntensity = intensity * 0.5
      }

      // Animate RFID LED
      if (rfidMeshRef.current) {
        const material = rfidMeshRef.current.material as THREE.MeshStandardMaterial
        material.emissive.setHSL(0.6, 1, intensity * 0.3)
        material.emissiveIntensity = intensity * 0.3
      }
    }

    // Animate particles for errors
    if (particlesRef.current && simData?.metrics?.errors?.length) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += delta * 0.5 // Move up
        if (positions[i + 1] > 3) {
          positions[i + 1] = 0
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={0.3}>
      {/* Models are created in useEffect */}
    </group>
  )
}

// Note: To use GLB models, create a separate component like this:
// 
// function ESP32Model() {
//   const { scene } = useGLTF('/models/esp32.glb')
//   return <primitive object={scene.clone()} />
// }
//
// Then replace the primitive creation in useEffect with:
// <ESP32Model />
// <group position={[0.2, 0, 0]}><RFIDModel /></group>
