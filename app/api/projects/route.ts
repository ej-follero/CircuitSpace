/**
 * Projects API Route
 * Handles GET (list user's projects) and POST (create new project)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const supabase = await createServerSupabase()
    
    // Get or create user in Supabase
    const { data: userIdData, error: userError } = await supabase.rpc('get_or_create_user', {
      p_clerk_id: userId,
      p_email: user.emailAddresses[0]?.emailAddress || null,
      p_name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || null,
      p_image: user.imageUrl || null,
    })

    if (userError || !userIdData) {
      console.error('Error getting/creating user:', userError)
      return NextResponse.json({ error: 'Failed to get user' }, { status: 500 })
    }

    // Get user's projects
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userIdData)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    // Transform to match frontend Project type
    const transformedProjects = projects.map((p) => ({
      id: p.id,
      name: p.title,
      description: p.description || undefined,
      code: p.code,
      language: p.language,
      createdAt: new Date(p.created_at),
      updatedAt: new Date(p.updated_at),
      userId: p.user_id,
    }))

    return NextResponse.json(transformedProjects)
  } catch (error) {
    console.error('Error in GET /api/projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, code, language, description } = body

    if (!title || !code || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: title, code, language' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabase()
    
    // Get or create user in Supabase
    const { data: userIdData, error: userError } = await supabase.rpc('get_or_create_user', {
      p_clerk_id: userId,
      p_email: user.emailAddresses[0]?.emailAddress || null,
      p_name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || null,
      p_image: user.imageUrl || null,
    })

    if (userError || !userIdData) {
      console.error('Error getting/creating user:', userError)
      return NextResponse.json({ error: 'Failed to get user' }, { status: 500 })
    }

    // Generate slug
    const { data: slugData } = await supabase.rpc('generate_slug', {
      title,
    })

    const slug = slugData || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        title,
        slug,
        code,
        language,
        description: description || null,
        user_id: userIdData,
        is_public: false,
      })
      .select()
      .single()

    if (projectError) {
      console.error('Error creating project:', projectError)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
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

    return NextResponse.json(transformedProject, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
