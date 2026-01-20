'use client'

import { ARCanvas } from '@/components/ar-canvas/ARCanvas'
import { useSimulation } from '@/hooks/useSimulation'
import { SimulationResult } from '@/lib/types'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ARPage() {
  const [simData, setSimData] = useState<SimulationResult | undefined>()
  const { simData: extendedSimData } = useSimulation(simData)
  const [fallbackMode, setFallbackMode] = useState(false)

  // Example: Load simulation data from API or props
  useEffect(() => {
    // In production, this would fetch from your API
    // For now, using example data
    const exampleSimData: SimulationResult = {
      success: true,
      logs: [
        'ESP32 initialized',
        'RFID reader ready',
        'Card scanned: 12345678',
      ],
      metrics: {
        cpu: 45,
        memory: 512,
        executionTime: 1200,
        dataTransferred: 256,
      },
      errors: [],
      output: {
        rfid: {
          scanned: true,
          cardId: '12345678',
          timestamp: Date.now(),
        },
      },
    }
    setSimData(exampleSimData)
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden">
      <ARCanvas 
        simData={extendedSimData} 
        fallbackMode={fallbackMode}
        onFallbackChange={setFallbackMode}
      />
      {simData && (
        <Card className="absolute bottom-4 right-4 w-80 bg-black/70 backdrop-blur-sm border-white/20 z-10">
          <CardHeader>
            <CardTitle className="text-white">Simulation Status</CardTitle>
            <CardDescription className="text-white/70">
              Real-time IoT device visualization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-white">
            <div>
              <span className="font-semibold">Status:</span>{' '}
              <span className={simData.success ? 'text-green-400' : 'text-red-400'}>
                {simData.success ? 'Running' : 'Error'}
              </span>
            </div>
            <div>
              <span className="font-semibold">CPU:</span> {simData.metrics.cpu}%
            </div>
            <div>
              <span className="font-semibold">Memory:</span> {simData.metrics.memory} KB
            </div>
            {extendedSimData?.rfid?.scanned && (
              <div className="pt-2 border-t border-white/20">
                <span className="font-semibold text-green-400">RFID Card Detected</span>
                {extendedSimData.rfid.cardId && (
                  <p className="text-xs text-white/70 mt-1">
                    Card ID: {extendedSimData.rfid.cardId}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
