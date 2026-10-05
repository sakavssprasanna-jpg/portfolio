-- =========================================================================
-- VEERA SATYA SAI PRASANNA — AI UNIVERSE PORTFOLIO SCHEMA
-- Target Engine: PostgreSQL / Supabase
-- Security: Full Row-Level Security (RLS) + Cross-Device Persistence
-- Idempotent: Safe to run on a brand-new empty Supabase project or re-run anytime
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- 1. TABLE DEFINITIONS (All tables created before any policies, FKs, or triggers)
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
-- 2. SEED INITIAL FOUNDATIONAL RECORDS (Idempotent: DOES NOT OVERWRITE DATA)
-- =========================================================================

-- 2.1 Seed Initial Profile
INSERT INTO public.profiles (id, full_name, headline, bio)
VALUES (
  'veera-core-profile',
  'VEERA SATYA SAI PRASANNA',
  'AI/ML • GenAI • Intelligent Systems',
  'Specializing in AI/ML, Machine Learning, Generative AI, RAG, Agentic AI, Computer Vision, NLP, and Software Engineering.'
)
ON CONFLICT (id) DO NOTHING;

-- 2.2 Seed Default AI World Sectors (ensures foreign keys succeed out of the box)
INSERT INTO public.worlds (id, name, slug, tagline, description, icon, color, accent_color, display_order, is_enabled, visual_properties)
VALUES 
  ('world-1', 'ML GALAXY', 'ml-galaxy', 'Deep Learning Architectures & Statistical Learning Models', 'Foundational machine learning, predictive models, model evaluation, and scalable inference architectures.', 'Brain', '#00f0ff', '#3b82f6', 1, true, '{"ring_style": "single", "orbit_speed": 1.2, "glow_intensity": 1.0}'::jsonb),
  ('world-2', 'AGENTIC AI WORLD', 'agentic-ai', 'Autonomous Agents, Tool-Use & Multi-Agent Swarms', 'Stateful multi-agent workflows, tool execution loops, reasoning trajectories, and autonomous problem solving.', 'Bot', '#8b5cf6', '#d946ef', 2, true, '{"ring_style": "quantum", "orbit_speed": 0.9, "glow_intensity": 1.1}'::jsonb),
  ('world-3', 'GENERATIVE AI NEBULA', 'generative-ai', 'Large Language Models, Diffusion & Multimodal Systems', 'Fine-tuning, prompt orchestration, generative pipelines, diffusion mechanisms, and structured generation.', 'Sparkles', '#ec4899', '#8b5cf6', 3, true, '{"ring_style": "double", "orbit_speed": 1.1, "glow_intensity": 1.2}'::jsonb),
  ('world-4', 'RAG REALM', 'rag-realm', 'Retrieval-Augmented Generation & Vector Vector Knowledge', 'Dense retrieval, semantic embeddings, hybrid search, rerankers, and contextual knowledge graphs.', 'Database', '#06b6d4', '#3b82f6', 4, true, '{"ring_style": "single", "orbit_speed": 0.8, "glow_intensity": 0.95}'::jsonb),
  ('world-5', 'COMPUTER VISION LAB', 'computer-vision', 'Visual Perception, Object Detection & Spatial AI', 'Convolutional neural networks, vision transformers, image segmentation, and real-time visual telemetry.', 'Eye', '#10b981', '#06b6d4', 5, true, '{"ring_style": "dashed", "orbit_speed": 1.0, "glow_intensity": 1.0}'::jsonb),
  ('world-6', 'NLP WORLD', 'nlp-world', 'Natural Language Processing & Syntactic Intelligence', 'Tokenization, attention mechanisms, intent classification, sentiment modeling, and sequence translation.', 'MessageSquare', '#f59e0b', '#ef4444', 6, true, '{"ring_style": "single", "orbit_speed": 0.95, "glow_intensity": 0.9}'::jsonb),
  ('world-7', 'ENGINEERING ARENA', 'engineering-arena', 'Robust Full-Stack & Production System Architecture', 'High-throughput APIs, microservices, database design, asynchronous queues, and resilient deployment systems.', 'Cpu', '#3b82f6', '#6366f1', 7, true, '{"ring_style": "quantum", "orbit_speed": 1.3, "glow_intensity": 1.0}'::jsonb),
  ('world-8', 'SPACE-TECH LAB', 'space-tech-lab', 'Telemetry, Orbital Simulation & Frontier Horizons', 'Orbital mechanics models, spatial simulations, data stream compression, and frontier algorithmic research.', 'Rocket', '#00f0ff', '#10b981', 8, true, '{"ring_style": "double", "orbit_speed": 0.7, "glow_intensity": 1.15}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 3. SCHEMA EVOLUTION / MIGRATION HELPERS
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
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- Rule: Full read access for public universe; full manage access for anon & authenticated roles.
-- Ensures Mission Control CRUD operations from web & mobile devices persist directly to Supabase.
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

-- 4.1 Profiles
DROP POLICY IF EXISTS "Allow public read-only profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow owner update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow full access to profiles" ON public.profiles;
CREATE POLICY "Allow public read-only profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow full access to profiles" ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4.2 Worlds
DROP POLICY IF EXISTS "Allow public read worlds" ON public.worlds;
DROP POLICY IF EXISTS "Allow owner manage worlds" ON public.worlds;
DROP POLICY IF EXISTS "Allow full access to worlds" ON public.worlds;
CREATE POLICY "Allow public read worlds" ON public.worlds FOR SELECT USING (true);
CREATE POLICY "Allow full access to worlds" ON public.worlds FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4.3 Projects
DROP POLICY IF EXISTS "Allow public read projects" ON public.projects;
DROP POLICY IF EXISTS "Allow owner manage projects" ON public.projects;
DROP POLICY IF EXISTS "Allow full access to projects" ON public.projects;
CREATE POLICY "Allow public read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow full access to projects" ON public.projects FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4.4 Skills
DROP POLICY IF EXISTS "Allow public read skills" ON public.skills;
DROP POLICY IF EXISTS "Allow owner manage skills" ON public.skills;
DROP POLICY IF EXISTS "Allow full access to skills" ON public.skills;
CREATE POLICY "Allow public read skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Allow full access to skills" ON public.skills FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4.5 Journey
DROP POLICY IF EXISTS "Allow public read journey" ON public.journey_entries;
DROP POLICY IF EXISTS "Allow owner manage journey" ON public.journey_entries;
DROP POLICY IF EXISTS "Allow full access to journey" ON public.journey_entries;
CREATE POLICY "Allow public read journey" ON public.journey_entries FOR SELECT USING (true);
CREATE POLICY "Allow full access to journey" ON public.journey_entries FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4.6 Achievements
DROP POLICY IF EXISTS "Allow public read achievements" ON public.achievements;
DROP POLICY IF EXISTS "Allow owner manage achievements" ON public.achievements;
DROP POLICY IF EXISTS "Allow full access to achievements" ON public.achievements;
CREATE POLICY "Allow public read achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Allow full access to achievements" ON public.achievements FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4.7 Resumes
DROP POLICY IF EXISTS "Allow public read approved resumes" ON public.resumes;
DROP POLICY IF EXISTS "Allow owner manage resumes" ON public.resumes;
DROP POLICY IF EXISTS "Allow full access to resumes" ON public.resumes;
CREATE POLICY "Allow public read approved resumes" ON public.resumes FOR SELECT USING (true);
CREATE POLICY "Allow full access to resumes" ON public.resumes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4.8 Resume Custom Sections
DROP POLICY IF EXISTS "Allow public read visible resume_custom_sections" ON public.resume_custom_sections;
DROP POLICY IF EXISTS "Allow authenticated owner manage resume_custom_sections" ON public.resume_custom_sections;
DROP POLICY IF EXISTS "Allow full access to resume_custom_sections" ON public.resume_custom_sections;
CREATE POLICY "Allow public read visible resume_custom_sections" ON public.resume_custom_sections FOR SELECT USING (true);
CREATE POLICY "Allow full access to resume_custom_sections" ON public.resume_custom_sections FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4.9 Media Assets
DROP POLICY IF EXISTS "Allow public read media" ON public.media_assets;
DROP POLICY IF EXISTS "Allow owner manage media" ON public.media_assets;
DROP POLICY IF EXISTS "Allow full access to media" ON public.media_assets;
CREATE POLICY "Allow public read media" ON public.media_assets FOR SELECT USING (true);
CREATE POLICY "Allow full access to media" ON public.media_assets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4.10 Admin Settings
DROP POLICY IF EXISTS "Allow owner manage settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Allow full access to admin_settings" ON public.admin_settings;
CREATE POLICY "Allow full access to admin_settings" ON public.admin_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- =========================================================================
-- 5. AUTO-UPDATE TIMESTAMP TRIGGERS
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
-- 6. STORAGE BUCKET & STORAGE RLS POLICIES
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
DROP POLICY IF EXISTS "Allow owner upload portfolio-media" ON storage.objects;
CREATE POLICY "Allow owner upload portfolio-media" 
ON storage.objects FOR INSERT 
TO anon, authenticated 
WITH CHECK (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Allow authenticated owner update portfolio-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow owner update portfolio-media" ON storage.objects;
CREATE POLICY "Allow owner update portfolio-media" 
ON storage.objects FOR UPDATE 
TO anon, authenticated 
USING (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Allow authenticated owner delete portfolio-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow owner delete portfolio-media" ON storage.objects;
CREATE POLICY "Allow owner delete portfolio-media" 
ON storage.objects FOR DELETE 
TO anon, authenticated 
USING (bucket_id = 'portfolio-media');
