import React, { useState } from 'react';
import { FamilyProfile, RoutineActivity, CommunicationCard, ObservationEntry, FontSizeType } from '../types';
import { DynamicIcon } from './IconHelper';

interface ProfileTabProps {
  profile: FamilyProfile;
  activities: RoutineActivity[];
  cards: CommunicationCard[];
  observations: ObservationEntry[];
  currentUser?: { displayName?: string | null; email?: string | null; photoURL?: string | null; uid?: string } | null;
  isSyncing?: boolean;
  onSignInWithGoogle?: () => void;
  onSignOut?: () => void;
  onSyncNow?: () => void;
  onUpdateProfile: (updated: FamilyProfile) => void;
  onOpenTour: () => void;
  onOpenDiary: () => void;
  onResetData: () => void;
  onOpenPortal?: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  profile,
  activities,
  cards,
  observations,
  currentUser,
  isSyncing,
  onSignInWithGoogle,
  onSignOut,
  onSyncNow,
  onUpdateProfile,
  onOpenTour,
  onOpenDiary,
  onResetData,
  onOpenPortal,
}) => {
  const [editingFamily, setEditingFamily] = useState(false);
  const [parentName, setParentName] = useState(profile.parentName);
  const [childName, setChildName] = useState(profile.childName);
  const [childAge, setChildAge] = useState(profile.childAge);
  const [focusArea, setFocusArea] = useState(profile.focusArea);
  const [exportSuccess, setExportSuccess] = useState(false);

  const focusOptions = [
    'Organizar a rotina',
    'Ajudar na comunicação',
    'Compreender melhor as necessidades da criança',
    'Lidar com momentos de sobrecarga',
    'Encontrar apoio para mim',
    'Um pouco de tudo',
  ];

  const handleSaveFamilyData = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      parentName: parentName.trim() || 'Você',
      childName: childName.trim() || 'Sua criança',
      childAge: childAge.trim(),
      focusArea,
    });
    setEditingFamily(false);
  };

  const handleExportBackup = () => {
    const fullBackup = {
      exportedAt: new Date().toISOString(),
      profile,
      activities,
      cards,
      observations,
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meu-mundo-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  return (
    <div className="space-y-5 pb-32 text-left animate-fadeIn">
      {/* Header */}
      <div className="cosmic-card p-4 md:p-5 rounded-2xl border border-indigo-900/50 shadow-lg flex items-center justify-between text-slate-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] rainbow-gradient-bar" />
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-linear-to-r from-amber-400/20 via-pink-400/20 to-sky-400/20 text-amber-200 text-[11px] font-bold border border-amber-300/40 shadow-[0_0_10px_rgba(251,191,36,0.2)]">
            <DynamicIcon name="User" className="w-3.5 h-3.5 text-amber-300" />
            <span>Meu Perfil & Configurações</span>
          </div>
          <h1 className="text-lg md:text-xl font-black text-white mt-1">
            Família {profile.parentName ? `de ${profile.parentName}` : ''}
          </h1>
          <p className="text-xs text-slate-300 mt-0.5 font-medium">
            Personalize a experiência, cores, acessibilidade e controle de dados
          </p>
        </div>

        <button
          onClick={onOpenTour}
          className="p-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
        >
          <DynamicIcon name="HelpCircle" className="w-4 h-4 text-amber-300" />
          <span className="hidden sm:inline">Guia do app</span>
        </button>
      </div>

      {/* Colorful Summary Statistics Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl border border-amber-400/40 bg-linear-to-br from-amber-950/40 to-[#0e1634]/90 shadow-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-300/40 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(251,191,36,0.25)]">
            <DynamicIcon name="Calendar" className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-amber-300 leading-none block">
              {activities.length}
            </span>
            <span className="text-[11px] font-bold text-slate-300">Na rotina</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl border border-cyan-400/40 bg-linear-to-br from-cyan-950/40 to-[#0e1634]/90 shadow-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-400/20 text-cyan-300 border border-cyan-300/40 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
            <DynamicIcon name="MessageSquare" className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-cyan-300 leading-none block">
              {cards.length}
            </span>
            <span className="text-[11px] font-bold text-slate-300">Cartões CAA</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenDiary}
          className="p-3.5 rounded-2xl border border-emerald-400/40 bg-linear-to-br from-emerald-950/40 to-[#0e1634]/90 shadow-md flex items-center gap-3 hover:border-emerald-300 transition text-left cursor-pointer active:scale-95"
          title="Abrir Diário de Observações e Gráfico de Humor"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 border border-emerald-300/40 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
            <DynamicIcon name="BookOpen" className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-emerald-300 leading-none block">
              {observations.length}
            </span>
            <span className="text-[11px] font-bold text-slate-300">No diário</span>
          </div>
        </button>

        <div className="p-3.5 rounded-2xl border border-pink-400/40 bg-linear-to-br from-pink-950/40 to-[#0e1634]/90 shadow-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-400/20 text-pink-300 border border-pink-300/40 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(244,114,182,0.25)]">
            <DynamicIcon name="Cloud" className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-black text-pink-300 leading-none block">
              {currentUser ? 'Conectado' : 'Local'}
            </span>
            <span className="text-[11px] font-bold text-slate-300">Firebase</span>
          </div>
        </div>
      </div>

      {/* Firebase Cloud Sync & Google Sign-In Card */}
      <div className="cosmic-card p-4 md:p-5 rounded-2xl border border-indigo-900/50 shadow-md space-y-3 text-slate-200">
        <div className="flex items-center justify-between border-b border-indigo-950/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-300 flex items-center justify-center border border-sky-400/30">
              <DynamicIcon name="Cloud" className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Sincronização em Nuvem (Firebase)</span>
                {currentUser && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-medium">
                    Ativa
                  </span>
                )}
              </h2>
            </div>
          </div>
        </div>

        {currentUser ? (
          <div className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30">
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Usuário'}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full border-2 border-emerald-400 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center font-bold">
                    {currentUser.displayName?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-white">
                    {currentUser.displayName || 'Cuidador(a)'}
                  </div>
                  <div className="text-[11px] text-slate-400">{currentUser.email}</div>
                  <div className="text-[10px] text-emerald-300 flex items-center gap-1 mt-0.5">
                    <DynamicIcon name="CheckCircle2" className="w-3 h-3 text-emerald-400" />
                    <span>Rotina, cartões e diário protegidos no Firestore</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onSyncNow && (
                  <button
                    type="button"
                    onClick={onSyncNow}
                    disabled={isSyncing}
                    className="px-3 py-1.5 rounded-xl border border-sky-400/30 bg-sky-950/40 hover:bg-sky-900/50 text-sky-200 text-xs font-medium transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <DynamicIcon
                      name={isSyncing ? 'Loader2' : 'RefreshCw'}
                      className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`}
                    />
                    <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
                  </button>
                )}
                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/10 text-rose-300 text-xs font-medium transition"
                  >
                    Desconectar
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 pt-1">
            <p className="text-xs text-slate-300 leading-relaxed">
              Conecte sua conta Google com o <strong>Firebase Authentication</strong> para sincronizar automaticamente sua rotina visual, cartões e diário de observações com o <strong>Firestore</strong> em qualquer dispositivo.
            </p>
            {onSignInWithGoogle && (
              <button
                type="button"
                id="btn-profile-google-login"
                onClick={onSignInWithGoogle}
                className="py-2.5 px-4 rounded-xl bg-linear-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)] transition flex items-center gap-2 active:scale-95"
              >
                <DynamicIcon name="LogIn" className="w-4 h-4" />
                <span>Entrar com Google e Sincronizar na Nuvem</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 1. Dados Básicos da Família */}
      <div className="cosmic-card p-4 md:p-5 rounded-2xl border border-indigo-900/40 shadow-md space-y-3 text-slate-200">
        <div className="flex items-center justify-between border-b border-indigo-950/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-400/15 text-amber-300 flex items-center justify-center border border-amber-300/30">
              <DynamicIcon name="User" className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white">Dados da família</h2>
          </div>
          <button
            onClick={() => setEditingFamily(!editingFamily)}
            className="text-xs font-semibold text-amber-300 hover:text-amber-200"
          >
            {editingFamily ? 'Cancelar' : 'Editar informações'}
          </button>
        </div>

        {editingFamily ? (
          <form onSubmit={handleSaveFamilyData} className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome do responsável
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-indigo-900/80 bg-slate-900/80 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome da criança
              </label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-indigo-900/80 bg-slate-900/80 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Idade da criança
              </label>
              <input
                type="text"
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-indigo-900/80 bg-slate-900/80 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Foco principal de melhoria
              </label>
              <select
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-indigo-900/80 bg-slate-900/80 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
              >
                {focusOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-slate-900 text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="py-2 px-4 rounded-xl bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold shadow-[0_0_12px_rgba(251,191,36,0.25)] transition active:scale-95"
            >
              Salvar dados
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-indigo-950/80">
              <span className="text-amber-300/80 block text-[10px] uppercase font-bold">Responsável</span>
              <span className="font-semibold text-white mt-0.5 block">{profile.parentName || 'Você'}</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-indigo-950/80">
              <span className="text-amber-300/80 block text-[10px] uppercase font-bold">Criança</span>
              <span className="font-semibold text-white mt-0.5 block">{profile.childName || 'Sua criança'}</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-indigo-950/80">
              <span className="text-amber-300/80 block text-[10px] uppercase font-bold">Idade</span>
              <span className="font-semibold text-white mt-0.5 block">{profile.childAge || 'Não informada'}</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-indigo-950/80">
              <span className="text-amber-300/80 block text-[10px] uppercase font-bold">Foco atual</span>
              <span className="font-semibold text-white mt-0.5 block truncate">{profile.focusArea || 'Rotina'}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Preferências de Acessibilidade */}
      <div className="cosmic-card p-4 md:p-5 rounded-2xl border border-indigo-900/40 shadow-md space-y-4 text-slate-200">
        <div className="flex items-center gap-2 border-b border-indigo-950/80 pb-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-400/15 text-sky-300 flex items-center justify-center border border-sky-300/30">
            <DynamicIcon name="Sliders" className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white">Preferências de acessibilidade</h2>
        </div>

        <div className="space-y-3">
          {/* Paleta de Cores do Aplicativo */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-indigo-950/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <DynamicIcon name="Sparkles" className="w-4 h-4 text-amber-300" />
                  <span>Paleta de Cores e Estilo Visual</span>
                </span>
                <span className="text-[11px] text-slate-300">
                  Escolha o visual mais colorido e acolhedor para sua família
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {[
                {
                  id: 'rainbow' as const,
                  name: '🌈 Arco-íris da Neurodiversidade',
                  desc: 'Super colorido, alegre e acolhedor com tons do espectro',
                  dots: ['#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6'],
                },
                {
                  id: 'sunset' as const,
                  name: '🌅 Aurora Solar Dourada',
                  desc: 'Tons quentes de sol, âmbar, amarelo e laranja',
                  dots: ['#f59e0b', '#f97316', '#fbbf24', '#ea580c'],
                },
                {
                  id: 'cosmic' as const,
                  name: '🌌 Céu Cósmico & Lavanda',
                  desc: 'Tons celestiais de azul celeste, lilás e violeta',
                  dots: ['#38bdf8', '#818cf8', '#a855f7', '#6366f1'],
                },
                {
                  id: 'garden' as const,
                  name: '🌿 Jardim Sensorial & Menta',
                  desc: 'Tons frescos de esmeralda, menta, turquesa e verde',
                  dots: ['#34d399', '#10b981', '#06b6d4', '#14b8a6'],
                },
              ].map((theme) => {
                const isSelected = (profile.colorTheme || 'rainbow') === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => onUpdateProfile({ ...profile, colorTheme: theme.id })}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/15 shadow-[0_0_15px_rgba(251,191,36,0.3)] ring-1 ring-amber-400/50'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white leading-tight">
                        {theme.name}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                          Ativo
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 mb-2">
                      {theme.desc}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {theme.dots.map((dot, i) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full shadow-xs"
                          style={{ backgroundColor: dot }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alto contraste */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-indigo-950/80">
            <div>
              <span className="text-xs font-bold text-white block">Modo de alto contraste</span>
              <span className="text-[11px] text-slate-400">
                Aumenta a nitidez de bordas e textos para facilitar a visualização
              </span>
            </div>
            <button
              onClick={() =>
                onUpdateProfile({ ...profile, highContrast: !profile.highContrast })
              }
              className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                profile.highContrast ? 'bg-amber-400 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="bg-slate-950 w-4 h-4 rounded-full shadow-xs" />
            </button>
          </div>

          {/* Redução de animações */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-indigo-950/80">
            <div>
              <span className="text-xs font-bold text-white block">Reduzir animações e transições</span>
              <span className="text-[11px] text-slate-400">
                Interface com movimentos mínimos, ideal para sensibilidade visual
              </span>
            </div>
            <button
              onClick={() =>
                onUpdateProfile({ ...profile, reducedMotion: !profile.reducedMotion })
              }
              className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                profile.reducedMotion ? 'bg-amber-400 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="bg-slate-950 w-4 h-4 rounded-full shadow-xs" />
            </button>
          </div>

          {/* Tamanho da Fonte */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-indigo-950/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">Tamanho do texto</span>
              <span className="text-[11px] text-amber-300 uppercase font-semibold">
                {profile.fontSize === 'normal'
                  ? 'Padrão'
                  : profile.fontSize === 'large'
                  ? 'Grande'
                  : 'Extra grande'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'large', 'extralarge'] as FontSizeType[]).map((sz) => (
                <button
                  key={sz}
                  onClick={() => onUpdateProfile({ ...profile, fontSize: sz })}
                  className={`py-1.5 rounded-lg text-xs font-semibold border transition ${
                    profile.fontSize === sz
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {sz === 'normal' ? 'Normal (100%)' : sz === 'large' ? 'Grande (115%)' : 'Extra (130%)'}
                </button>
              ))}
            </div>
          </div>

          {/* Reprodução de Voz */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-indigo-950/80">
            <div>
              <span className="text-xs font-bold text-white block">
                Sintetizador de voz nos cartões
              </span>
              <span className="text-[11px] text-slate-400">
                Lê o texto do cartão em voz alta em português ao clicar
              </span>
            </div>
            <button
              onClick={() =>
                onUpdateProfile({ ...profile, soundEnabled: !profile.soundEnabled })
              }
              className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                profile.soundEnabled ? 'bg-amber-400 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="bg-slate-950 w-4 h-4 rounded-full shadow-xs" />
            </button>
          </div>
        </div>
      </div>

      {/* 2.1 Configuração de Mensagens de Acolhimento (Versículos Bíblicos) */}
      <div className="cosmic-card p-4 md:p-5 rounded-2xl border border-indigo-900/40 shadow-md space-y-4 text-slate-200">
        <div className="flex items-center justify-between border-b border-indigo-950/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-400/15 text-amber-300 flex items-center justify-center border border-amber-300/30">
              <DynamicIcon name="Sparkles" className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Mensagens de Acolhimento & Fé</h2>
              <span className="text-[11px] text-slate-400">
                Pequenas reflexões e versículos de paz para a família
              </span>
            </div>
          </div>
          <button
            onClick={() =>
              onUpdateProfile({
                ...profile,
                versesEnabled: profile.versesEnabled === false ? true : false,
              })
            }
            aria-label="Ativar ou desativar versículos"
            className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
              profile.versesEnabled !== false && profile.verseFrequency !== 'disabled'
                ? 'bg-amber-400 justify-end'
                : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="bg-slate-950 w-4 h-4 rounded-full shadow-xs" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          O Meu Mundo disponibiliza 30 versículos temáticos sobre amor, família, descanso, esperança e gratidão, exibidos de forma suave na parte inferior da tela sem atrapalhar a sua navegação. O recurso é 100% opcional.
        </p>

        {profile.versesEnabled !== false && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Frequência de exibição:</span>
              <span className="text-[11px] text-amber-300 font-medium">
                {profile.verseFrequency === 'reduced'
                  ? 'Reduzida (mais espaçada)'
                  : profile.verseFrequency === 'disabled'
                  ? 'Desativada'
                  : 'Normal (equilibrada)'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() =>
                  onUpdateProfile({
                    ...profile,
                    versesEnabled: true,
                    verseFrequency: 'normal',
                  })
                }
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition text-center ${
                  profile.versesEnabled !== false && (profile.verseFrequency === 'normal' || !profile.verseFrequency)
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                Normal
              </button>

              <button
                onClick={() =>
                  onUpdateProfile({
                    ...profile,
                    versesEnabled: true,
                    verseFrequency: 'reduced',
                  })
                }
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition text-center ${
                  profile.versesEnabled !== false && profile.verseFrequency === 'reduced'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                Reduzida
              </button>

              <button
                onClick={() =>
                  onUpdateProfile({
                    ...profile,
                    versesEnabled: false,
                    verseFrequency: 'disabled',
                  })
                }
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition text-center ${
                  profile.versesEnabled === false || profile.verseFrequency === 'disabled'
                    ? 'bg-slate-700 text-white border-slate-500'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                Desativar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3D Portal Experience Section */}
      {onOpenPortal && (
        <div className="cosmic-card p-4 md:p-5 rounded-2xl border border-amber-400/40 shadow-[0_0_25px_rgba(251,191,36,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-400/60 shrink-0 shadow-[0_0_12px_rgba(251,191,36,0.25)]">
              <img
                src="/assets/reference_boy.jpg"
                alt="Miniatura arte 3D"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <DynamicIcon name="Sparkles" className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>Experiência 3D — Portal Meu Mundo</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Reviva a abertura cinematográfica com as peças em profundidade 3D e o símbolo do infinito.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenPortal}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-linear-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(251,191,36,0.3)] shrink-0 active:scale-95"
          >
            <DynamicIcon name="Sparkles" className="w-3.5 h-3.5 text-slate-950" />
            <span>Abrir Portal 3D</span>
          </button>
        </div>
      )}

      {/* 3. Privacidade, Segurança & Responsabilidade */}
      <div className="cosmic-card p-4 md:p-5 rounded-2xl border border-indigo-900/40 shadow-md space-y-3 text-slate-200">
        <div className="flex items-center gap-2 border-b border-indigo-950/80 pb-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-400/15 text-emerald-300 flex items-center justify-center border border-emerald-300/30">
            <DynamicIcon name="ShieldAlert" className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white">Privacidade & Responsabilidade Ética</h2>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-slate-300 space-y-1.5 leading-relaxed">
          <p className="font-semibold text-emerald-300">
            🔒 Seus dados pertencem unicamente à sua família:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-300">
            <li>Os dados e anotações são armazenados localmente no seu dispositivo.</li>
            <li>Não coletamos nem solicitamos laudos médicos, prontuários ou documentos sensíveis.</li>
            <li>Não há anúncios comerciais ou rastreamento invasivo de comportamento.</li>
            <li>Nenhum dado pessoal de crianças é utilizado para treinamento de modelos de IA sem consentimento.</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={handleExportBackup}
            className="py-2 px-3 rounded-xl border border-white/10 hover:bg-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition active:scale-95"
          >
            <DynamicIcon name="Download" className="w-4 h-4 text-slate-300" />
            <span>Fazer backup completo (JSON)</span>
          </button>

          <button
            onClick={onOpenDiary}
            className="py-2 px-3 rounded-xl border border-amber-300/30 bg-amber-400/15 hover:bg-amber-400/25 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
          >
            <DynamicIcon name="FileText" className="w-4 h-4 text-amber-300" />
            <span>Exportar resumo para consultas</span>
          </button>

          <button
            onClick={onResetData}
            className="py-2 px-3 rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/15 text-xs font-semibold flex items-center gap-1.5 transition ml-auto active:scale-95"
          >
            <DynamicIcon name="Trash2" className="w-4 h-4" />
            <span>Redefinir aplicativo</span>
          </button>
        </div>

        {exportSuccess && (
          <p className="text-xs text-emerald-300 font-semibold animate-fadeIn">
            ✓ Arquivo de backup salvo com sucesso no seu dispositivo!
          </p>
        )}
      </div>

      {/* 4. Sobre o Aplicativo & Manifesto */}
      <div className="cosmic-card p-4 md:p-5 rounded-2xl border border-indigo-900/40 text-xs text-slate-300 space-y-2">
        <h3 className="font-bold text-white">Sobre o "Meu Mundo — Apoio à Família"</h3>
        <p className="leading-relaxed">
          Desenvolvido como um micro-aplicativo acolhedor e seguro, projetado com carinho para pais e responsáveis que buscam clareza, rotina previsível e acolhimento emocional.
        </p>
        <p className="italic font-medium text-amber-200/90">
          "Cada criança tem seu jeito. Cada família tem seu caminho. Vamos caminhar juntos, um passo de cada vez."
        </p>
      </div>
    </div>
  );
};
