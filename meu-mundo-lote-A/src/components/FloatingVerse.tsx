import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BiblicalVerse, FamilyProfile } from '../types';
import { biblicalVerses } from '../data/verses';
import { DynamicIcon } from './IconHelper';

interface FloatingVerseProps {
  profile: FamilyProfile;
  activeTab?: string;
}

export const FloatingVerse: React.FC<FloatingVerseProps> = ({
  profile,
  activeTab = 'home',
}) => {
  // Check if verses are enabled
  const isEnabled = profile.versesEnabled !== false && profile.verseFrequency !== 'disabled';
  const frequency = profile.verseFrequency || 'normal';
  const isHighContrast = profile.highContrast;
  const isReducedMotion = profile.reducedMotion;

  // Selected verse index
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    // Start with an appropriate contextual verse based on tab or random
    const initialByTab: Record<string, number> = {
      home: 29, // Gratidão: Salmos 118:24
      routine: 2, // Família: Provérbios 22:6
      communication: 10, // Amor: João 13:34
      support: 15, // Jesus: Mateus 11:28
      profile: 0, // Família: Josué 24:15
    };
    return initialByTab[activeTab] ?? Math.floor(Math.random() * biblicalVerses.length);
  });

  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isDismissedByUser, setIsDismissedByUser] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);

  // Advance to next verse (without repeating immediate previous)
  const handleNextVerse = useCallback(() => {
    setCurrentIndex((prev) => {
      let next = Math.floor(Math.random() * biblicalVerses.length);
      if (next === prev) {
        next = (prev + 1) % biblicalVerses.length;
      }
      return next;
    });
    setIsVisible(true);
  }, []);

  // Update verse contextually when user switches tabs (if not hovered)
  useEffect(() => {
    if (!isEnabled || isDismissedByUser) return;
    
    // Select category matching current tab
    let preferredCategory: BiblicalVerse['category'] | null = null;
    if (activeTab === 'routine') preferredCategory = 'Família';
    else if (activeTab === 'communication') preferredCategory = 'Amor';
    else if (activeTab === 'support') preferredCategory = 'Jesus';
    else if (activeTab === 'home') preferredCategory = 'Esperança';

    if (preferredCategory) {
      const matches = biblicalVerses
        .map((v, idx) => ({ v, idx }))
        .filter((item) => item.v.category === preferredCategory);
      if (matches.length > 0) {
        const randomMatch = matches[Math.floor(Math.random() * matches.length)];
        setCurrentIndex(randomMatch.idx);
        setIsVisible(true);
      }
    }
  }, [activeTab, isEnabled, isDismissedByUser]);

  // Automatic gentle cycling based on frequency
  useEffect(() => {
    if (!isEnabled || isDismissedByUser || isMinimized || isHovered) return;

    // Display duration
    const displayDuration = frequency === 'reduced' ? 14000 : 20000;
    const pauseDuration = frequency === 'reduced' ? 45000 : 25000;

    const showTimeout = window.setTimeout(() => {
      // Fade out
      setIsVisible(false);

      // After fade out pause, advance to next verse and fade in
      const nextTimeout = window.setTimeout(() => {
        handleNextVerse();
      }, pauseDuration);

      timerRef.current = nextTimeout;
    }, displayDuration);

    return () => {
      clearTimeout(showTimeout);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, isEnabled, isDismissedByUser, isMinimized, isHovered, frequency, handleNextVerse]);

  if (!isEnabled || isDismissedByUser) {
    return null;
  }

  const currentVerse = biblicalVerses[currentIndex] || biblicalVerses[0];

  const getVerseCategoryTheme = (category: BiblicalVerse['category']) => {
    switch (category) {
      case 'Família':
        return { badge: 'bg-amber-500/20 text-amber-300 border-amber-400/40', refText: 'text-amber-300' };
      case 'Amor':
        return { badge: 'bg-rose-500/20 text-rose-300 border-rose-400/40', refText: 'text-rose-300' };
      case 'Jesus':
        return { badge: 'bg-purple-500/20 text-purple-300 border-purple-400/40', refText: 'text-purple-300' };
      case 'Mentalidade e renovação':
        return { badge: 'bg-sky-500/20 text-sky-300 border-sky-400/40', refText: 'text-sky-300' };
      case 'Esperança':
        return { badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40', refText: 'text-emerald-300' };
      case 'Gratidão':
      default:
        return { badge: 'bg-amber-400/20 text-amber-300 border-amber-300/40', refText: 'text-amber-300' };
    }
  };

  const verseTheme = getVerseCategoryTheme(currentVerse.category);

  // Minimized pill view (accessible, compact, non-intrusive)
  if (isMinimized) {
    return (
      <aside
        id="floating-biblical-verse-minimized"
        aria-label="Palavra de acolhimento minimizada"
        className="fixed bottom-[66px] sm:bottom-[72px] left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-fadeIn"
      >
        <button
          onClick={() => {
            setIsMinimized(false);
            setIsVisible(true);
          }}
          title="Expandir mensagem de acolhimento"
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shadow-[0_4px_20px_rgba(0,0,0,0.6)] active:scale-95 group ${
            isHighContrast
              ? 'bg-white text-slate-900 border-2 border-slate-900 font-semibold'
              : 'bg-[#070c20]/90 text-amber-200 border border-amber-400/30 backdrop-blur-xl hover:bg-[#0a122e] hover:border-amber-300/60 shadow-[0_0_15px_rgba(251,191,36,0.12)]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse" />
          <DynamicIcon name="Sparkles" className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
          <span className="tracking-wide">Mensagem de Paz</span>
          <span className="text-[10px] text-sky-300/80 font-mono">({currentVerse.reference})</span>
        </button>
      </aside>
    );
  }

  return (
    <aside
      id="floating-biblical-verse"
      role="status"
      aria-live="polite"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed bottom-[66px] sm:bottom-[72px] left-1/2 -translate-x-1/2 z-30 max-w-lg w-[calc(100%-1.75rem)] pointer-events-auto transition-all duration-700 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <div
        className={`p-3 sm:p-3.5 rounded-2xl transition-all relative overflow-hidden ${
          isHighContrast
            ? 'bg-white text-slate-950 border-2 border-slate-900 shadow-xl'
            : 'bg-[#070c20]/88 backdrop-blur-2xl border border-sky-400/20 text-slate-100 shadow-[0_12px_36px_rgba(2,5,18,0.8),0_0_20px_rgba(56,189,248,0.06),inset_0_1px_1px_rgba(255,255,255,0.08)]'
        }`}
      >
        {/* Soft celestial light shimmer at top rim */}
        {!isHighContrast && (
          <>
            <div className="absolute top-0 left-8 right-8 h-[1px] bg-linear-to-r from-transparent via-amber-300/40 via-sky-300/45 to-transparent pointer-events-none" />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-10 bg-radial from-sky-400/15 to-transparent blur-lg pointer-events-none" />
          </>
        )}

        {/* Rainbow top line on floating verse */}
        {!isHighContrast && (
          <div className="absolute top-0 left-0 right-0 h-[2px] rainbow-gradient-bar opacity-80" />
        )}

        <div className="flex items-center justify-between gap-2">
          {/* Category & Faith Badge with celestial soft lighting */}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-colors ${
                isHighContrast
                  ? 'bg-slate-100 text-slate-900 border border-slate-300'
                  : `border ${verseTheme.badge} shadow-xs`
              }`}
            >
              <DynamicIcon name="Sparkle" className="w-2.5 h-2.5" />
              <span>{currentVerse.category}</span>
            </span>

            <span
              className={`text-xs font-bold tracking-wide truncate ${
                isHighContrast ? 'text-slate-950 font-bold' : `${verseTheme.refText} font-mono`
              }`}
            >
              {currentVerse.reference}
            </span>
          </div>

          {/* Minimalist Controls: Next, Minimize, Dismiss */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={handleNextVerse}
              title="Próximo versículo"
              aria-label="Ver outro versículo de acolhimento"
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                isHighContrast
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-amber-200 hover:bg-white/8'
              }`}
            >
              <DynamicIcon name="ChevronRight" className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsMinimized(true)}
              title="Recolher mensagem (deixar discreto)"
              aria-label="Recolher mensagem para formato discreto"
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                isHighContrast
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-amber-200 hover:bg-white/8'
              }`}
            >
              <DynamicIcon name="Minus" className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsDismissedByUser(true)}
              title="Fechar mensagem por agora"
              aria-label="Fechar mensagem de acolhimento"
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                isHighContrast
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-rose-300 hover:bg-rose-500/10'
              }`}
            >
              <DynamicIcon name="X" className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Verse text with warm, comforting typography */}
        <p
          className={`mt-1.5 text-xs sm:text-[13px] leading-relaxed transition-colors select-text ${
            isHighContrast
              ? 'text-slate-900 font-medium'
              : 'text-slate-200/95 font-normal'
          }`}
        >
          <span className="text-amber-300/60 font-serif mr-0.5">“</span>
          {currentVerse.text}
          <span className="text-amber-300/60 font-serif ml-0.5">”</span>
        </p>

        {/* Delicate footer divider and serene caption */}
        <div
          className={`mt-2 flex items-center justify-between text-[10px] pt-1.5 border-t ${
            isHighContrast
              ? 'border-slate-200 text-slate-600'
              : 'border-indigo-950/70 text-slate-400/80'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400/70 shrink-0" />
            <span className="truncate">Palavra de paz para pais & cuidadores</span>
          </div>
          <span className="shrink-0 font-mono text-[9px] text-slate-500 ml-2">
            #{currentVerse.id} de 30
          </span>
        </div>
      </div>
    </aside>
  );
};
