export interface ExtractedEducation {
  institution: string;
  degree?: string;
  field_of_study?: string;
  date_range?: string;
  description?: string;
}

export interface ExtractedProject {
  title: string;
  short_description?: string;
  full_description?: string;
  tech_stack: string[];
  features?: string[];
  link?: string;
}

export interface ExtractedExperience {
  role: string;
  organization: string;
  date_range: string;
  description: string;
  category?: 'experience' | 'education' | 'milestone' | 'research';
  is_internship?: boolean;
}

export interface ExtractedAchievement {
  title: string;
  organization: string;
  date?: string;
  description?: string;
}

export interface ExtractedSkill {
  name: string;
  category: string;
}

export interface ExtractedCustomSection {
  title: string;
  slug?: string;
  content: string[] | string;
  display_order?: number;
  visible?: boolean;
}

export interface ExtractedResumeData {
  full_name?: string;
  headline?: string;
  summary?: string;
  email?: string;
  location?: string;
  links: {
    github?: string;
    linkedin?: string;
    website?: string;
  };
  skills: ExtractedSkill[];
  projects: ExtractedProject[];
  experience: ExtractedExperience[];
  education: ExtractedEducation[];
  achievements: ExtractedAchievement[];
  certifications: string[];
  custom_sections?: ExtractedCustomSection[];
}

export type ChangeResolution = 'MERGE' | 'REPLACE' | 'KEEP_EXISTING' | 'REVIEW_MANUALLY';
export type ItemChangeStatus = 'NEW' | 'UPDATED' | 'UNCHANGED' | 'POSSIBLE DUPLICATE';
export type ResumeItemGroup = 
  | 'PROFILE' 
  | 'EDUCATION' 
  | 'SKILLS' 
  | 'PROJECTS' 
  | 'EXPERIENCE' 
  | 'INTERNSHIPS' 
  | 'ACHIEVEMENTS' 
  | 'CERTIFICATIONS' 
  | 'CUSTOM_SECTIONS'
  | 'LINKS';

export interface ProposedChangeItem<T = any> {
  id: string;
  group: ResumeItemGroup;
  entityType: 'profile' | 'project' | 'skill' | 'journey' | 'achievement' | 'link' | 'certification' | 'custom_section';
  status: ItemChangeStatus;
  action: 'insert' | 'update' | 'noop';
  title: string;
  incomingData: T;
  existingData?: T;
  isDuplicate: boolean;
  resolution: ChangeResolution;
  isApproved: boolean;
  userEditedData?: T;
}

export interface ResumeChangeReport {
  resumeVersionName: string;
  totalChanges: number;
  newItemsCount: number;
  updatedItemsCount: number;
  duplicateItemsCount: number;
  unchangedItemsCount: number;
  items: ProposedChangeItem[];
}

export interface ExtractionDiagnostics {
  pdfUploaded: boolean;
  pdfTextExtracted: boolean;
  charactersExtracted: number;
  aiConfigured: boolean;
  aiRequestStatus: 'success' | 'failed' | 'not-configured' | 'fallback';
  aiErrorMessage?: string;
  structuredResponseValid: boolean;
  itemsExtractedCount: number;
  rawTextPreview?: string;
}

export interface ExtractionResult {
  data: ExtractedResumeData;
  diagnostics: ExtractionDiagnostics;
}

