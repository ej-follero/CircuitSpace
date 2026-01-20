-- Supabase Migration: Initial Schema with RLS
-- Run this in Supabase SQL Editor or via Supabase CLI
-- This creates all tables with Row Level Security enabled

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced with Clerk)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  name TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid()::text = clerk_id);

-- RLS Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid()::text = clerk_id);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  language TEXT CHECK (language IN ('arduino', 'javascript')) DEFAULT 'javascript',
  preset_type TEXT,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  thumbnail TEXT,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users own their projects
CREATE POLICY "Users own projects" 
  ON public.projects 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = projects.user_id 
      AND clerk_id = auth.uid()::text
    )
  );

-- RLS Policy: Public projects are readable by everyone
CREATE POLICY "Public projects readable" 
  ON public.projects 
  FOR SELECT 
  USING (
    is_public = true 
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = projects.user_id 
      AND clerk_id = auth.uid()::text
    )
  );

-- Simulations table
CREATE TABLE IF NOT EXISTS public.simulations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  logs JSONB NOT NULL DEFAULT '[]'::jsonb,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  inputs JSONB,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on simulations
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can access simulations for their projects
CREATE POLICY "Project simulations access" 
  ON public.simulations 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = simulations.project_id 
      AND (
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = projects.user_id 
          AND clerk_id = auth.uid()::text
        )
        OR projects.is_public = true
      )
    )
  );

-- Collaboration rooms table (for real-time collaboration)
CREATE TABLE IF NOT EXISTS public.collab_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id TEXT UNIQUE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  members JSONB DEFAULT '[]'::jsonb,
  state JSONB,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on collab_rooms
ALTER TABLE public.collab_rooms ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Room access by owner or member
CREATE POLICY "Room access by owner or member" 
  ON public.collab_rooms 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = collab_rooms.owner_id 
      AND clerk_id = auth.uid()::text
    )
    OR (
      members::jsonb @> jsonb_build_array(auth.uid()::text)
    )
  );

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_public ON public.projects(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_projects_parent_id ON public.projects(parent_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_simulations_project_id ON public.simulations(project_id);
CREATE INDEX IF NOT EXISTS idx_simulations_code_hash ON public.simulations(code_hash);
CREATE INDEX IF NOT EXISTS idx_simulations_created_at ON public.simulations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_collab_rooms_room_id ON public.collab_rooms(room_id);
CREATE INDEX IF NOT EXISTS idx_collab_rooms_owner_id ON public.collab_rooms(owner_id);
CREATE INDEX IF NOT EXISTS idx_collab_rooms_expires_at ON public.collab_rooms(expires_at) 
  WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON public.users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON public.projects 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collab_rooms_updated_at 
  BEFORE UPDATE ON public.collab_rooms 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique slugs
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase and replace spaces with hyphens
  base_slug := lower(regexp_replace(title, '[^a-z0-9]+', '-', 'gi'));
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Check if slug exists, append number if needed
  WHILE EXISTS (SELECT 1 FROM public.projects WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired collaboration rooms (run via pg_cron)
CREATE OR REPLACE FUNCTION public.cleanup_expired_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM public.collab_rooms 
  WHERE expires_at IS NOT NULL 
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
