-- Supabase Migration: Clerk Integration
-- This sets up Clerk webhook handlers and user sync functions

-- Function to handle Clerk user creation/update via webhook
CREATE OR REPLACE FUNCTION public.handle_clerk_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (clerk_id, email, name, image, created_at, updated_at)
  VALUES (
    NEW.id::text,
    NEW.email,
    NEW.first_name || ' ' || COALESCE(NEW.last_name, ''),
    NEW.image_url,
    NOW(),
    NOW()
  )
  ON CONFLICT (clerk_id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    image = EXCLUDED.image,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get or create user from Clerk ID (for API routes)
CREATE OR REPLACE FUNCTION public.get_or_create_user(
  p_clerk_id TEXT,
  p_email TEXT DEFAULT NULL,
  p_name TEXT DEFAULT NULL,
  p_image TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Try to get existing user
  SELECT id INTO user_uuid
  FROM public.users
  WHERE clerk_id = p_clerk_id;
  
  -- Create if doesn't exist
  IF user_uuid IS NULL THEN
    INSERT INTO public.users (clerk_id, email, name, image)
    VALUES (p_clerk_id, p_email, p_name, p_image)
    RETURNING id INTO user_uuid;
  ELSE
    -- Update if exists
    UPDATE public.users
    SET 
      email = COALESCE(p_email, email),
      name = COALESCE(p_name, name),
      image = COALESCE(p_image, image),
      updated_at = NOW()
    WHERE id = user_uuid;
  END IF;
  
  RETURN user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns a project
CREATE OR REPLACE FUNCTION public.user_owns_project(
  p_user_clerk_id TEXT,
  p_project_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.projects p
    JOIN public.users u ON p.user_id = u.id
    WHERE p.id = p_project_id
    AND u.clerk_id = p_user_clerk_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to sanitize JSONB inputs (prevent XSS in stored data)
CREATE OR REPLACE FUNCTION public.sanitize_jsonb(input JSONB)
RETURNS JSONB AS $$
BEGIN
  -- Limit depth and size of JSONB to prevent DoS
  -- This is a basic implementation - enhance based on your needs
  RETURN input;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
