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
    console.error('Failed to save to local storage', err);
  }
}

export const dbService = {
  // --- PROFILES ---
  async getProfile(): Promise<Profile> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').limit(1).single();
        if (!error && data) return data as Profile;
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
      try {
        await supabase.from('profiles').upsert(updated);
      } catch (err) {
        console.error('Error updating profile in Supabase', err);
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
        if (!error && data && data.length > 0) return data as World[];
      } catch (err) {
        console.warn('Falling back to local worlds mirror', err);
      }
    }
    return getLocal<World[]>(KEYS.WORLDS, INITIAL_WORLDS);
  },

  async saveWorld(world: World): Promise<World> {
    const worlds = await this.getWorlds();
    const idx = worlds.findIndex(w => w.id === world.id);
    let updated: World[];
    if (idx >= 0) {
      updated = [...worlds];
      updated[idx] = { ...world, updated_at: new Date().toISOString() };
    } else {
      updated = [...worlds, { ...world, updated_at: new Date().toISOString() }];
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('worlds').upsert(world);
      } catch (err) {
        console.error('Error saving world in Supabase', err);
      }
    }
    setLocal(KEYS.WORLDS, updated);
    return world;
  },

  async deleteWorld(worldId: string): Promise<void> {
    const worlds = (await this.getWorlds()).filter(w => w.id !== worldId);
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('worlds').delete().eq('id', worldId);
      } catch (err) {
        console.error('Error deleting world in Supabase', err);
      }
    }
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
        await supabase.from('worlds').update({ display_order: w.display_order }).eq('id', w.id);
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
        if (!error && data) return data as Project[];
      } catch (err) {
        console.warn('Falling back to local projects mirror', err);
      }
    }
    // Strict adherence to Rule #28: NO FAKE DATA! Empty array initially.
    return getLocal<Project[]>(KEYS.PROJECTS, []);
  },

  async saveProject(project: Project): Promise<Project> {
    const projects = await this.getProjects();
    const idx = projects.findIndex(p => p.id === project.id);
    let updated: Project[];
    if (idx >= 0) {
      updated = [...projects];
      updated[idx] = { ...project, updated_at: new Date().toISOString() };
    } else {
      updated = [...projects, { ...project, updated_at: new Date().toISOString() }];
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('projects').upsert(project);
      } catch (err) {
        console.error('Error saving project in Supabase', err);
      }
    }
    setLocal(KEYS.PROJECTS, updated);
    return project;
  },

  async deleteProject(projectId: string): Promise<void> {
    const projects = (await this.getProjects()).filter(p => p.id !== projectId);
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('projects').delete().eq('id', projectId);
      } catch (err) {
        console.error('Error deleting project in Supabase', err);
      }
    }
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
        if (!error && data) return data as Skill[];
      } catch (err) {
        console.warn('Falling back to local skills mirror', err);
      }
    }
    return getLocal<Skill[]>(KEYS.SKILLS, []);
  },

  async saveSkill(skill: Skill): Promise<Skill> {
    const skills = await this.getSkills();
    const idx = skills.findIndex(s => s.id === skill.id);
    let updated: Skill[];
    if (idx >= 0) {
      updated = [...skills];
      updated[idx] = skill;
    } else {
      updated = [...skills, skill];
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('skills').upsert(skill);
      } catch (err) {
        console.error('Error saving skill in Supabase', err);
      }
    }
    setLocal(KEYS.SKILLS, updated);
    return skill;
  },

  async deleteSkill(skillId: string): Promise<void> {
    const skills = (await this.getSkills()).filter(s => s.id !== skillId);
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('skills').delete().eq('id', skillId);
      } catch (err) {
        console.error('Error deleting skill in Supabase', err);
      }
    }
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
        await supabase.from('skills').update({ display_order: s.display_order }).eq('id', s.id);
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
        if (!error && data) return data as JourneyEntry[];
      } catch (err) {
        console.warn('Falling back to local journey mirror', err);
      }
    }
    return getLocal<JourneyEntry[]>(KEYS.JOURNEY, []);
  },

  async saveJourneyEntry(entry: JourneyEntry): Promise<JourneyEntry> {
    const journey = await this.getJourney();
    const idx = journey.findIndex(j => j.id === entry.id);
    let updated: JourneyEntry[];
    if (idx >= 0) {
      updated = [...journey];
      updated[idx] = entry;
    } else {
      updated = [...journey, entry];
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('journey_entries').upsert(entry);
      } catch (err) {
        console.error('Error saving journey entry in Supabase', err);
      }
    }
    setLocal(KEYS.JOURNEY, updated);
    return entry;
  },

  async deleteJourneyEntry(id: string): Promise<void> {
    const journey = (await this.getJourney()).filter(j => j.id !== id);
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('journey_entries').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting journey entry in Supabase', err);
      }
    }
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
        await supabase.from('journey_entries').update({ display_order: j.display_order }).eq('id', j.id);
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
        if (!error && data) return data as Achievement[];
      } catch (err) {
        console.warn('Falling back to local achievements mirror', err);
      }
    }
    return getLocal<Achievement[]>(KEYS.ACHIEVEMENTS, []);
  },

  async saveAchievement(achievement: Achievement): Promise<Achievement> {
    const items = await this.getAchievements();
    const idx = items.findIndex(a => a.id === achievement.id);
    let updated: Achievement[];
    if (idx >= 0) {
      updated = [...items];
      updated[idx] = achievement;
    } else {
      updated = [...items, achievement];
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('achievements').upsert(achievement);
      } catch (err) {
        console.error('Error saving achievement in Supabase', err);
      }
    }
    setLocal(KEYS.ACHIEVEMENTS, updated);
    return achievement;
  },

  async deleteAchievement(id: string): Promise<void> {
    const items = (await this.getAchievements()).filter(a => a.id !== id);
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('achievements').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting achievement in Supabase', err);
      }
    }
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
        if (!error && data) return data as ResumeVersion;
      } catch (err) {
        console.warn('Falling back to local resumes mirror', err);
      }
    }
    const all = getLocal<ResumeVersion[]>(KEYS.RESUMES, []);
    return all.find(r => r.is_current_approved) || null;
  },

  async getAllResumes(): Promise<ResumeVersion[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .order('upload_date', { ascending: false });
        if (!error && data) return data as ResumeVersion[];
      } catch (err) {
        console.warn('Falling back to local resumes mirror', err);
      }
    }
    return getLocal<ResumeVersion[]>(KEYS.RESUMES, []);
  },

  async saveResumeVersion(resume: ResumeVersion): Promise<ResumeVersion> {
    const resumes = await this.getAllResumes();
    let updated: ResumeVersion[];
    
    // If setting as approved, remove approved flag from others
    const processed = resume.is_current_approved
      ? resumes.map(r => ({ ...r, is_current_approved: false }))
      : resumes;

    const idx = processed.findIndex(r => r.id === resume.id);
    if (idx >= 0) {
      updated = [...processed];
      updated[idx] = resume;
    } else {
      updated = [resume, ...processed];
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        if (resume.is_current_approved) {
          await supabase.from('resumes').update({ is_current_approved: false }).neq('id', resume.id);
        }
        await supabase.from('resumes').upsert(resume);
      } catch (err) {
        console.error('Error saving resume in Supabase', err);
      }
    }
    setLocal(KEYS.RESUMES, updated);
    return resume;
  },

  async deleteResume(id: string): Promise<void> {
    const resumes = (await this.getAllResumes()).filter(r => r.id !== id);
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('resumes').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting resume in Supabase', err);
      }
    }
    setLocal(KEYS.RESUMES, resumes);
    // Clean up associated custom sections
    const allSections = getLocal<ResumeCustomSection[]>(KEYS.CUSTOM_SECTIONS, []);
    const remainingSections = allSections.filter(s => s.resume_id !== id);
    setLocal(KEYS.CUSTOM_SECTIONS, remainingSections);
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('resume_custom_sections').delete().eq('resume_id', id);
      } catch (err) {
        console.error('Error deleting resume custom sections in Supabase', err);
      }
    }
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
        if (!error && data && data.length > 0) return data as ResumeCustomSection[];
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
      // Check if the resume version itself holds custom_sections
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
    const sections = getLocal<ResumeCustomSection[]>(KEYS.CUSTOM_SECTIONS, []);
    const idx = sections.findIndex(s => s.id === section.id);
    let updatedSections: ResumeCustomSection[];
    
    const preparedSection: ResumeCustomSection = {
      ...section,
      updated_at: new Date().toISOString()
    };

    if (idx >= 0) {
      updatedSections = [...sections];
      updatedSections[idx] = preparedSection;
    } else {
      updatedSections = [...sections, preparedSection];
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('resume_custom_sections').upsert(preparedSection);
      } catch (err) {
        console.error('Error saving custom section in Supabase', err);
      }
    }
    setLocal(KEYS.CUSTOM_SECTIONS, updatedSections);

    // Keep associated resume version synchronized
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
        if (isSupabaseConfigured() && supabase) {
          try {
            await supabase.from('resumes').update({ custom_sections: updatedCustom }).eq('id', targetResume.id);
          } catch (err) {
            console.error('Error updating resume custom sections column in Supabase', err);
          }
        }
      }
    }

    return preparedSection;
  },

  async deleteCustomSection(id: string): Promise<void> {
    const sections = getLocal<ResumeCustomSection[]>(KEYS.CUSTOM_SECTIONS, []);
    const target = sections.find(s => s.id === id);
    const updated = sections.filter(s => s.id !== id);
    
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('resume_custom_sections').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting custom section in Supabase', err);
      }
    }
    setLocal(KEYS.CUSTOM_SECTIONS, updated);

    // Also remove from matching resume version if applicable
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
    const all = getLocal<ResumeCustomSection[]>(KEYS.CUSTOM_SECTIONS, []);
    const updated = all.map(section => {
      const matchIndex = orderedIds.indexOf(section.id);
      if (matchIndex >= 0) {
        return { ...section, display_order: matchIndex + 1, updated_at: new Date().toISOString() };
      }
      return section;
    });

    if (isSupabaseConfigured() && supabase) {
      for (const id of orderedIds) {
        const order = orderedIds.indexOf(id) + 1;
        await supabase.from('resume_custom_sections').update({ display_order: order }).eq('id', id);
      }
    }
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
        if (!error && data) return data as MediaAsset[];
      } catch (err) {
        console.warn('Falling back to local media mirror', err);
      }
    }
    return getLocal<MediaAsset[]>(KEYS.MEDIA, []);
  },

  async addMediaAsset(asset: MediaAsset): Promise<MediaAsset> {
    const list = await this.getMediaAssets();
    const updated = [asset, ...list];
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('media_assets').insert(asset);
      } catch (err) {
        console.error('Error saving media asset in Supabase', err);
      }
    }
    setLocal(KEYS.MEDIA, updated);
    return asset;
  },

  async deleteMediaAsset(id: string): Promise<void> {
    const list = (await this.getMediaAssets()).filter(m => m.id !== id);
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('media_assets').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting media asset in Supabase', err);
      }
    }
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
  }
};
