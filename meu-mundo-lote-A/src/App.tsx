import { useState, useEffect, useCallback } from 'react';
import {
  TabType,
  FamilyProfile,
  RoutineActivity,
  CommunicationCard,
  ObservationEntry,
  DailyStep,
} from './types';
import {
  initialFamilyProfile,
  initialActivities,
  initialCommunicationCards,
  initialObservations,
  initialDailySteps,
  initialSupportArticles,
  initialEducationalArticles,
} from './data/initialData';
import { TopHeader, BottomNav } from './components/Navigation';
import { HomeTab } from './components/HomeTab';
import { RoutineTab } from './components/RoutineTab';
import { CommunicationTab } from './components/CommunicationTab';
import { SupportTab } from './components/SupportTab';
import { ProfileTab } from './components/ProfileTab';
import { OnboardingModal } from './components/OnboardingModal';
import { WelcomeTourModal } from './components/WelcomeTourModal';
import { DiaryModal } from './components/DiaryModal';
import { PortalCinematicExperience } from './components/PortalCinematicExperience';
import { CosmicAmbientAtmosphere } from './components/CosmicAmbientAtmosphere';
import { FloatingVerse } from './components/FloatingVerse';
import { VoiceConversationModal } from './components/VoiceConversationModal';
import {
  signInWithGoogle,
  signOutUser,
  subscribeToAuth,
  saveProfileToFirestore,
  loadProfileFromFirestore,
  saveActivityToFirestore,
  deleteActivityFromFirestore,
  loadActivitiesFromFirestore,
  saveCardToFirestore,
  deleteCardFromFirestore,
  loadCardsFromFirestore,
  saveObservationToFirestore,
  deleteObservationFromFirestore,
  loadObservationsFromFirestore,
} from './lib/firebase';
import { User } from 'firebase/auth';
import { safeSetItem } from './utils/storage';

export default function App() {
  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // 1. Profile State with LocalStorage
  const [profile, setProfile] = useState<FamilyProfile>(() => {
    const saved = localStorage.getItem('meu_mundo_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao ler perfil salvo:', e);
      }
    }
    return initialFamilyProfile;
  });

  // 2. Activities State
  const [activities, setActivities] = useState<RoutineActivity[]>(() => {
    const saved = localStorage.getItem('meu_mundo_activities');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao ler atividades:', e);
      }
    }
    return initialActivities;
  });

  // 3. Communication Cards State
  const [cards, setCards] = useState<CommunicationCard[]>(() => {
    const saved = localStorage.getItem('meu_mundo_cards');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao ler cartões:', e);
      }
    }
    return initialCommunicationCards;
  });

  // 4. Observation Diary State
  const [observations, setObservations] = useState<ObservationEntry[]>(() => {
    const saved = localStorage.getItem('meu_mundo_observations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Remove as anotações de exemplo antigas (obs-1 a obs-6); anotações reais nunca são alteradas
          return parsed.filter((item: any) => !/^obs-[1-6]$/.test(String(item?.id)));
        }
      } catch (e) {
        console.error('Erro ao ler observações:', e);
      }
    }
    return initialObservations;
  });

  // 5. Daily Steps
  const [dailySteps, setDailySteps] = useState<DailyStep[]>(() => {
    const saved = localStorage.getItem('meu_mundo_steps');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao ler passos diários:', e);
      }
    }
    return initialDailySteps;
  });

  // Navigation & Modals State
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [showTourModal, setShowTourModal] = useState(false);
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [showPortal, setShowPortal] = useState(true);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  // Sync to local storage
  useEffect(() => {
    safeSetItem('meu_mundo_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    safeSetItem('meu_mundo_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    safeSetItem('meu_mundo_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    safeSetItem('meu_mundo_observations', JSON.stringify(observations));
  }, [observations]);

  useEffect(() => {
    safeSetItem('meu_mundo_steps', JSON.stringify(dailySteps));
  }, [dailySteps]);

  // Subscribe to Firebase Auth and initial Firestore synchronization
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsSyncing(true);
        try {
          // 1. Profile
          const remoteProfile = await loadProfileFromFirestore(user.uid);
          if (remoteProfile) {
            setProfile((prev) => ({ ...prev, ...remoteProfile }));
          } else {
            await saveProfileToFirestore(user.uid, profile, user.email || undefined);
          }

          // 2. Activities
          const remoteActivities = await loadActivitiesFromFirestore(user.uid);
          if (remoteActivities.length > 0) {
            setActivities(remoteActivities);
          } else {
            for (const act of activities) {
              await saveActivityToFirestore(user.uid, act);
            }
          }

          // 3. Cards
          const remoteCards = await loadCardsFromFirestore(user.uid);
          if (remoteCards.length > 0) {
            setCards(remoteCards);
          } else {
            for (const card of cards) {
              await saveCardToFirestore(user.uid, card);
            }
          }

          // 4. Observations
          const remoteObservations = await loadObservationsFromFirestore(user.uid);
          if (remoteObservations.length > 0) {
            setObservations(remoteObservations);
          } else {
            for (const obs of observations) {
              await saveObservationToFirestore(user.uid, obs);
            }
          }
        } catch (err) {
          console.error('Erro ao sincronizar com Firestore:', err);
        } finally {
          setIsSyncing(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Update handlers with Firestore write-through
  const handleUpdateProfile = useCallback(
    (updated: FamilyProfile) => {
      setProfile(updated);
      if (currentUser) {
        saveProfileToFirestore(currentUser.uid, updated, currentUser.email || undefined);
      }
    },
    [currentUser]
  );

  const handleUpdateActivities = useCallback(
    (updatedActivities: RoutineActivity[]) => {
      if (currentUser) {
        const updatedIds = new Set(updatedActivities.map((a) => a.id));
        activities.forEach((act) => {
          if (!updatedIds.has(act.id)) {
            deleteActivityFromFirestore(currentUser.uid, act.id);
          }
        });
        for (const act of updatedActivities) {
          saveActivityToFirestore(currentUser.uid, act);
        }
      }
      setActivities(updatedActivities);
    },
    [currentUser, activities]
  );

  const handleUpdateCards = useCallback(
    (updatedCards: CommunicationCard[]) => {
      if (currentUser) {
        const updatedIds = new Set(updatedCards.map((c) => c.id));
        cards.forEach((card) => {
          if (!updatedIds.has(card.id)) {
            deleteCardFromFirestore(currentUser.uid, card.id);
          }
        });
        for (const card of updatedCards) {
          saveCardToFirestore(currentUser.uid, card);
        }
      }
      setCards(updatedCards);
    },
    [currentUser, cards]
  );

  const handleUpdateObservations = useCallback(
    (updatedObs: ObservationEntry[]) => {
      if (currentUser) {
        const updatedIds = new Set(updatedObs.map((o) => o.id));
        observations.forEach((obs) => {
          if (!updatedIds.has(obs.id)) {
            deleteObservationFromFirestore(currentUser.uid, obs.id);
          }
        });
        for (const obs of updatedObs) {
          saveObservationToFirestore(currentUser.uid, obs);
        }
      }
      setObservations(updatedObs);
    },
    [currentUser, observations]
  );

  const handleSignInGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Falha no login Google:', err);
      alert('Não foi possível concluir o login com Google no momento. Seus dados continuam salvos localmente no dispositivo.');
    }
  };

  const handleSignOutUser = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error('Falha ao desconectar:', err);
    }
  };

  const handleSyncNow = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    try {
      await saveProfileToFirestore(currentUser.uid, profile, currentUser.email || undefined);
      for (const act of activities) {
        await saveActivityToFirestore(currentUser.uid, act);
      }
      for (const card of cards) {
        await saveCardToFirestore(currentUser.uid, card);
      }
      for (const obs of observations) {
        await saveObservationToFirestore(currentUser.uid, obs);
      }
      alert('Dados sincronizados com sucesso no Firebase Firestore!');
    } catch (err) {
      console.error('Erro na sincronização manual:', err);
      alert('Erro ao sincronizar. Verifique a conexão com a internet.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleDailyStep = (id: string) => {
    setDailySteps((prev) =>
      prev.map((step) =>
        step.id === id ? { ...step, completed: !step.completed } : step
      )
    );
  };

  const handleResetData = () => {
    if (
      confirm(
        'Tem certeza de que deseja restaurar as configurações padrão? Todos os registros personalizados serão reiniciados.'
      )
    ) {
      localStorage.clear();
      setProfile(initialFamilyProfile);
      setActivities(initialActivities);
      setCards(initialCommunicationCards);
      setObservations(initialObservations);
      setDailySteps(initialDailySteps);
      setActiveTab('home');
    }
  };

  // Font size class wrapper
  const fontSizeClass =
    profile.fontSize === 'large'
      ? 'text-[17px]'
      : profile.fontSize === 'extralarge'
      ? 'text-[19px]'
      : 'text-sm';

  const contrastClass = profile.highContrast
    ? 'contrast-125 border-slate-900 bg-white text-slate-950'
    : 'text-slate-100 selection:bg-amber-400/30 selection:text-amber-100';

  const motionClass = profile.reducedMotion ? 'motion-reduce' : '';

  return (
    <div
      id="app-root-container"
      data-theme={profile.colorTheme || 'rainbow'}
      className={`min-h-screen ${contrastClass} ${fontSizeClass} ${motionClass} flex flex-col font-sans transition-colors relative`}
    >
      {/* Harmonious Cosmic Ambient Atmosphere & Soft Lighting */}
      <CosmicAmbientAtmosphere
        reducedMotion={profile.reducedMotion}
        highContrast={profile.highContrast}
        theme={profile.colorTheme}
      />

      {/* Top Header */}
      <TopHeader
        profile={profile}
        activeTab={activeTab}
        currentUser={currentUser}
        onSignIn={handleSignInGoogle}
        onSignOut={handleSignOutUser}
        onOpenTour={() => setShowTourModal(true)}
        onOpenPortal={() => setShowPortal(true)}
        onOpenVoice={() => setShowVoiceModal(true)}
        onToggleSound={() =>
          handleUpdateProfile({ ...profile, soundEnabled: !profile.soundEnabled })
        }
        onToggleContrast={() =>
          handleUpdateProfile({ ...profile, highContrast: !profile.highContrast })
        }
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 pb-32 sm:pb-36">
        {activeTab === 'home' && (
          <HomeTab
            profile={profile}
            activities={activities}
            dailySteps={dailySteps}
            onToggleStep={handleToggleDailyStep}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenDiary={() => setShowDiaryModal(true)}
            onOpenPortal={() => setShowPortal(true)}
          />
        )}

        {activeTab === 'routine' && (
          <RoutineTab
            profile={profile}
            activities={activities}
            onUpdateActivities={handleUpdateActivities}
          />
        )}

        {activeTab === 'communication' && (
          <CommunicationTab
            profile={profile}
            cards={cards}
            onUpdateCards={handleUpdateCards}
          />
        )}

        {activeTab === 'support' && (
          <SupportTab
            profile={profile}
            supportArticles={initialSupportArticles}
            educationalArticles={initialEducationalArticles}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onAddActivity={(act) => handleUpdateActivities([act, ...activities])}
            onAddCard={(card) => handleUpdateCards([card, ...cards])}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            profile={profile}
            activities={activities}
            cards={cards}
            observations={observations}
            currentUser={currentUser}
            isSyncing={isSyncing}
            onSignInWithGoogle={handleSignInGoogle}
            onSignOut={handleSignOutUser}
            onSyncNow={handleSyncNow}
            onUpdateProfile={handleUpdateProfile}
            onOpenTour={() => setShowTourModal(true)}
            onOpenDiary={() => setShowDiaryModal(true)}
            onResetData={handleResetData}
            onOpenPortal={() => setShowPortal(true)}
          />
        )}
      </main>

      {/* Floating Biblical Verses & Comfort Messages */}
      <FloatingVerse profile={profile} activeTab={activeTab} />

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* 3D Cinematic Portal Experience */}
      {showPortal && (
        <PortalCinematicExperience
          childName={profile.childName}
          onEnterApp={() => setShowPortal(false)}
        />
      )}

      {/* Welcome / Onboarding Modal on First Launch */}
      {!profile.onboardingCompleted && (
        <OnboardingModal
          profile={profile}
          onSave={handleUpdateProfile}
          onExploreTour={() => {
            handleUpdateProfile({ ...profile, onboardingCompleted: true });
            setShowTourModal(true);
          }}
        />
      )}

      {/* Welcome / App Tour Modal */}
      {showTourModal && (
        <WelcomeTourModal onClose={() => setShowTourModal(false)} />
      )}

      {/* Family Diary Modal */}
      {showDiaryModal && (
        <DiaryModal
          profile={profile}
          observations={observations}
          onClose={() => setShowDiaryModal(false)}
          onSaveObservations={handleUpdateObservations}
        />
      )}

      {/* Voice Conversation Modal with AI */}
      {showVoiceModal && (
        <VoiceConversationModal
          profile={profile}
          onClose={() => setShowVoiceModal(false)}
          onOpenBreathing={() => {
            setShowVoiceModal(false);
            setActiveTab('support');
          }}
          onAddActivity={(act) => {
            handleUpdateActivities([act, ...activities]);
          }}
          onAddCard={(card) => {
            handleUpdateCards([card, ...cards]);
          }}
          onNavigate={(tab) => {
            setShowVoiceModal(false);
            setActiveTab(tab);
          }}
        />
      )}
    </div>
  );
}
