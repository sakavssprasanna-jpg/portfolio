import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dbService } from '../services/db';
import { 
  Profile, 
  World, 
  Project, 
  Skill, 
  JourneyEntry, 
  Achievement, 
  ResumeVersion 
} from '../types/database';

interface UniverseContextType {
  profile: Profile | null;
  worlds: World[];
  projects: Project[];
  skills: Skill[];
  journey: JourneyEntry[];
  achievements: Achievement[];
  approvedResume: ResumeVersion | null;
  activeWorldId: string | null;
  setActiveWorldId: (id: string | null) => void;
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const UniverseContext = createContext<UniverseContextType | undefined>(undefined);

export const UniverseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [journey, setJourney] = useState<JourneyEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [approvedResume, setApprovedResume] = useState<ResumeVersion | null>(null);

  const [activeWorldId, setActiveWorldId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Detect prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const refreshData = useCallback(async () => {
    try {
      const [prof, wrlds, projs, skls, jrny, achs, res] = await Promise.all([
        dbService.getProfile(),
        dbService.getWorlds(),
        dbService.getProjects(),
        dbService.getSkills(),
        dbService.getJourney(),
        dbService.getAchievements(),
        dbService.getApprovedResume()
      ]);

      setProfile(prof);
      setWorlds(wrlds);
      setProjects(projs);
      setSkills(skls);
      setJourney(jrny);
      setAchievements(achs);
      setApprovedResume(res);

      if (wrlds.length > 0 && !activeWorldId) {
        const firstEnabled = wrlds.find(w => w.is_enabled);
        if (firstEnabled) setActiveWorldId(firstEnabled.id);
      }
    } catch (err) {
      console.error('Failed to load universe data', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeWorldId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <UniverseContext.Provider
      value={{
        profile,
        worlds,
        projects,
        skills,
        journey,
        achievements,
        approvedResume,
        activeWorldId,
        setActiveWorldId,
        selectedProject,
        setSelectedProject,
        reducedMotion,
        setReducedMotion,
        isLoading,
        refreshData
      }}
    >
      {children}
    </UniverseContext.Provider>
  );
};

export const useUniverse = () => {
  const ctx = useContext(UniverseContext);
  if (!ctx) throw new Error('useUniverse must be used within a UniverseProvider');
  return ctx;
};
