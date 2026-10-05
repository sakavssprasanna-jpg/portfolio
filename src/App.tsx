import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UniverseProvider } from './context/UniverseContext';
import { OpeningScreen } from './pages/OpeningScreen';
import { UniversePage } from './pages/UniversePage';
import { MissionControlPage } from './pages/MissionControlPage';
import { LoginModal } from './components/auth/LoginModal';

type AppView = 'landing' | 'universe' | 'mission_control';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>(() => {
    // Check URL pathname, hash or query for direct navigation
    const hash = window.location.hash.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    if (hash.includes('mission-control') || hash.includes('admin') || path.includes('/admin')) {
      return 'mission_control';
    }
    if (hash.includes('universe')) {
      return 'universe';
    }
    return 'landing';
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Sync hash changes with currentView
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash.includes('mission-control') || hash.includes('admin') || path.includes('/admin')) {
        setCurrentView('mission_control');
      } else if (hash.includes('universe')) {
        setCurrentView('universe');
      } else if (!hash || hash === '#' || hash === '#home') {
        // Keep current view or landing
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when view changes
  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    if (view === 'universe') {
      window.location.hash = 'universe';
    } else if (view === 'mission_control') {
      window.location.hash = 'mission-control';
    } else {
      window.location.hash = '';
    }
  };

  // Enforce security: Mission Control is ONLY accessible to authenticated owner
  if (currentView === 'mission_control') {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-space-950 flex items-center justify-center text-cyan-400 font-mono text-sm">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            <span>Verifying Commander Access Session...</span>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // If not authenticated, open login modal and show universe or landing
      return (
        <>
          <UniversePage
            onGoToMissionControl={() => setIsLoginModalOpen(true)}
            onGoToLanding={() => navigateTo('landing')}
          />
          <LoginModal
            isOpen={true}
            onClose={() => navigateTo('universe')}
            onSuccess={() => navigateTo('mission_control')}
          />
        </>
      );
    }

    return (
      <MissionControlPage
        onExitToUniverse={() => navigateTo('universe')}
      />
    );
  }

  if (currentView === 'universe') {
    return (
      <>
        <UniversePage
          onGoToMissionControl={() => {
            if (isAuthenticated) {
              navigateTo('mission_control');
            } else {
              setIsLoginModalOpen(true);
            }
          }}
          onGoToLanding={() => navigateTo('landing')}
        />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={() => {
            setIsLoginModalOpen(false);
            navigateTo('mission_control');
          }}
        />
      </>
    );
  }

  // Default: Landing Opening Experience
  return (
    <>
      <OpeningScreen
        onEnterUniverse={() => navigateTo('universe')}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setIsLoginModalOpen(false);
          navigateTo('mission_control');
        }}
      />
    </>
  );
};

export function App() {
  return (
    <AuthProvider>
      <UniverseProvider>
        <AppContent />
      </UniverseProvider>
    </AuthProvider>
  );
}

export default App;
