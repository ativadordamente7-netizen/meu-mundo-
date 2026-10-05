import React, { useState } from 'react';
import { CommunicationCard, CommCategoryType, FamilyProfile } from '../types';
import { DynamicIcon } from './IconHelper';
import { speakText } from '../utils/speech';
import { shrinkImage } from '../utils/image';

interface CommunicationTabProps {
  profile: FamilyProfile;
  cards: CommunicationCard[];
  onUpdateCards: (cards: CommunicationCard[]) => void;
}

export const CommunicationTab: React.FC<CommunicationTabProps> = ({
  profile,
  cards,
  onUpdateCards,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CommCategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [phraseStrip, setPhraseStrip] = useState<CommunicationCard[]>([]);
  const [enlargedCard, setEnlargedCard] = useState<CommunicationCard | null>(null);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);

  // New card form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'basic' | 'choices' | 'feelings' | 'free'>('choices');
  const [newIcon, setNewIcon] = useState('Smile');
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);

  const getCategoryStyle = (cat: string) => {
    switch (cat) {
      case 'basic':
        return {
          cardClass: 'card-category-basic',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
          badgeText: 'Básico',
          iconBg: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300',
          activeFilter: 'bg-emerald-400 text-slate-950 border-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.45)] font-bold',
          tagColor: 'text-emerald-300',
        };
      case 'choices':
        return {
          cardClass: 'card-category-choices',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
          badgeText: 'Escolhas',
          iconBg: 'bg-amber-500/20 border-amber-400/50 text-amber-300',
          activeFilter: 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.45)] font-bold',
          tagColor: 'text-amber-300',
        };
      case 'feelings':
        return {
          cardClass: 'card-category-feelings',
          badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
          badgeText: 'Sentimentos',
          iconBg: 'bg-rose-500/20 border-rose-400/50 text-rose-300',
          activeFilter: 'bg-rose-500 text-white border-rose-400 shadow-[0_0_14px_rgba(244,114,182,0.45)] font-bold',
          tagColor: 'text-rose-300',
        };
      case 'free':
      default:
        return {
          cardClass: 'card-category-free',
          badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
          badgeText: 'Comunicação',
          iconBg: 'bg-sky-500/20 border-sky-400/50 text-sky-300',
          activeFilter: 'bg-sky-400 text-slate-950 border-sky-300 shadow-[0_0_14px_rgba(56,189,248,0.45)] font-bold',
          tagColor: 'text-sky-300',
        };
    }
  };

  const categories = [
    { id: 'all', label: 'Todos os cartões', icon: 'Sparkles', activeClass: 'bg-linear-to-r from-pink-500 via-amber-400 to-sky-400 text-slate-950 border-white/40 shadow-[0_0_14px_rgba(251,191,36,0.45)] font-bold' },
    { id: 'favorites', label: 'Favoritos', icon: 'Star', activeClass: 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.4)] font-bold' },
    { id: 'basic', label: 'Necessidades básicas', icon: 'GlassWater', activeClass: 'bg-emerald-400 text-slate-950 border-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.45)] font-bold' },
    { id: 'choices', label: 'Escolhas & Lazer', icon: 'Gamepad2', activeClass: 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.45)] font-bold' },
    { id: 'feelings', label: 'Sentimentos & Estados', icon: 'Heart', activeClass: 'bg-rose-500 text-white border-rose-400 shadow-[0_0_14px_rgba(244,114,182,0.45)] font-bold' },
    { id: 'free', label: 'Comunicação livre', icon: 'CheckCircle2', activeClass: 'bg-sky-400 text-slate-950 border-sky-300 shadow-[0_0_14px_rgba(56,189,248,0.45)] font-bold' },
  ];

  const handleCardClick = (card: CommunicationCard) => {
    // Speak card if sound enabled
    if (profile.soundEnabled) {
      speakText(card.title, true);
    }
    // Add to phrase strip
    setPhraseStrip((prev) => [...prev, card]);
  };

  const handleSpeakPhrase = () => {
    if (phraseStrip.length === 0) return;
    const phrase = phraseStrip.map((c) => c.title).join(' ');
    speakText(phrase, true);
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = cards.map((c) =>
      c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
    );
    onUpdateCards(updated);
  };

  const filteredCards = cards.filter((card) => {
    if (selectedCategory === 'favorites' && !card.isFavorite) return false;
    if (selectedCategory !== 'all' && selectedCategory !== 'favorites' && card.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim() && !card.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Call server to generate image with gemini-3.1-flash-image
  const handleGenerateAiImage = async () => {
    const promptToUse = (imagePrompt || newTitle).trim();
    if (!promptToUse || generatingImage) return;

    setGeneratingImage(true);
    try {
      const response = await fetch('/api/generate-card-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptToUse }),
      });

      if (!response.ok) {
        throw new Error('Falha ao gerar imagem');
      }

      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedImageUrl(await shrinkImage(data.imageUrl));
      }
    } catch (err) {
      console.error('Erro na geração de imagem IA:', err);
      alert('Não foi possível gerar a imagem no momento. Você ainda pode salvar o cartão com um ícone!');
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleCreateCustomCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newCard: CommunicationCard = {
      id: `custom-comm-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      iconName: newIcon,
      colorBg: 'bg-teal-50 hover:bg-teal-100',
      colorText: 'text-teal-900',
      colorBorder: 'border-teal-200',
      isFavorite: true,
      custom: true,
      imageUrl: generatedImageUrl || undefined,
    };

    onUpdateCards([...cards, newCard]);
    setNewTitle('');
    setImagePrompt('');
    setGeneratedImageUrl(null);
    setShowAddCustomModal(false);
  };

  const deleteCard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Deseja excluir este cartão personalizado?')) {
      onUpdateCards(cards.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-5 pb-32 animate-fadeIn">
      {/* Header Info */}
      <div className="cosmic-card p-4 md:p-5 rounded-2xl border border-indigo-900/50 shadow-lg text-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-400/10 text-sky-300 text-[11px] font-semibold border border-sky-300/30 shadow-[0_0_8px_rgba(56,189,248,0.15)]">
              <DynamicIcon name="MessageSquare" className="w-3.5 h-3.5 text-sky-300" />
              <span>Comunicação Aumentativa & Alternativa (CAA)</span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-white mt-1">
              Cartões de Comunicação
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Toque no cartão para ouvir e expressar intenções com facilidade
            </p>
          </div>

          <button
            id="btn-add-custom-card"
            onClick={() => {
              setNewTitle('');
              setImagePrompt('');
              setGeneratedImageUrl(null);
              setShowAddCustomModal(true);
            }}
            className="py-2 px-3 rounded-xl bg-linear-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white text-xs font-bold shadow-[0_0_12px_rgba(56,189,248,0.25)] transition flex items-center gap-1.5 self-start sm:self-auto active:scale-95"
          >
            <DynamicIcon name="Plus" className="w-4 h-4" />
            <span>Criar cartão com IA</span>
          </button>
        </div>

        {/* Respeitosa mensagem */}
        <div className="mt-3.5 p-3 rounded-xl bg-sky-500/10 border border-sky-400/30 flex items-start gap-2.5 text-left shadow-[0_0_10px_rgba(56,189,248,0.1)]">
          <DynamicIcon name="Heart" className="w-4 h-4 text-sky-300 shrink-0 mt-0.5" />
          <p className="text-xs text-sky-100 leading-relaxed font-medium">
            "Cada pessoa se comunica de um jeito. Use este espaço da forma que fizer sentido para {profile.childName || 'sua criança'}."
          </p>
        </div>
      </div>

      {/* Faixa de Frase / Seleção de Imagens (Sentence Strip) */}
      <div className="cosmic-card p-3.5 md:p-4 rounded-2xl border border-indigo-900/50 shadow-lg relative overflow-hidden">
        {/* Subtle colorful aura in phrase strip container */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <DynamicIcon name="Sparkles" className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Frase montada por seleção</span>
          </span>
          <div className="flex items-center gap-2">
            {phraseStrip.length > 0 && (
              <>
                <button
                  id="btn-speak-phrase"
                  onClick={handleSpeakPhrase}
                  className="px-3 py-1.5 rounded-xl bg-linear-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(52,211,153,0.4)] active:scale-95 cursor-pointer"
                >
                  <DynamicIcon name="Volume2" className="w-4 h-4 text-slate-950" />
                  <span>Falar frase</span>
                </button>
                <button
                  onClick={() => setPhraseStrip([])}
                  className="px-2.5 py-1.5 rounded-xl border border-white/15 text-slate-200 hover:text-white text-xs font-medium hover:bg-white/10"
                >
                  Limpar
                </button>
              </>
            )}
          </div>
        </div>

        <div className="min-h-[64px] bg-[#070d24]/85 rounded-xl p-2.5 border border-dashed border-indigo-900/70 flex items-center gap-2 overflow-x-auto relative z-10">
          {phraseStrip.length === 0 ? (
            <span className="text-xs text-slate-300 italic mx-auto">
              Toque nos cartões coloridos abaixo para montar sua frase visual
            </span>
          ) : (
            phraseStrip.map((item, idx) => {
              const itemStyle = getCategoryStyle(item.category);
              return (
                <div
                  key={`${item.id}-${idx}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${itemStyle.cardClass} text-white shadow-md shrink-0`}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 rounded-md object-cover border border-white/20"
                    />
                  ) : (
                    <DynamicIcon name={item.iconName} className={`w-4 h-4 ${itemStyle.tagColor}`} />
                  )}
                  <span className="text-xs font-bold text-white">{item.title}</span>
                  <button
                    onClick={() =>
                      setPhraseStrip((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="p-0.5 text-slate-300 hover:text-white ml-1"
                  >
                    <DynamicIcon name="X" className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Category Tabs & Search */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as CommCategoryType)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? cat.activeClass
                    : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10 hover:border-white/25'
                }`}
              >
                <DynamicIcon name={cat.icon} className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar cartão por palavra..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 pl-9 rounded-xl border border-indigo-900/80 bg-slate-900/80 text-white placeholder:text-slate-400 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
          />
          <DynamicIcon
            name="Search"
            className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
          />
        </div>
      </div>

      {/* Grid de Cartões Multicoloridos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filteredCards.map((card) => {
          const catStyle = getCategoryStyle(card.category);
          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`${catStyle.cardClass} relative p-3 rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-between text-center select-none active:scale-95 group min-h-[148px] shadow-md`}
            >
              {/* Top action row */}
              <div className="w-full flex items-center justify-between">
                <button
                  onClick={(e) => toggleFavorite(card.id, e)}
                  className={`p-1 rounded-lg transition ${
                    card.isFavorite
                      ? 'text-amber-300 bg-amber-400/20 shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={card.isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
                >
                  <DynamicIcon name="Star" className="w-4 h-4 fill-current" />
                </button>

                {/* Category Pill Tag */}
                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md border ${catStyle.badgeClass}`}>
                  {catStyle.badgeText}
                </span>

                <div className="flex items-center gap-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEnlargedCard(card);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                    title="Modo ampliado"
                  >
                    <DynamicIcon name="Maximize2" className="w-3.5 h-3.5" />
                  </button>
                  {card.custom && (
                    <button
                      onClick={(e) => deleteCard(card.id, e)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                      title="Excluir"
                    >
                      <DynamicIcon name="Trash2" className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Visual Icon or AI Generated Image with Category Theme Glow */}
              <div
                className={`my-2 p-1.5 rounded-2xl border shadow-md group-hover:scale-110 transition-all flex items-center justify-center overflow-hidden w-16 h-16 ${catStyle.iconBg}`}
              >
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <DynamicIcon name={card.iconName} className="w-8 h-8" />
                )}
              </div>

              {/* Label */}
              <span className="text-xs md:text-sm font-extrabold leading-tight text-white group-hover:text-amber-100 transition-colors">
                {card.title}
              </span>

              {/* Voice hint indicator */}
              <span className={`text-[10px] font-bold ${catStyle.tagColor} mt-1 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity`}>
                <DynamicIcon name="Volume2" className="w-3 h-3" />
                <span>Ouvir</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Modo de Visualização Ampliada (Full screen focus card) */}
      {enlargedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0a1128] rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_35px_rgba(0,0,0,0.8)] border border-indigo-900/60 flex flex-col items-center text-slate-200">
            <button
              onClick={() => setEnlargedCard(null)}
              className="self-end p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <DynamicIcon name="X" className="w-6 h-6" />
            </button>

            <div className="w-36 h-36 rounded-3xl bg-amber-400/15 border border-amber-300/40 flex items-center justify-center my-4 shadow-[0_0_25px_rgba(251,191,36,0.25)] overflow-hidden">
              {enlargedCard.imageUrl ? (
                <img
                  src={enlargedCard.imageUrl}
                  alt={enlargedCard.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <DynamicIcon name={enlargedCard.iconName} className="w-16 h-16 text-amber-300 animate-gentleFloat" />
              )}
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-tight mt-2">
              {enlargedCard.title}
            </h2>

            <p className="text-xs text-slate-400 mt-2">
              Cartão em foco para apoiar a comunicação direta
            </p>

            <div className="mt-6 flex gap-2 w-full">
              <button
                onClick={() => speakText(enlargedCard.title, true)}
                className="flex-1 py-3 px-4 rounded-xl bg-linear-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.3)] active:scale-95"
              >
                <DynamicIcon name="Volume2" className="w-5 h-5 text-slate-950" />
                <span>Ouvir em voz alta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar Cartão Personalizado com Suporte a IA para Imagens */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0a1128] rounded-3xl shadow-[0_0_35px_rgba(0,0,0,0.8)] max-w-md w-full p-6 border border-indigo-900/60 text-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-950/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center border border-sky-400/30">
                  <DynamicIcon name="Sparkles" className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Novo cartão com Ilustração IA</h3>
              </div>
              <button
                onClick={() => setShowAddCustomModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <DynamicIcon name="X" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomCard} className="mt-4 space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Texto do cartão *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Quero um abraço, Parque, Mordedor..."
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (!imagePrompt) setImagePrompt(e.target.value);
                  }}
                  className="w-full px-3 py-2 text-xs md:text-sm rounded-xl border border-indigo-900/80 bg-slate-900/80 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-indigo-900/80 bg-slate-900/80 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
                >
                  <option value="basic">Necessidades básicas</option>
                  <option value="choices">Escolhas & Lazer</option>
                  <option value="feelings">Sentimentos & Estados</option>
                  <option value="free">Comunicação livre</option>
                </select>
              </div>

              {/* AI Image Generation Section (gemini-3.1-flash-image) */}
              <div className="p-3 rounded-2xl bg-indigo-950/40 border border-sky-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-200 flex items-center gap-1.5">
                    <DynamicIcon name="Sparkles" className="w-3.5 h-3.5 text-sky-300" />
                    <span>Ilustração PECS com IA (gemini-3.1-flash-image)</span>
                  </span>
                  {generatedImageUrl && (
                    <button
                      type="button"
                      onClick={() => setGeneratedImageUrl(null)}
                      className="text-[10px] text-rose-300 hover:underline"
                    >
                      Remover imagem
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Descreva a imagem (ex: maçã picada, blocos de montar)..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-indigo-900/80 bg-slate-900/90 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateAiImage}
                    disabled={generatingImage || (!imagePrompt.trim() && !newTitle.trim())}
                    className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 transition shadow-[0_0_10px_rgba(56,189,248,0.3)] shrink-0 active:scale-95"
                  >
                    {generatingImage ? (
                      <>
                        <DynamicIcon name="Loader2" className="w-3.5 h-3.5 animate-spin" />
                        <span>Gerando...</span>
                      </>
                    ) : (
                      <>
                        <DynamicIcon name="Sparkles" className="w-3.5 h-3.5" />
                        <span>Gerar</span>
                      </>
                    )}
                  </button>
                </div>

                {generatedImageUrl && (
                  <div className="flex items-center gap-3 pt-1">
                    <img
                      src={generatedImageUrl}
                      alt="Prévia gerada pela IA"
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover border-2 border-sky-400 shadow-md"
                    />
                    <div className="text-xs text-slate-300">
                      <span className="font-semibold text-sky-200 block">Ilustração gerada com sucesso!</span>
                      <span className="text-[11px] text-slate-400">Este pictograma será exibido no cartão da rotina.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Icon fallback if no image */}
              {!generatedImageUrl && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Ou selecione um ícone
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      'Smile',
                      'Heart',
                      'Sparkles',
                      'Gamepad2',
                      'Palette',
                      'Music',
                      'GlassWater',
                      'Apple',
                      'Bed',
                      'HelpCircle',
                      'CheckCircle2',
                      'Sun',
                    ].map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setNewIcon(ic)}
                        className={`p-2.5 rounded-xl border flex items-center justify-center transition ${
                          newIcon === ic
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400 ring-2 ring-amber-400/30 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                            : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <DynamicIcon name={ic} className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="py-2 px-3 rounded-xl border border-white/10 text-slate-300 text-xs font-medium hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold shadow-[0_0_12px_rgba(251,191,36,0.3)] transition"
                >
                  Salvar cartão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
