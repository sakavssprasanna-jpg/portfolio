import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Profile, 
  World, 
  Project, 
  Skill, 
  JourneyEntry, 
  Achievement, 
  ResumeVersion,
  ResumeCustomSection, 
  MediaAsset,
  SystemStats 
} from '../types/database';

// Storage keys for local persistence mirror / offline mode
const KEYS = {
  PROFILE: 'veera_db_profile',
  WORLDS: 'veera_db_worlds',
  PROJECTS: 'veera_db_projects',
  SKILLS: 'veera_db_skills',
  JOURNEY: 'veera_db_journey',
  ACHIEVEMENTS: 'veera_db_achievements',
  RESUMES: 'veera_db_resumes',
  MEDIA: 'veera_db_media',
  CUSTOM_SECTIONS: 'veera_db_custom_sections',
};

// Initial verified profile identity matching prompt requirements
const INITIAL_PROFILE: Profile = {
  id: 'veera-core-profile',
  full_name: 'VEERA SATYA SAI PRASANNA',
  headline: 'AI/ML • GenAI • Intelligent Systems',
  bio: 'Specializing in AI/ML, Machine Learning, Generative AI, RAG, Agentic AI, Computer Vision, NLP, and Software Engineering. Architecting resilient neural and distributed systems.',
  email: '',
  location: '',
  avatar_url: '',
  github_url: '',
  linkedin_url: '',
  twitter_url: '',
  website_url: '',
  leetcode_url: '',
  hackerrank_url: ''
};

// Initial AI Worlds (dynamic & fully editable through Mission Control)
const INITIAL_WORLDS: World[] = [
  {
    id: 'world-1',
    name: 'ML GALAXY',
    slug: 'ml-galaxy',
    tagline: 'Deep Learning Architectures & Statistical Learning Models',
    description: 'Foundational machine learning, predictive models, model evaluation, and scalable inference architectures.',
    icon: 'Brain',
    color: '#00f0ff',
    accent_color: '#3b82f6',
    display_order: 1,
    is_enabled: true,
    visual_properties: { ring_style: 'single', orbit_speed: 1.2, glow_intensity: 1.0 }
  },
  {
    id: 'world-2',
    name: 'AGENTIC AI WORLD',
    slug: 'agentic-ai',
    tagline: 'Autonomous Agents, Tool-Use & Multi-Agent Swarms',
    description: 'Stateful multi-agent workflows, tool execution loops, reasoning trajectories, and autonomous problem solving.',
    icon: 'Bot',
    color: '#8b5cf6',
    accent_color: '#d946ef',
    display_order: 2,
    is_enabled: true,
    visual_properties: { ring_style: 'quantum', orbit_speed: 0.9, glow_intensity: 1.1 }
  },
  {
    id: 'world-3',
    name: 'GENERATIVE AI NEBULA',
    slug: 'generative-ai',
    tagline: 'Large Language Models, Diffusion & Multimodal Systems',
    description: 'Fine-tuning, prompt orchestration, generative pipelines, diffusion mechanisms, and structured generation.',
    icon: 'Sparkles',
    color: '#ec4899',
    accent_color: '#8b5cf6',
    display_order: 3,
    is_enabled: true,
    visual_properties: { ring_style: 'double', orbit_speed: 1.1, glow_intensity: 1.2 }
  },
  {
    id: 'world-4',
    name: 'RAG REALM',
    slug: 'rag-realm',
    tagline: 'Retrieval-Augmented Generation & Vector Vector Knowledge',
    description: 'Dense retrieval, semantic embeddings, hybrid search, rerankers, and contextual knowledge graphs.',
    icon: 'Database',
    color: '#06b6d4',
    accent_color: '#3b82f6',
    display_order: 4,
    is_enabled: true,
    visual_properties: { ring_style: 'single', orbit_speed: 0.8, glow_intensity: 0.95 }
  },
  {
    id: 'world-5',
    name: 'COMPUTER VISION LAB',
    slug: 'computer-vision',
    tagline: 'Visual Perception, Object Detection & Spatial AI',
    description: 'Convolutional neural networks, vision transformers, image segmentation, and real-time visual telemetry.',
    icon: 'Eye',
    color: '#10b981',
    accent_color: '#06b6d4',
    display_order: 5,
    is_enabled: true,
    visual_properties: { ring_style: 'dashed', orbit_speed: 1.0, glow_intensity: 1.0 }
  },
  {
    id: 'world-6',
    name: 'NLP WORLD',
    slug: 'nlp-world',
    tagline: 'Natural Language Processing & Syntactic Intelligence',
    description: 'Tokenization, attention mechanisms, intent classification, sentiment modeling, and sequence translation.',
    icon: 'MessageSquare',
    color: '#f59e0b',
    accent_color: '#ef4444',
    display_order: 6,
    is_enabled: true,
    visual_properties: { ring_style: 'single', orbit_speed: 0.95, glow_intensity: 0.9 }
  },
  {
    id: 'world-7',
    name: 'ENGINEERING ARENA',
    slug: 'engineering-arena',
    tagline: 'Robust Full-Stack & Production System Architecture',
    description: 'High-throughput APIs, microservices, database design, asynchronous queues, and resilient deployment systems.',
    icon: 'Cpu',
    color: '#3b82f6',
    accent_color: '#6366f1',
    display_order: 7,
    is_enabled: true,
    visual_properties: { ring_style: 'quantum', orbit_speed: 1.3, glow_intensity: 1.0 }
  },
  {
    id: 'world-8',
    name: 'SPACE-TECH LAB',
    slug: 'space-tech-lab',
    tagline: 'Telemetry, Orbital Simulation & Frontier Horizons',
    description: 'Orbital mechanics models, spatial simulations, data stream compression, and frontier algorithmic research.',
    icon: 'Rocket',
    color: '#00f0ff',
    accent_color: '#10b981',
    display_order: 8,
    is_enabled: true,
    visual_properties: { ring_style: 'double', orbit_speed: 0.7, glow_intensity: 1.15 }
  }
];

// Helper: load from localStorage
function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

// Helper: save to localStorage
function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to save to local storage mirror', err);
  }
}

// Track background auto-sync check once per session
let autoSyncAttempted = false;

export const dbService = {
  // --- PROFILES ---
  async getProfile(): Promise<Profile> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').limit(1).maybeSingle();
        if (!error && data) {
          setLocal(KEYS.PROFILE, data);
          return data as Profile;
        }
      } catch (err) {
        console.warn('Falling back to local profile mirror', err);
      }
    }
    return getLocal<Profile>(KEYS.PROFILE, INITIAL_PROFILE);
  },

  async updateProfile(profile: Partial<Profile>): Promise<Profile> {
    const current = await this.getProfile();
    const updated = { ...current, ...profile, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('profiles').upsert(updated);
      if (error) {
        console.error('Supabase profile update failed:', error);
        throw new Error(`Cloud Database profile update failed: ${error.message}`);
      }
    }
    setLocal(KEYS.PROFILE, updated);
    return updated;
  },

  // --- WORLDS ---
  async getWorlds(): Promise<World[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('worlds')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data) {
          if (data.length > 0) {
            setLocal(KEYS.WORLDS, data);
            return data as World[];
          } else {
            // Seed INITIAL_WORLDS if Supabase worlds table is empty
            await supabase.from('worlds').upsert(INITIAL_WORLDS);
            setLocal(KEYS.WORLDS, INITIAL_WORLDS);
            return INITIAL_WORLDS;
          }
        }
      } catch (err) {
        console.warn('Falling back to local worlds mirror', err);
      }
    }
    return getLocal<World[]>(KEYS.WORLDS, INITIAL_WORLDS);
  },

  async saveWorld(world: World): Promise<World> {
    const preparedWorld = { ...world, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('worlds').upsert(preparedWorld);
      if (error) {
        console.error('Supabase world save failed:', error);
        throw new Error(`Cloud Database world save failed: ${error.message}`);
      }
    }

    const worlds = await this.getWorlds();
    const idx = worlds.findIndex(w => w.id === world.id);
    let updated: World[];
    if (idx >= 0) {
      updated = [...worlds];
      updated[idx] = preparedWorld;
    } else {
      updated = [...worlds, preparedWorld];
    }
    setLocal(KEYS.WORLDS, updated);
    return preparedWorld;
  },

  async deleteWorld(worldId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('worlds').delete().eq('id', worldId);
      if (error) {
        console.error('Supabase world delete failed:', error);
        throw new Error(`Cloud Database world delete failed: ${error.message}`);
      }
    }
    const worlds = (await this.getWorlds()).filter(w => w.id !== worldId);
    setLocal(KEYS.WORLDS, worlds);
  },

  async reorderWorlds(orderedIds: string[]): Promise<void> {
    const worlds = await this.getWorlds();
    const updated = orderedIds.map((id, index) => {
      const match = worlds.find(w => w.id === id);
      return match ? { ...match, display_order: index + 1 } : null;
    }).filter(Boolean) as World[];

    if (isSupabaseConfigured() && supabase) {
      for (const w of updated) {
        const { error } = await supabase.from('worlds').update({ display_order: w.display_order }).eq('id', w.id);
        if (error) console.error(`Failed to update world order for ${w.id}:`, error.message);
      }
    }
    setLocal(KEYS.WORLDS, updated);
  },

  // --- PROJECTS ---
  async getProjects(): Promise<Project[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data) {
          if (data.length > 0) {
            setLocal(KEYS.PROJECTS, data);
            return data as Project[];
          }
          // Supabase has 0 projects: check if we should auto-sync local projects
          this.triggerAutoSyncIfEmpty();
          const local = getLocal<Project[]>(KEYS.PROJECTS, []);
          if (local.length > 0) return local;
          return [];
        }
      } catch (err) {
        console.warn('Falling back to local projects mirror', err);
      }
    }
    return getLocal<Project[]>(KEYS.PROJECTS, []);
  },

  async saveProject(project: Project): Promise<Project> {
    const sanitizedWorldId = (project.world_id && project.world_id.trim()) ? project.world_id.trim() : null;
    const preparedProject: Project = {
      ...project,
      world_id: sanitizedWorldId as any,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase) {
      // Ensure world sector exists in Supabase if referencing an initial world
      if (sanitizedWorldId) {
        const matchInitial = INITIAL_WORLDS.find(w => w.id === sanitizedWorldId);
        if (matchInitial) {
          await supabase.from('worlds').upsert(matchInitial);
        }
      }

      let { error } = await supabase.from('projects').upsert(preparedProject);
      
      // If foreign key constraint failed, retry with world_id: null to prevent project loss
      if (error && sanitizedWorldId && error.code === '23503') {
        console.warn(`Foreign key violation on world_id "${sanitizedWorldId}". Retrying save with world_id: null...`);
        const fallbackProject = { ...preparedProject, world_id: null as any };
        const retryResult = await supabase.from('projects').upsert(fallbackProject);
        error = retryResult.error;
      }

      if (error) {
        console.error('Supabase project save failed:', error);
        throw new Error(`Cloud Database project save failed: ${error.message}`);
      }
    }

    const projects = await this.getProjects();
    const idx = projects.findIndex(p => p.id === project.id);
    let updated: Project[];
    if (idx >= 0) {
      updated = [...projects];
      updated[idx] = preparedProject;
    } else {
      updated = [...projects, preparedProject];
    }
    setLocal(KEYS.PROJECTS, updated);
    return preparedProject;
  },

  async deleteProject(projectId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (error) {
        console.error('Supabase project delete failed:', error);
        throw new Error(`Cloud Database project delete failed: ${error.message}`);
      }
    }
    const projects = (await this.getProjects()).filter(p => p.id !== projectId);
    setLocal(KEYS.PROJECTS, projects);
  },

  // --- SKILLS ---
  async getSkills(): Promise<Skill[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data) {
          if (data.length > 0) {
            setLocal(KEYS.SKILLS, data);
            return data as Skill[];
          }
          this.triggerAutoSyncIfEmpty();
          const local = getLocal<Skill[]>(KEYS.SKILLS, []);
          if (local.length > 0) return local;
          return [];
        }
      } catch (err) {
        console.warn('Falling back to local skills mirror', err);
      }
    }
    return getLocal<Skill[]>(KEYS.SKILLS, []);
  },

  async saveSkill(skill: Skill): Promise<Skill> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('skills').upsert(skill);
      if (error) {
        console.error('Supabase skill save failed:', error);
        throw new Error(`Cloud Database skill save failed: ${error.message}`);
      }
    }

    const skills = await this.getSkills();
    const idx = skills.findIndex(s => s.id === skill.id);
    let updated: Skill[];
    if (idx >= 0) {
      updated = [...skills];
      updated[idx] = skill;
    } else {
      updated = [...skills, skill];
    }
    setLocal(KEYS.SKILLS, updated);
    return skill;
  },

  async deleteSkill(skillId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('skills').delete().eq('id', skillId);
      if (error) {
        console.error('Supabase skill delete failed:', error);
        throw new Error(`Cloud Database skill delete failed: ${error.message}`);
      }
    }
    const skills = (await this.getSkills()).filter(s => s.id !== skillId);
    setLocal(KEYS.SKILLS, skills);
  },

  async reorderSkills(orderedIds: string[]): Promise<void> {
    const skills = await this.getSkills();
    const updated = orderedIds.map((id, index) => {
      const match = skills.find(s => s.id === id);
      return match ? { ...match, display_order: index + 1 } : null;
    }).filter(Boolean) as Skill[];

    if (isSupabaseConfigured() && supabase) {
      for (const s of updated) {
        const { error } = await supabase.from('skills').update({ display_order: s.display_order }).eq('id', s.id);
        if (error) console.error(`Failed to update skill order for ${s.id}:`, error.message);
      }
    }
    setLocal(KEYS.SKILLS, updated);
  },

  // --- JOURNEY ---
  async getJourney(): Promise<JourneyEntry[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('journey_entries')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data) {
          if (data.length > 0) {
            setLocal(KEYS.JOURNEY, data);
            return data as JourneyEntry[];
          }
          this.triggerAutoSyncIfEmpty();
          const local = getLocal<JourneyEntry[]>(KEYS.JOURNEY, []);
          if (local.length > 0) return local;
          return [];
        }
      } catch (err) {
        console.warn('Falling back to local journey mirror', err);
      }
    }
    return getLocal<JourneyEntry[]>(KEYS.JOURNEY, []);
  },

  async saveJourneyEntry(entry: JourneyEntry): Promise<JourneyEntry> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('journey_entries').upsert(entry);
      if (error) {
        console.error('Supabase journey entry save failed:', error);
        throw new Error(`Cloud Database journey save failed: ${error.message}`);
      }
    }

    const journey = await this.getJourney();
    const idx = journey.findIndex(j => j.id === entry.id);
    let updated: JourneyEntry[];
    if (idx >= 0) {
      updated = [...journey];
      updated[idx] = entry;
    } else {
      updated = [...journey, entry];
    }
    setLocal(KEYS.JOURNEY, updated);
    return entry;
  },

  async deleteJourneyEntry(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('journey_entries').delete().eq('id', id);
      if (error) {
        console.error('Supabase journey delete failed:', error);
        throw new Error(`Cloud Database journey delete failed: ${error.message}`);
      }
    }
    const journey = (await this.getJourney()).filter(j => j.id !== id);
    setLocal(KEYS.JOURNEY, journey);
  },

  async reorderJourney(orderedIds: string[]): Promise<void> {
    const journey = await this.getJourney();
    const updated = orderedIds.map((id, index) => {
      const match = journey.find(j => j.id === id);
      return match ? { ...match, display_order: index + 1 } : null;
    }).filter(Boolean) as JourneyEntry[];

    if (isSupabaseConfigured() && supabase) {
      for (const j of updated) {
        const { error } = await supabase.from('journey_entries').update({ display_order: j.display_order }).eq('id', j.id);
        if (error) console.error(`Failed to update journey order for ${j.id}:`, error.message);
      }
    }
    setLocal(KEYS.JOURNEY, updated);
  },

  // --- ACHIEVEMENTS ---
  async getAchievements(): Promise<Achievement[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data) {
          if (data.length > 0) {
            setLocal(KEYS.ACHIEVEMENTS, data);
            return data as Achievement[];
          }
          this.triggerAutoSyncIfEmpty();
          const local = getLocal<Achievement[]>(KEYS.ACHIEVEMENTS, []);
          if (local.length > 0) return local;
          return [];
        }
      } catch (err) {
        console.warn('Falling back to local achievements mirror', err);
      }
    }
    return getLocal<Achievement[]>(KEYS.ACHIEVEMENTS, []);
  },

  async saveAchievement(achievement: Achievement): Promise<Achievement> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('achievements').upsert(achievement);
      if (error) {
        console.error('Supabase achievement save failed:', error);
        throw new Error(`Cloud Database achievement save failed: ${error.message}`);
      }
    }

    const items = await this.getAchievements();
    const idx = items.findIndex(a => a.id === achievement.id);
    let updated: Achievement[];
    if (idx >= 0) {
      updated = [...items];
      updated[idx] = achievement;
    } else {
      updated = [...items, achievement];
    }
    setLocal(KEYS.ACHIEVEMENTS, updated);
    return achievement;
  },

  async deleteAchievement(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('achievements').delete().eq('id', id);
      if (error) {
        console.error('Supabase achievement delete failed:', error);
        throw new Error(`Cloud Database achievement delete failed: ${error.message}`);
      }
    }
    const items = (await this.getAchievements()).filter(a => a.id !== id);
    setLocal(KEYS.ACHIEVEMENTS, items);
  },

  // --- RESUMES ---
  async getApprovedResume(): Promise<ResumeVersion | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('is_current_approved', true)
          .limit(1)
          .maybeSingle();
        if (!error && data) {
          return data as ResumeVersion;
        }
      } catch (err) {
        console.warn('Falling back to local approved resume mirror', err);
      }
    }
    const all = await this.getAllResumes();
    return all.find(r => r.is_current_approved) || null;
  },

  async getAllResumes(): Promise<ResumeVersion[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .order('upload_date', { ascending: false });
        if (!error && data) {
          if (data.length > 0) {
            setLocal(KEYS.RESUMES, data);
            return data as ResumeVersion[];
          }
          const local = getLocal<ResumeVersion[]>(KEYS.RESUMES, []);
          if (local.length > 0) return local;
          return [];
        }
      } catch (err) {
        console.warn('Falling back to local resumes mirror', err);
      }
    }
    return getLocal<ResumeVersion[]>(KEYS.RESUMES, []);
  },

  async saveResumeVersion(resume: ResumeVersion): Promise<ResumeVersion> {
    if (isSupabaseConfigured() && supabase) {
      if (resume.is_current_approved) {
        const { error: unapproveErr } = await supabase
          .from('resumes')
          .update({ is_current_approved: false })
          .neq('id', resume.id);
        if (unapproveErr) console.warn('Supabase resume unapprove notice:', unapproveErr.message);
      }

      const { error } = await supabase.from('resumes').upsert(resume);
      if (error) {
        console.error('Supabase resume save failed:', error);
        throw new Error(`Cloud Database resume save failed: ${error.message}`);
      }
    }

    const resumes = await this.getAllResumes();
    const processed = resume.is_current_approved
      ? resumes.map(r => ({ ...r, is_current_approved: false }))
      : resumes;

    const idx = processed.findIndex(r => r.id === resume.id);
    let updated: ResumeVersion[];
    if (idx >= 0) {
      updated = [...processed];
      updated[idx] = resume;
    } else {
      updated = [resume, ...processed];
    }
    setLocal(KEYS.RESUMES, updated);
    return resume;
  },

  async deleteResume(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error: secErr } = await supabase.from('resume_custom_sections').delete().eq('resume_id', id);
      if (secErr) console.warn('Supabase delete custom sections notice:', secErr.message);

      const { error } = await supabase.from('resumes').delete().eq('id', id);
      if (error) {
        console.error('Supabase resume delete failed:', error);
        throw new Error(`Cloud Database resume delete failed: ${error.message}`);
      }
    }

    const resumes = (await this.getAllResumes()).filter(r => r.id !== id);
    setLocal(KEYS.RESUMES, resumes);

    // Clean up local custom sections mirror
    const allSections = getLocal<ResumeCustomSection[]>(KEYS.CUSTOM_SECTIONS, []);
    const remainingSections = allSections.filter(s => s.resume_id !== id);
    setLocal(KEYS.CUSTOM_SECTIONS, remainingSections);
  },

  // --- RESUME CUSTOM SECTIONS ---
  async getCustomSections(resumeId?: string): Promise<ResumeCustomSection[]> {
    let effectiveResumeId = resumeId;
    if (!effectiveResumeId) {
      const approved = await this.getApprovedResume();
      effectiveResumeId = approved?.id;
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('resume_custom_sections').select('*').order('display_order', { ascending: true });
        if (effectiveResumeId) {
          query = query.eq('resume_id', effectiveResumeId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          setLocal(KEYS.CUSTOM_SECTIONS, data);
          return data as ResumeCustomSection[];
        }
      } catch (err) {
        console.warn('Falling back to local custom sections mirror', err);
      }
    }

    const all = getLocal<ResumeCustomSection[]>(KEYS.CUSTOM_SECTIONS, []);
    if (effectiveResumeId) {
      const filtered = all.filter(s => s.resume_id === effectiveResumeId || (!s.resume_id && effectiveResumeId === 'default'));
      if (filtered.length > 0) {
        return filtered.sort((a, b) => a.display_order - b.display_order);
      }
      const resumes = getLocal<ResumeVersion[]>(KEYS.RESUMES, []);
      const matchedResume = resumes.find(r => r.id === effectiveResumeId);
      if (matchedResume?.custom_sections && matchedResume.custom_sections.length > 0) {
        return matchedResume.custom_sections.sort((a, b) => a.display_order - b.display_order);
      }
      return [];
    }

    return all.sort((a, b) => a.display_order - b.display_order);
  },

  async saveCustomSection(section: ResumeCustomSection): Promise<ResumeCustomSection> {
    const preparedSection: ResumeCustomSection = {
      ...section,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('resume_custom_sections').upsert(preparedSection);
      if (error) {
        console.error('Supabase custom section save failed:', error);
        throw new Error(`Cloud Database custom section save failed: ${error.message}`);
      }

      // Keep parent resume column updated in Supabase
      if (preparedSection.resume_id) {
        const targetResume = (await this.getAllResumes()).find(r => r.id === preparedSection.resume_id);
        if (targetResume) {
          const currentSections = await this.getCustomSections(preparedSection.resume_id);
          const cIdx = currentSections.findIndex(s => s.id === preparedSection.id);
          const updatedCustom = cIdx >= 0 ? [...currentSections] : [...currentSections, preparedSection];
          if (cIdx >= 0) updatedCustom[cIdx] = preparedSection;
          await supabase.from('resumes').update({ custom_sections: updatedCustom }).eq('id', targetResume.id);
        }
      }
    }

    const sections = getLocal<ResumeCustomSection[]>(KEYS.CUSTOM_SECTIONS, []);
    const idx = sections.findIndex(s => s.id === section.id);
    let updatedSections: ResumeCustomSection[];
    if (idx >= 0) {
      updatedSections = [...sections];
      updatedSections[idx] = preparedSection;
    } else {
      updatedSections = [...sections, preparedSection];
    }
    setLocal(KEYS.CUSTOM_SECTIONS, updatedSections);

    if (preparedSection.resume_id) {
      const resumes = getLocal<ResumeVersion[]>(KEYS.RESUMES, []);
      const targetResume = resumes.find(r => r.id === preparedSection.resume_id);
      if (targetResume) {
        const existingCustom = targetResume.custom_sections || [];
        const cIdx = existingCustom.findIndex(s => s.id === preparedSection.id);
        let updatedCustom: ResumeCustomSection[];
        if (cIdx >= 0) {
          updatedCustom = [...existingCustom];
          updatedCustom[cIdx] = preparedSection;
        } else {
          updatedCustom = [...existingCustom, preparedSection];
        }
        targetResume.custom_sections = updatedCustom;
        setLocal(KEYS.RESUMES, resumes);
      }
    }

    return preparedSection;
  },

  async deleteCustomSection(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('resume_custom_sections').delete().eq('id', id);
      if (error) {
        console.error('Supabase custom section delete failed:', error);
        throw new Error(`Cloud Database custom section delete failed: ${error.message}`);
      }
    }

    const sections = getLocal<ResumeCustomSection[]>(KEYS.CUSTOM_SECTIONS, []);
    const target = sections.find(s => s.id === id);
    const updated = sections.filter(s => s.id !== id);
    setLocal(KEYS.CUSTOM_SECTIONS, updated);

    if (target?.resume_id) {
      const resumes = getLocal<ResumeVersion[]>(KEYS.RESUMES, []);
      const targetResume = resumes.find(r => r.id === target.resume_id);
      if (targetResume && targetResume.custom_sections) {
        targetResume.custom_sections = targetResume.custom_sections.filter(s => s.id !== id);
        setLocal(KEYS.RESUMES, resumes);
      }
    }
  },

  async reorderCustomSections(orderedIds: string[], resumeId?: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      for (const id of orderedIds) {
        const order = orderedIds.indexOf(id) + 1;
        const { error } = await supabase.from('resume_custom_sections').update({ display_order: order }).eq('id', id);
        if (error) console.error(`Failed to reorder section ${id}:`, error.message);
      }
    }

    const all = getLocal<ResumeCustomSection[]>(KEYS.CUSTOM_SECTIONS, []);
    const updated = all.map(section => {
      const matchIndex = orderedIds.indexOf(section.id);
      if (matchIndex >= 0) {
        return { ...section, display_order: matchIndex + 1, updated_at: new Date().toISOString() };
      }
      return section;
    });
    setLocal(KEYS.CUSTOM_SECTIONS, updated);

    if (resumeId) {
      const resumes = getLocal<ResumeVersion[]>(KEYS.RESUMES, []);
      const targetResume = resumes.find(r => r.id === resumeId);
      if (targetResume && targetResume.custom_sections) {
        targetResume.custom_sections = targetResume.custom_sections.map(s => {
          const matchIndex = orderedIds.indexOf(s.id);
          return matchIndex >= 0 ? { ...s, display_order: matchIndex + 1 } : s;
        }).sort((a, b) => a.display_order - b.display_order);
        setLocal(KEYS.RESUMES, resumes);
      }
    }
  },

  // --- MEDIA ASSETS ---
  async getMediaAssets(): Promise<MediaAsset[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('media_assets').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          if (data.length > 0) {
            setLocal(KEYS.MEDIA, data);
            return data as MediaAsset[];
          }
          const local = getLocal<MediaAsset[]>(KEYS.MEDIA, []);
          if (local.length > 0) return local;
          return [];
        }
      } catch (err) {
        console.warn('Falling back to local media mirror', err);
      }
    }
    return getLocal<MediaAsset[]>(KEYS.MEDIA, []);
  },

  async addMediaAsset(asset: MediaAsset): Promise<MediaAsset> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('media_assets').insert(asset);
      if (error) {
        console.error('Supabase media asset insert failed:', error);
        throw new Error(`Cloud Database media asset save failed: ${error.message}`);
      }
    }
    const list = await this.getMediaAssets();
    const updated = [asset, ...list];
    setLocal(KEYS.MEDIA, updated);
    return asset;
  },

  async deleteMediaAsset(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('media_assets').delete().eq('id', id);
      if (error) {
        console.error('Supabase media asset delete failed:', error);
        throw new Error(`Cloud Database media asset delete failed: ${error.message}`);
      }
    }
    const list = (await this.getMediaAssets()).filter(m => m.id !== id);
    setLocal(KEYS.MEDIA, list);
  },

  // --- SYSTEM TELEMETRY STATS ---
  async getSystemStats(): Promise<SystemStats> {
    const worlds = await this.getWorlds();
    const projects = await this.getProjects();
    const skills = await this.getSkills();
    const achievements = await this.getAchievements();
    const resumes = await this.getAllResumes();

    return {
      publishedWorlds: worlds.filter(w => w.is_enabled).length,
      publishedProjects: projects.length,
      skillsCount: skills.length,
      achievementsCount: achievements.length,
      resumeVersionsCount: resumes.length,
    };
  },

  // --- BACKGROUND HELPER: AUTO-SYNC LOCAL DATA IF CLOUD IS EMPTY ---
  triggerAutoSyncIfEmpty(): void {
    if (autoSyncAttempted || !isSupabaseConfigured() || !supabase) return;
    autoSyncAttempted = true;

    // Run asynchronously without blocking immediate UI rendering
    setTimeout(async () => {
      try {
        const localProjects = getLocal<Project[]>(KEYS.PROJECTS, []);
        const localSkills = getLocal<Skill[]>(KEYS.SKILLS, []);
        const localJourney = getLocal<JourneyEntry[]>(KEYS.JOURNEY, []);
        const localAchievements = getLocal<Achievement[]>(KEYS.ACHIEVEMENTS, []);

        const totalLocalRecords = localProjects.length + localSkills.length + localJourney.length + localAchievements.length;
        if (totalLocalRecords > 0) {
          console.info(`Initial cloud synchronization: Migrating ${totalLocalRecords} local portfolio items to connected Supabase Cloud database...`);
          await this.syncLocalToSupabase();
        }
      } catch (err) {
        console.warn('Initial cloud migration notice:', err);
      }
    }, 100);
  },

  // --- SAFE DATA MIGRATION: LOCAL VAULT -> SUPABASE CLOUD ---
  async syncLocalToSupabase(): Promise<{ success: boolean; count: number; error?: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { 
        success: false, 
        count: 0, 
        error: 'Supabase is not configured yet. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.' 
      };
    }

    try {
      let syncedCount = 0;
      const errors: string[] = [];

      // 1. Profile
      const localProfile = getLocal<Profile | null>(KEYS.PROFILE, null);
      if (localProfile) {
        const { error } = await supabase.from('profiles').upsert(localProfile);
        if (error) errors.push(`Profile: ${error.message}`);
        else syncedCount++;
      }

      // 2. Worlds (Ensure INITIAL_WORLDS and localWorlds exist in Supabase first so FK constraints succeed)
      const localWorlds = getLocal<World[]>(KEYS.WORLDS, INITIAL_WORLDS);
      const combinedWorlds = [...INITIAL_WORLDS];
      for (const lw of localWorlds) {
        const idx = combinedWorlds.findIndex(w => w.id === lw.id);
        if (idx >= 0) combinedWorlds[idx] = lw;
        else combinedWorlds.push(lw);
      }
      for (const w of combinedWorlds) {
        const { error } = await supabase.from('worlds').upsert(w);
        if (error) errors.push(`World (${w.name}): ${error.message}`);
        else syncedCount++;
      }

      // 3. Projects
      const localProjects = getLocal<Project[]>(KEYS.PROJECTS, []);
      for (const p of localProjects) {
        const sanitizedWorldId = (p.world_id && p.world_id.trim()) ? p.world_id.trim() : null;
        let payload = { ...p, world_id: sanitizedWorldId };
        
        let { error } = await supabase.from('projects').upsert(payload);
        // If foreign key constraint failed, retry with world_id: null to prevent project loss
        if (error && sanitizedWorldId && error.code === '23503') {
          console.warn(`Foreign key issue on project "${p.title}" with world "${sanitizedWorldId}". Retrying with world_id: null...`);
          payload = { ...p, world_id: null };
          const retry = await supabase.from('projects').upsert(payload);
          error = retry.error;
        }

        if (error) errors.push(`Project (${p.title}): ${error.message}`);
        else syncedCount++;
      }

      // 4. Skills
      const localSkills = getLocal<Skill[]>(KEYS.SKILLS, []);
      for (const s of localSkills) {
        const { error } = await supabase.from('skills').upsert(s);
        if (error) errors.push(`Skill (${s.name}): ${error.message}`);
        else syncedCount++;
      }

      // 5. Journey
      const localJourney = getLocal<JourneyEntry[]>(KEYS.JOURNEY, []);
      for (const j of localJourney) {
        const { error } = await supabase.from('journey_entries').upsert(j);
        if (error) errors.push(`Journey (${j.title}): ${error.message}`);
        else syncedCount++;
      }

      // 6. Achievements
      const localAchievements = getLocal<Achievement[]>(KEYS.ACHIEVEMENTS, []);
      for (const a of localAchievements) {
        const { error } = await supabase.from('achievements').upsert(a);
        if (error) errors.push(`Achievement (${a.title}): ${error.message}`);
        else syncedCount++;
      }

      // 7. Resumes
      const localResumes = getLocal<ResumeVersion[]>(KEYS.RESUMES, []);
      for (const r of localResumes) {
        const { error } = await supabase.from('resumes').upsert(r);
        if (error) errors.push(`Resume (${r.version_name}): ${error.message}`);
        else syncedCount++;
      }

      // 8. Custom Sections
      const localSections = getLocal<ResumeCustomSection[]>(KEYS.CUSTOM_SECTIONS, []);
      for (const cs of localSections) {
        let payload = { ...cs };
        let { error } = await supabase.from('resume_custom_sections').upsert(payload);
        if (error && cs.resume_id && error.code === '23503') {
          payload = { ...cs, resume_id: undefined as any };
          const retry = await supabase.from('resume_custom_sections').upsert(payload);
          error = retry.error;
        }
        if (error) errors.push(`Custom Section (${cs.title}): ${error.message}`);
        else syncedCount++;
      }

      // 9. Media Assets catalog
      const localMedia = getLocal<MediaAsset[]>(KEYS.MEDIA, []);
      for (const m of localMedia) {
        const { error } = await supabase.from('media_assets').upsert(m);
        if (error) errors.push(`Media (${m.name}): ${error.message}`);
        else syncedCount++;
      }

      if (errors.length > 0) {
        console.warn('Some items encountered notices during Supabase sync:', errors);
        return { 
          success: syncedCount > 0, 
          count: syncedCount, 
          error: `Synchronized ${syncedCount} items, but ${errors.length} notice(s):\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? '\n...' : ''}` 
        };
      }

      return { success: true, count: syncedCount };
    } catch (err: any) {
      console.error('Error synchronizing local data to Supabase:', err);
      return { success: false, count: 0, error: err?.message || 'Failed to synchronize data.' };
    }
  }
};
