import { 
  ExtractedResumeData, 
  ExtractionResult, 
  ExtractionDiagnostics 
} from '../types/resume';

const EXTRACTION_SYSTEM_PROMPT = `You are a precision resume extraction engine for an AI/ML and software engineering portfolio.
CRITICAL ZERO-HALLUCINATION RULES:
1. Extract ONLY information that is EXPLICITLY present in the resume text below.
2. NEVER hallucinate, invent, extrapolate, or assume any skills, job titles, companies, dates, metrics, projects, or links.
3. If a field or category is not mentioned in the resume, leave it empty or omit it.
4. Output valid JSON adhering strictly to the schema below without any markdown fences.

Expected JSON Schema:
{
  "full_name": string,
  "headline": string,
  "summary": string,
  "email": string,
  "location": string,
  "links": {
    "github": string,
    "linkedin": string,
    "website": string
  },
  "skills": [
    { "name": string, "category": string }
  ],
  "projects": [
    {
      "title": string,
      "short_description": string,
      "full_description": string,
      "tech_stack": [string],
      "features": [string],
      "link": string
    }
  ],
  "experience": [
    {
      "role": string,
      "organization": string,
      "date_range": string,
      "description": string,
      "category": "experience" | "education" | "milestone" | "research",
      "is_internship": boolean
    }
  ],
  "education": [
    {
      "institution": string,
      "degree": string,
      "field_of_study": string,
      "date_range": string,
      "description": string
    }
  ],
  "achievements": [
    {
      "title": string,
      "organization": string,
      "date": string,
      "description": string
    }
  ],
  "certifications": [string],
  "custom_sections": [
    {
      "title": string,
      "content": [string]
    }
  ]
}
If the resume contains sections not captured by the predefined fields above (such as Languages, Publications, Volunteer Experience, Relevant Coursework, Research, Leadership, Interests, Awards, Professional Memberships, Conferences, etc.), extract them faithfully into "custom_sections" using their exact heading title. Never invent or omit sections.`;

// Strict Schema Validation & Normalization Layer (Section 6)
export function validateAndNormalizeExtractedData(raw: any): ExtractedResumeData {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Structured response is not a valid JSON object.');
  }

  // Helper for safe strings
  const s = (val: any): string => (typeof val === 'string' ? val.trim() : '');

  // 1. Links
  const linksRaw = raw.links && typeof raw.links === 'object' ? raw.links : {};
  const links = {
    github: s(linksRaw.github),
    linkedin: s(linksRaw.linkedin),
    website: s(linksRaw.website || linksRaw.portfolio)
  };

  // 2. Skills
  const skillsRaw = Array.isArray(raw.skills) ? raw.skills : [];
  const skills = skillsRaw
    .map((item: any) => {
      if (typeof item === 'string' && item.trim()) {
        return { name: item.trim(), category: 'AI / ML' };
      }
      if (item && typeof item === 'object' && item.name) {
        return {
          name: s(item.name),
          category: s(item.category) || 'Technical Competencies'
        };
      }
      return null;
    })
    .filter(Boolean) as { name: string; category: string }[];

  // 3. Projects
  const projectsRaw = Array.isArray(raw.projects) ? raw.projects : [];
  const projects = projectsRaw
    .map((p: any) => {
      if (!p || typeof p !== 'object' || !p.title) return null;
      const techStack = Array.isArray(p.tech_stack)
        ? p.tech_stack.map(s).filter(Boolean)
        : [];
      const features = Array.isArray(p.features)
        ? p.features.map(s).filter(Boolean)
        : [];

      return {
        title: s(p.title),
        short_description: s(p.short_description || p.description),
        full_description: s(p.full_description || p.short_description || p.description),
        tech_stack: techStack,
        features: features,
        link: s(p.link || p.github || p.url)
      };
    })
    .filter(Boolean);

  // 4. Experience & Internships
  const expRaw = Array.isArray(raw.experience) ? raw.experience : [];
  const experience = expRaw
    .map((e: any) => {
      if (!e || typeof e !== 'object' || (!e.role && !e.title)) return null;
      const role = s(e.role || e.title);
      const isIntern = Boolean(
        e.is_internship ||
        role.toLowerCase().includes('intern') ||
        s(e.description).toLowerCase().includes('intern')
      );

      return {
        role,
        organization: s(e.organization || e.company || e.institution),
        date_range: s(e.date_range || e.dates || e.duration),
        description: s(e.description || e.summary),
        category: (e.category || 'experience') as 'experience' | 'education' | 'milestone' | 'research',
        is_internship: isIntern
      };
    })
    .filter(Boolean);

  // 5. Education
  const eduRaw = Array.isArray(raw.education) ? raw.education : [];
  const education = eduRaw
    .map((ed: any) => {
      if (!ed || typeof ed !== 'object' || (!ed.institution && !ed.degree)) return null;
      return {
        institution: s(ed.institution || ed.university || ed.college || ed.school),
        degree: s(ed.degree),
        field_of_study: s(ed.field_of_study || ed.major || ed.branch),
        date_range: s(ed.date_range || ed.dates || ed.year),
        description: s(ed.description)
      };
    })
    .filter(Boolean);

  // 6. Achievements
  const achRaw = Array.isArray(raw.achievements) ? raw.achievements : [];
  const achievements = achRaw
    .map((a: any) => {
      if (!a || typeof a !== 'object' || !a.title) return null;
      return {
        title: s(a.title),
        organization: s(a.organization || a.issuer || ''),
        date: s(a.date || a.year || ''),
        description: s(a.description)
      };
    })
    .filter(Boolean);

  // 7. Certifications
  const certsRaw = Array.isArray(raw.certifications) ? raw.certifications : [];
  const certifications = certsRaw
    .map((c: any) => (typeof c === 'string' ? c.trim() : s(c?.title || c?.name)))
    .filter(Boolean);

  // 8. Custom Sections
  const customRaw = Array.isArray(raw.custom_sections) ? raw.custom_sections : [];
  const custom_sections = customRaw
    .map((cs: any, idx: number) => {
      if (!cs || typeof cs !== 'object') return null;
      const title = s(cs.title || cs.name || cs.section);
      if (!title) return null;

      let content: string[] = [];
      if (Array.isArray(cs.content)) {
        content = cs.content.map(s).filter(Boolean);
      } else if (typeof cs.content === 'string') {
        const text = cs.content.trim();
        content = text.includes('\n') 
          ? text.split('\n').map(s).filter(Boolean)
          : [text];
      }

      return {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        content,
        display_order: idx + 1,
        visible: true
      };
    })
    .filter(Boolean);

  return {
    full_name: s(raw.full_name || raw.name),
    headline: s(raw.headline || raw.title),
    summary: s(raw.summary || raw.bio || raw.profile),
    email: s(raw.email),
    location: s(raw.location || raw.address),
    links,
    skills,
    projects,
    experience,
    education,
    achievements,
    certifications,
    custom_sections
  };
}

// Deterministic rule-based extraction fallback (Section 9 - Zero Hallucination)
export function extractWithDeterministicEngine(text: string): ExtractedResumeData {
  const result: ExtractedResumeData = {
    links: { github: '', linkedin: '', website: '' },
    skills: [],
    projects: [],
    experience: [],
    education: [],
    achievements: [],
    certifications: [],
    custom_sections: []
  };

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Extract Email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) result.email = emailMatch[0];

  // 2. Extract Links (GitHub, LinkedIn, Website)
  const ghMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  if (ghMatch) result.links.github = ghMatch[0].startsWith('http') ? ghMatch[0] : `https://${ghMatch[0]}`;

  const liMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  if (liMatch) result.links.linkedin = liMatch[0].startsWith('http') ? liMatch[0] : `https://${liMatch[0]}`;

  const webMatch = text.match(/(?:https?:\/\/)(?!github|linkedin)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i);
  if (webMatch) result.links.website = webMatch[0];

  // 3. Name & Headline detection from first few lines
  if (lines.length > 0) {
    const candidateName = lines[0];
    if (candidateName.length < 50 && !candidateName.includes('@') && !candidateName.includes('http')) {
      result.full_name = candidateName;
    }
    if (lines.length > 1) {
      const candidateHeadline = lines[1];
      if (candidateHeadline.length < 90 && !candidateHeadline.includes('@') && !candidateHeadline.includes('http')) {
        result.headline = candidateHeadline;
      }
    }
  }

  // 4. Keyword taxonomy for skills
  const knownTechKeywords = [
    { name: 'Python', category: 'Programming Languages' },
    { name: 'TypeScript', category: 'Programming Languages' },
    { name: 'JavaScript', category: 'Programming Languages' },
    { name: 'C++', category: 'Programming Languages' },
    { name: 'Java', category: 'Programming Languages' },
    { name: 'PyTorch', category: 'AI / ML Frameworks' },
    { name: 'TensorFlow', category: 'AI / ML Frameworks' },
    { name: 'Scikit-Learn', category: 'AI / ML Frameworks' },
    { name: 'Keras', category: 'AI / ML Frameworks' },
    { name: 'Hugging Face', category: 'Generative AI & LLMs' },
    { name: 'LangChain', category: 'Agentic AI & RAG' },
    { name: 'LangGraph', category: 'Agentic AI & RAG' },
    { name: 'LlamaIndex', category: 'Agentic AI & RAG' },
    { name: 'ChromaDB', category: 'Vector Databases' },
    { name: 'Pinecone', category: 'Vector Databases' },
    { name: 'Milvus', category: 'Vector Databases' },
    { name: 'FAISS', category: 'Vector Databases' },
    { name: 'OpenCV', category: 'Computer Vision' },
    { name: 'YOLO', category: 'Computer Vision' },
    { name: 'BERT', category: 'NLP' },
    { name: 'Transformers', category: 'NLP & LLMs' },
    { name: 'FastAPI', category: 'Backend & APIs' },
    { name: 'Flask', category: 'Backend & APIs' },
    { name: 'React', category: 'Frontend Development' },
    { name: 'Next.js', category: 'Frontend Development' },
    { name: 'Tailwind CSS', category: 'Frontend Development' },
    { name: 'Node.js', category: 'Backend & APIs' },
    { name: 'Docker', category: 'DevOps & Cloud' },
    { name: 'Kubernetes', category: 'DevOps & Cloud' },
    { name: 'AWS', category: 'Cloud Infrastructure' },
    { name: 'GCP', category: 'Cloud Infrastructure' },
    { name: 'PostgreSQL', category: 'Databases' },
    { name: 'Supabase', category: 'Databases' },
    { name: 'MongoDB', category: 'Databases' },
    { name: 'Redis', category: 'Databases' },
    { name: 'SQL', category: 'Databases' },
    { name: 'Git', category: 'Developer Tools' }
  ];

  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const foundSkills = new Set<string>();
  for (const tech of knownTechKeywords) {
    const escaped = escapeRegex(tech.name);
    const boundaryStart = /^\w/.test(tech.name) ? '\\b' : '';
    const boundaryEnd = /\w$/.test(tech.name) ? '\\b' : '(?![a-zA-Z0-9])';
    const regex = new RegExp(`${boundaryStart}${escaped}${boundaryEnd}`, 'i');
    if (regex.test(text) && !foundSkills.has(tech.name)) {
      foundSkills.add(tech.name);
      result.skills.push({ name: tech.name, category: tech.category });
    }
  }

  // 5. Section parsing
  let currentSection: 'projects' | 'experience' | 'education' | 'achievements' | 'certifications' | 'custom' | null = null;
  let currentProject: any = null;
  let currentExp: any = null;
  let currentCustomSection: { title: string; slug: string; content: string[]; display_order: number; visible: boolean } | null = null;

  const flushCustom = () => {
    if (currentCustomSection && currentCustomSection.content.length > 0) {
      if (!result.custom_sections) result.custom_sections = [];
      result.custom_sections.push(currentCustomSection);
      currentCustomSection = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upper = line.toUpperCase().trim();

    // Standard known sections check
    if (upper === 'PROJECTS' || upper.startsWith('PROJECTS') || upper.startsWith('KEY PROJECTS') || upper.startsWith('ACADEMIC PROJECTS') || upper.startsWith('NOTABLE PROJECTS')) {
      if (currentProject) { result.projects.push(currentProject); currentProject = null; }
      if (currentExp) { result.experience.push(currentExp); currentExp = null; }
      flushCustom();
      currentSection = 'projects';
      continue;
    } else if (upper === 'EXPERIENCE' || upper.startsWith('WORK EXPERIENCE') || upper.startsWith('PROFESSIONAL EXPERIENCE') || upper.startsWith('EMPLOYMENT') || upper.startsWith('WORK HISTORY')) {
      if (currentProject) { result.projects.push(currentProject); currentProject = null; }
      if (currentExp) { result.experience.push(currentExp); currentExp = null; }
      flushCustom();
      currentSection = 'experience';
      continue;
    } else if (upper === 'INTERNSHIPS' || upper.startsWith('INTERNSHIP')) {
      if (currentProject) { result.projects.push(currentProject); currentProject = null; }
      if (currentExp) { result.experience.push(currentExp); currentExp = null; }
      flushCustom();
      currentSection = 'experience';
      continue;
    } else if (upper === 'EDUCATION' || upper.startsWith('ACADEMIC BACKGROUND') || upper.startsWith('QUALIFICATIONS') || upper.startsWith('EDUCATIONAL QUALIFICATIONS')) {
      if (currentProject) { result.projects.push(currentProject); currentProject = null; }
      if (currentExp) { result.experience.push(currentExp); currentExp = null; }
      flushCustom();
      currentSection = 'education';
      continue;
    } else if (upper === 'ACHIEVEMENTS' || upper.startsWith('HONORS') || upper.startsWith('AWARDS') || upper.startsWith('HONORS & AWARDS') || upper.startsWith('ACCOMPLISHMENTS')) {
      if (currentProject) { result.projects.push(currentProject); currentProject = null; }
      if (currentExp) { result.experience.push(currentExp); currentExp = null; }
      flushCustom();
      currentSection = 'achievements';
      continue;
    } else if (upper === 'CERTIFICATIONS' || upper.startsWith('CERTIFICATES') || upper.startsWith('LICENSES & CERTIFICATIONS') || upper.startsWith('LICENSES')) {
      if (currentProject) { result.projects.push(currentProject); currentProject = null; }
      if (currentExp) { result.experience.push(currentExp); currentExp = null; }
      flushCustom();
      currentSection = 'certifications';
      continue;
    } else if (upper === 'SKILLS' || upper.startsWith('TECHNICAL SKILLS') || upper.startsWith('CORE COMPETENCIES') || upper.startsWith('AREAS OF EXPERTISE') || upper.startsWith('SKILLS & EXPERTISE')) {
      if (currentProject) { result.projects.push(currentProject); currentProject = null; }
      if (currentExp) { result.experience.push(currentExp); currentExp = null; }
      flushCustom();
      currentSection = null;
      continue;
    } else if (upper === 'SUMMARY' || upper.startsWith('PROFESSIONAL SUMMARY') || upper.startsWith('ABOUT ME') || upper === 'PROFILE') {
      if (currentProject) { result.projects.push(currentProject); currentProject = null; }
      if (currentExp) { result.experience.push(currentExp); currentExp = null; }
      flushCustom();
      currentSection = null;
      continue;
    } else if (upper === 'CONTACT' || upper.startsWith('CONTACT') || upper === 'LINKS' || upper.startsWith('LINKS')) {
      if (currentProject) { result.projects.push(currentProject); currentProject = null; }
      if (currentExp) { result.experience.push(currentExp); currentExp = null; }
      flushCustom();
      currentSection = null;
      continue;
    }

    const isNameOrHeader = (i <= 1 && !upper.startsWith('LANGUAGES') && !upper.startsWith('PUBLICATIONS')) || (result.full_name && upper === result.full_name.toUpperCase());

    // Dynamic / Custom Section Heading Detection (Languages, Publications, Coursework, Volunteer, Research, Leadership, etc.)
    const isCustomHeading = 
      !isNameOrHeader &&
      !line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*') && !line.startsWith('+') &&
      line.length >= 3 && line.length <= 45 &&
      !line.includes('@') && !line.includes('http') && !line.includes('.com') && !line.endsWith('.') &&
      (
        upper.startsWith('LANGUAGES') ||
        upper.startsWith('PUBLICATIONS') ||
        upper.startsWith('VOLUNTEER') ||
        upper.startsWith('RELEVANT COURSEWORK') ||
        upper.startsWith('COURSEWORK') ||
        upper.startsWith('RESEARCH') ||
        upper.startsWith('LEADERSHIP') ||
        upper.startsWith('INTERESTS') ||
        upper.startsWith('HOBBIES') ||
        upper.startsWith('PROFESSIONAL MEMBERSHIPS') ||
        upper.startsWith('MEMBERSHIPS') ||
        upper.startsWith('CONFERENCES') ||
        upper.startsWith('PATENTS') ||
        upper.startsWith('EXTRACURRICULAR') ||
        upper.startsWith('EXTRA-CURRICULAR') ||
        // Standalone all-caps header with following lines (ignoring lines in the top 3 lines of dossier)
        (i > 2 && /^[A-Z0-9\s&/-]{3,35}$/.test(line.trim()) && !line.includes(':') && (i + 1 < lines.length) && !lines[i+1].includes('@') && !lines[i+1].includes('http'))
      );

    if (isCustomHeading) {
      if (currentProject) { result.projects.push(currentProject); currentProject = null; }
      if (currentExp) { result.experience.push(currentExp); currentExp = null; }
      flushCustom();

      const rawTitle = line.trim();
      const formattedTitle = rawTitle === rawTitle.toUpperCase()
        ? rawTitle.split(/[\s_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
        : rawTitle;

      currentSection = 'custom';
      currentCustomSection = {
        title: formattedTitle,
        slug: formattedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        content: [],
        display_order: (result.custom_sections?.length || 0) + 1,
        visible: true
      };
      continue;
    }

    if (currentSection === 'projects') {
      if (!line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*') && line.length < 90 && line.length > 3) {
        if (currentProject) result.projects.push(currentProject);
        const stackMatch = line.match(/\(([^)]+)\)/);
        const titleOnly = line.replace(/\([^)]+\)/, '').trim();
        const detectedStack = stackMatch 
          ? stackMatch[1].split(/[,|]/).map(s => s.trim()).filter(Boolean)
          : [];

        currentProject = {
          title: titleOnly || line,
          short_description: '',
          full_description: '',
          tech_stack: detectedStack,
          features: [],
          link: ''
        };
      } else if (currentProject) {
        const cleanBullet = line.replace(/^[•\-\*]\s*/, '').trim();
        if (cleanBullet) {
          currentProject.features.push(cleanBullet);
          currentProject.full_description += (currentProject.full_description ? ' ' : '') + cleanBullet;
          if (!currentProject.short_description) {
            currentProject.short_description = cleanBullet;
          }
        }
      }
    } else if (currentSection === 'experience') {
      if (!line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*') && line.length < 90 && line.length > 3) {
        if (currentExp) result.experience.push(currentExp);
        const parts = line.split(/[|–—-]/).map(p => p.trim());
        const role = parts[0] || line;
        const org = parts[1] || '';
        const isIntern = role.toLowerCase().includes('intern') || line.toLowerCase().includes('intern');

        currentExp = {
          role,
          organization: org,
          date_range: parts[2] || '',
          description: '',
          category: 'experience',
          is_internship: isIntern
        };
      } else if (currentExp) {
        const cleanBullet = line.replace(/^[•\-\*]\s*/, '').trim();
        if (cleanBullet) {
          currentExp.description += (currentExp.description ? '\n' : '') + cleanBullet;
        }
      }
    } else if (currentSection === 'education') {
      const isEduLine = line.toLowerCase().includes('university') || 
                        line.toLowerCase().includes('institute') || 
                        line.toLowerCase().includes('college') || 
                        line.toLowerCase().includes('bachelor') || 
                        line.toLowerCase().includes('b.tech') || 
                        line.toLowerCase().includes('m.tech') ||
                        line.toLowerCase().includes('b.s.') || 
                        line.toLowerCase().includes('m.s.');
      if (isEduLine) {
        result.education.push({
          institution: line,
          degree: '',
          field_of_study: '',
          date_range: '',
          description: ''
        });
      }
    } else if (currentSection === 'achievements') {
      const cleanBullet = line.replace(/^[•\-\*]\s*/, '').trim();
      if (cleanBullet.length > 5) {
        result.achievements.push({
          title: cleanBullet.split(':')[0] || cleanBullet,
          organization: '',
          date: '',
          description: cleanBullet
        });
      }
    } else if (currentSection === 'certifications') {
      const cleanCert = line.replace(/^[•\-\*]\s*/, '').trim();
      if (cleanCert.length > 3) {
        result.certifications.push(cleanCert);
      }
    } else if (currentSection === 'custom') {
      const cleanBullet = line.replace(/^[•\-\*]\s*/, '').trim();
      if (cleanBullet && currentCustomSection) {
        currentCustomSection.content.push(cleanBullet);
      }
    }
  }

  if (currentProject) result.projects.push(currentProject);
  if (currentExp) result.experience.push(currentExp);
  flushCustom();

  return result;
}

// Master Extraction Controller with Actionable Diagnostics (Sections 4, 6, 8, 9)
export async function extractResumeDataWithDiagnostics(
  resumeText: string,
  apiKey?: string
): Promise<ExtractionResult> {
  let envKey: string | undefined;
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any)?.env) {
      envKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
    }
  } catch {
    // Ignore in non-Vite environments
  }
  if (!envKey && typeof process !== 'undefined' && (process as any)?.env) {
    envKey = (process as any).env.VITE_GEMINI_API_KEY;
  }
  const activeKey = apiKey || envKey;
  const isAiConfigured = Boolean(activeKey && !activeKey.includes('your-') && activeKey.length > 10);

  const charCount = resumeText.length;
  const textPreview = resumeText.slice(0, 300) + (charCount > 300 ? '...' : '');

  // A. Attempt AI Extraction if key configured
  if (isAiConfigured) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18000); // 18s timeout

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: EXTRACTION_SYSTEM_PROMPT },
                  { text: `=== RESUME TEXT ===\n${resumeText}` }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1
            }
          })
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errMessage = 'AI extraction service is temporarily unavailable. Try again.';
        if (response.status === 400 || response.status === 401 || response.status === 403) {
          errMessage = 'Invalid or unauthorized Gemini API key. Please check your VITE_GEMINI_API_KEY configuration.';
        } else if (response.status === 429) {
          errMessage = 'Gemini API rate limit reached. Please wait a moment and try again.';
        }
        console.warn(`Gemini extraction failed (HTTP ${response.status}):`, errMessage);

        // Fall back to deterministic engine so the user is never blocked
        const fallbackData = extractWithDeterministicEngine(resumeText);
        const totalItems = fallbackData.skills.length + fallbackData.projects.length + fallbackData.experience.length;

        return {
          data: fallbackData,
          diagnostics: {
            pdfUploaded: true,
            pdfTextExtracted: true,
            charactersExtracted: charCount,
            aiConfigured: true,
            aiRequestStatus: 'fallback',
            aiErrorMessage: errMessage,
            structuredResponseValid: true,
            itemsExtractedCount: totalItems,
            rawTextPreview: textPreview
          }
        };
      }

      const jsonResponse = await response.json();
      const candidateText = jsonResponse.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!candidateText) {
        throw new Error('AI returned an empty response.');
      }

      // Safe JSON Extraction (handle code fences if any)
      const cleanJson = candidateText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/```\s*$/, '')
        .trim();

      const parsed = JSON.parse(cleanJson);
      const validatedData = validateAndNormalizeExtractedData(parsed);
      const totalItems = validatedData.skills.length + validatedData.projects.length + validatedData.experience.length;

      return {
        data: validatedData,
        diagnostics: {
          pdfUploaded: true,
          pdfTextExtracted: true,
          charactersExtracted: charCount,
          aiConfigured: true,
          aiRequestStatus: 'success',
          structuredResponseValid: true,
          itemsExtractedCount: totalItems,
          rawTextPreview: textPreview
        }
      };
    } catch (err: any) {
      console.warn('AI Extraction exception:', err);
      const errName = err?.name === 'AbortError' ? 'AI request timed out after 18s.' : (err?.message || 'AI request failed');

      // Fall back to deterministic engine
      const fallbackData = extractWithDeterministicEngine(resumeText);
      const totalItems = fallbackData.skills.length + fallbackData.projects.length + fallbackData.experience.length;

      return {
        data: fallbackData,
        diagnostics: {
          pdfUploaded: true,
          pdfTextExtracted: true,
          charactersExtracted: charCount,
          aiConfigured: true,
          aiRequestStatus: 'fallback',
          aiErrorMessage: errName,
          structuredResponseValid: true,
          itemsExtractedCount: totalItems,
          rawTextPreview: textPreview
        }
      };
    }
  }

  // B. Deterministic Engine (when Gemini API is not configured)
  const deterministicData = extractWithDeterministicEngine(resumeText);
  const totalItems = deterministicData.skills.length + deterministicData.projects.length + deterministicData.experience.length;

  return {
    data: deterministicData,
    diagnostics: {
      pdfUploaded: true,
      pdfTextExtracted: true,
      charactersExtracted: charCount,
      aiConfigured: false,
      aiRequestStatus: 'not-configured',
      aiErrorMessage: 'AI extraction API key not configured (VITE_GEMINI_API_KEY missing). Using deterministic zero-hallucination engine.',
      structuredResponseValid: true,
      itemsExtractedCount: totalItems,
      rawTextPreview: textPreview
    }
  };
}

// Backward-compatible wrapper
export async function extractResumeData(
  resumeText: string,
  apiKey?: string
): Promise<ExtractedResumeData> {
  const result = await extractResumeDataWithDiagnostics(resumeText, apiKey);
  return result.data;
}
