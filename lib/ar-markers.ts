/**
 * AR Marker Generation Utilities
 * Generates printable AR markers (Hiro pattern, custom patterns)
 */

export interface MarkerConfig {
  type: 'hiro' | 'kanji' | 'custom'
  size?: number // in mm
  patternUrl?: string // for custom patterns
}

/**
 * Generate a printable Hiro marker PDF
 */
export async function generateHiroMarkerPDF(): Promise<Blob> {
  // Create canvas with Hiro marker pattern
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 800
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Could not create canvas context')
  }

  // White background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Black border
  ctx.fillStyle = '#000000'
  const borderWidth = 40
  ctx.fillRect(0, 0, canvas.width, borderWidth) // Top
  ctx.fillRect(0, 0, borderWidth, canvas.height) // Left
  ctx.fillRect(canvas.width - borderWidth, 0, borderWidth, canvas.height) // Right
  ctx.fillRect(0, canvas.height - borderWidth, canvas.width, borderWidth) // Bottom

  // Inner pattern (simplified Hiro pattern representation)
  const cellSize = 80
  const gridSize = 8
  const startX = borderWidth + cellSize
  const startY = borderWidth + cellSize

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const x = startX + col * cellSize
      const y = startY + row * cellSize
      
      // Simplified Hiro pattern (checkerboard-like with specific pattern)
      const isBlack = (row + col) % 3 === 0 || (row === 2 && col === 2) || (row === 5 && col === 5)
      
      if (isBlack) {
        ctx.fillRect(x, y, cellSize - 10, cellSize - 10)
      }
    }
  }

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to create blob'))
      }
    }, 'image/png')
  })
}

/**
 * Download marker as PDF/image
 */
export async function downloadMarker(type: 'hiro' | 'kanji' = 'hiro') {
  try {
    if (type === 'hiro') {
      // For Hiro, we can use the official image
      const link = document.createElement('a')
      link.href = 'https://jeromeetienne.github.io/AR.js/data/images/HIRO.jpg'
      link.download = 'hiro-marker.jpg'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // Generate custom marker
      const blob = await generateHiroMarkerPDF()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${type}-marker.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error('Failed to download marker:', error)
    throw error
  }
}

/**
 * Generate custom pattern file (.patt) for AR.js
 * Note: This is a placeholder - actual pattern generation requires AR.js tools
 */
export function generateCustomPattern(patternId: string): string {
  // In production, this would generate a .patt file
  // For now, return a URL to a pattern generator service or local pattern
  return `/markers/${patternId}.patt`
}
