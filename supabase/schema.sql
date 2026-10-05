-- =========================================================================
-- VEERA SATYA SAI PRASANNA — AI UNIVERSE PORTFOLIO SCHEMA
-- Target Engine: PostgreSQL / Supabase
-- Security: Full Row-Level Security (RLS) + Authenticated Owner Write Access
-- Idempotent: Safe to run on a brand-new empty Supabase project or re-run anytime
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- 1. TABLE DEFINITIONS (All tables created before any policies or triggers)
-- =========================================================================

-- 1.1 PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    full_name TEXT NOT NULL DEFAULT 'VEERA SATYA SAI PRASANNA',
    headline TEXT NOT NULL DEFAULT 'AI/ML • GenAI • Intelligent Systems',
    bio TEXT NOT NULL DEFAULT 'Specializing in AI/ML, Machine Learning, Generative AI, RAG, Agentic AI, Computer Vision, NLP, and Software Engineering.',
    email TEXT DEFAULT '',
    location TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    github_url TEXT DEFAULT '',
    linkedin_url TEXT DEFAULT '',
    twitter_url TEXT DEFAULT '',
    website_url TEXT DEFAULT '',
    leetcode_url TEXT DEFAULT '',
    hackerrank_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 1.2 AI WORLDS
CREATE TABLE IF NOT EXISTS public.worlds (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tagline TEXT DEFAULT '',
    description TEXT DEFAULT '',
    icon TEXT DEFAULT 'Brain',
    color TEXT DEFAULT '#00f0ff',
    accent_color TEXT DEFAULT '#3b82f6',
    display_order INT DEFAULT 0,
    is_enabled BOOLEAN DEFAULT true,
    visual_properties JSONB DEFAULT '{"ring_style": "single", "orbit_speed": 1, "glow_intensity": 1}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 1.3 PROJECTS (Planets & Missions)
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    world_id TEXT REFERENCES public.worlds(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT DEFAULT '',
    full_description TEXT DEFAULT '',
    problem TEXT DEFAULT '',
    solution TEXT DEFAULT '',
    ai_ml_approach TEXT DEFAULT '',
    architecture_diagram TEXT DEFAULT '',
    architecture_description TEXT DEFAULT '',
    models_methods TEXT DEFAULT '',
    dataset_info TEXT DEFAULT '',
    thumbnail_url TEXT DEFAULT '',
    tech_stack TEXT[] DEFAULT ARRAY[]::TEXT[],
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
    my_contribution TEXT DEFAULT '',
    challenges TEXT DEFAULT '',
    solutions_developed TEXT DEFAULT '',
    learnings TEXT DEFAULT '',
    github_url TEXT DEFAULT '',
    live_url TEXT DEFAULT '',
    demo_video_url TEXT DEFAULT '',
    documentation_url TEXT DEFAULT '',
    screenshots TEXT[] DEFAULT ARRAY[]::TEXT[],
    project_date TEXT DEFAULT '',
    status TEXT DEFAULT 'completed', -- 'completed', 'in_development', 'research'
    is_featured BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 1.4 SKILLS & CONSTELLATIONS
CREATE TABLE IF NOT EXISTS public.skills (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    proficiency INT DEFAULT NULL,
    description TEXT DEFAULT '',
    icon TEXT DEFAULT 'Sparkles',
    related_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 1.5 MY JOURNEY (Orbital Timeline)
CREATE TABLE IF NOT EXISTS public.journey_entries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    date_range TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'experience', -- 'experience', 'education', 'milestone', 'research'
    image_url TEXT DEFAULT '',
    external_url TEXT DEFAULT '',
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 1.6 ACHIEVEMENT GALAXY
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'award',
    certificate_url TEXT DEFAULT '',
    certificate_file_url TEXT DEFAULT '',
    external_url TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 1.7 RESUME STATION & VERSIONS
CREATE TABLE IF NOT EXISTS public.resumes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    version_name TEXT NOT NULL,
    upload_date TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    is_current_approved BOOLEAN DEFAULT false,
    extracted_data JSONB DEFAULT '{}'::jsonb,
    custom_sections JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 1.8 RESUME CUSTOM SECTIONS (Created immediately after resumes table)
CREATE TABLE IF NOT EXISTS public.resume_custom_sections (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    resume_id TEXT REFERENCES public.resumes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content JSONB DEFAULT '[]'::jsonb,
    display_order INT DEFAULT 0,
    visible BOOLEAN DEFAULT true,
    source TEXT DEFAULT 'manual',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 1.9 MEDIA ASSETS
CREATE TABLE IF NOT EXISTS public.media_assets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'image', 'video', 'document', 'diagram'
    category TEXT DEFAULT 'general',
    url TEXT NOT NULL,
    size BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 1.10 ADMIN SETTINGS
CREATE TABLE IF NOT EXISTS public.admin_settings (
    key TEXT PRIMARY KEY,
    value JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- =========================================================================
-- 2. SCHEMA EVOLUTION / MIGRATION HELPERS
-- Ensures existing installations also gain any newer columns idempotently
-- =========================================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS leetcode_url TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hackerrank_url TEXT DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS documentation_url TEXT DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS models_methods TEXT DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS dataset_info TEXT DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS architecture_description TEXT DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS thumbnail_url TEXT DEFAULT '';
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS certificate_file_url TEXT DEFAULT '';
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'award';
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS custom_sections JSONB DEFAULT '[]'::jsonb;

-- =========================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- Rule: Public can read published/approved content; Authenticated owner has full access.
-- All policies use DROP POLICY IF EXISTS before CREATE POLICY to ensure idempotency.
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_custom_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- 3.1 Profiles
DROP POLICY IF EXISTS "Allow public read-only profiles" ON public.profiles;
CREATE POLICY "Allow public read-only profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow owner update profiles" ON public.profiles;
CREATE POLICY "Allow owner update profiles" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3.2 Worlds
DROP POLICY IF EXISTS "Allow public read worlds" ON public.worlds;
CREATE POLICY "Allow public read worlds" ON public.worlds FOR SELECT USING (is_enabled = true);

DROP POLICY IF EXISTS "Allow owner manage worlds" ON public.worlds;
CREATE POLICY "Allow owner manage worlds" ON public.worlds FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3.3 Projects
DROP POLICY IF EXISTS "Allow public read projects" ON public.projects;
CREATE POLICY "Allow public read projects" ON public.projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow owner manage projects" ON public.projects;
CREATE POLICY "Allow owner manage projects" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3.4 Skills
DROP POLICY IF EXISTS "Allow public read skills" ON public.skills;
CREATE POLICY "Allow public read skills" ON public.skills FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow owner manage skills" ON public.skills;
CREATE POLICY "Allow owner manage skills" ON public.skills FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3.5 Journey
DROP POLICY IF EXISTS "Allow public read journey" ON public.journey_entries;
CREATE POLICY "Allow public read journey" ON public.journey_entries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow owner manage journey" ON public.journey_entries;
CREATE POLICY "Allow owner manage journey" ON public.journey_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3.6 Achievements
DROP POLICY IF EXISTS "Allow public read achievements" ON public.achievements;
CREATE POLICY "Allow public read achievements" ON public.achievements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow owner manage achievements" ON public.achievements;
CREATE POLICY "Allow owner manage achievements" ON public.achievements FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3.7 Resumes
DROP POLICY IF EXISTS "Allow public read approved resumes" ON public.resumes;
CREATE POLICY "Allow public read approved resumes" ON public.resumes FOR SELECT USING (is_current_approved = true);

DROP POLICY IF EXISTS "Allow owner manage resumes" ON public.resumes;
CREATE POLICY "Allow owner manage resumes" ON public.resumes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3.8 Resume Custom Sections
DROP POLICY IF EXISTS "Allow public read visible resume_custom_sections" ON public.resume_custom_sections;
CREATE POLICY "Allow public read visible resume_custom_sections" ON public.resume_custom_sections FOR SELECT USING (visible = true);

DROP POLICY IF EXISTS "Allow authenticated owner manage resume_custom_sections" ON public.resume_custom_sections;
CREATE POLICY "Allow authenticated owner manage resume_custom_sections" ON public.resume_custom_sections FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3.9 Media Assets
DROP POLICY IF EXISTS "Allow public read media" ON public.media_assets;
CREATE POLICY "Allow public read media" ON public.media_assets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow owner manage media" ON public.media_assets;
CREATE POLICY "Allow owner manage media" ON public.media_assets FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3.10 Admin Settings
DROP POLICY IF EXISTS "Allow owner manage settings" ON public.admin_settings;
CREATE POLICY "Allow owner manage settings" ON public.admin_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =========================================================================
-- 4. AUTO-UPDATE TIMESTAMP TRIGGERS
-- =========================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_worlds_updated_at ON public.worlds;
CREATE TRIGGER update_worlds_updated_at BEFORE UPDATE ON public.worlds FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_resume_custom_sections_updated_at ON public.resume_custom_sections;
CREATE TRIGGER update_resume_custom_sections_updated_at BEFORE UPDATE ON public.resume_custom_sections FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =========================================================================
-- 5. STORAGE BUCKET & STORAGE RLS POLICIES
-- =========================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Objects Policies (idempotent drops before creation)
DROP POLICY IF EXISTS "Allow public read portfolio-media" ON storage.objects;
CREATE POLICY "Allow public read portfolio-media" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Allow authenticated owner upload portfolio-media" ON storage.objects;
CREATE POLICY "Allow authenticated owner upload portfolio-media" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Allow authenticated owner update portfolio-media" ON storage.objects;
CREATE POLICY "Allow authenticated owner update portfolio-media" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Allow authenticated owner delete portfolio-media" ON storage.objects;
CREATE POLICY "Allow authenticated owner delete portfolio-media" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'portfolio-media');
