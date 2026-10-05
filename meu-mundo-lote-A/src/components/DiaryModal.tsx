import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { ObservationEntry, FamilyProfile, MoodScoreType } from '../types';
import { MOOD_LEVELS, getMoodLevel } from '../data/initialData';
import { DynamicIcon } from './IconHelper';

interface DiaryModalProps {
  profile: FamilyProfile;
  observations: ObservationEntry[];
  onClose: () => void;
  onSaveObservations: (entries: ObservationEntry[]) => void;
}

export const DiaryModal: React.FC<DiaryModalProps> = ({
  profile,
  observations,
  onClose,
  onSaveObservations,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const [chartFilterCategoryOnly, setChartFilterCategoryOnly] = useState(false);
  const [highlightedEntryId, setHighlightedEntryId] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // New entry form states
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [formCategory, setFormCategory] = useState<ObservationEntry['category']>('Mudança de rotina');
  const [formMoodScore, setFormMoodScore] = useState<MoodScoreType>(3);
  const [formSituation, setFormSituation] = useState('');
  const [formBeforeContext, setFormBeforeContext] = useState('');
  const [formReaction, setFormReaction] = useState('');
  const [formWhatHelped, setFormWhatHelped] = useState('');
  const [formToDiscuss, setFormToDiscuss] = useState('');

  const categories = [
    'Mudança de rotina',
    'Sensorial',
    'Comunicação',
    'Alimentação',
    'Sono',
    'Interação',
    'Outro',
  ];

  const filteredObservations = useMemo(() => {
    return observations.filter((entry) => {
      if (selectedCategory === 'all') return true;
      return entry.category === selectedCategory;
    });
  }, [observations, selectedCategory]);

  const getDiaryCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Mudança de rotina':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/40';
      case 'Sensorial':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/40';
      case 'Comunicação':
        return 'bg-sky-500/20 text-sky-300 border-sky-400/40';
      case 'Alimentação':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';
      case 'Sono':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40';
      case 'Interação':
        return 'bg-pink-500/20 text-pink-300 border-pink-400/40';
      default:
        return 'bg-teal-500/20 text-teal-300 border-teal-400/40';
    }
  };

  // Prepare chronological data for Recharts Line Chart
  const chartData = useMemo(() => {
    const dataSource = chartFilterCategoryOnly && selectedCategory !== 'all'
      ? filteredObservations
      : observations;

    return [...dataSource]
      .map((obs) => {
        const moodDef = getMoodLevel(obs.moodScore);
        const dateParts = obs.date ? obs.date.split('-') : ['2026', '01', '01'];
        const timeParts = (obs.time || '12:00').split(':');
        const year = parseInt(dateParts[0], 10) || 2026;
        const month = (parseInt(dateParts[1], 10) || 1) - 1;
        const day = parseInt(dateParts[2], 10) || 1;
        const hours = parseInt(timeParts[0], 10) || 12;
        const minutes = parseInt(timeParts[1], 10) || 0;
        const timestamp = new Date(year, month, day, hours, minutes).getTime();

        const shortDate = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}`;
        const displayDateTime = `${shortDate}${obs.time ? ` às ${obs.time}` : ''}`;

        return {
          id: obs.id,
          timestamp,
          shortDate,
          displayDateTime,
          moodScore: obs.moodScore ?? 3,
          moodLabel: obs.moodLabel || moodDef.label,
          emoji: moodDef.emoji,
          shortLabel: moodDef.shortLabel,
          colorHex: moodDef.colorHex,
          badgeBg: moodDef.badgeBg,
          badgeText: moodDef.badgeText,
          badgeBorder: moodDef.badgeBorder,
          category: obs.category,
          situation: obs.situation,
          whatHelped: obs.whatHelped,
          toDiscuss: obs.toDiscussWithProfessional,
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [observations, filteredObservations, chartFilterCategoryOnly, selectedCategory]);

  // Statistics calculation for the mood chart header
  const moodStats = useMemo(() => {
    if (chartData.length === 0) return null;
    const scores = chartData.map((d) => d.moodScore);
    const sum = scores.reduce((acc, curr) => acc + curr, 0);
    const avg = sum / scores.length;
    const latest = chartData[chartData.length - 1];

    // Determine general trend: comparing last half vs first half
    let trend: 'improving' | 'stable' | 'attention' = 'stable';
    if (chartData.length >= 2) {
      const firstScore = chartData[0].moodScore;
      const lastScore = latest.moodScore;
      if (lastScore > firstScore) trend = 'improving';
      else if (lastScore < firstScore) trend = 'attention';
    }

    return {
      avg: avg.toFixed(1),
      count: chartData.length,
      latest,
      trend,
    };
  }, [chartData]);

  // Scroll to and highlight selected observation
  const handleScrollToObservation = (id: string) => {
    setHighlightedEntryId(id);
    const el = document.getElementById(`entry-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSituation.trim()) return;

    const selectedMood = MOOD_LEVELS.find((m) => m.score === formMoodScore) || MOOD_LEVELS[2];

    const newEntry: ObservationEntry = {
      id: `obs-${Date.now()}`,
      date: formDate,
      time: formTime,
      category: formCategory,
      situation: formSituation.trim(),
      beforeContext: formBeforeContext.trim() || 'Não especificado',
      reaction: formReaction.trim() || 'Não especificado',
      whatHelped: formWhatHelped.trim() || 'Observado com acolhimento',
      toDiscussWithProfessional: formToDiscuss.trim() || undefined,
      moodScore: formMoodScore,
      moodLabel: selectedMood.label,
    };

    onSaveObservations([newEntry, ...observations]);
    // Reset form
    setFormSituation('');
    setFormBeforeContext('');
    setFormReaction('');
    setFormWhatHelped('');
    setFormToDiscuss('');
    setFormMoodScore(3);
    setShowAddForm(false);
  };

  const deleteEntry = (id: string) => {
    if (confirm('Deseja excluir esta anotação do diário?')) {
      onSaveObservations(observations.filter((o) => o.id !== id));
      if (highlightedEntryId === id) setHighlightedEntryId(null);
    }
  };

  // Export summary for healthcare professionals
  const handleExportSummary = () => {
    const header = `=== DIÁRIO DE OBSERVAÇÕES E EVOLUÇÃO DO HUMOR — MEU MUNDO ===\nCriança: ${profile.childName || 'Criança'} (Idade: ${profile.childAge || 'N/A'})\nResponsável: ${profile.parentName || 'Responsável'}\nData de geração: ${new Date().toLocaleDateString()}\nTotal de observações: ${observations.length}\n${
      moodStats ? `Média geral de regulação emocional: ${moodStats.avg}/5\n` : ''
    }\n`;

    const body = observations
      .map((obs, idx) => {
        const moodDef = getMoodLevel(obs.moodScore);
        return `[Registro #${idx + 1}] - Data: ${obs.date} às ${obs.time || '--:--'} | Categoria: ${obs.category}
• Estado de Humor/Regulação: ${moodDef.emoji} ${obs.moodLabel || moodDef.label} (${obs.moodScore ?? 3}/5)
• Situação: ${obs.situation}
• O que aconteceu antes: ${obs.beforeContext}
• Como a criança reagiu: ${obs.reaction}
• O que pareceu ajudar: ${obs.whatHelped}
• Para conversar com o profissional: ${obs.toDiscussWithProfessional || 'Nenhum ponto anotado'}
--------------------------------------------------`;
      })
      .join('\n\n');

    const fullText = header + body;
    navigator.clipboard.writeText(fullText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  // Custom Tick on Y-Axis with Emojis
  const renderCustomYAxisTick = (tickProps: any) => {
    const { x, y, payload } = tickProps;
    const moodDef = MOOD_LEVELS.find((m) => m.score === payload.value);
    if (!moodDef) return null;

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={-6} y={4} textAnchor="end" className="text-xs select-none">
          <tspan className="text-[13px]">{moodDef.emoji}</tspan>
        </text>
      </g>
    );
  };

  // Custom Dots along the Line Chart colored by mood state
  const renderCustomDot = (dotProps: any) => {
    const { cx, cy, payload } = dotProps;
    if (!cx || !cy || !payload) return null;
    const isSelected = highlightedEntryId === payload.id;

    return (
      <g
        key={`dot-${payload.id}`}
        className="cursor-pointer transition-transform hover:scale-125"
        onClick={() => handleScrollToObservation(payload.id)}
      >
        {isSelected && (
          <circle
            cx={cx}
            cy={cy}
            r={10}
            fill="none"
            stroke="#fbbf24"
            strokeWidth={2}
            strokeDasharray="3 2"
          />
        )}
        <circle
          cx={cx}
          cy={cy}
          r={isSelected ? 6.5 : 5}
          fill={payload.colorHex || '#38bdf8'}
          stroke="#0a1128"
          strokeWidth={2}
        />
      </g>
    );
  };

  // Custom Tooltip for Recharts
  const CustomMoodTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0b132b]/95 border border-indigo-500/40 rounded-xl p-3 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-md max-w-xs text-left z-50 animate-fadeIn pointer-events-none">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 mb-1.5">
            <span className="text-[11px] font-medium text-slate-300">📅 {data.displayDateTime}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-slate-200">
              {data.category}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{data.emoji}</span>
            <div>
              <div className="text-xs font-bold text-white leading-tight">{data.moodLabel}</div>
              <span
                className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded border mt-0.5 ${data.badgeBg} ${data.badgeText} ${data.badgeBorder}`}
              >
                Nível {data.moodScore} de 5
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-1">
            <strong className="text-amber-300">Situação:</strong> {data.situation}
          </p>

          {data.whatHelped && (
            <p className="text-[10px] text-emerald-300 line-clamp-2 leading-tight">
              ✨ <strong className="text-emerald-200">Ajudou:</strong> {data.whatHelped}
            </p>
          )}

          <div className="text-[9px] text-amber-400/90 pt-1.5 mt-1 border-t border-white/5 flex items-center gap-1 font-medium">
            <span>👇 Clique no ponto para localizar anotação</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0a1128]/95 backdrop-blur-xl rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.85)] max-w-3xl w-full flex flex-col max-h-[94vh] border border-indigo-900/60 overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-indigo-950/80 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/15 text-amber-300 flex items-center justify-center border border-amber-300/30 shadow-[0_0_10px_rgba(251,191,36,0.2)] shrink-0">
              <DynamicIcon name="BookOpen" className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                <span>Diário de Observações da Família</span>
              </h2>
              <p className="text-xs text-slate-400">
                Identifique padrões cotidianos e a evolução do humor da criança ao longo do tempo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSummary}
              title="Copiar resumo completo para levar à consulta"
              className="py-1.5 px-3 rounded-xl border border-amber-300/30 bg-amber-400/15 text-amber-200 text-xs font-semibold hover:bg-amber-400/25 transition flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <DynamicIcon name="Download" className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Exportar resumo</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Fechar"
            >
              <DynamicIcon name="X" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {copiedNotification && (
          <div className="bg-amber-400 text-slate-950 text-xs px-4 py-2 font-bold text-center animate-fadeIn shadow-md">
            ✓ Resumo formatado copiado para a área de transferência! Cole no WhatsApp ou imprima para a consulta.
          </div>
        )}

        {/* Ethical clarification statement */}
        <div className="px-4 py-2.5 bg-slate-900/80 border-b border-indigo-950/80 text-left">
          <p className="text-[11px] text-slate-300 leading-tight">
            💡 <strong className="text-amber-300">Propósito do diário:</strong> Este espaço serve para ajudar a família a perceber o que funciona e organizar informações para conversas com profissionais (terapeutas, fonoaudiólogos, neuropediatras). Ele não deve ser usado para rotular a criança.
          </p>
        </div>

        {/* Action bar with Category filter and New Entry button */}
        <div className="p-3 md:p-4 border-b border-indigo-950/80 flex flex-wrap items-center justify-between gap-2 bg-slate-900/40">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-[0_0_8px_rgba(251,191,36,0.25)]'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              Todos ({observations.length})
            </button>
            {categories.map((c) => {
              const count = observations.filter((o) => o.category === c).length;
              return (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition whitespace-nowrap ${
                    selectedCategory === c
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-[0_0_8px_rgba(251,191,36,0.25)]'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {c} {count > 0 ? `(${count})` : ''}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChart(!showChart)}
              className={`py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 ${
                showChart
                  ? 'border-sky-400/40 bg-sky-500/20 text-sky-200'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
              title="Exibir ou ocultar o gráfico de evolução do humor"
            >
              <DynamicIcon name="TrendingUp" className="w-3.5 h-3.5 text-sky-400" />
              <span>{showChart ? 'Gráfico ativo' : 'Ver gráfico'}</span>
            </button>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="py-1.5 px-3 rounded-xl bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-[0_0_12px_rgba(251,191,36,0.25)] transition active:scale-95"
            >
              <DynamicIcon name={showAddForm ? 'X' : 'Plus'} className="w-3.5 h-3.5 text-slate-950" />
              <span>{showAddForm ? 'Fechar formulário' : 'Novo registro'}</span>
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="p-3 sm:p-4 md:p-5 overflow-y-auto space-y-4 flex-1">
          {/* RECHARTS LINE CHART SECTION */}
          {showChart && (
            <div className="bg-[#0c1538]/90 rounded-2xl p-3.5 sm:p-4 border border-indigo-900/60 shadow-lg text-left animate-fadeIn space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-950 pb-2.5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                    <DynamicIcon name="Activity" className="w-3.5 h-3.5 text-sky-400" />
                    <span>Evolução do Humor ao Longo do Tempo</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Oscilações de bem-estar emocional e regulação sensorial nas observações
                  </p>
                </div>

                {/* Filter toggle and quick stats */}
                <div className="flex flex-wrap items-center gap-2">
                  {selectedCategory !== 'all' && (
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer bg-slate-900/80 px-2 py-1 rounded-lg border border-indigo-900/60">
                      <input
                        type="checkbox"
                        checked={chartFilterCategoryOnly}
                        onChange={(e) => setChartFilterCategoryOnly(e.target.checked)}
                        className="rounded text-amber-400 focus:ring-0 bg-slate-950"
                      />
                      <span>Filtrar apenas "{selectedCategory}"</span>
                    </label>
                  )}

                  {moodStats && (
                    <div className="flex items-center gap-2 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-indigo-900/60 text-[11px]">
                      <span className="text-slate-400">Média:</span>
                      <span className="font-bold text-amber-300">{moodStats.avg} / 5</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-slate-400">Pontos:</span>
                      <span className="font-bold text-sky-300">{moodStats.count}</span>
                    </div>
                  )}
                </div>
              </div>

              {chartData.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Nenhum dado disponível para o gráfico nesta seleção.
                </div>
              ) : (
                <>
                  <div className="w-full h-[220px] sm:h-[240px] pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 12, right: 18, left: -22, bottom: 6 }}
                      >
                        <defs>
                          <linearGradient id="moodLineGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#38bdf8" />
                            <stop offset="50%" stopColor="#fbbf24" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255, 255, 255, 0.08)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="shortDate"
                          stroke="#94a3b8"
                          tick={{ fill: '#94a3b8', fontSize: 10 }}
                          tickLine={false}
                          axisLine={{ stroke: 'rgba(255, 255, 255, 0.12)' }}
                        />
                        <YAxis
                          domain={[1, 5]}
                          ticks={[1, 2, 3, 4, 5]}
                          stroke="#94a3b8"
                          tickLine={false}
                          axisLine={{ stroke: 'rgba(255, 255, 255, 0.12)' }}
                          tick={renderCustomYAxisTick}
                        />
                        <ReferenceLine
                          y={3}
                          stroke="#38bdf8"
                          strokeDasharray="4 4"
                          strokeOpacity={0.35}
                          label={{
                            value: 'Equilíbrio',
                            fill: '#38bdf8',
                            fontSize: 9,
                            position: 'insideTopRight',
                            opacity: 0.7,
                          }}
                        />
                        <Tooltip content={<CustomMoodTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="moodScore"
                          stroke="url(#moodLineGrad)"
                          strokeWidth={3}
                          dot={renderCustomDot}
                          activeDot={{
                            r: 7,
                            stroke: '#ffffff',
                            strokeWidth: 2,
                            fill: '#fbbf24',
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Mood Scale Legend */}
                  <div className="pt-2 border-t border-indigo-950/80 flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
                    <span className="text-slate-400 font-medium hidden sm:inline">
                      Escala de humor:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      {MOOD_LEVELS.map((m) => (
                        <div
                          key={m.score}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-900/60 border border-white/5 text-slate-300"
                        >
                          <span>{m.emoji}</span>
                          <span className="font-semibold text-white/90">{m.score}</span>
                          <span className="text-slate-400 hidden md:inline">{m.shortLabel}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* New Entry Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddEntry}
              className="bg-slate-900/90 rounded-2xl p-4 border border-indigo-900/70 space-y-3.5 text-left animate-fadeIn shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-indigo-950 pb-2">
                <h3 className="text-xs font-bold uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                  <DynamicIcon name="PlusCircle" className="w-4 h-4 text-amber-300" />
                  <span>Adicionar observação do dia</span>
                </h3>
                <span className="text-[10px] text-slate-400">Preencha com carinho e acolhimento</span>
              </div>

              {/* Mood selector buttons */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Estado de humor / regulação da criança na situação *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {MOOD_LEVELS.map((m) => {
                    const isSelected = formMoodScore === m.score;
                    return (
                      <button
                        key={m.score}
                        type="button"
                        onClick={() => setFormMoodScore(m.score)}
                        className={`p-2 rounded-xl border text-left transition flex flex-col items-center sm:items-start text-center sm:text-left ${
                          isSelected
                            ? `${m.badgeBg} ${m.badgeBorder} ring-2 ring-amber-400 shadow-md`
                            : 'bg-slate-950/60 border-white/10 hover:bg-white/5'
                        }`}
                      >
                        <span className="text-lg">{m.emoji}</span>
                        <span className="text-[11px] font-bold text-white mt-1 leading-tight">
                          {m.shortLabel}
                        </span>
                        <span className="text-[9px] text-slate-400 mt-0.5">Nível {m.score} de 5</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-amber-200/90 mt-1.5 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-300/20">
                  💡 <strong>{MOOD_LEVELS.find((m) => m.score === formMoodScore)?.label}:</strong>{' '}
                  {formMoodScore === 1 && 'Momento de crise intensa, choro, desespero ou extrema sobrecarga sensorial.'}
                  {formMoodScore === 2 && 'Inquietação, desconforto corporal, agitação ou receio com o ambiente.'}
                  {formMoodScore === 3 && 'Em equilíbrio estável, concentrado em regulação ou sem reações bruscas.'}
                  {formMoodScore === 4 && 'Tranquilo, cooperativo, seguro e calmo no ambiente.'}
                  {formMoodScore === 5 && 'Radiante, expressando alegria, entusiasmo, afeto e conexão.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
                    Data
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-indigo-900/80 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
                    Horário aproximado
                  </label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-indigo-900/80 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
                    Categoria
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-indigo-900/80 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c} className="bg-slate-900 text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
                  1. Situação observada *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mudança no trajeto de volta para casa..."
                  value={formSituation}
                  onChange={(e) => setFormSituation(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-indigo-900/80 bg-slate-950 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
                  2. O que aconteceu antes? (ambiente, barulhos, cansaço...)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Havia barulho alto de obras na rua e já estava perto da hora do almoço..."
                  value={formBeforeContext}
                  onChange={(e) => setFormBeforeContext(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-indigo-900/80 bg-slate-950 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
                  3. Como a criança se comunicou ou reagiu?
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Cobriu os olhos e pediu para sentar no chão..."
                  value={formReaction}
                  onChange={(e) => setFormReaction(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-indigo-900/80 bg-slate-950 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
                  4. O que pareceu ajudar?
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Oferecer água, falar com voz baixa e esperar 5 minutos em silêncio..."
                  value={formWhatHelped}
                  onChange={(e) => setFormWhatHelped(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-indigo-900/80 bg-slate-950 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">
                  5. O que a família gostaria de conversar com o profissional? (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Perguntar à terapeuta sobre dicas para barulhos de trânsito..."
                  value={formToDiscuss}
                  onChange={(e) => setFormToDiscuss(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-indigo-900/80 bg-slate-950 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="py-1.5 px-3 rounded-lg border border-white/10 text-slate-300 hover:bg-white/10 text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-4 rounded-lg bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold shadow-[0_0_12px_rgba(251,191,36,0.25)] transition active:scale-95"
                >
                  Salvar anotação
                </button>
              </div>
            </form>
          )}

          {/* List of Entries */}
          {filteredObservations.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Nenhuma anotação nesta categoria. Clique em "Novo registro" para anotar.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>
                  Mostrando {filteredObservations.length} anotaç{filteredObservations.length === 1 ? 'ão' : 'ões'}
                </span>
                {highlightedEntryId && (
                  <button
                    onClick={() => setHighlightedEntryId(null)}
                    className="text-amber-300 hover:underline text-[11px]"
                  >
                    Limpar destaque do gráfico
                  </button>
                )}
              </div>

              {filteredObservations.map((obs) => {
                const moodDef = getMoodLevel(obs.moodScore);
                const isHighlighted = highlightedEntryId === obs.id;

                return (
                  <div
                    key={obs.id}
                    id={`entry-${obs.id}`}
                    className={`p-4 rounded-2xl bg-[#0f1738]/90 border shadow-md text-left space-y-2.5 transition-all ${
                      isHighlighted
                        ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.25)] bg-[#141f4a]'
                        : 'border-indigo-900/50 hover:border-indigo-800'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Category badge */}
                        <span
                          className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase ${getDiaryCategoryColor(
                            obs.category
                          )}`}
                        >
                          {obs.category}
                        </span>

                        {/* Mood level badge */}
                        <span
                          className={`px-2 py-0.5 rounded-md border text-[10px] font-bold flex items-center gap-1 ${moodDef.badgeBg} ${moodDef.badgeText} ${moodDef.badgeBorder}`}
                        >
                          <span>{moodDef.emoji}</span>
                          <span>{obs.moodLabel || moodDef.label}</span>
                          <span className="opacity-80">({obs.moodScore ?? 3}/5)</span>
                        </span>

                        <span className="text-xs text-slate-400">
                          {obs.date} {obs.time ? `às ${obs.time}` : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => deleteEntry(obs.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Excluir anotação"
                        >
                          <DynamicIcon name="Trash2" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-white">{obs.situation}</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-900/60 p-2.5 rounded-xl border border-indigo-950/80">
                        <span className="font-semibold text-amber-300/80 block text-[10px] uppercase">
                          O que aconteceu antes:
                        </span>
                        <p className="text-slate-300 mt-0.5 leading-relaxed">{obs.beforeContext}</p>
                      </div>

                      <div className="bg-slate-900/60 p-2.5 rounded-xl border border-indigo-950/80">
                        <span className="font-semibold text-amber-300/80 block text-[10px] uppercase">
                          Reação / Comunicação da criança:
                        </span>
                        <p className="text-slate-300 mt-0.5 leading-relaxed">{obs.reaction}</p>
                      </div>
                    </div>

                    <div className="bg-sky-500/10 p-2.5 rounded-xl border border-sky-400/30 text-xs">
                      <span className="font-semibold text-sky-300 block text-[10px] uppercase">
                        ✨ O que pareceu ajudar:
                      </span>
                      <p className="text-slate-200 mt-0.5 leading-relaxed">{obs.whatHelped}</p>
                    </div>

                    {obs.toDiscussWithProfessional && (
                      <div className="bg-amber-400/10 p-2 rounded-lg border border-amber-300/30 text-xs flex items-start gap-1.5">
                        <DynamicIcon name="Sparkles" className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                        <span className="text-amber-200">
                          <strong>Para a consulta:</strong> {obs.toDiscussWithProfessional}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
