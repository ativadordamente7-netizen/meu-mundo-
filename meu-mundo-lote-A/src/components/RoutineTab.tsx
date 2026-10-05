import React, { useState } from 'react';
import { RoutineActivity, PeriodType, FamilyProfile } from '../types';
import { DynamicIcon } from './IconHelper';
import { speakText } from '../utils/speech';

interface RoutineTabProps {
  profile: FamilyProfile;
  activities: RoutineActivity[];
  onUpdateActivities: (activities: RoutineActivity[]) => void;
}

export const RoutineTab: React.FC<RoutineTabProps> = ({
  profile,
  activities,
  onUpdateActivities,
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [periodFilter, setPeriodFilter] = useState<'all' | PeriodType>('all');
  const [selectedActivity, setSelectedActivity] = useState<RoutineActivity | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<RoutineActivity | null>(null);

  // Form states for new/edited activity
  const [formTitle, setFormTitle] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formPeriod, setFormPeriod] = useState<PeriodType>('morning');
  const [formIcon, setFormIcon] = useState('Sparkles');
  const [formPrepWhat, setFormPrepWhat] = useState('');
  const [formPrepHelp, setFormPrepHelp] = useState('');
  const [formPrepWarning, setFormPrepWarning] = useState('');

  const suggestedIcons = [
    { name: 'Sun', label: 'Sol / Manhã' },
    { name: 'Droplets', label: 'Água / Banheiro' },
    { name: 'Coffee', label: 'Café / Lanche' },
    { name: 'Sparkles', label: 'Escova / Dentes' },
    { name: 'Shirt', label: 'Vestir-se' },
    { name: 'School', label: 'Escola' },
    { name: 'Utensils', label: 'Almoço / Refeição' },
    { name: 'BedDouble', label: 'Pausa / Descanso' },
    { name: 'Smile', label: 'Brincar / Lazer' },
    { name: 'Bath', label: 'Banho' },
    { name: 'UtensilsCrossed', label: 'Jantar' },
    { name: 'Moon', label: 'Dormir / Noite' },
  ];

  const getPeriodTheme = (period: PeriodType) => {
    switch (period) {
      case 'morning':
        return {
          cardBg: 'bg-gradient-to-br from-amber-950/45 via-[#101736]/90 to-orange-950/35 border-amber-400/45 hover:border-amber-400/70',
          badge: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
          iconBg: 'bg-amber-400/20 text-amber-300 border-amber-300/40 shadow-[0_0_12px_rgba(251,191,36,0.3)]',
          timeBadge: 'text-amber-200 bg-amber-400/15 border-amber-300/40',
        };
      case 'afternoon':
        return {
          cardBg: 'bg-gradient-to-br from-cyan-950/45 via-[#101736]/90 to-sky-950/35 border-cyan-400/45 hover:border-cyan-400/70',
          badge: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/40',
          iconBg: 'bg-cyan-400/20 text-cyan-300 border-cyan-300/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]',
          timeBadge: 'text-cyan-200 bg-cyan-400/15 border-cyan-300/40',
        };
      case 'night':
        return {
          cardBg: 'bg-gradient-to-br from-purple-950/45 via-[#101736]/90 to-indigo-950/35 border-purple-400/45 hover:border-purple-400/70',
          badge: 'bg-purple-400/20 text-purple-300 border-purple-400/40',
          iconBg: 'bg-purple-400/20 text-purple-300 border-purple-300/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]',
          timeBadge: 'text-purple-200 bg-purple-400/15 border-purple-300/40',
        };
    }
  };

  const getCategoryBadge = (category: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('higiene') || cat.includes('banho') || cat.includes('dente')) {
      return 'bg-teal-500/20 text-teal-300 border-teal-400/40';
    }
    if (cat.includes('aliment') || cat.includes('lanche') || cat.includes('café') || cat.includes('almoço') || cat.includes('jantar')) {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';
    }
    if (cat.includes('lazer') || cat.includes('brincar')) {
      return 'bg-amber-500/20 text-amber-300 border-amber-400/40';
    }
    if (cat.includes('sono') || cat.includes('dormir') || cat.includes('descanso')) {
      return 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40';
    }
    if (cat.includes('escola') || cat.includes('desenvolvimento')) {
      return 'bg-pink-500/20 text-pink-300 border-pink-400/40';
    }
    return 'bg-sky-500/20 text-sky-300 border-sky-400/40';
  };

  const periodOptions = [
    { id: 'all', label: 'Todo o dia', icon: 'Sparkles', activeClass: 'bg-linear-to-r from-pink-500 via-amber-400 to-sky-400 text-slate-950 font-black shadow-[0_0_12px_rgba(251,191,36,0.35)]' },
    { id: 'morning', label: 'Manhã', icon: 'Sun', activeClass: 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-[0_0_12px_rgba(251,191,36,0.35)]' },
    { id: 'afternoon', label: 'Tarde', icon: 'Smile', activeClass: 'bg-cyan-400 text-slate-950 border-cyan-300 font-black shadow-[0_0_12px_rgba(6,182,212,0.35)]' },
    { id: 'night', label: 'Noite', icon: 'Moon', activeClass: 'bg-purple-400 text-slate-950 border-purple-300 font-black shadow-[0_0_12px_rgba(168,85,247,0.35)]' },
  ];

  const filteredActivities = activities.filter((act) => {
    if (periodFilter === 'all') return true;
    return act.period === periodFilter;
  });

  const toggleComplete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = activities.map((act) => {
      if (act.id === id) {
        const nextState = !act.completed;
        if (nextState && profile.soundEnabled) {
          speakText(`Muito bem! Atividade concluída: ${act.title}`);
        }
        return { ...act, completed: nextState };
      }
      return act;
    });
    onUpdateActivities(updated);
  };

  const moveActivity = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activities.length) return;
    const newItems = [...activities];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);
    onUpdateActivities(newItems);
  };

  const deleteActivity = (id: string) => {
    if (confirm('Deseja remover esta atividade da rotina?')) {
      onUpdateActivities(activities.filter((a) => a.id !== id));
      if (selectedActivity?.id === id) setSelectedActivity(null);
    }
  };

  const openAddModal = () => {
    setEditingActivity(null);
    setFormTitle('');
    setFormTime('');
    setFormPeriod('morning');
    setFormIcon('Sparkles');
    setFormPrepWhat('');
    setFormPrepHelp('');
    setFormPrepWarning('');
    setShowAddModal(true);
  };

  const openEditModal = (act: RoutineActivity, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingActivity(act);
    setFormTitle(act.title);
    setFormTime(act.time || '');
    setFormPeriod(act.period);
    setFormIcon(act.iconName);
    setFormPrepWhat(act.prepWhat || '');
    setFormPrepHelp(act.prepHelp || '');
    setFormPrepWarning(act.prepWarning || '');
    setShowAddModal(true);
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingActivity) {
      const updated = activities.map((act) =>
        act.id === editingActivity.id
          ? {
              ...act,
              title: formTitle.trim(),
              time: formTime.trim() || undefined,
              period: formPeriod,
              iconName: formIcon,
              prepWhat: formPrepWhat.trim() || undefined,
              prepHelp: formPrepHelp.trim() || undefined,
              prepWarning: formPrepWarning.trim() || undefined,
            }
          : act
      );
      onUpdateActivities(updated);
    } else {
      const newActivity: RoutineActivity = {
        id: `act-${Date.now()}`,
        title: formTitle.trim(),
        time: formTime.trim() || undefined,
        period: formPeriod,
        category: formPeriod === 'morning' ? 'Manhã' : formPeriod === 'afternoon' ? 'Tarde' : 'Noite',
        iconName: formIcon,
        completed: false,
        prepWhat: formPrepWhat.trim() || undefined,
        prepHelp: formPrepHelp.trim() || undefined,
        prepWarning: formPrepWarning.trim() || undefined,
      };
      onUpdateActivities([...activities, newActivity]);
    }

    setShowAddModal(false);
  };

  return (
    <div className="space-y-5 pb-32 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cosmic-card p-4 md:p-5 rounded-2xl border border-indigo-900/50 shadow-lg">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 text-[11px] font-semibold border border-amber-300/30 shadow-[0_0_8px_rgba(251,191,36,0.15)]">
            <DynamicIcon name="Calendar" className="w-3.5 h-3.5 text-amber-300" />
            <span>Previsibilidade & Rotina</span>
          </div>
          <h1 className="text-lg md:text-xl font-bold text-white mt-1">
            Nossa Rotina Visual
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Ajude {profile.childName || 'sua criança'} a visualizar o que vem a seguir
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="inline-flex bg-slate-900/60 p-1 rounded-xl border border-indigo-950/80">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                viewMode === 'cards'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cartões grandes
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                viewMode === 'list'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Lista
            </button>
          </div>

          <button
            id="btn-add-activity"
            onClick={openAddModal}
            className="py-2 px-3 rounded-xl bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold shadow-[0_0_12px_rgba(251,191,36,0.25)] transition flex items-center gap-1.5 active:scale-95"
          >
            <DynamicIcon name="Plus" className="w-4 h-4 text-slate-950" />
            <span>Nova atividade</span>
          </button>
        </div>
      </div>

      {/* Period Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {periodOptions.map((item) => {
          const isSelected = periodFilter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPeriodFilter(item.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isSelected
                  ? item.activeClass
                  : 'bg-white/5 text-slate-200 border-white/10 hover:bg-white/10 hover:border-white/25'
              }`}
            >
              <DynamicIcon name={item.icon} className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Activities Grid (Cartões Grandes) or List */}
      {filteredActivities.length === 0 ? (
        <div className="cosmic-card rounded-2xl p-8 text-center border border-indigo-900/40">
          <p className="text-sm text-slate-300">Nenhuma atividade cadastrada para este período.</p>
          <button
            onClick={openAddModal}
            className="mt-3 px-4 py-2 rounded-xl bg-linear-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs inline-flex items-center gap-1 shadow-[0_0_12px_rgba(251,191,36,0.35)] cursor-pointer"
          >
            <DynamicIcon name="Plus" className="w-4 h-4" />
            <span>Adicionar primeira atividade</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredActivities.map((activity, idx) => {
            const isSelected = selectedActivity?.id === activity.id;
            const periodTheme = getPeriodTheme(activity.period);
            const catBadgeClass = getCategoryBadge(activity.category);

            return (
              <div
                key={activity.id}
                onClick={() => setSelectedActivity(activity)}
                className={`rounded-2xl p-4 border transition-all cursor-pointer relative flex flex-col justify-between shadow-md hover:shadow-xl ${
                  activity.completed
                    ? 'border-emerald-500/50 bg-emerald-950/25 opacity-85'
                    : isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-[0_0_20px_rgba(251,191,36,0.3)] bg-[#10193d]'
                    : periodTheme.cardBg
                }`}
              >
                <div>
                  {/* Top line with period badge, category badge & time */}
                  <div className="flex items-center justify-between gap-1.5 mb-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${periodTheme.badge}`}>
                        {activity.period === 'morning'
                          ? 'Manhã'
                          : activity.period === 'afternoon'
                          ? 'Tarde'
                          : 'Noite'}
                      </span>
                      {activity.category && (
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${catBadgeClass}`}>
                          {activity.category}
                        </span>
                      )}
                    </div>
                    {activity.time && (
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${periodTheme.timeBadge}`}>
                        {activity.time}
                      </span>
                    )}
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-3.5 my-2">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${
                        activity.completed
                          ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                          : periodTheme.iconBg
                      }`}
                    >
                      <DynamicIcon name={activity.iconName} className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-sm md:text-base font-extrabold truncate leading-tight ${
                          activity.completed ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {activity.title}
                      </h3>
                      {activity.prepWarning && (
                        <p className="text-[11px] text-amber-300 font-semibold truncate mt-1 flex items-center gap-1">
                          <DynamicIcon name="Sparkles" className="w-3 h-3 shrink-0 text-amber-400 animate-pulse" />
                          <span>Aviso prévio configurado</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card footer controls */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={(e) => toggleComplete(activity.id, e)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activity.completed
                        ? 'bg-emerald-500 text-slate-950 border border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.35)] font-black'
                        : 'bg-white/8 hover:bg-white/15 text-slate-200 border border-white/15'
                    }`}
                  >
                    <DynamicIcon
                      name={activity.completed ? 'Check' : 'CheckSquare'}
                      className="w-3.5 h-3.5"
                    />
                    <span>{activity.completed ? 'Concluída' : 'Marcar concluída'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => openEditModal(activity, e)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
                      title="Editar"
                    >
                      <DynamicIcon name="Edit2" className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteActivity(activity.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                      title="Excluir"
                    >
                      <DynamicIcon name="Trash2" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode */
        <div className="cosmic-card rounded-2xl border border-indigo-900/60 divide-y divide-indigo-950/80 overflow-hidden shadow-md">
          {filteredActivities.map((activity, idx) => {
            const periodTheme = getPeriodTheme(activity.period);
            return (
              <div
                key={activity.id}
                onClick={() => setSelectedActivity(activity)}
                className={`p-3.5 md:p-4 flex items-center justify-between gap-3 hover:bg-white/5 cursor-pointer transition ${
                  activity.completed ? 'bg-white/2 opacity-75' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={(e) => toggleComplete(activity.id, e)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition shrink-0 ${
                      activity.completed
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                        : 'border-white/25 hover:border-emerald-400 bg-white/5'
                    }`}
                  >
                    {activity.completed && <DynamicIcon name="Check" className="w-4 h-4 text-slate-950 font-black" />}
                  </button>

                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${periodTheme.iconBg}`}>
                    <DynamicIcon name={activity.iconName} className="w-4 h-4" />
                  </div>

                  <div className="truncate">
                    <p
                      className={`text-xs md:text-sm font-bold truncate ${
                        activity.completed ? 'line-through text-slate-400' : 'text-white'
                      }`}
                    >
                      {activity.title}
                    </p>
                    <span className="text-[11px] text-slate-300">
                      {activity.time ? `${activity.time} • ` : ''}
                      {activity.period === 'morning'
                        ? 'Manhã'
                        : activity.period === 'afternoon'
                        ? 'Tarde'
                        : 'Noite'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveActivity(idx, 'up');
                    }}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                    title="Subir"
                  >
                    <DynamicIcon name="ChevronUp" className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveActivity(idx, 'down');
                    }}
                    disabled={idx === filteredActivities.length - 1}
                    className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                    title="Descer"
                  >
                    <DynamicIcon name="ChevronDown" className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => openEditModal(activity, e)}
                    className="p-1 text-slate-400 hover:text-amber-300 ml-1"
                  >
                    <DynamicIcon name="Edit2" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recurso importante: Preparação para Mudanças (Drawer / Detalhes ao abrir uma atividade) */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0a1128] rounded-3xl shadow-[0_0_35px_rgba(0,0,0,0.8)] max-w-lg w-full p-6 border border-indigo-900/60 max-h-[90vh] overflow-y-auto text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-950/80">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/15 text-amber-300 border border-amber-300/30 flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.2)]">
                  <DynamicIcon name={selectedActivity.iconName} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedActivity.title}</h3>
                  <span className="text-xs text-slate-400">
                    {selectedActivity.time ? `Horário: ${selectedActivity.time}` : 'Sem horário fixo'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <DynamicIcon name="X" className="w-5 h-5" />
              </button>
            </div>

            {/* Preparation section */}
            <div className="mt-4 space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-400/30 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.15)]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300 mb-1">
                  <DynamicIcon name="Sparkles" className="w-4 h-4 text-sky-400 animate-pulse" />
                  <span>Preparação para mudanças & transição</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Apresentamos essas ideias como possibilidades acolhedoras. Nem toda criança se beneficia das mesmas estratégias; observe o que funciona para {profile.childName || 'sua criança'}.
                </p>
              </div>

              <div className="space-y-3 text-left">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-indigo-950/80">
                  <span className="text-[11px] uppercase font-bold text-amber-300/90 block">
                    O que vai acontecer?
                  </span>
                  <p className="text-xs text-slate-300 mt-1">
                    {selectedActivity.prepWhat ||
                      'Explicar brevemente a ação usando palavras gentis e concretas.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-indigo-950/80">
                  <span className="text-[11px] uppercase font-bold text-sky-300/90 block">
                    O que pode ajudar nessa transição?
                  </span>
                  <p className="text-xs text-slate-300 mt-1">
                    {selectedActivity.prepHelp ||
                      'Dar suporte visual, diminuir estímulos de fundo ou levar um objeto de conforto.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-indigo-950/80">
                  <span className="text-[11px] uppercase font-bold text-emerald-300/90 block">
                    Existe algum aviso prévio que a criança prefere?
                  </span>
                  <p className="text-xs text-slate-300 mt-1">
                    {selectedActivity.prepWarning ||
                      'Exemplo: "Daqui a 5 minutos vamos guardar os blocos para o banho."'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-indigo-950/80 flex items-center justify-between gap-2">
              <button
                onClick={(e) => {
                  toggleComplete(selectedActivity.id, e);
                  setSelectedActivity({
                    ...selectedActivity,
                    completed: !selectedActivity.completed,
                  });
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  selectedActivity.completed
                    ? 'bg-white/10 text-slate-300 hover:bg-white/15'
                    : 'bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)] hover:from-emerald-400 hover:to-emerald-500'
                }`}
              >
                <DynamicIcon name="Check" className="w-4 h-4" />
                <span>
                  {selectedActivity.completed ? 'Desmarcar conclusão' : 'Marcar como concluída'}
                </span>
              </button>

              <button
                onClick={(e) => {
                  openEditModal(selectedActivity, e);
                  setSelectedActivity(null);
                }}
                className="py-2.5 px-3 rounded-xl border border-white/10 text-slate-300 text-xs font-medium hover:bg-white/10"
              >
                Editar detalhes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0a1128] rounded-3xl shadow-[0_0_35px_rgba(0,0,0,0.8)] max-w-md w-full p-6 border border-indigo-900/60 max-h-[92vh] overflow-y-auto text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-950/80">
              <h3 className="text-base font-bold text-white">
                {editingActivity ? 'Editar atividade' : 'Nova atividade da rotina'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <DynamicIcon name="X" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="mt-4 space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome da atividade *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Escovar os dentes, Almoço, Parquinho..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs md:text-sm rounded-xl border border-indigo-900/80 bg-slate-900/80 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Horário (opcional)
                  </label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-indigo-900/80 bg-slate-900/80 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Período do dia
                  </label>
                  <select
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(e.target.value as PeriodType)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-indigo-900/80 bg-slate-900/80 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
                  >
                    <option value="morning">Manhã</option>
                    <option value="afternoon">Tarde</option>
                    <option value="night">Noite</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ícone visual
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {suggestedIcons.map((ic) => (
                    <button
                      key={ic.name}
                      type="button"
                      onClick={() => setFormIcon(ic.name)}
                      title={ic.label}
                      className={`p-2.5 rounded-xl border flex items-center justify-center transition ${
                        formIcon === ic.name
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400 ring-2 ring-amber-400/30 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <DynamicIcon name={ic.name} className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Preparação para Mudanças Inputs */}
              <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-300/25 space-y-2.5">
                <span className="text-[11px] font-bold text-amber-300 uppercase block tracking-wider">
                  Preparação para mudanças (opcional)
                </span>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-0.5">
                    O que vai acontecer?
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Vamos sair para a pracinha"
                    value={formPrepWhat}
                    onChange={(e) => setFormPrepWhat(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-300/30 bg-slate-900/90 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-0.5">
                    O que pode ajudar nessa transição?
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Levar o carrinho de brinquedo favorito"
                    value={formPrepHelp}
                    onChange={(e) => setFormPrepHelp(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-300/30 bg-slate-900/90 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-0.5">
                    Existe algum aviso preferido?
                  </label>
                  <input
                    type="text"
                    placeholder='Ex: "Daqui a 5 minutos vamos guardar os brinquedos"'
                    value={formPrepWarning}
                    onChange={(e) => setFormPrepWarning(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-300/30 bg-slate-900/90 text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 px-3 rounded-xl border border-white/10 text-slate-300 text-xs font-medium hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold shadow-[0_0_12px_rgba(251,191,36,0.3)] transition"
                >
                  {editingActivity ? 'Salvar alterações' : 'Adicionar à rotina'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
