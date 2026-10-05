import { 
  ExtractedResumeData, 
  ResumeChangeReport, 
  ProposedChangeItem,
  ChangeResolution,
  ItemChangeStatus,
  ResumeItemGroup
} from '../types/resume';
import { Project, Skill, JourneyEntry, Achievement, Profile, World, ResumeCustomSection } from '../types/database';

// Compute word token similarity between two strings (0.0 to 1.0)
export function stringSimilarity(str1: string, str2: string): number {
  const s1 = (str1 || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const s2 = (str2 || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  // Exact substring match check
  if (s1.includes(s2) || s2.includes(s1)) {
    const ratio = Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length);
    if (ratio > 0.6) return 0.85;
  }

  const words1 = new Set(s1.split(/\s+/).filter(Boolean));
  const words2 = new Set(s2.split(/\s+/).filter(Boolean));
  if (words1.size === 0 || words2.size === 0) return 0.0;

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  return intersection.size / union.size;
}

export function generateResumeChangeReport(
  extractedInput: ExtractedResumeData,
  existingDataInput: {
    profile?: Profile;
    worlds?: World[];
    projects?: Project[];
    skills?: Skill[];
    journey?: JourneyEntry[];
    achievements?: Achievement[];
    customSections?: ResumeCustomSection[];
  },
  resumeVersionName: string
): ResumeChangeReport {
  // Defensive normalization to prevent any undefined crashes
  const extracted: ExtractedResumeData = {
    full_name: extractedInput?.full_name || '',
    headline: extractedInput?.headline || '',
    summary: extractedInput?.summary || '',
    email: extractedInput?.email || '',
    location: extractedInput?.location || '',
    links: {
      github: extractedInput?.links?.github || '',
      linkedin: extractedInput?.links?.linkedin || '',
      website: extractedInput?.links?.website || ''
    },
    skills: Array.isArray(extractedInput?.skills) ? extractedInput.skills : [],
    projects: Array.isArray(extractedInput?.projects) ? extractedInput.projects : [],
    experience: Array.isArray(extractedInput?.experience) ? extractedInput.experience : [],
    education: Array.isArray(extractedInput?.education) ? extractedInput.education : [],
    achievements: Array.isArray(extractedInput?.achievements) ? extractedInput.achievements : [],
    certifications: Array.isArray(extractedInput?.certifications) ? extractedInput.certifications : [],
    custom_sections: Array.isArray(extractedInput?.custom_sections) ? extractedInput.custom_sections : []
  };

  const existingData = {
    profile: existingDataInput?.profile || {
      id: 'veera-core-profile',
      full_name: 'VEERA SATYA SAI PRASANNA',
      headline: 'AI/ML • GenAI • Intelligent Systems',
      bio: '',
      email: '',
      location: '',
      avatar_url: '',
      github_url: '',
      linkedin_url: '',
      twitter_url: '',
      website_url: ''
    },
    worlds: Array.isArray(existingDataInput?.worlds) ? existingDataInput.worlds : [],
    projects: Array.isArray(existingDataInput?.projects) ? existingDataInput.projects : [],
    skills: Array.isArray(existingDataInput?.skills) ? existingDataInput.skills : [],
    journey: Array.isArray(existingDataInput?.journey) ? existingDataInput.journey : [],
    achievements: Array.isArray(existingDataInput?.achievements) ? existingDataInput.achievements : [],
    customSections: Array.isArray(existingDataInput?.customSections) ? existingDataInput.customSections : []
  };

  const items: ProposedChangeItem[] = [];

  // ==========================================
  // 1. PROFILE
  // ==========================================
  const incomingProfile = {
    full_name: extracted.full_name || existingData.profile.full_name,
    headline: extracted.headline || existingData.profile.headline,
    bio: extracted.summary || existingData.profile.bio,
    email: extracted.email || existingData.profile.email,
    location: extracted.location || existingData.profile.location || ''
  };

  const profileDiffers = 
    (extracted.full_name && extracted.full_name !== existingData.profile.full_name) ||
    (extracted.headline && extracted.headline !== existingData.profile.headline) ||
    (extracted.summary && extracted.summary !== existingData.profile.bio) ||
    (extracted.email && extracted.email !== existingData.profile.email) ||
    (extracted.location && extracted.location !== existingData.profile.location);

  const profileStatus: ItemChangeStatus = profileDiffers ? 'UPDATED' : 'UNCHANGED';

  items.push({
    id: `profile_sync_${Date.now()}`,
    group: 'PROFILE',
    entityType: 'profile',
    status: profileStatus,
    action: profileDiffers ? 'update' : 'noop',
    title: 'Core Identity & Professional Bio',
    incomingData: incomingProfile,
    existingData: {
      full_name: existingData.profile.full_name,
      headline: existingData.profile.headline,
      bio: existingData.profile.bio,
      email: existingData.profile.email,
      location: existingData.profile.location || ''
    },
    isDuplicate: true,
    resolution: 'MERGE',
    isApproved: Boolean(profileDiffers)
  });

  // ==========================================
  // 2. LINKS
  // ==========================================
  const incomingLinks = {
    github_url: extracted.links.github || existingData.profile.github_url || '',
    linkedin_url: extracted.links.linkedin || existingData.profile.linkedin_url || '',
    website_url: extracted.links.website || existingData.profile.website_url || ''
  };

  const linksDiffer = Boolean(
    (extracted.links.github && extracted.links.github !== existingData.profile.github_url) ||
    (extracted.links.linkedin && extracted.links.linkedin !== existingData.profile.linkedin_url) ||
    (extracted.links.website && extracted.links.website !== existingData.profile.website_url)
  );

  const hasAnyLinks = Boolean(extracted.links.github || extracted.links.linkedin || extracted.links.website);
  if (hasAnyLinks || linksDiffer) {
    items.push({
      id: `links_sync_${Date.now()}`,
      group: 'LINKS',
      entityType: 'link',
      status: linksDiffer ? 'UPDATED' : 'UNCHANGED',
      action: linksDiffer ? 'update' : 'noop',
      title: 'Digital Beacon Channels & URLs',
      incomingData: incomingLinks,
      existingData: {
        github_url: existingData.profile.github_url || '',
        linkedin_url: existingData.profile.linkedin_url || '',
        website_url: existingData.profile.website_url || ''
      },
      isDuplicate: true,
      resolution: 'MERGE',
      isApproved: Boolean(linksDiffer)
    });
  }

  // ==========================================
  // 3. PROJECTS (with Rule 14 Preservation)
  // ==========================================
  const defaultWorldId = existingData.worlds[0]?.id || 'world-1';

  for (const extProj of extracted.projects) {
    let bestMatch: Project | null = null;
    let highestSim = 0;

    for (const curProj of existingData.projects) {
      const sim = stringSimilarity(extProj.title, curProj.title);
      if (sim > highestSim && sim >= 0.40) {
        highestSim = sim;
        bestMatch = curProj;
      }
    }

    let status: ItemChangeStatus = 'NEW';
    let isDuplicate = false;
    let action: 'insert' | 'update' | 'noop' = 'insert';
    let resolution: ChangeResolution = 'REPLACE';

    if (bestMatch) {
      if (highestSim >= 0.82) {
        // High similarity match: determine if description or tech changed
        const descMatch = (extProj.short_description || '') === (bestMatch.short_description || '');
        const techMatch = JSON.stringify((extProj.tech_stack || []).sort()) === JSON.stringify((bestMatch.tech_stack || []).sort());
        if (descMatch && techMatch) {
          status = 'UNCHANGED';
          action = 'noop';
        } else {
          status = 'UPDATED';
          action = 'update';
        }
        isDuplicate = true;
        resolution = 'MERGE';
      } else {
        // 0.40 <= highestSim < 0.82
        status = 'POSSIBLE DUPLICATE';
        isDuplicate = true;
        action = 'update';
        resolution = 'REVIEW_MANUALLY';
      }
    }

    const incomingProject: Partial<Project> = {
      title: extProj.title,
      slug: extProj.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      short_description: extProj.short_description || '',
      full_description: extProj.full_description || extProj.short_description || '',
      tech_stack: extProj.tech_stack || [],
      features: extProj.features || [],
      github_url: extProj.link?.includes('github') ? extProj.link : (bestMatch?.github_url || ''),
      live_url: extProj.link && !extProj.link.includes('github') ? extProj.link : (bestMatch?.live_url || ''),
      world_id: bestMatch?.world_id || defaultWorldId,
      status: bestMatch?.status || 'completed',
      is_featured: bestMatch?.is_featured ?? false,
      display_order: bestMatch?.display_order || existingData.projects.length + items.filter(i => i.group === 'PROJECTS').length + 1
    };

    items.push({
      id: `change_proj_${Math.random().toString(36).substring(2, 9)}`,
      group: 'PROJECTS',
      entityType: 'project',
      status,
      action,
      title: extProj.title,
      incomingData: incomingProject,
      existingData: bestMatch || undefined,
      isDuplicate,
      resolution,
      isApproved: status !== 'UNCHANGED' && status !== 'POSSIBLE DUPLICATE'
    });
  }

  // ==========================================
  // 4. SKILLS
  // ==========================================
  for (const extSkill of extracted.skills) {
    const existingSkill = existingData.skills.find(
      s => s.name.toLowerCase().trim() === extSkill.name.toLowerCase().trim()
    );

    let status: ItemChangeStatus = 'NEW';
    let isDuplicate = false;
    let action: 'insert' | 'update' | 'noop' = 'insert';
    let resolution: ChangeResolution = 'REPLACE';

    if (existingSkill) {
      isDuplicate = true;
      const catMatch = (existingSkill.category || '').toLowerCase() === (extSkill.category || '').toLowerCase();
      if (catMatch) {
        status = 'UNCHANGED';
        action = 'noop';
        resolution = 'KEEP_EXISTING';
      } else {
        status = 'UPDATED';
        action = 'update';
        resolution = 'MERGE';
      }
    } else {
      // Check partial match
      const partialMatch = existingData.skills.find(
        s => stringSimilarity(s.name, extSkill.name) >= 0.70
      );
      if (partialMatch) {
        status = 'POSSIBLE DUPLICATE';
        isDuplicate = true;
        action = 'update';
        resolution = 'REVIEW_MANUALLY';
      }
    }

    const incomingSkill: Skill = {
      id: existingSkill?.id || `skill_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: extSkill.name,
      category: extSkill.category || 'AI / ML',
      proficiency: existingSkill?.proficiency ?? null, // Preserve manual rating
      related_skills: existingSkill?.related_skills || [],
      display_order: existingSkill?.display_order || existingData.skills.length + items.filter(i => i.group === 'SKILLS').length + 1
    };

    items.push({
      id: `change_skill_${Math.random().toString(36).substring(2, 9)}`,
      group: 'SKILLS',
      entityType: 'skill',
      status,
      action,
      title: extSkill.name,
      incomingData: incomingSkill,
      existingData: existingSkill || undefined,
      isDuplicate,
      resolution,
      isApproved: status === 'NEW'
    });
  }

  // ==========================================
  // 5. EXPERIENCE & INTERNSHIPS
  // ==========================================
  for (const extExp of extracted.experience) {
    const isInternship = Boolean(
      extExp.is_internship ||
      extExp.role.toLowerCase().includes('intern') ||
      extExp.description.toLowerCase().includes('intern')
    );
    const targetGroup: ResumeItemGroup = isInternship ? 'INTERNSHIPS' : 'EXPERIENCE';

    let bestMatch: JourneyEntry | null = null;
    let highestSim = 0;

    for (const curJourney of existingData.journey) {
      if (curJourney.category === 'education') continue;
      const titleSim = stringSimilarity(curJourney.title, extExp.role);
      const orgSim = stringSimilarity(curJourney.organization, extExp.organization);
      const combinedSim = (titleSim * 0.6) + (orgSim * 0.4);

      if (combinedSim > highestSim && combinedSim >= 0.45) {
        highestSim = combinedSim;
        bestMatch = curJourney;
      }
    }

    let status: ItemChangeStatus = 'NEW';
    let isDuplicate = false;
    let action: 'insert' | 'update' | 'noop' = 'insert';
    let resolution: ChangeResolution = 'REPLACE';

    if (bestMatch) {
      isDuplicate = true;
      if (highestSim >= 0.80) {
        const descEqual = (bestMatch.description || '').trim() === (extExp.description || '').trim();
        const datesEqual = (bestMatch.date_range || '').trim() === (extExp.date_range || '').trim();
        if (descEqual && datesEqual) {
          status = 'UNCHANGED';
          action = 'noop';
        } else {
          status = 'UPDATED';
          action = 'update';
        }
        resolution = 'MERGE';
      } else {
        status = 'POSSIBLE DUPLICATE';
        action = 'update';
        resolution = 'REVIEW_MANUALLY';
      }
    }

    const incomingEntry: JourneyEntry = {
      id: bestMatch?.id || `journey_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: extExp.role,
      organization: extExp.organization || 'Organization',
      date_range: extExp.date_range || '',
      description: extExp.description || '',
      category: isInternship ? 'experience' : (extExp.category || 'experience'),
      image_url: bestMatch?.image_url || '',
      external_url: bestMatch?.external_url || '',
      display_order: bestMatch?.display_order || existingData.journey.length + items.filter(i => i.group === 'EXPERIENCE' || i.group === 'INTERNSHIPS').length + 1
    };

    items.push({
      id: `change_journey_${Math.random().toString(36).substring(2, 9)}`,
      group: targetGroup,
      entityType: 'journey',
      status,
      action,
      title: `${extExp.role} @ ${extExp.organization || 'Organization'}`,
      incomingData: incomingEntry,
      existingData: bestMatch || undefined,
      isDuplicate,
      resolution,
      isApproved: status !== 'UNCHANGED' && status !== 'POSSIBLE DUPLICATE'
    });
  }

  // ==========================================
  // 6. EDUCATION
  // ==========================================
  for (const extEdu of extracted.education) {
    let bestMatch: JourneyEntry | null = null;
    let highestSim = 0;

    for (const curJourney of existingData.journey) {
      if (curJourney.category !== 'education') continue;
      const degSim = stringSimilarity(curJourney.title, extEdu.degree || '');
      const instSim = stringSimilarity(curJourney.organization, extEdu.institution);
      const combinedSim = (degSim * 0.5) + (instSim * 0.5);

      if (combinedSim > highestSim && combinedSim >= 0.40) {
        highestSim = combinedSim;
        bestMatch = curJourney;
      }
    }

    let status: ItemChangeStatus = 'NEW';
    let isDuplicate = false;
    let action: 'insert' | 'update' | 'noop' = 'insert';
    let resolution: ChangeResolution = 'REPLACE';

    if (bestMatch) {
      isDuplicate = true;
      if (highestSim >= 0.75) {
        const descEqual = (bestMatch.description || '').trim() === (extEdu.description || '').trim();
        status = descEqual ? 'UNCHANGED' : 'UPDATED';
        action = descEqual ? 'noop' : 'update';
        resolution = 'MERGE';
      } else {
        status = 'POSSIBLE DUPLICATE';
        action = 'update';
        resolution = 'REVIEW_MANUALLY';
      }
    }

    const titleStr = extEdu.degree 
      ? (extEdu.field_of_study ? `${extEdu.degree} in ${extEdu.field_of_study}` : extEdu.degree)
      : (extEdu.field_of_study || 'Education');

    const incomingEdu: JourneyEntry = {
      id: bestMatch?.id || `edu_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: titleStr,
      organization: extEdu.institution,
      date_range: extEdu.date_range || '',
      description: extEdu.description || '',
      category: 'education',
      image_url: bestMatch?.image_url || '',
      external_url: bestMatch?.external_url || '',
      display_order: bestMatch?.display_order || existingData.journey.length + items.filter(i => i.group === 'EDUCATION').length + 1
    };

    items.push({
      id: `change_edu_${Math.random().toString(36).substring(2, 9)}`,
      group: 'EDUCATION',
      entityType: 'journey',
      status,
      action,
      title: `${titleStr} - ${extEdu.institution}`,
      incomingData: incomingEdu,
      existingData: bestMatch || undefined,
      isDuplicate,
      resolution,
      isApproved: status !== 'UNCHANGED' && status !== 'POSSIBLE DUPLICATE'
    });
  }

  // ==========================================
  // 7. ACHIEVEMENTS
  // ==========================================
  for (const extAch of extracted.achievements) {
    let bestMatch: Achievement | null = null;
    let highestSim = 0;

    for (const curAch of existingData.achievements) {
      const sim = stringSimilarity(curAch.title, extAch.title);
      if (sim > highestSim && sim >= 0.50) {
        highestSim = sim;
        bestMatch = curAch;
      }
    }

    let status: ItemChangeStatus = 'NEW';
    let isDuplicate = false;
    let action: 'insert' | 'update' | 'noop' = 'insert';
    let resolution: ChangeResolution = 'REPLACE';

    if (bestMatch) {
      isDuplicate = true;
      if (highestSim >= 0.80) {
        status = 'UNCHANGED';
        action = 'noop';
        resolution = 'KEEP_EXISTING';
      } else {
        status = 'POSSIBLE DUPLICATE';
        action = 'update';
        resolution = 'REVIEW_MANUALLY';
      }
    }

    const incomingAch: Achievement = {
      id: bestMatch?.id || `ach_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: extAch.title,
      organization: extAch.organization || '',
      date: extAch.date || '',
      description: extAch.description || '',
      certificate_url: bestMatch?.certificate_url || '',
      external_url: bestMatch?.external_url || '',
      image_url: bestMatch?.image_url || '',
      display_order: bestMatch?.display_order || existingData.achievements.length + items.filter(i => i.group === 'ACHIEVEMENTS').length + 1
    };

    items.push({
      id: `change_ach_${Math.random().toString(36).substring(2, 9)}`,
      group: 'ACHIEVEMENTS',
      entityType: 'achievement',
      status,
      action,
      title: extAch.title,
      incomingData: incomingAch,
      existingData: bestMatch || undefined,
      isDuplicate,
      resolution,
      isApproved: status === 'NEW'
    });
  }

  // ==========================================
  // 8. CERTIFICATIONS
  // ==========================================
  for (const certName of extracted.certifications) {
    const existingAch = existingData.achievements.find(
      a => stringSimilarity(a.title, certName) >= 0.65
    );

    let status: ItemChangeStatus = 'NEW';
    let isDuplicate = false;
    let action: 'insert' | 'update' | 'noop' = 'insert';
    let resolution: ChangeResolution = 'REPLACE';

    if (existingAch) {
      isDuplicate = true;
      status = 'UNCHANGED';
      action = 'noop';
      resolution = 'KEEP_EXISTING';
    }

    const incomingCert: Achievement = {
      id: existingAch?.id || `cert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: certName,
      organization: 'Verified Certification',
      date: '',
      description: `Professional certification verified from resume dossier.`,
      certificate_url: existingAch?.certificate_url || '',
      external_url: existingAch?.external_url || '',
      image_url: existingAch?.image_url || '',
      display_order: existingAch?.display_order || existingData.achievements.length + items.filter(i => i.group === 'CERTIFICATIONS').length + 1
    };

    items.push({
      id: `change_cert_${Math.random().toString(36).substring(2, 9)}`,
      group: 'CERTIFICATIONS',
      entityType: 'certification',
      status,
      action,
      title: certName,
      incomingData: incomingCert,
      existingData: existingAch || undefined,
      isDuplicate,
      resolution,
      isApproved: status === 'NEW'
    });
  }

  // ==========================================
  // 9. DYNAMIC / CUSTOM RESUME SECTIONS
  // ==========================================
  for (const extSec of extracted.custom_sections || []) {
    let bestMatch: ResumeCustomSection | null = null;
    let highestSim = 0;

    for (const curSec of existingData.customSections) {
      if (curSec.slug && extSec.slug && curSec.slug === extSec.slug) {
        bestMatch = curSec;
        highestSim = 1.0;
        break;
      }
      const sim = stringSimilarity(curSec.title, extSec.title);
      if (sim > highestSim && sim >= 0.45) {
        highestSim = sim;
        bestMatch = curSec;
      }
    }

    let status: ItemChangeStatus = 'NEW';
    let isDuplicate = false;
    let action: 'insert' | 'update' | 'noop' = 'insert';
    let resolution: ChangeResolution = 'REPLACE';

    if (bestMatch) {
      isDuplicate = true;
      if (highestSim >= 0.75) {
        const curContentStr = Array.isArray(bestMatch.content) ? bestMatch.content.join('\n') : (typeof bestMatch.content === 'object' && bestMatch.content !== null ? JSON.stringify(bestMatch.content) : String(bestMatch.content || ''));
        const incContentStr = Array.isArray(extSec.content) ? extSec.content.join('\n') : (typeof extSec.content === 'object' && extSec.content !== null ? JSON.stringify(extSec.content) : String(extSec.content || ''));
        const contentMatch = curContentStr.trim() === incContentStr.trim();
        status = contentMatch ? 'UNCHANGED' : 'UPDATED';
        action = contentMatch ? 'noop' : 'update';
        resolution = contentMatch ? 'KEEP_EXISTING' : 'MERGE';
      } else {
        status = 'POSSIBLE DUPLICATE';
        action = 'update';
        resolution = 'REVIEW_MANUALLY';
      }
    }

    const generatedSlug = extSec.slug || extSec.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const incomingSec: ResumeCustomSection = {
      id: bestMatch?.id || `sec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: extSec.title,
      slug: generatedSlug,
      content: extSec.content,
      display_order: bestMatch?.display_order ?? (existingData.customSections.length + items.filter(i => i.group === 'CUSTOM_SECTIONS').length + 1),
      visible: bestMatch?.visible ?? true,
      source: 'extracted',
      created_at: bestMatch?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    items.push({
      id: `change_csec_${Math.random().toString(36).substring(2, 9)}`,
      group: 'CUSTOM_SECTIONS',
      entityType: 'custom_section',
      status,
      action,
      title: extSec.title,
      incomingData: incomingSec,
      existingData: bestMatch || undefined,
      isDuplicate,
      resolution,
      isApproved: status === 'NEW' || status === 'UPDATED'
    });
  }

  const newCount = items.filter(i => i.status === 'NEW').length;
  const updatedCount = items.filter(i => i.status === 'UPDATED').length;
  const duplicateCount = items.filter(i => i.status === 'POSSIBLE DUPLICATE').length;
  const unchangedCount = items.filter(i => i.status === 'UNCHANGED').length;

  return {
    resumeVersionName,
    totalChanges: items.length,
    newItemsCount: newCount,
    updatedItemsCount: updatedCount,
    duplicateItemsCount: duplicateCount,
    unchangedItemsCount: unchangedCount,
    items
  };
}

// Apply changes with strict manual data preservation (Rule 14)
export function mergeProjectWithPreservation(existing: Project, incoming: Partial<Project>): Project {
  return {
    ...existing,
    ...incoming,
    // Preserve critical manual inputs if incoming is empty/missing
    github_url: incoming.github_url || existing.github_url,
    live_url: incoming.live_url || existing.live_url,
    demo_video_url: incoming.demo_video_url || existing.demo_video_url,
    documentation_url: incoming.documentation_url || existing.documentation_url,
    architecture_diagram: incoming.architecture_diagram || existing.architecture_diagram,
    screenshots: (incoming.screenshots && incoming.screenshots.length > 0) ? incoming.screenshots : existing.screenshots,
    my_contribution: incoming.my_contribution || existing.my_contribution,
    challenges: incoming.challenges || existing.challenges,
    solutions_developed: incoming.solutions_developed || existing.solutions_developed,
    learnings: incoming.learnings || existing.learnings,
    world_id: incoming.world_id || existing.world_id,
    is_featured: existing.is_featured,
    status: existing.status || incoming.status || 'completed',
    tech_stack: Array.from(new Set([...(existing.tech_stack || []), ...(incoming.tech_stack || [])]))
  };
}

export function mergeCustomSectionWithPreservation(
  existing: ResumeCustomSection,
  incoming: Partial<ResumeCustomSection>
): ResumeCustomSection {
  let mergedContent: ResumeCustomSection['content'] = incoming.content !== undefined ? incoming.content : existing.content;
  if (Array.isArray(existing.content) && Array.isArray(incoming.content)) {
    mergedContent = Array.from(new Set([...existing.content, ...incoming.content]));
  }
  return {
    ...existing,
    ...incoming,
    title: incoming.title || existing.title,
    slug: incoming.slug || existing.slug,
    content: mergedContent,
    visible: incoming.visible !== undefined ? incoming.visible : existing.visible,
    display_order: incoming.display_order !== undefined ? incoming.display_order : existing.display_order,
    updated_at: new Date().toISOString()
  };
}
