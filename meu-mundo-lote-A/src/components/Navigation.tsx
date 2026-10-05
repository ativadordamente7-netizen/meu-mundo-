import React from 'react';
import { TabType, FamilyProfile } from '../types';
import { DynamicIcon } from './IconHelper';
import { AppLogo } from './AppLogo';

interface HeaderProps {
  profile: FamilyProfile;
  activeTab: TabType;
  currentUser?: { displayName?: string | null; email?: string | null; photoURL?: string | null } | null;
  onOpenTour: () => void;
  onToggleSound: () => void;
  onToggleContrast: () => void;
  onOpenPortal?: () => void;
  onOpenVoice?: () => void;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

export const TopHeader: React.FC<HeaderProps> = ({
  profile,
  currentUser,
  onOpenTour,
  onToggleSound,
  onToggleContrast,
  onOpenPortal,
  onOpenVoice,
  onSignIn,
  onSignOut,
}) => {
  const isHighContrast = profile.highContrast;

  return (
    <header
      className={`sticky top-0 z-30 transition-all ${
        isHighContrast
          ? 'bg-white border-b-2 border-slate-900'
          : 'bg-[#0b102e]/85 backdrop-blur-xl border-b border-indigo-900/60 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)]'
      } px-4 py-3 relative`}
    >
      {/* Radiant Rainbow Spectrum Top Line (Símbolo do Infinito & Neurodiversidade) */}
      {!isHighContrast && (
        <div className="absolute top-0 left-0 right-0 h-[2.5px] rainbow-gradient-bar shadow-[0_0_10px_rgba(236,72,153,0.4)]" />
      )}

      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all overflow-hidden ${
              isHighContrast
                ? 'bg-slate-100 border border-slate-900'
                : 'bg-white/10 border border-amber-300/40 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
            }`}
          >
            <AppLogo className="w-8 h-8 drop-shadow-md" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className={`font-extrabold text-base tracking-tight ${
                  isHighContrast
                    ? 'text-slate-950'
                    : 'rainbow-text-gradient font-black drop-shadow-xs'
                }`}
              >
                Meu Mundo
              </span>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full transition-all ${
                  isHighContrast
                    ? 'bg-slate-100 text-slate-900 border border-slate-300'
                    : 'bg-linear-to-r from-amber-400/20 via-pink-400/20 to-sky-400/20 text-amber-200 border border-amber-300/40 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                }`}
              >
                Apoio à Família
              </span>
            </div>
            <p
              className={`text-[11px] leading-none mt-0.5 hidden sm:block ${
                isHighContrast ? 'text-slate-700' : 'text-slate-300 font-medium'
              }`}
            >
              {profile.childName ? `Jornada com ${profile.childName}` : 'Um passo de cada vez'}
            </p>
          </div>
        </div>

        {/* Quick Accessibility & Actions */}
        <div className="flex items-center gap-1.5">
          {onOpenPortal && (
            <button
              id="btn-open-3d-portal"
              onClick={onOpenPortal}
              aria-label="Abrir Portal 3D Meu Mundo"
              title="Abrir Experiência 3D com arte e o símbolo do infinito"
              className={`px-2 sm:px-3 py-1.5 rounded-xl border text-xs transition flex items-center gap-1 font-semibold ${
                isHighContrast
                  ? 'border-slate-900 bg-slate-100 text-slate-900 hover:bg-slate-200'
                  : 'border-amber-300/50 bg-linear-to-r from-amber-400/15 via-amber-500/20 to-sky-400/15 hover:from-amber-400/25 hover:to-sky-400/25 text-amber-200 shadow-[0_0_14px_rgba(251,191,36,0.2)] active:scale-95'
              }`}
            >
              <DynamicIcon name="Sparkles" className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">Portal 3D ∞</span>
              <span className="sm:hidden text-[10px]">3D ∞</span>
            </button>
          )}

          {onOpenVoice && (
            <button
              id="btn-voice-conversation"
              onClick={onOpenVoice}
              aria-label="Ativar conversa por voz com a IA"
              title="Conversar por voz em tempo real com a IA do Meu Mundo"
              className={`px-2 sm:px-3 py-1.5 rounded-xl border text-xs transition flex items-center gap-1 font-semibold active:scale-95 relative group ${
                isHighContrast
                  ? 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800'
                  : 'border-sky-400/50 bg-linear-to-r from-sky-500/20 via-indigo-500/20 to-teal-400/20 hover:from-sky-500/30 hover:to-teal-400/30 text-sky-200 shadow-[0_0_14px_rgba(56,189,248,0.25)]'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400"></span>
              </span>
              <DynamicIcon name="Mic" className="w-3.5 h-3.5 text-sky-300 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Voz com IA</span>
              <span className="sm:hidden text-[10px]">Voz</span>
            </button>
          )}

          <button
            id="btn-quick-sound"
            onClick={onToggleSound}
            aria-label={profile.soundEnabled ? 'Desativar voz dos cartões' : 'Ativar voz dos cartões'}
            title={profile.soundEnabled ? 'Voz ativada para cartões' : 'Voz desativada'}
            className={`p-2 rounded-xl border text-xs transition flex items-center gap-1 ${
              isHighContrast
                ? profile.soundEnabled
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-500 border-slate-300'
                : profile.soundEnabled
                ? 'bg-sky-500/20 text-sky-300 border-sky-400/40 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
            }`}
          >
            <DynamicIcon name={profile.soundEnabled ? 'Volume2' : 'VolumeX'} className="w-4 h-4" />
            <span className="text-[11px] font-medium hidden md:inline">
              {profile.soundEnabled ? 'Voz ativa' : 'Mudo'}
            </span>
          </button>

          <button
            id="btn-quick-contrast"
            onClick={onToggleContrast}
            aria-label="Alternar modo de contraste"
            title="Alternar contraste da tela"
            className={`p-2 rounded-xl border text-xs transition flex items-center gap-1 ${
              isHighContrast
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <DynamicIcon name="Eye" className="w-4 h-4" />
            <span className="text-[11px] font-medium hidden md:inline">Contraste</span>
          </button>

          <button
            id="btn-header-info"
            onClick={onOpenTour}
            aria-label="Informações sobre o aplicativo"
            title="Guia do aplicativo"
            className={`p-2 rounded-xl border text-xs transition ${
              isHighContrast
                ? 'border-slate-300 text-slate-800 hover:bg-slate-100'
                : 'border-white/10 text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white'
            }`}
          >
            <DynamicIcon name="HelpCircle" className="w-4 h-4" />
          </button>

          {/* Firebase Auth Google Sign-in / Cloud Status */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 pl-1">
              <button
                id="btn-user-cloud-status"
                onClick={onSignOut}
                title={`Conectado como ${currentUser.displayName || currentUser.email || 'Usuário'}. Clique para desconectar.`}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition ${
                  isHighContrast
                    ? 'border-slate-900 bg-emerald-50 text-slate-900 hover:bg-rose-50'
                    : 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300 hover:bg-rose-950/30 hover:border-rose-500/30 hover:text-rose-200'
                }`}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Foto do perfil"
                    referrerPolicy="no-referrer"
                    className="w-4 h-4 rounded-full"
                  />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
                <DynamicIcon name="Cloud" className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline max-w-[80px] truncate text-[11px]">
                  {currentUser.displayName?.split(' ')[0] || 'Nuvem'}
                </span>
              </button>
            </div>
          ) : (
            onSignIn && (
              <button
                id="btn-google-signin"
                onClick={onSignIn}
                title="Entrar com Google e sincronizar dados com Firebase"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition shadow-sm active:scale-95 ${
                  isHighContrast
                    ? 'bg-white border-slate-900 text-slate-900 hover:bg-slate-100'
                    : 'bg-white/8 hover:bg-white/15 border-white/20 text-slate-100 shadow-[0_0_10px_rgba(255,255,255,0.05)]'
                }`}
              >
                <DynamicIcon name="LogIn" className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline text-[11px]">Entrar</span>
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
};

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs: {
    id: TabType;
    label: string;
    icon: string;
    activeText: string;
    activeIconColor: string;
    activeIndicator: string;
    glowClass: string;
    hoverText: string;
  }[] = [
    {
      id: 'home',
      label: 'Início',
      icon: 'Sun',
      activeText: 'text-amber-400 font-bold',
      activeIconColor: 'text-amber-400',
      activeIndicator: 'from-amber-400 via-yellow-300 to-amber-500',
      glowClass: 'drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]',
      hoverText: 'hover:text-amber-300',
    },
    {
      id: 'routine',
      label: 'Rotina',
      icon: 'Calendar',
      activeText: 'text-orange-400 font-bold',
      activeIconColor: 'text-orange-400',
      activeIndicator: 'from-orange-500 via-amber-400 to-orange-400',
      glowClass: 'drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]',
      hoverText: 'hover:text-orange-300',
    },
    {
      id: 'communication',
      label: 'Comunicação',
      icon: 'MessageSquare',
      activeText: 'text-cyan-300 font-bold',
      activeIconColor: 'text-cyan-300',
      activeIndicator: 'from-cyan-400 via-sky-300 to-teal-400',
      glowClass: 'drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]',
      hoverText: 'hover:text-cyan-300',
    },
    {
      id: 'support',
      label: 'Apoio',
      icon: 'Heart',
      activeText: 'text-pink-400 font-bold',
      activeIconColor: 'text-pink-400',
      activeIndicator: 'from-pink-500 via-rose-400 to-fuchsia-400',
      glowClass: 'drop-shadow-[0_0_10px_rgba(236,72,153,0.6)]',
      hoverText: 'hover:text-pink-300',
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: 'User',
      activeText: 'text-purple-300 font-bold',
      activeIconColor: 'text-purple-300',
      activeIndicator: 'from-purple-400 via-indigo-300 to-violet-500',
      glowClass: 'drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]',
      hoverText: 'hover:text-purple-300',
    },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Navegação principal do aplicativo"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0b102e]/94 backdrop-blur-xl border-t border-indigo-900/60 px-2 py-1.5 shadow-[0_-8px_28px_rgba(0,0,0,0.6)] transition-colors relative"
    >
      {/* Rainbow line along the bottom bar's upper edge */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rainbow-gradient-bar opacity-80" />

      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 min-h-[52px] relative group ${
                isActive
                  ? `${tab.activeText}`
                  : `text-slate-300 ${tab.hoverText} font-medium`
              }`}
            >
              {isActive && (
                <span
                  className={`absolute top-0.5 w-8 h-1 rounded-full bg-linear-to-r ${tab.activeIndicator} shadow-[0_0_10px_rgba(255,255,255,0.7)] animate-pulse`}
                />
              )}
              <DynamicIcon
                name={tab.icon}
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive
                    ? `scale-115 ${tab.activeIconColor} ${tab.glowClass}`
                    : 'text-slate-300 group-hover:scale-110'
                }`}
              />
              <span className="text-[11px] mt-1 tracking-tight leading-none whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
