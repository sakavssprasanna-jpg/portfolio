export interface Profile {
  id: string;
  full_name: string;
  headline: string;
  bio: string;
  email: string;
  location: string;
  avatar_url: string;
  github_url: string;
  linkedin_url: string;
  twitter_url: string;
  website_url: string;
  leetcode_url?: string;
  hackerrank_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorldVisualProperties {
  particle_density?: number;
  ring_style?: 'single' | 'double' | 'dashed' | 'quantum';
  orbit_speed?: number;
  glow_intensity?: number;
  nebula_tint?: string;
}

export interface World {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  accent_color: string;
  display_order: number;
  is_enabled: boolean;
  visual_properties?: WorldVisualProperties;
  created_at?: string;
  updated_at?: string;
}

export type ProjectStatus = 'completed' | 'in_development' | 'research';

export interface Project {
  id: string;
  world_id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  problem: string;
  solution: string;
  ai_ml_approach: string;
  models_methods?: string;
  dataset_info?: string;
  architecture_diagram?: string;
  architecture_description?: string;
  thumbnail_url?: string;
  tech_stack: string[];
  features: string[];
  my_contribution: string;
  challenges: string;
  solutions_developed: string;
  learnings: string;
  github_url?: string;
  live_url?: string;
  demo_video_url?: string;
  documentation_url?: string;
  screenshots: string[];
  project_date: string;
  status: ProjectStatus;
  is_featured: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Skill {
  id: string;
  category: string;
  name: string;
  description?: string;
  proficiency?: number | null; // Optional, never automatically invented
  icon?: string;
  related_skills: string[];
  display_order: number;
  created_at?: string;
}

export type JourneyCategory = 'experience' | 'education' | 'milestone' | 'research';

export interface JourneyEntry {
  id: string;
  title: string;
  organization: string;
  date_range: string;
  description: string;
  category: JourneyCategory;
  image_url?: string;
  external_url?: string;
  display_order: number;
  created_at?: string;
}

export interface Achievement {
  id: string;
  title: string;
  organization: string;
  date: string;
  description: string;
  category?: string;
  certificate_url?: string;
  certificate_file_url?: string;
  external_url?: string;
  image_url?: string;
  display_order: number;
  created_at?: string;
}

export interface ResumeCustomSection {
  id: string;
  resume_id?: string;
  title: string;
  slug: string;
  content: string[] | string | Record<string, any>;
  display_order: number;
  visible: boolean;
  source: 'extracted' | 'manual';
  created_at?: string;
  updated_at?: string;
}

export interface ResumeVersion {
  id: string;
  file_name: string;
  file_url: string;
  version_name: string;
  upload_date: string;
  is_current_approved: boolean;
  extracted_data?: Record<string, any>;
  custom_sections?: ResumeCustomSection[];
  created_at?: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'diagram';
  category: 'profile' | 'projects' | 'certificates' | 'resumes' | 'general';
  url: string;
  size: number;
  created_at: string;
}

export interface SystemStats {
  publishedWorlds: number;
  publishedProjects: number;
  skillsCount: number;
  achievementsCount: number;
  resumeVersionsCount: number;
}
