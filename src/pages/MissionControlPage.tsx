import React, { useState } from 'react';
import { MissionControlLayout, AdminTab } from '../components/admin/MissionControlLayout';
import { DashboardOverview } from '../components/admin/DashboardOverview';
import { ResumeIntelligence } from '../components/admin/ResumeIntelligence';
import { ResumeControl } from '../components/admin/ResumeControl';
import { ProjectControl } from '../components/admin/ProjectControl';
import { WorldControl } from '../components/admin/WorldControl';
import { SkillControl } from '../components/admin/SkillControl';
import { JourneyControl } from '../components/admin/JourneyControl';
import { AchievementControl } from '../components/admin/AchievementControl';
import { ProfileControl } from '../components/admin/ProfileControl';
import { MediaLibrary } from '../components/admin/MediaLibrary';
import { SettingsControl } from '../components/admin/SettingsControl';

interface MissionControlPageProps {
  onExitToUniverse: () => void;
}

export const MissionControlPage: React.FC<MissionControlPageProps> = ({ onExitToUniverse }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  return (
    <MissionControlLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onExitToUniverse={onExitToUniverse}
    >
      {activeTab === 'dashboard' && <DashboardOverview onNavigateTab={setActiveTab} />}
      {activeTab === 'intelligence' && <ResumeIntelligence />}
      {activeTab === 'resumes' && <ResumeControl />}
      {activeTab === 'projects' && <ProjectControl />}
      {activeTab === 'worlds' && <WorldControl />}
      {activeTab === 'skills' && <SkillControl />}
      {activeTab === 'journey' && <JourneyControl />}
      {activeTab === 'achievements' && <AchievementControl />}
      {activeTab === 'profile' && <ProfileControl />}
      {activeTab === 'media' && <MediaLibrary />}
      {activeTab === 'settings' && <SettingsControl />}
    </MissionControlLayout>
  );
};
