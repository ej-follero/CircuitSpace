/**
 * Supabase Usage Examples
 * Copy and adapt these patterns for your components
 */

'use client'

import { useEffect, useState } from 'react'
import { supabase } from './client'
import { createProject, getUserProjects, saveSimulation, subscribeToProject, subscribeToCollabRoom } from './helpers'
import type { Database } from './types'

type Project = Database['public']['Tables']['projects']['Row']

/**
 * Example: Fetch user's projects in a Server Component
 */
export async function ProjectsListServer() {
  const projects = await getUserProjects()
  
  return (
    <div>
      {projects.map((project) => (
        <div key={project.id}>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
        </div>
      ))}
    </div>
  )
}

/**
 * Example: Real-time project updates in a Client Component
 */
export function ProjectEditor({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    // Fetch initial project
    supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()
      .then(({ data }) => setProject(data))

    // Subscribe to real-time updates
    const subscription = subscribeToProject(projectId, (payload) => {
      setProject(payload.new)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [projectId])

  const handleSave = async (code: string) => {
    if (!project) return

    const { error } = await supabase
      .from('projects')
      .update({ code, updated_at: new Date().toISOString() })
      .eq('id', projectId)

    if (error) {
      console.error('Error saving project:', error)
    }
  }

  return (
    <div>
      {project && (
        <>
          <h1>{project.title}</h1>
          <textarea
            value={project.code}
            onChange={(e) => handleSave(e.target.value)}
          />
        </>
      )}
    </div>
  )
}

/**
 * Example: Real-time collaboration room
 */
export function CollabRoom({ roomId }: { roomId: string }) {
  const [state, setState] = useState<any>(null)

  useEffect(() => {
    const subscription = subscribeToCollabRoom(roomId, (payload) => {
      setState(payload.new.state)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [roomId])

  const updateState = async (newState: any) => {
    const { error } = await supabase
      .from('collab_rooms')
      .update({ state: newState })
      .eq('room_id', roomId)

    if (error) {
      console.error('Error updating room state:', error)
    }
  }

  return (
    <div>
      {/* Your collaboration UI here */}
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  )
}

/**
 * Example: Create a new project
 */
export function CreateProjectForm() {
  const [title, setTitle] = useState('')
  const [code, setCode] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const project = await createProject(title, code, 'javascript', {
        description: 'My new project',
        isPublic: false,
      })
      
      console.log('Project created:', project)
      // Redirect or update UI
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Project title"
      />
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Code"
      />
      <button type="submit">Create Project</button>
    </form>
  )
}

/**
 * Example: Save simulation results
 */
export async function runSimulation(projectId: string, code: string) {
  // Run your simulation logic here
  const logs = ['Simulation started', 'Processing...', 'Complete']
  const metrics = { cpu: 12.4, memory: 2048, errors: [] }
  const codeHash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(code)
  ).then(hash => Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join(''))

  try {
    const simulation = await saveSimulation(
      projectId,
      codeHash,
      logs,
      metrics,
      { sensor1: 25.5 },
      1234
    )
    
    return simulation
  } catch (error) {
    console.error('Error saving simulation:', error)
    throw error
  }
}
