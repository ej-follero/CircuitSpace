/**
 * Supabase Helper Functions
 * Common utilities for working with Supabase and Clerk
 */

import { createServerSupabase } from './server'
import { supabase } from './client'
import { auth, currentUser } from '@clerk/nextjs/server'
import type { Database } from './types'

type Project = Database['public']['Tables']['projects']['Row']
type Simulation = Database['public']['Tables']['simulations']['Row']
type CollabRoom = Database['public']['Tables']['collab_rooms']['Row']

/**
 * Get or create user from Clerk ID
 */
export async function getOrCreateUserFromClerk() {
  const { userId } = await auth()
  if (!userId) return null

  const user = await currentUser()
  if (!user) return null

  const serverSupabase = await createServerSupabase()
  
  const { data, error } = await serverSupabase.rpc('get_or_create_user', {
    p_clerk_id: userId,
    p_email: user.emailAddresses[0]?.emailAddress || null,
    p_name: user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.firstName || null,
    p_image: user.imageUrl || null,
  })

  if (error) {
    console.error('Error getting/creating user:', error)
    return null
  }

  return data
}

/**
 * Get user's projects
 */
export async function getUserProjects(limit = 50) {
  const userId = await getOrCreateUserFromClerk()
  if (!userId) return []

  const serverSupabase = await createServerSupabase()
  
  const { data, error } = await serverSupabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return data as Project[]
}

/**
 * Get public projects
 */
export async function getPublicProjects(limit = 20) {
  const serverSupabase = await createServerSupabase()
  
  const { data, error } = await serverSupabase
    .from('projects')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching public projects:', error)
    return []
  }

  return data as Project[]
}

/**
 * Create a new project
 */
export async function createProject(
  title: string,
  code: string,
  language: 'arduino' | 'javascript' = 'javascript',
  options?: {
    description?: string
    presetType?: string
    isPublic?: boolean
    parentId?: string
  }
) {
  const userId = await getOrCreateUserFromClerk()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const serverSupabase = await createServerSupabase()
  
  // Generate slug
  const { data: slugData } = await serverSupabase.rpc('generate_slug', {
    title,
  })

  const slug = slugData || title.toLowerCase().replace(/\s+/g, '-')

  const { data, error } = await serverSupabase
    .from('projects')
    .insert({
      title,
      slug,
      code,
      language,
      description: options?.description || null,
      preset_type: options?.presetType || null,
      is_public: options?.isPublic || false,
      parent_id: options?.parentId || null,
      user_id: userId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    throw error
  }

  return data as Project
}

/**
 * Save simulation results
 */
export async function saveSimulation(
  projectId: string,
  codeHash: string,
  logs: unknown[],
  metrics: Record<string, unknown>,
  inputs?: unknown,
  durationMs?: number
) {
  const serverSupabase = await createServerSupabase()
  
  const { data, error } = await serverSupabase
    .from('simulations')
    .insert({
      project_id: projectId,
      code_hash: codeHash,
      logs,
      metrics,
      inputs: inputs || null,
      duration_ms: durationMs || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving simulation:', error)
    throw error
  }

  return data as Simulation
}

/**
 * Create or update collaboration room
 */
export async function createCollabRoom(
  projectId: string,
  expiresInHours = 24
) {
  const userId = await getOrCreateUserFromClerk()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const serverSupabase = await createServerSupabase()
  const roomId = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + expiresInHours)

  const { data, error } = await serverSupabase
    .from('collab_rooms')
    .insert({
      room_id: roomId,
      project_id: projectId,
      owner_id: userId,
      members: [],
      state: null,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating collab room:', error)
    throw error
  }

  return data as CollabRoom
}

/**
 * Subscribe to real-time project updates
 */
export function subscribeToProject(
  projectId: string,
  callback: (payload: { new: Project; old?: Project }) => void
) {
  const channel = supabase
    .channel(`project:${projectId}`)
    .on(
      'postgres_changes' as any,
      {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `id=eq.${projectId}`,
      },
      (payload: any) => {
        callback(payload)
      }
    )
    .subscribe()
  
  return {
    unsubscribe: () => {
      supabase.removeChannel(channel)
    }
  }
}

/**
 * Subscribe to collaboration room updates
 */
export function subscribeToCollabRoom(
  roomId: string,
  callback: (payload: { new: CollabRoom; old?: CollabRoom }) => void
) {
  const channel = supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes' as any,
      {
        event: '*',
        schema: 'public',
        table: 'collab_rooms',
        filter: `room_id=eq.${roomId}`,
      },
      (payload: any) => {
        callback(payload)
      }
    )
    .subscribe()
  
  return {
    unsubscribe: () => {
      supabase.removeChannel(channel)
    }
  }
}
