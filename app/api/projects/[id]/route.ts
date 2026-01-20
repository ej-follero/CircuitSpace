/**
 * Individual Project API Route
 * Handles DELETE (delete project) and PATCH (update project)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createServerSupabase()
    
    // Get user ID from Supabase
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete project (RLS will ensure user owns it)
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', userData.id)

    if (error) {
      console.error('Error deleting project:', error)
      return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/projects/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, code, language, description } = body

    const supabase = await createServerSupabase()
    
    // Get user ID from Supabase
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update project
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (title !== undefined) {
      updateData.title = title
      // Regenerate slug if title changed
      const { data: slugData } = await supabase.rpc('generate_slug', { title })
      updateData.slug = slugData || title.toLowerCase().replace(/\s+/g, '-')
    }
    if (code !== undefined) updateData.code = code
    if (language !== undefined) updateData.language = language
    if (description !== undefined) updateData.description = description

    const { data: project, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userData.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
    }

    // Transform to match frontend Project type
    const transformedProject = {
      id: project.id,
      name: project.title,
      description: project.description || undefined,
      code: project.code,
      language: project.language,
      createdAt: new Date(project.created_at),
      updatedAt: new Date(project.updated_at),
      userId: project.user_id,
    }

    return NextResponse.json(transformedProject)
  } catch (error) {
    console.error('Error in PATCH /api/projects/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
