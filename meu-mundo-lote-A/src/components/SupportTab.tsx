import React, { useState, useRef, useEffect } from 'react';
import {
  SupportArticle,
  EducationalContent,
  FamilyProfile,
  ChatMessage,
  GroundingSource,
  ProposedAction,
  RoutineActivity,
  CommunicationCard,
  TabType,
} from '../types';
import { DynamicIcon } from './IconHelper';
import { AppLogo } from './AppLogo';

interface SupportTabProps {
  profile: FamilyProfile;
  supportArticles: SupportArticle[];
  educationalArticles: EducationalContent[];
  onNavigateTab?: (tab: TabType) => void;
  onAddActivity?: (activity: RoutineActivity) => void;
  onAddCard?: (card: CommunicationCard) => void;
}

export const SupportTab: React.FC<SupportTabProps> = ({
  profile,
  supportArticles,
  educationalArticles,
  onNavigateTab,
  onAddActivity,
  onAddCard,
}) => {
  // Conversational Multi-turn Messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('meu_mundo_ai_chat');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Erro ao ler mensagens de apoio:', e);
      }
    }
    return [
      {
        id: 'welcome-msg',
        role: 'model',
        text: `Oi. Eu estou aqui com você.
Pode me contar o que está acontecendo por aí, vamos por partes.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputText, setInputText] = useState('');
  const [loadingAssistant, setLoadingAssistant] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Modals & Panels (Supporting experiences behind the conversation)
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [activeActionModal, setActiveActionModal] = useState<ProposedAction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Breathing state
  const [breathPhase, setBreathPhase] = useState<'Inspire...' | 'Segure o ar...' | 'Solte devagar...'>('Inspire...');
  const [breathCount, setBreathCount] = useState(4);

  // Library modal active tab
  const [libraryTab, setLibraryTab] = useState<'guidelines' | 'education'>('guidelines');
  const [expandedGuidelineId, setExpandedGuidelineId] = useState<string | null>(supportArticles[0]?.id || null);
  const [expandedEduId, setExpandedEduId] = useState<string | null>(null);

  // AI Memory Settings
  const [memoryEnabled, setMemoryEnabled] = useState<boolean>(() => {
    return localStorage.getItem('meu_mundo_ai_memory_enabled') !== 'false';
  });

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Stop any active audio / speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem('meu_mundo_ai_chat', JSON.stringify(messages));
    } catch (e) {
      console.error('Erro ao persistir chat:', e);
    }
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingAssistant]);

  // Breathing timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showBreathingModal) {
      timer = setInterval(() => {
        setBreathCount((prev) => {
          if (prev <= 1) {
            setBreathPhase((currentPhase) => {
              if (currentPhase === 'Inspire...') return 'Segure o ar...';
              if (currentPhase === 'Segure o ar...') return 'Solte devagar...';
              return 'Inspire...';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showBreathingModal]);

  // Quick suggestion chips alinhados com o tom real e situações cotidianas
  const quickSuggestions = [
    'Meu filho teve uma crise hoje',
    'Estou muito cansada hoje',
    'Ele não quer tomar banho',
    'Quero organizar a rotina',
    'Não sei nem por onde começar',
    'Fazer uma pausa para respirar',
  ];

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Speech to text (Voice input)
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Reconhecimento de voz não suportado neste navegador. Você pode digitar sua mensagem normalmente!');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Erro no reconhecimento de voz:', e);
      setIsListening(false);
    }
  };

  // Play audio response using Gemini TTS or Web Speech fallback
  const handlePlayVoice = async (msgId: string, text: string) => {
    if (playingAudioId === msgId) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      window.speechSynthesis?.cancel();
      setPlayingAudioId(null);
      return;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    window.speechSynthesis?.cancel();

    setPlayingAudioId(msgId);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 300) }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
          currentAudioRef.current = audio;
          audio.onended = () => setPlayingAudioId(null);
          audio.onerror = () => fallbackWebSpeech(text, msgId);
          await audio.play();
          return;
        }
      }
      fallbackWebSpeech(text, msgId);
    } catch (err) {
      console.warn('Fallback para Web Speech API:', err);
      fallbackWebSpeech(text, msgId);
    }
  };

  const fallbackWebSpeech = (text: string, msgId: string) => {
    if (!window.speechSynthesis) {
      setPlayingAudioId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#•_~`]/g, '').slice(0, 350);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    // Cadência tranquila, compassada e natural de escuta clínica
    utterance.rate = 0.86;
    utterance.pitch = 0.98;

    // Priorizar vozes naturais femininas em português brasileiro
    const voices = window.speechSynthesis.getVoices();
    const ptVoice =
      voices.find(
        (v) =>
          v.lang.replace('_', '-').toLowerCase().startsWith('pt-br') &&
          (v.name.includes('Luciana') ||
            v.name.includes('Letícia') ||
            v.name.includes('Maria') ||
            v.name.includes('Francisca') ||
            v.name.includes('Helena') ||
            v.name.includes('Google português do Brasil') ||
            v.name.toLowerCase().includes('natural') ||
            v.name.toLowerCase().includes('female'))
      ) ||
      voices.find((v) => v.lang.replace('_', '-').toLowerCase().startsWith('pt-br')) ||
      voices.find((v) => v.lang.startsWith('pt'));

    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    utterance.onend = () => setPlayingAudioId(null);
    utterance.onerror = () => setPlayingAudioId(null);
    window.speechSynthesis.speak(utterance);
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || loadingAssistant) return;

    // Check direct voice breathing command
    if (query.toLowerCase().includes('pausa para respirar') || query.toLowerCase().includes('respirar comigo')) {
      setShowBreathingModal(true);
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInputText('');
    setLoadingAssistant(true);

    try {
      const historyPayload = updatedMessages.slice(0, -1).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: historyPayload,
          message: query,
          childName: memoryEnabled ? profile.childName : 'a criança',
          parentName: memoryEnabled ? profile.parentName : 'você',
          focusArea: memoryEnabled ? profile.focusArea : '',
          useSearch: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha no servidor');
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'model',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingSources: data.groundingSources as GroundingSource[],
        proposedActions: data.actions as ProposedAction[],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.warn('Falha na conexão com a IA, usando resposta de acolhimento:', err);
      const fallbackMsg: ChatMessage = {
        id: `fallback-${Date.now()}`,
        role: 'model',
        text: `Entendi o que você compartilhou. 

Para lidar com esse momento com ${profile.childName || 'a criança'}, podemos dar um passo de cada vez: primeiro trazendo previsibilidade amorosa, diminuindo os ruídos ao redor e oferecendo escolhas simples.

Quer que eu te ajude a pensar em uma etapa específica para testar hoje?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        proposedActions: [
          {
            id: 'fallback-breath',
            type: 'open_breathing',
            label: 'Fazer uma Pausa para Respirar',
            description: 'Exercício de 1 minuto para acalmar os pensamentos',
          },
        ],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoadingAssistant(false);
    }
  };

  // Action executor with user confirmation
  const handleTriggerAction = (action: ProposedAction) => {
    if (action.type === 'open_breathing') {
      setShowBreathingModal(true);
      return;
    }

    if (action.type === 'view_guideline') {
      setShowLibraryModal(true);
      return;
    }

    if (action.type === 'navigate_tab' && action.payload?.tab && onNavigateTab) {
      onNavigateTab(action.payload.tab as TabType);
      return;
    }

    // For routine or card mutations, open confirmation dialog
    setActiveActionModal(action);
  };

  const handleConfirmAction = () => {
    if (!activeActionModal) return;

    if (activeActionModal.type === 'suggest_routine') {
      const p = activeActionModal.payload || {};
      const newAct: RoutineActivity = {
        id: `act-ai-${Date.now()}`,
        title: p.title || 'Transição Acolhedora',
        period: p.period || 'afternoon',
        category: p.category || 'Rotina',
        iconName: p.iconName || 'Clock',
        completed: false,
        prepWarning: p.prepWarning || 'Aviso antecipado de 5 minutos',
      };
      onAddActivity?.(newAct);
      showToast(`Atividade "${newAct.title}" adicionada à Nossa Rotina com sucesso!`);
      setActiveActionModal(null);
      return;
    }

    if (activeActionModal.type === 'suggest_card') {
      const p = activeActionModal.payload || {};
      const newCard: CommunicationCard = {
        id: `card-ai-${Date.now()}`,
        title: p.title || 'Nova Escolha',
        category: p.category || 'basic',
        iconName: p.iconName || 'Sparkles',
        colorBg: 'bg-sky-500/20',
        colorText: 'text-sky-200',
        colorBorder: 'border-sky-400/40',
        isFavorite: true,
        custom: true,
      };
      onAddCard?.(newCard);
      showToast(`Cartão visual "${newCard.title}" criado em Vamos nos Comunicar!`);
      setActiveActionModal(null);
      return;
    }

    setActiveActionModal(null);
  };

  const handleClearHistory = () => {
    if (confirm('Deseja reiniciar a conversa e limpar o histórico atual?')) {
      const resetMsg: ChatMessage = {
        id: 'welcome-reset',
        role: 'model',
        text: `Oi. Eu estou aqui com você.
Pode me contar o que está acontecendo ou simplesmente me dizer do que você precisa.
Vamos por partes, com calma.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([resetMsg]);
      localStorage.setItem('meu_mundo_ai_chat', JSON.stringify([resetMsg]));
      showToast('Histórico reiniciado com carinho.');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto pb-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-emerald-950/90 border border-emerald-400/50 text-emerald-200 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <DynamicIcon name="CheckCircle2" className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header of Apoio (Clean & Direct) */}
      <div className="flex items-center justify-between px-3 py-2.5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-indigo-950/80 mb-2.5 shrink-0">
        <div className="flex items-center gap-2.5 text-left">
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-amber-300/30 flex items-center justify-center overflow-hidden shadow-[0_0_12px_rgba(251,191,36,0.15)]">
            <AppLogo className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-white tracking-tight">Apoio</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none mt-0.5">
              Conversa acolhedora e suporte para {profile.parentName || 'você'}
            </p>
          </div>
        </div>

        {/* Quick Helper Actions */}
        <div className="flex items-center gap-1.5">
          <button
            id="btn-quick-breathing-top"
            onClick={() => setShowBreathingModal(true)}
            title="Pausa para respirar e acalmar"
            className="px-2.5 py-1.5 rounded-xl border border-sky-400/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-200 text-xs font-medium flex items-center gap-1.5 transition active:scale-95"
          >
            <DynamicIcon name="Heart" className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
            <span className="hidden sm:inline">Pausa</span>
          </button>

          <button
            id="btn-quick-library-top"
            onClick={() => setShowLibraryModal(true)}
            title="Biblioteca de orientações práticas e artigos"
            className="px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <DynamicIcon name="BookOpen" className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Orientações</span>
          </button>

          <button
            id="btn-quick-memory-top"
            onClick={() => setShowMemoryModal(true)}
            title="Personalização e histórico da conversa"
            className="p-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <DynamicIcon name="Settings" className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-1 space-y-3.5 pr-1.5 custom-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} text-left group`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[85%] p-3.5 sm:p-4 rounded-2xl text-xs md:text-sm leading-relaxed transition-all shadow-md ${
                  isUser
                    ? 'bg-linear-to-r from-amber-500/25 to-amber-600/30 border border-amber-400/40 text-slate-100 rounded-br-xs'
                    : 'bg-[#0b122c]/90 border border-indigo-900/60 text-slate-200 rounded-bl-xs shadow-[0_4px_20px_rgba(0,0,0,0.25)]'
                }`}
              >
                {/* Assistant header avatar */}
                {!isUser && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-indigo-950/80">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-white/5 border border-amber-300/30 flex items-center justify-center overflow-hidden">
                        <AppLogo className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-amber-300 text-xs">Apoio Meu Mundo</span>
                    </div>

                    <button
                      onClick={() => handlePlayVoice(msg.id, msg.text)}
                      title={playingAudioId === msg.id ? 'Parar voz' : 'Ouvir resposta com voz suave'}
                      className={`p-1 rounded-lg text-xs transition flex items-center gap-1 ${
                        playingAudioId === msg.id
                          ? 'bg-amber-400 text-slate-950 font-semibold animate-pulse'
                          : 'text-slate-400 hover:text-amber-300 bg-white/5'
                      }`}
                    >
                      <DynamicIcon
                        name={playingAudioId === msg.id ? 'VolumeX' : 'Volume2'}
                        className="w-3.5 h-3.5"
                      />
                      <span className="text-[10px] hidden sm:inline">
                        {playingAudioId === msg.id ? 'Parar' : 'Ouvir'}
                      </span>
                    </button>
                  </div>
                )}

                {/* Content */}
                <div className="whitespace-pre-line text-slate-100 font-normal select-text">
                  {msg.text}
                </div>

                {/* Google Search Grounding references if any */}
                {msg.groundingSources && msg.groundingSources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-indigo-950/80">
                    <div className="flex items-center gap-1 text-[11px] text-amber-300/90 font-medium mb-1">
                      <DynamicIcon name="Search" className="w-3 h-3" />
                      <span>Fontes de apoio verificadas:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.groundingSources.map((src, i) => (
                        <a
                          key={i}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] px-2 py-0.5 rounded-md bg-sky-950/40 text-sky-300 border border-sky-500/30 hover:bg-sky-900/50 transition inline-flex items-center gap-1"
                        >
                          <span>{src.title}</span>
                          <DynamicIcon name="ExternalLink" className="w-2.5 h-2.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive Action Buttons proposed by the AI */}
                {msg.proposedActions && msg.proposedActions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-indigo-900/60 space-y-2">
                    {msg.proposedActions.map((action) => (
                      <div
                        key={action.id}
                        className="p-2.5 rounded-xl bg-indigo-950/60 border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm"
                      >
                        <div>
                          <p className="text-xs font-semibold text-amber-200">{action.label}</p>
                          {action.description && (
                            <p className="text-[11px] text-slate-300 mt-0.5">{action.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleTriggerAction(action)}
                          className="px-3 py-1.5 rounded-lg bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shrink-0 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                        >
                          <DynamicIcon name="ArrowRight" className="w-3.5 h-3.5" />
                          <span>{action.label}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[10px] mt-2 text-right ${
                    isUser ? 'text-amber-200/70' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loadingAssistant && (
          <div className="flex items-start text-left animate-fadeIn">
            <div className="p-3.5 rounded-2xl bg-[#0b122c]/90 border border-indigo-900/60 rounded-bl-xs text-xs text-slate-300 flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-amber-300 border-t-transparent animate-spin" />
              <span>Ouvindo com carinho e pensando...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Quick Starters (displayed above input if conversation is short) */}
      {messages.length <= 2 && (
        <div className="my-2 pt-2 border-t border-indigo-950/70 text-left">
          <p className="text-[11px] text-slate-400 font-medium mb-1.5 px-1">
            Sugestões para começar a conversa:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickSuggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(sug)}
                className="text-left text-[11px] px-2.5 py-1.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-amber-200 border border-indigo-950 hover:border-amber-400/40 transition active:scale-95 leading-snug"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form with Voice Support */}
      <div className="mt-2 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-xl border border-indigo-950/80 p-1.5 rounded-2xl shadow-xl focus-within:border-amber-400/50 transition-all"
        >
          {/* Microphone button */}
          <button
            type="button"
            id="btn-voice-input"
            onClick={toggleListening}
            title={isListening ? 'Parar gravação de voz' : 'Falar pelo microfone'}
            className={`p-2.5 rounded-xl transition flex items-center justify-center shrink-0 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-amber-300'
            }`}
          >
            <DynamicIcon name={isListening ? 'MicOff' : 'Mic'} className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            id="input-apoio-chat"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Digite ou fale o que você precisa..."
            disabled={loadingAssistant}
            className="flex-1 bg-transparent border-none text-xs md:text-sm text-slate-100 placeholder-slate-400 px-2 py-2 focus:outline-hidden"
          />

          {/* Send Button */}
          <button
            type="submit"
            id="btn-send-apoio"
            disabled={!inputText.trim() || loadingAssistant}
            className="p-2.5 rounded-xl bg-linear-to-r from-amber-400 to-amber-500 text-slate-950 font-bold transition disabled:opacity-30 disabled:cursor-not-allowed hover:from-amber-300 hover:to-amber-400 active:scale-95 shrink-0 shadow-[0_0_12px_rgba(251,191,36,0.3)]"
          >
            <DynamicIcon name="Send" className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* ================= MODAL: PAUSA PARA RESPIRAR ================= */}
      {showBreathingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="cosmic-card w-full max-w-sm p-6 rounded-3xl border border-sky-400/40 text-center shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-indigo-950 pb-3">
              <div className="flex items-center gap-2">
                <DynamicIcon name="Heart" className="w-5 h-5 text-sky-300 animate-pulse" />
                <h3 className="font-bold text-white text-base">Pausa para Respirar</h3>
              </div>
              <button
                onClick={() => setShowBreathingModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <DynamicIcon name="X" className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Cuidar de quem cuida. Feche os olhos ou acompanhe o círculo abaixo no ritmo 4-4-4:
            </p>

            {/* Breathing Animation Sphere */}
            <div className="py-6 flex flex-col items-center justify-center">
              <div
                className={`w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-1000 border-2 ${
                  breathPhase === 'Inspire...'
                    ? 'scale-115 bg-sky-500/20 border-sky-400 shadow-[0_0_35px_rgba(56,189,248,0.4)]'
                    : breathPhase === 'Segure o ar...'
                    ? 'scale-115 bg-amber-500/20 border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.4)]'
                    : 'scale-90 bg-indigo-500/20 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                }`}
              >
                <span className="text-sm font-bold text-white tracking-wide">{breathPhase}</span>
                <span className="text-2xl font-black text-amber-300 mt-1">{breathCount}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              "Você não precisa dar conta de tudo perfeitamente hoje. Um passo de cada vez."
            </p>

            <button
              onClick={() => setShowBreathingModal(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition active:scale-95"
            >
              Concluir Pausa
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRMAÇÃO DE AÇÃO DA IA ================= */}
      {activeActionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="cosmic-card w-full max-w-md p-5 rounded-3xl border border-amber-400/40 text-left shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <DynamicIcon name="HelpCircle" className="w-5 h-5" />
              <span>Confirmação com a Família</span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              {activeActionModal.type === 'suggest_routine' ? (
                <>
                  A IA do Apoio propõe adicionar a atividade{' '}
                  <strong className="text-amber-300">
                    "{activeActionModal.payload?.title || 'Transição Suave'}"
                  </strong>{' '}
                  à <strong>Nossa Rotina</strong> de {profile.childName || 'sua criança'}.
                </>
              ) : (
                <>
                  A IA do Apoio propõe criar o cartão de comunicação visual{' '}
                  <strong className="text-amber-300">
                    "{activeActionModal.payload?.title || 'Nova Escolha'}"
                  </strong>{' '}
                  em <strong>Vamos nos Comunicar</strong>.
                </>
              )}
            </p>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1 text-slate-300">
              <p>
                <strong>Título:</strong> {activeActionModal.payload?.title}
              </p>
              {activeActionModal.payload?.prepWarning && (
                <p>
                  <strong>Dica de apoio:</strong> {activeActionModal.payload?.prepWarning}
                </p>
              )}
              {activeActionModal.payload?.category && (
                <p>
                  <strong>Categoria:</strong> {activeActionModal.payload?.category}
                </p>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              Você pode editar ou excluir este item a qualquer momento dentro da respectiva área.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-indigo-950">
              <button
                onClick={() => setActiveActionModal(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-[0_0_12px_rgba(251,191,36,0.3)] active:scale-95"
              >
                <DynamicIcon name="Check" className="w-4 h-4" />
                <span>Sim, adicionar agora</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: BIBLIOTECA DE ARTIGOS & ORIENTAÇÕES ================= */}
      {showLibraryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
          <div className="cosmic-card w-full max-w-2xl max-h-[88vh] flex flex-col p-4 sm:p-6 rounded-3xl border border-indigo-900/80 text-left shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-indigo-950 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <DynamicIcon name="BookOpen" className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-bold text-white text-base">Biblioteca de Apoio</h3>
                  <p className="text-[11px] text-slate-400">Orientações práticas e artigos educativos</p>
                </div>
              </div>
              <button
                onClick={() => setShowLibraryModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
              >
                <DynamicIcon name="X" className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-2 py-3 border-b border-indigo-950/70 shrink-0">
              <button
                onClick={() => setLibraryTab('guidelines')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  libraryTab === 'guidelines'
                    ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                Orientações Práticas ({supportArticles.length})
              </button>
              <button
                onClick={() => setLibraryTab('education')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  libraryTab === 'education'
                    ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                Entendendo o Autismo ({educationalArticles.length})
              </button>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 custom-scrollbar">
              {libraryTab === 'guidelines' &&
                supportArticles.map((article) => {
                  const isExpanded = expandedGuidelineId === article.id;
                  return (
                    <div
                      key={article.id}
                      className="p-3.5 rounded-2xl bg-[#0b122c]/80 border border-indigo-900/50 hover:border-amber-400/40 transition-all"
                    >
                      <button
                        onClick={() => setExpandedGuidelineId(isExpanded ? null : article.id)}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <h4 className="font-bold text-white text-xs sm:text-sm">{article.title}</h4>
                        <DynamicIcon
                          name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
                          className="w-4 h-4 text-slate-400 shrink-0"
                        />
                      </button>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-indigo-950/80 space-y-2.5 text-xs text-slate-200">
                          <p className="leading-relaxed">{article.explanation}</p>
                          <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-300/30 text-amber-200">
                            <strong className="block mb-1 text-amber-300">💡 Ideia prática:</strong>
                            <span>{article.practicalTip}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 italic">
                            Nota: {article.note}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}

              {libraryTab === 'education' &&
                educationalArticles.map((edu) => {
                  const isExpanded = expandedEduId === edu.id;
                  return (
                    <div
                      key={edu.id}
                      className="p-3.5 rounded-2xl bg-[#0b122c]/80 border border-indigo-900/50 hover:border-sky-400/40 transition-all"
                    >
                      <button
                        onClick={() => setExpandedEduId(isExpanded ? null : edu.id)}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <div>
                          <h4 className="font-bold text-white text-xs sm:text-sm">{edu.title}</h4>
                          <span className="text-[10px] text-slate-400">Leitura: {edu.readTime}</span>
                        </div>
                        <DynamicIcon
                          name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
                          className="w-4 h-4 text-slate-400 shrink-0"
                        />
                      </button>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-indigo-950/80 space-y-2.5 text-xs text-slate-200">
                          <p className="leading-relaxed">{edu.summary}</p>
                          <div className="space-y-1.5 pt-1">
                            <strong className="text-sky-300 text-xs block">Pontos principais:</strong>
                            <ul className="space-y-1">
                              {edu.keyPoints.map((point, idx) => (
                                <li key={idx} className="flex items-start gap-1.5 text-slate-300">
                                  <span className="text-amber-400 mt-0.5">•</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: PREFERÊNCIAS & MEMÓRIA DA IA ================= */}
      {showMemoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="cosmic-card w-full max-w-md p-5 rounded-3xl border border-indigo-900/80 text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-950 pb-3">
              <div className="flex items-center gap-2">
                <DynamicIcon name="Settings" className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-white text-base">Ajustes do Apoio</h3>
              </div>
              <button
                onClick={() => setShowMemoryModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <DynamicIcon name="X" className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                <p className="font-semibold text-white">Dados da família em uso:</p>
                <p>• <strong>Responsável:</strong> {profile.parentName || 'Não informado'}</p>
                <p>• <strong>Criança:</strong> {profile.childName || 'Não informada'}</p>
                <p>• <strong>Idade:</strong> {profile.childAge ? `${profile.childAge} anos` : 'Não informada'}</p>
                <p>• <strong>Foco principal:</strong> {profile.focusArea || 'Apoio geral'}</p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                <div>
                  <p className="font-semibold text-white">Personalização Acolhedora</p>
                  <p className="text-[11px] text-slate-400">Usar o nome e foco da família nas respostas</p>
                </div>
                <button
                  onClick={() => {
                    const nextVal = !memoryEnabled;
                    setMemoryEnabled(nextVal);
                    localStorage.setItem('meu_mundo_ai_memory_enabled', String(nextVal));
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    memoryEnabled ? 'bg-amber-400' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                      memoryEnabled ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    handleClearHistory();
                    setShowMemoryModal(false);
                  }}
                  className="w-full py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <DynamicIcon name="Trash2" className="w-3.5 h-3.5" />
                  <span>Limpar histórico da conversa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
