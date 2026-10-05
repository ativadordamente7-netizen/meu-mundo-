export type TabType = 'home' | 'routine' | 'communication' | 'support' | 'profile';

export type PeriodType = 'morning' | 'afternoon' | 'night';

export type CommCategoryType = 'all' | 'basic' | 'choices' | 'feelings' | 'free' | 'favorites';

export type FontSizeType = 'normal' | 'large' | 'extralarge';

export type ColorThemeType = 'rainbow' | 'sunset' | 'cosmic' | 'garden';

export type VerseFrequencyType = 'normal' | 'reduced' | 'disabled';

export type VerseCategoryType =
  | 'Família'
  | 'Amor'
  | 'Jesus'
  | 'Mentalidade e renovação'
  | 'Esperança'
  | 'Gratidão';

export interface BiblicalVerse {
  id: number;
  reference: string;
  text: string;
  category: VerseCategoryType;
}

export interface FamilyProfile {
  parentName: string;
  childName: string;
  childAge: string;
  focusArea: string;
  onboardingCompleted: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: FontSizeType;
  soundEnabled: boolean;
  colorTheme?: ColorThemeType;
  versesEnabled?: boolean;
  verseFrequency?: VerseFrequencyType;
}

export interface RoutineActivity {
  id: string;
  title: string;
  time?: string;
  period: PeriodType;
  category: string;
  iconName: string;
  completed: boolean;
  // Preparação para mudanças (recurso importante)
  prepWhat?: string;
  prepHelp?: string;
  prepWarning?: string;
}

export interface CommunicationCard {
  id: string;
  title: string;
  category: 'basic' | 'choices' | 'feelings' | 'free';
  iconName: string;
  colorBg: string;
  colorText: string;
  colorBorder: string;
  isFavorite: boolean;
  custom?: boolean;
  imageUrl?: string;
}

export interface GroundingSource {
  title: string;
  uri?: string;
}

export type ProposedActionType =
  | 'open_breathing'
  | 'suggest_routine'
  | 'suggest_card'
  | 'navigate_tab'
  | 'view_guideline';

export interface ProposedAction {
  id: string;
  type: ProposedActionType;
  label: string;
  description?: string;
  payload?: any;
  confirmed?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  groundingSources?: GroundingSource[];
  audioBase64?: string;
  proposedActions?: ProposedAction[];
  agentCategory?: 'rotina' | 'comunicacao' | 'cuidado' | 'conhecimento' | 'orientacoes' | 'apoio';
}

export interface AiMemory {
  enabled: boolean;
  notes: string[];
  observedPreferences: string[];
}

export type MoodScoreType = 1 | 2 | 3 | 4 | 5;

export interface MoodLevel {
  score: MoodScoreType;
  label: string;
  shortLabel: string;
  emoji: string;
  colorHex: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export interface ObservationEntry {
  id: string;
  date: string;
  time?: string;
  situation: string;
  beforeContext: string;
  reaction: string;
  whatHelped: string;
  toDiscussWithProfessional?: string;
  category: 'Mudança de rotina' | 'Sensorial' | 'Comunicação' | 'Alimentação' | 'Sono' | 'Interação' | 'Outro';
  moodScore?: number; // 1 (Sobrecarga) a 5 (Radiante)
  moodLabel?: string;
}

export interface SupportArticle {
  id: string;
  title: string;
  category: 'rotina' | 'comunicacao' | 'autocuidado' | 'sensorial' | 'profissionais';
  explanation: string;
  practicalTip: string;
  note: string;
}

export interface EducationalContent {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
  readTime: string;
}

export interface DailyStep {
  id: string;
  text: string;
  date: string;
  completed: boolean;
}
