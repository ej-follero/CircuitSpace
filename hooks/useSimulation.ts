import { useState, useEffect } from 'react'
import { ExtendedSimulationResult } from '@/components/ar-canvas/ARUtils'
import { SimulationResult } from '@/lib/types'

export function useSimulation(initialData?: SimulationResult) {
  const [simData, setSimData] = useState<ExtendedSimulationResult | undefined>(
    initialData ? {
      ...initialData,
      metrics: {
        ...initialData.metrics,
        errors: initialData.errors || [],
      },
      rfid: {
        scanned: false,
      },
    } : undefined
  )

  // Extract RFID data from simulation output
  useEffect(() => {
    if (initialData?.output) {
      const rfidData = initialData.output.rfid || initialData.output.RFID
      if (rfidData) {
        setSimData((prev) => ({
          ...prev!,
          rfid: {
            scanned: !!rfidData.scanned || !!rfidData.cardId,
            cardId: rfidData.cardId,
            timestamp: rfidData.timestamp || Date.now(),
          },
        }))
      }
    }
  }, [initialData?.output])

  // Simulate RFID scan from logs
  useEffect(() => {
    if (initialData?.logs) {
      const hasRFIDScan = initialData.logs.some(
        (log) => log.toLowerCase().includes('rfid') || log.toLowerCase().includes('card')
      )
      if (hasRFIDScan) {
        setSimData((prev) => ({
          ...prev!,
          rfid: {
            scanned: true,
            timestamp: Date.now(),
          },
        }))
      }
    }
  }, [initialData?.logs])

  return { simData, setSimData }
}
