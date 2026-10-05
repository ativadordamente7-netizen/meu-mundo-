import React, { useState } from 'react';
import { FamilyProfile, RoutineActivity, TabType, DailyStep } from '../types';
import { DynamicIcon } from './IconHelper';

interface HomeTabProps {
  profile: FamilyProfile;
  activities: RoutineActivity[];
  dailySteps: DailyStep[];
  onToggleStep: (id: string) => void;
  onNavigate: (tab: TabType) => void;
  onOpenDiary: () => void;
  onOpenPortal?: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  profile,
  activities,
  dailySteps,
  onToggleStep,
  onNavigate,
  onOpenDiary,
  onOpenPortal,
}) => {
  // Quick transition countdown state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 min default
  const [selectedMinutes, setSelectedMinutes] = useState(5);

  React.useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const startTimer = (mins: number) => {
    setSelectedMinutes(mins);
    setTimeLeft(mins * 60);
    setTimerRunning(true);
  };

  const stopTimer = () => {
    setTimerRunning(false);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(selectedMinutes * 60);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Find next uncompleted activity
  const nextActivity = activities.find((a) => !a.completed);
  const completedCount = activities.filter((a) => a.completed).length;

  const currentStep = dailySteps[0] || {
    id: 'step-today',
    text: 'Hoje, experimente avisar com antecedência quando uma atividade estiver prestes a terminar.',
    completed: false,
  };

  return (
    <div className="space-y-6 pb-32 animate-fadeIn">
      {/* Personalized Welcoming Header with Cosmic Atmosphere */}
      <section className="cosmic-card rounded-3xl p-5 md:p-7 border border-amber-400/40 bg-gradient-to-br from-[#121c45]/90 via-[#181a48]/90 to-[#10243d]/90 shadow-xl relative overflow-hidden group">
        {/* Shimmering rainbow border top accent */}
        <div className="absolute top-0 left-0 right-0 h-[3px] rainbow-gradient-bar" />

        <div className="max-w-xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-linear-to-r from-pink-500/20 via-amber-400/20 to-sky-400/20 border border-amber-300/40 text-amber-200 text-xs font-bold mb-3 shadow-[0_0_12px_rgba(251,191,36,0.25)]">
            <span className="w-2.5 h-2.5 rounded-full bg-linear-to-r from-amber-400 to-rose-400 animate-pulse shadow-[0_0_8px_#fbbf24]"></span>
            <span>🌈 Espaço de acolhimento, luz & cores</span>
          </div>

          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-sm">
            Olá, <span className="rainbow-text-gradient">{profile.parentName || 'responsável'}</span>!
          </h1>
          <p className="text-sm md:text-base text-slate-200 mt-1.5 leading-relaxed font-medium">
            Vamos cuidar de um passo por vez com <span className="text-amber-300 font-bold">{profile.childName || 'sua criança'}</span>.
          </p>

          <p className="text-xs text-amber-100 mt-3.5 italic border-l-3 border-amber-400 pl-3 leading-relaxed bg-amber-400/10 py-1.5 rounded-r-xl">
            "Cada criança tem seu jeito. Cada família tem seu caminho. Vamos caminhar juntos."
          </p>
        </div>

        {/* Soft atmospheric background glow & subtle starlight icon */}
        <div className="absolute right-3 -bottom-5 text-amber-300/15 pointer-events-none hidden sm:block animate-gentleFloat">
          <DynamicIcon name="Sparkle" className="w-36 h-36" />
        </div>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* 3D Cinematic Portal Feature Card */}
      {onOpenPortal && (
        <section className="bg-linear-to-r from-[#121c48] via-[#241445] to-[#102d45] rounded-3xl p-4 sm:p-5 text-white shadow-xl border border-amber-400/40 flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden relative">
          <div className="flex items-center gap-4 z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.35)] shrink-0 relative group">
              <img
                src="/assets/reference_boy.jpg"
                alt="Menino feliz de braços abertos e peças de quebra-cabeça"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent flex items-end justify-center pb-1">
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-tight">Portal 3D ∞</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-linear-to-r from-amber-400/25 to-pink-500/25 text-amber-200 border border-amber-300/50 shadow-[0_0_10px_rgba(251,191,36,0.25)]">
                  Experiência Cinematográfica 🌈
                </span>
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>O Infinito de {profile.childName || 'cada criança'}</span>
              </h2>
              <p className="text-xs text-slate-200 mt-0.5 max-w-sm line-clamp-2 leading-relaxed font-medium">
                Peças em 3D com volume real flutuando e o fluxo de luz tecendo o símbolo do infinito.
              </p>
            </div>
          </div>

          <button
            id="btn-trigger-3d-portal-banner"
            onClick={onOpenPortal}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-linear-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition-all shadow-[0_0_18px_rgba(251,191,36,0.4)] flex items-center justify-center gap-2 shrink-0 z-10 active:scale-95 cursor-pointer"
          >
            <DynamicIcon name="Sparkles" className="w-4 h-4 text-slate-950 animate-pulse" />
            <span>Vivenciar Portal 3D ∞</span>
          </button>

          {/* Background subtle glow effect */}
          <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-0 left-1/4 w-36 h-36 bg-pink-500/15 rounded-full blur-2xl pointer-events-none" />
        </section>
      )}

      {/* Pequeno passo de hoje */}
      <section className="rounded-2xl p-4 md:p-5 border border-emerald-400/50 bg-linear-to-br from-emerald-950/40 via-[#0e1738]/85 to-teal-950/30 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-2.5 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/25 text-emerald-300 flex items-center justify-center border border-emerald-400/50 shadow-[0_0_12px_rgba(52,211,153,0.3)]">
              <DynamicIcon name="Sparkles" className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-300 block">
                🌱 Sugestão leve do dia
              </span>
              <h2 className="text-sm font-bold text-white">Pequeno passo com carinho</h2>
            </div>
          </div>
          <span className="text-[11px] font-medium text-emerald-200/80 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-400/30">
            Sem metas rígidas
          </span>
        </div>

        <p className="text-xs md:text-sm text-emerald-50 leading-relaxed bg-[#07132a]/80 p-3.5 rounded-xl border border-emerald-500/30 relative z-10 font-medium">
          "{currentStep.text}"
        </p>

        <div className="mt-3 flex items-center justify-between relative z-10">
          <button
            id="btn-toggle-daily-step"
            onClick={() => onToggleStep(currentStep.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              currentStep.completed
                ? 'bg-emerald-500 text-slate-950 border border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.4)] font-black'
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
            }`}
          >
            <DynamicIcon
              name={currentStep.completed ? 'CheckCircle2' : 'CheckSquare'}
              className="w-4 h-4"
            />
            <span>{currentStep.completed ? 'Experimentado com carinho!' : 'Marcar como experimentado'}</span>
          </button>

          <span className="text-[11px] text-slate-300">Lembre-se: sem pressão</span>
        </div>
      </section>

      {/* Três Cartões Principais */}
      <section className="space-y-3.5">
        <h2 className="text-xs font-black uppercase tracking-wider text-amber-300 px-1 flex items-center gap-1.5">
          <DynamicIcon name="Sparkle" className="w-3.5 h-3.5 text-amber-400" />
          <span>Acesso rápido aos módulos principais</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cartão 1 — Nossa rotina */}
          <div className="rounded-2xl p-5 border border-amber-400/45 bg-linear-to-br from-amber-950/45 via-[#101736]/85 to-orange-950/35 shadow-lg flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(245,158,11,0.25)] hover:border-amber-400/70 transition-all group">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-300/50 flex items-center justify-center text-amber-300 mb-3.5 shadow-[0_0_14px_rgba(251,191,36,0.3)] group-hover:scale-105 transition-transform">
                <DynamicIcon name="Calendar" className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white">Nossa rotina</h3>
              <p className="text-xs text-slate-200 mt-1.5 leading-relaxed font-medium">
                Organize os momentos do dia de uma forma visual e previsível.
              </p>
              {nextActivity && (
                <div className="mt-3 p-2 rounded-xl bg-amber-400/15 border border-amber-400/30 text-[11px] text-amber-200 font-medium">
                  <span className="font-bold text-amber-300">Próximo passo:</span> {nextActivity.title}
                </div>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-amber-400/20">
              <button
                id="btn-card-routine"
                onClick={() => onNavigate('routine')}
                className="w-full py-2.5 px-3 rounded-xl bg-linear-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-xs font-black transition flex items-center justify-center gap-1.5 shadow-[0_0_14px_rgba(251,191,36,0.35)] cursor-pointer active:scale-95"
              >
                <span>Ver rotina</span>
                <DynamicIcon name="ChevronRight" className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cartão 2 — Vamos nos comunicar */}
          <div className="rounded-2xl p-5 border border-cyan-400/45 bg-linear-to-br from-cyan-950/45 via-[#101736]/85 to-sky-950/35 shadow-lg flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(6,182,212,0.25)] hover:border-cyan-400/70 transition-all group">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-cyan-400/20 border border-cyan-300/50 flex items-center justify-center text-cyan-300 mb-3.5 shadow-[0_0_14px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-transform">
                <DynamicIcon name="MessageSquare" className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white">Vamos nos comunicar</h3>
              <p className="text-xs text-slate-200 mt-1.5 leading-relaxed font-medium">
                Explore formas de ajudar sua criança a expressar necessidades, escolhas e sentimentos.
              </p>
              <div className="mt-3 p-2 rounded-xl bg-cyan-400/15 border border-cyan-400/30 text-[11px] text-cyan-200 font-medium">
                <span className="font-bold text-cyan-300">Recurso:</span> Pranchas visuais com voz em português
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-cyan-400/20">
              <button
                id="btn-card-communication"
                onClick={() => onNavigate('communication')}
                className="w-full py-2.5 px-3 rounded-xl bg-linear-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-sky-400 text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow-[0_0_14px_rgba(56,189,248,0.35)] cursor-pointer active:scale-95"
              >
                <span>Abrir comunicação</span>
                <DynamicIcon name="ChevronRight" className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cartão 3 — Cuidando de quem cuida */}
          <div className="rounded-2xl p-5 border border-pink-400/45 bg-linear-to-br from-pink-950/45 via-[#101736]/85 to-rose-950/35 shadow-lg flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(244,114,182,0.25)] hover:border-pink-400/70 transition-all group">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-pink-400/20 border border-pink-300/50 flex items-center justify-center text-pink-300 mb-3.5 shadow-[0_0_14px_rgba(244,114,182,0.3)] group-hover:scale-105 transition-transform">
                <DynamicIcon name="Heart" className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white">Cuidando de quem cuida</h3>
              <p className="text-xs text-slate-200 mt-1.5 leading-relaxed font-medium">
                Encontre acolhimento, pequenas pausas e ideias para cuidar de você também.
              </p>
              <div className="mt-3 p-2 rounded-xl bg-pink-400/15 border border-pink-400/30 text-[11px] text-pink-200 font-medium">
                <span className="font-bold text-pink-300">Para você:</span> Pausa de respiração & orientações
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-pink-400/20">
              <button
                id="btn-card-support"
                onClick={() => onNavigate('support')}
                className="w-full py-2.5 px-3 rounded-xl bg-linear-to-r from-pink-500 via-rose-500 to-rose-600 hover:from-pink-400 hover:to-rose-400 text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow-[0_0_14px_rgba(244,63,94,0.35)] cursor-pointer active:scale-95"
              >
                <span>Meu apoio</span>
                <DynamicIcon name="ChevronRight" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recurso Prático: Temporizador Visual de Transição */}
      <section className="cosmic-card rounded-2xl p-4 md:p-5 border border-indigo-900/60 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-400/20 text-sky-300 flex items-center justify-center border border-sky-300/40 shadow-[0_0_10px_rgba(56,189,248,0.25)]">
              <DynamicIcon name="Clock" className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-bold text-white">
                Aviso prévio: timer visual de transição
              </h3>
              <p className="text-[11px] text-slate-300 font-medium">
                Ajude sua criança a saber quando uma atividade está para terminar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { mins: 2, label: '2 min', activeStyle: 'bg-emerald-400 text-slate-950 border-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.4)]' },
              { mins: 5, label: '5 min', activeStyle: 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.4)]' },
              { mins: 10, label: '10 min', activeStyle: 'bg-purple-400 text-slate-950 border-purple-300 shadow-[0_0_10px_rgba(192,132,252,0.4)]' },
            ].map(({ mins, label, activeStyle }) => (
              <button
                key={mins}
                onClick={() => startTimer(mins)}
                className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                  selectedMinutes === mins && timerRunning
                    ? `${activeStyle} font-black`
                    : 'bg-white/8 text-slate-200 border-white/15 hover:bg-white/15'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#080e28]/90 p-4 rounded-xl border border-indigo-900/60 flex items-center justify-between">
          <div>
            <span className="text-2xl md:text-3xl font-mono font-black text-amber-300 tracking-wider drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]">
              {formatTimer(timeLeft)}
            </span>
            <span className="text-[11px] text-slate-300 font-medium ml-2.5">
              {timerRunning
                ? 'Em andamento — avise com voz calma e carinhosa'
                : timeLeft === 0
                ? 'Tempo concluído! Momento de transição suave.'
                : 'Pronto para iniciar'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {timerRunning ? (
              <button
                onClick={stopTimer}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400/25 text-amber-200 border border-amber-300/50 text-xs font-bold hover:bg-amber-400/35 cursor-pointer"
              >
                Pausar
              </button>
            ) : (
              <button
                onClick={() => setTimerRunning(true)}
                className="px-4 py-1.5 rounded-xl bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black shadow-[0_0_12px_rgba(251,191,36,0.35)] cursor-pointer active:scale-95"
              >
                Iniciar
              </button>
            )}
            <button
              onClick={resetTimer}
              className="p-2 rounded-xl bg-white/8 border border-white/15 text-slate-200 text-xs hover:bg-white/15 cursor-pointer"
              title="Reiniciar"
            >
              <DynamicIcon name="RefreshCw" className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Atalhos Complementares: Diário e Assistente */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <button
          onClick={onOpenDiary}
          className="p-4 rounded-2xl border border-emerald-400/40 bg-linear-to-r from-emerald-950/35 to-[#0d1636]/80 text-left transition flex items-center gap-3.5 shadow-md hover:border-emerald-400/70 hover:shadow-[0_4px_20px_rgba(16,185,129,0.25)] group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 border border-emerald-300/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(16,185,129,0.25)]">
            <DynamicIcon name="BookOpen" className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white group-hover:text-emerald-200 transition-colors">
              Diário de observações
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5 font-medium">
              Anote reações e o que ajudou para levar a consultas
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('support')}
          className="p-4 rounded-2xl border border-purple-400/40 bg-linear-to-r from-purple-950/35 to-[#0d1636]/80 text-left transition flex items-center gap-3.5 shadow-md hover:border-purple-400/70 hover:shadow-[0_4px_20px_rgba(168,85,247,0.25)] group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-400/20 text-purple-300 border border-purple-300/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(168,85,247,0.25)]">
            <DynamicIcon name="HelpCircle" className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white group-hover:text-purple-200 transition-colors">
              Converse com o apoio
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5 font-medium">
              Tire dúvidas práticas com respostas sem julgamentos
            </p>
          </div>
        </button>
      </section>
    </div>
  );
};
