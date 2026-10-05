import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FamilyProfile, ProposedAction, TabType } from '../types';
import { DynamicIcon } from './IconHelper';

interface VoiceConversationModalProps {
  profile: FamilyProfile;
  onClose: () => void;
  onOpenBreathing?: () => void;
  onAddActivity?: (activity: any) => void;
  onAddCard?: (card: any) => void;
  onNavigate?: (tab: TabType) => void;
}

interface VoiceTurn {
  id: string;
  role: 'user' | 'model';
  text: string;
  audioBase64?: string;
  actions?: ProposedAction[];
  timestamp: string;
}

export type SupportedVoice = 'Aoede' | 'Leda' | 'Zephyr' | 'Kore' | 'Puck' | 'Charon';

export const GEMINI_VOICES: Array<{
  id: SupportedVoice;
  name: string;
  label: string;
  tone: string;
  badge?: string;
}> = [
  { id: 'Aoede', name: 'Aoede', label: 'Aoede', tone: 'Voz acolhedora e aveludada (feminina)', badge: 'Padrão' },
  { id: 'Leda', name: 'Leda', label: 'Leda', tone: 'Voz doce, calma e compassiva (feminina)' },
  { id: 'Zephyr', name: 'Zephyr', label: 'Zephyr', tone: 'Voz equilibrada, serena e pausada (reflexiva)' },
  { id: 'Kore', name: 'Kore', label: 'Kore', tone: 'Voz empática e calorosa (feminina)' },
  { id: 'Charon', name: 'Charon', label: 'Charon', tone: 'Voz firme, profunda e tranquila (masculina)' },
  { id: 'Puck', name: 'Puck', label: 'Puck', tone: 'Voz amigável, leve e próxima' },
];

export const VoiceConversationModal: React.FC<VoiceConversationModalProps> = ({
  profile,
  onClose,
  onOpenBreathing,
  onAddActivity,
  onAddCard,
  onNavigate,
}) => {
  const isHighContrast = profile.highContrast;

  // Voice Interaction States
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [handsFreeMode, setHandsFreeMode] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [manualText, setManualText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Processing Elapsed Timer to scale gradual radial glow
  const [processingElapsedMs, setProcessingElapsedMs] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isProcessing) {
      setProcessingElapsedMs(0);
      const startTime = Date.now();
      interval = setInterval(() => {
        setProcessingElapsedMs(Date.now() - startTime);
      }, 60);
    } else {
      setProcessingElapsedMs(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing]);

  // Gradual glow intensity factor: starts at 0.25 and smoothly increases to 1.0 over ~2.4 seconds
  const glowIntensity = isProcessing
    ? Math.min(1.0, 0.25 + (processingElapsedMs / 2400) * 0.75)
    : 0;

  // Lógica de estado onde a animação de pulsação suave sincroniza intensidade e velocidade com a atividade do microfone:
  // - Quando o usuário fala: o brilho fica mais lento e profundo (cadência respiratória suave de 4.8s a 5.6s, maior profundidade de campo e blur)
  // - Quando a IA processa: o brilho aumenta sutilmente de frequência (frequência maior com ciclo mais rápido entre 1.7s e 2.0s, usando animações CSS existentes)
  const [pulseState, setPulseState] = useState<{
    intensity: number; // 0.0 a 1.0 (profundidade/intensidade do brilho)
    speedSec: number; // segundos por ciclo (velocidade da pulsação)
    mode: 'idle' | 'speaking' | 'processing' | 'ai_speaking';
  }>({
    intensity: 0.35,
    speedSec: 4.2,
    mode: 'idle',
  });

  useEffect(() => {
    if (isProcessing) {
      // Quando a IA está processando: o brilho aumenta sutilmente de frequência (ciclo mais rápido: ~1.7s a 2.0s)
      setPulseState({
        intensity: Math.min(1.0, 0.65 + glowIntensity * 0.35),
        speedSec: Math.max(1.7, 2.1 - glowIntensity * 0.4),
        mode: 'processing',
      });
    } else if (isListening) {
      const isSpeaking = audioLevel > 6;
      if (isSpeaking) {
        // Quando o usuário está falando: o brilho deve ser mais lento e profundo
        const normalized = Math.min(1.0, audioLevel / 80);
        setPulseState({
          intensity: 0.6 + normalized * 0.4, // Mais profundo e luminoso
          speedSec: 4.8 + normalized * 1.0, // Mais lento e cadenciado
          mode: 'speaking',
        });
      } else {
        // Microfone ouvindo em silêncio
        setPulseState({
          intensity: 0.4,
          speedSec: 3.8,
          mode: 'speaking',
        });
      }
    } else if (isAiSpeaking) {
      setPulseState({
        intensity: 0.55,
        speedSec: 2.8,
        mode: 'ai_speaking',
      });
    } else {
      setPulseState({
        intensity: 0.28,
        speedSec: 4.4,
        mode: 'idle',
      });
    }
  }, [isProcessing, isListening, audioLevel, isAiSpeaking, glowIntensity]);

  // Conversation turns strictly following IDENTIDADE CONVERSACIONAL — APOIO | MEU MUNDO
  const [turns, setTurns] = useState<VoiceTurn[]>([
    {
      id: 'welcome-voice',
      role: 'model',
      text: `Oi. Eu estou aqui com você. Pode me contar o que está acontecendo por aí.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Audio & Speech references
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const currentHtmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const micAnimFrameRef = useRef<number | null>(null);
  const isComponentMounted = useRef(true);
  const handsFreeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Vozes Humanas Autênticas do Gemini (prebuiltVoiceConfig):
  // Aoede (Nova voz padrão): Acolhedora, calorosa e serena
  const [selectedVoice, setSelectedVoice] = useState<'Aoede' | 'Leda' | 'Zephyr' | 'Kore' | 'Puck' | 'Charon'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('meumundo_selected_voice') as any;
      if (saved && ['Aoede', 'Leda', 'Zephyr', 'Kore', 'Puck', 'Charon'].includes(saved)) {
        return saved;
      }
    }
    return 'Aoede';
  });
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);

  // Suggested Voice Starters alinhados com o tom real da conversa
  const voiceStarters = [
    'Estou muito cansada hoje',
    'Meu filho teve uma crise hoje',
    'Ele não quer sair de casa',
    'Acho que estou fazendo tudo errado',
    'Não sei nem por onde começar',
    'Hoje foi um dia muito bom',
  ];

  // Stop currently playing AI audio
  const stopAiSpeech = useCallback(() => {
    if (currentAudioSourceRef.current) {
      try {
        currentAudioSourceRef.current.stop();
      } catch (e) {}
      currentAudioSourceRef.current = null;
    }
    if (currentHtmlAudioRef.current) {
      currentHtmlAudioRef.current.pause();
      if (currentHtmlAudioRef.current.src && currentHtmlAudioRef.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(currentHtmlAudioRef.current.src);
      }
      currentHtmlAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeaking(false);
  }, []);

  // Initialize Microphone visualizer
  const startMicVisualizer = useCallback(async () => {
    try {
      if (!micStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
      }

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const source = audioContextRef.current.createMediaStreamSource(micStreamRef.current);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      micAnalyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        if (!isComponentMounted.current) return;
        if (analyser && isListening) {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round(avg * 1.5)));
        } else {
          setAudioLevel(0);
        }
        micAnimFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (err) {
      console.warn('Não foi possível obter visualização de microfone:', err);
    }
  }, [isListening]);

  const stopMicVisualizer = useCallback(() => {
    if (micAnimFrameRef.current) {
      cancelAnimationFrame(micAnimFrameRef.current);
      micAnimFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Play spoken response (Gemini TTS audio base64 or Web Speech fallback)
  const playModelAudio = useCallback(
    async (text: string, audioBase64?: string) => {
      stopAiSpeech();
      setIsAiSpeaking(true);

      const onPlaybackFinished = () => {
        setIsAiSpeaking(false);
        // If continuous dialogue is active, restart listening after a gentle pause
        if (handsFreeMode && isComponentMounted.current) {
          if (handsFreeTimerRef.current) clearTimeout(handsFreeTimerRef.current);
          handsFreeTimerRef.current = setTimeout(() => {
            if (isComponentMounted.current) {
              startListening();
            }
          }, 800);
        }
      };

      // 1. Play authentic Gemini Human Voice (WAV/PCM decoded from Gemini TTS)
      if (audioBase64) {
        try {
          const binary = atob(audioBase64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }

          // Create standard WAV Blob from server
          const blob = new Blob([bytes], { type: 'audio/wav' });
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          currentHtmlAudioRef.current = audio;

          audio.onended = () => {
            URL.revokeObjectURL(url);
            currentHtmlAudioRef.current = null;
            onPlaybackFinished();
          };

          audio.onerror = async (errEvt) => {
            console.warn('Playback HTMLAudio falhou, decodificando via Web Audio API:', errEvt);
            URL.revokeObjectURL(url);
            currentHtmlAudioRef.current = null;

            // Fallback imediato para AudioContext nativo decodificando o buffer de áudio humano
            try {
              const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
              const ctx = audioContextRef.current || new AudioCtx();
              audioContextRef.current = ctx;
              if (ctx.state === 'suspended') {
                await ctx.resume();
              }
              const audioBuf = await ctx.decodeAudioData(bytes.buffer.slice(0));
              const source = ctx.createBufferSource();
              source.buffer = audioBuf;
              source.connect(ctx.destination);
              currentAudioSourceRef.current = source;
              source.onended = () => {
                currentAudioSourceRef.current = null;
                onPlaybackFinished();
              };
              source.start(0);
              return;
            } catch (ctxErr) {
              console.warn('AudioContext decode também falhou, usando síntese secundária:', ctxErr);
              fallbackWebSpeech(text, onPlaybackFinished);
            }
          };

          await audio.play();
          return;
        } catch (err) {
          console.warn('Erro ao processar áudio humano Gemini:', err);
        }
      }

      // 2. Fallback secundário caso o dispositivo esteja desconectado ou sem áudio Gemini
      fallbackWebSpeech(text, onPlaybackFinished);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handsFreeMode, stopAiSpeech]
  );

  // Fallback speech synthesis calibrado para máxima naturalidade humana em português
  const fallbackWebSpeech = (text: string, onEndCallback: () => void) => {
    if (!('speechSynthesis' in window)) {
      onEndCallback();
      return;
    }
    window.speechSynthesis.cancel();
    const cleanForSpeech = text.replace(/[*_~`#•]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanForSpeech);
    utterance.lang = 'pt-BR';
    // Cadência tranquila, compassada, empática e humana de psicóloga
    utterance.rate = 0.88;
    const isMaleTone = selectedVoice === 'Charon';
    utterance.pitch = isMaleTone ? 0.88 : 1.0;

    // Buscar ativamente a melhor voz humana e natural disponível no sistema
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = isMaleTone
      ? voices.find(
          (v) =>
            v.lang.replace('_', '-').toLowerCase().startsWith('pt-br') &&
            (v.name.toLowerCase().includes('daniel') ||
              v.name.toLowerCase().includes('male') ||
              v.name.toLowerCase().includes('felipe') ||
              v.name.toLowerCase().includes('antonio'))
        ) ||
        voices.find((v) => v.lang.replace('_', '-').toLowerCase().startsWith('pt-br') && !v.name.toLowerCase().includes('espeak'))
      : voices.find(
          (v) =>
            v.lang.replace('_', '-').toLowerCase().startsWith('pt-br') &&
            (v.name.toLowerCase().includes('natural') ||
              v.name.toLowerCase().includes('neural') ||
              v.name.toLowerCase().includes('online') ||
              v.name.includes('Luciana') ||
              v.name.includes('Letícia') ||
              v.name.includes('Francisca') ||
              v.name.includes('Helena') ||
              v.name.includes('Google português do Brasil') ||
              v.name.toLowerCase().includes('female'))
        ) ||
        voices.find((v) => v.lang.replace('_', '-').toLowerCase().startsWith('pt-br') && !v.name.toLowerCase().includes('espeak')) ||
        voices.find((v) => v.lang.startsWith('pt'));

    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    utterance.onend = onEndCallback;
    utterance.onerror = onEndCallback;

    window.speechSynthesis.speak(utterance);
  };

  // Send message to Voice Chat Backend API
  const sendVoiceMessage = async (userText: string) => {
    if (!userText.trim()) return;

    // Stop listening while processing
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    setLiveTranscript('');
    setIsProcessing(true);
    stopAiSpeech();

    const newTurn: VoiceTurn = {
      id: `turn-user-${Date.now()}`,
      role: 'user',
      text: userText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTurns((prev) => [...prev, newTurn]);

    try {
      const historyPayload = turns.slice(-6).map((t) => ({
        role: t.role,
        text: t.text,
      }));

      const res = await fetch('/api/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText.trim(),
          history: historyPayload,
          childName: profile.childName || 'a criança',
          parentName: profile.parentName || 'você',
          focusArea: profile.focusArea || 'Rotina, regulação e apoio emocional',
          currentContext: 'Conversa por voz ao vivo no aplicativo Meu Mundo com a família',
          location: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Brasil',
          voiceName: selectedVoice,
        }),
      });

      const data = await res.json();
      const reply = data.reply || 'Estou aqui com você. Conte comigo.';
      const actions = data.actions || [];
      const audioBase64 = data.audioBase64 || null;

      const aiTurn: VoiceTurn = {
        id: `turn-ai-${Date.now()}`,
        role: 'model',
        text: reply,
        audioBase64,
        actions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Pausa reflexiva e compassada simulando escuta ativa de psicólogo (evita respostas automáticas/imediatas)
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (isComponentMounted.current) {
        setTurns((prev) => [...prev, aiTurn]);
        setIsProcessing(false);
        playModelAudio(reply, audioBase64);
      }
    } catch (err) {
      console.error('Erro na conversa por voz:', err);
      // Fallback simulando escuta empática e reflexiva
      await new Promise((resolve) => setTimeout(resolve, 600));
      const fallbackAiTurn: VoiceTurn = {
        id: `turn-ai-err-${Date.now()}`,
        role: 'model',
        text: 'Eu escuto você com todo carinho. É compreensível que tudo pareça pesado às vezes. Como você está sentindo o seu coração e o seu corpo neste exato momento?',
        actions: [
          {
            id: 'act-breath',
            type: 'open_breathing',
            label: 'Pausa para Respirar',
          },
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      if (isComponentMounted.current) {
        setTurns((prev) => [...prev, fallbackAiTurn]);
        setIsProcessing(false);
        playModelAudio(fallbackAiTurn.text);
      }
    }
  };

  // Start Voice Recognition
  const startListening = useCallback(() => {
    stopAiSpeech();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        'Reconhecimento de voz contínuo não suportado neste navegador. Você pode usar a entrada de texto no teclado abaixo.'
      );
      setShowManualInput(true);
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
        startMicVisualizer();
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) {
          setLiveTranscript(interim);
        }

        if (final) {
          setLiveTranscript(final);
          sendVoiceMessage(final);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Erro no reconhecimento de voz:', event.error);
        setIsListening(false);
        stopMicVisualizer();
      };

      recognition.onend = () => {
        setIsListening(false);
        stopMicVisualizer();
      };

      recognition.start();
    } catch (err) {
      console.error('Falha ao iniciar SpeechRecognition:', err);
      setIsListening(false);
      stopMicVisualizer();
    }
  }, [startMicVisualizer, stopAiSpeech, stopMicVisualizer]);

  // Stop Listening manually
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    stopMicVisualizer();
  }, [stopMicVisualizer]);

  // Initial welcome greeting play and cleanup
  useEffect(() => {
    isComponentMounted.current = true;

    // Speak initial welcome message
    const timer = setTimeout(() => {
      if (isComponentMounted.current) {
        playModelAudio(turns[0].text);
      }
    }, 400);

    return () => {
      isComponentMounted.current = false;
      clearTimeout(timer);
      if (handsFreeTimerRef.current) clearTimeout(handsFreeTimerRef.current);
      stopAiSpeech();
      stopListening();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Execute suggested action
  const handleActionClick = (act: ProposedAction) => {
    if (act.type === 'open_breathing' && onOpenBreathing) {
      onOpenBreathing();
    } else if (act.type === 'suggest_routine' && onAddActivity) {
      onAddActivity({
        id: `act-${Date.now()}`,
        title: act.payload?.title || 'Transição com Calma',
        period: act.payload?.period || 'afternoon',
        category: 'Rotina Suave',
        iconName: 'Clock',
        completed: false,
        prepWarning: 'Avisar 5 e 2 minutos antes',
      });
      if (onNavigate) onNavigate('routine');
    } else if (act.type === 'suggest_card' && onAddCard) {
      onAddCard({
        id: `card-${Date.now()}`,
        title: act.payload?.title || 'Quero Apoio',
        category: 'basic',
        iconName: 'Heart',
        colorBg: 'bg-emerald-500/20',
        colorText: 'text-emerald-200',
        colorBorder: 'border-emerald-400/40',
        isFavorite: true,
        custom: true,
      });
      if (onNavigate) onNavigate('communication');
    } else if (act.type === 'navigate_tab' && onNavigate && act.payload?.tab) {
      onNavigate(act.payload.tab);
    }
  };

  const latestTurn = turns[turns.length - 1];

  return (
    <div
      id="voice-conversation-overlay"
      className="VoiceConversationModal fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-modal-title"
    >
      <div
        id="voice-modal-card"
        className={`VoiceConversationModal-card w-full max-w-xl rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-all relative ${
          isHighContrast
            ? 'bg-white border-slate-900 text-slate-950 shadow-slate-900/50'
            : isListening
            ? 'bg-[#090e24]/95 border-sky-400/50 text-slate-100'
            : isProcessing
            ? 'bg-[#090e24]/95 border-indigo-400/50 text-slate-100'
            : 'bg-[#090e24]/95 border-sky-400/30 text-slate-100 shadow-[0_0_50px_rgba(56,189,248,0.2)]'
        }`}
        style={{
          maxHeight: '92vh',
          boxShadow: isHighContrast
            ? undefined
            : pulseState.mode === 'speaking'
            ? `0 0 ${40 + pulseState.intensity * 45}px rgba(56, 189, 248, ${0.25 + pulseState.intensity * 0.25}), 0 0 ${80 + pulseState.intensity * 50}px rgba(45, 212, 191, ${0.15 + pulseState.intensity * 0.2})`
            : pulseState.mode === 'processing'
            ? `0 0 ${35 + pulseState.intensity * 35}px rgba(168, 85, 247, ${0.3 + pulseState.intensity * 0.25}), 0 0 ${70 + pulseState.intensity * 45}px rgba(251, 191, 36, ${0.2 + pulseState.intensity * 0.25})`
            : undefined,
          transition: 'box-shadow 0.3s ease-out, border-color 0.3s ease-out',
        }}
      >
        {/* Ambient Pulsating Glow Aura sincronizada com atividade do microfone e processamento da IA */}
        {!isHighContrast && (
          <div
            className={`absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
              pulseState.mode === 'processing'
                ? 'animate-gradualGlow bg-linear-to-b from-indigo-500/30 via-amber-500/20 to-transparent'
                : 'animate-cosmicPulse bg-linear-to-b from-sky-500/25 via-teal-500/15 to-transparent'
            }`}
            style={{
              animationDuration: `${pulseState.speedSec}s`,
              opacity: pulseState.intensity,
              transform: `translate(-50%, 0) scale(${1 + pulseState.intensity * 0.15})`,
            }}
          />
        )}

        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isHighContrast ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/5'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center relative ${
                isHighContrast
                  ? 'bg-slate-900 text-white'
                  : 'bg-linear-to-br from-sky-400/30 to-amber-400/30 border border-sky-400/40 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
              } ${isListening ? 'animate-cosmicPulse ring-2 ring-sky-400/40' : ''}`}
            >
              {isListening && (
                <span className="absolute -inset-1 rounded-2xl bg-sky-400/20 animate-cosmicPulse pointer-events-none" />
              )}
              <DynamicIcon name="Mic" className={`w-5 h-5 text-sky-300 ${isListening ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="voice-modal-title" className="font-bold text-base tracking-tight leading-tight">
                  Apoio por Voz • Escuta Acolhedora
                </h2>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
                    isHighContrast
                      ? 'border-slate-900 text-slate-900'
                      : isListening
                      ? 'border-sky-400/60 bg-sky-500/20 text-sky-200 animate-cosmicPulse shadow-[0_0_10px_rgba(56,189,248,0.35)]'
                      : 'border-sky-400/40 bg-sky-500/15 text-sky-300'
                  }`}
                >
                  {isListening && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                  )}
                  {isListening ? 'Ouvindo você' : 'Ao Vivo'}
                </span>
              </div>
              <p
                className={`text-[11px] leading-none mt-0.5 ${
                  isHighContrast ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                Voz serena e empática • Fale no seu tempo, com calma
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Selector de Vozes do Apoio */}
            <div className="relative">
              <button
                id="btn-toggle-human-voice"
                onClick={() => setShowVoiceMenu((prev) => !prev)}
                title="Escolher voz humana do Apoio"
                className={`px-2.5 py-1.5 rounded-xl border text-xs transition flex items-center gap-1.5 ${
                  isHighContrast
                    ? 'border-slate-300 hover:bg-slate-100 text-slate-800'
                    : 'border-amber-400/30 bg-amber-500/10 hover:bg-amber-500/15 text-amber-200'
                }`}
              >
                <DynamicIcon name="Sparkles" className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="text-[11px] font-medium hidden sm:inline">
                  Voz: {GEMINI_VOICES.find((v) => v.id === selectedVoice)?.name || selectedVoice}
                </span>
                <span className="text-[11px] font-medium sm:hidden">{selectedVoice}</span>
                <DynamicIcon name="ChevronDown" className="w-3 h-3 opacity-70" />
              </button>

              {showVoiceMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowVoiceMenu(false)}
                  />
                  <div
                    id="voice-picker-menu"
                    className={`absolute right-0 top-full mt-2 w-72 rounded-2xl p-2 border shadow-2xl z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl ${
                      isHighContrast
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-slate-900/95 border-slate-700/80 text-white'
                    }`}
                  >
                    <div className="px-2.5 py-1.5 border-b border-white/5 mb-1.5 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-300">
                        Escolha o Tom de Voz
                      </span>
                      <span className="text-[10px] text-amber-400 font-medium">Voz Humana Real</span>
                    </div>
                    <div className="space-y-1">
                      {GEMINI_VOICES.map((voice) => {
                        const isSelected = selectedVoice === voice.id;
                        return (
                          <button
                            key={voice.id}
                            id={`btn-voice-option-${voice.id.toLowerCase()}`}
                            onClick={() => {
                              setSelectedVoice(voice.id);
                              if (typeof window !== 'undefined') {
                                localStorage.setItem('meumundo_selected_voice', voice.id);
                              }
                              setShowVoiceMenu(false);
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition flex items-center justify-between group ${
                              isSelected
                                ? isHighContrast
                                  ? 'bg-amber-100 text-amber-900 font-semibold'
                                  : 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
                                : isHighContrast
                                ? 'hover:bg-slate-100 text-slate-700'
                                : 'hover:bg-white/5 text-slate-300'
                            }`}
                          >
                            <div className="pr-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-[12px]">{voice.name}</span>
                                {voice.badge && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium leading-none">
                                    {voice.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                                {voice.tone}
                              </p>
                            </div>
                            {isSelected && (
                              <DynamicIcon name="Check" className="w-4 h-4 text-amber-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Toggle History Drawer */}
            <button
              id="btn-toggle-transcript-history"
              onClick={() => setShowHistory(!showHistory)}
              title={showHistory ? 'Ocultar histórico' : 'Ver transcrição'}
              className={`p-2 rounded-xl border text-xs transition flex items-center gap-1 ${
                showHistory
                  ? isHighContrast
                    ? 'bg-slate-900 text-white'
                    : 'bg-sky-500/20 text-sky-300 border-sky-400/40'
                  : isHighContrast
                  ? 'border-slate-300 hover:bg-slate-100'
                  : 'border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <DynamicIcon name="MessageSquare" className="w-4 h-4" />
              <span className="text-[11px] font-medium hidden sm:inline">Histórico</span>
            </button>

            {/* Close Button */}
            <button
              id="btn-close-voice-modal"
              onClick={onClose}
              aria-label="Fechar conversa por voz"
              className={`p-2 rounded-xl border transition ${
                isHighContrast
                  ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                  : 'border-white/10 hover:bg-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <DynamicIcon name="X" className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-between space-y-6">
          {/* Main Visualizer Stage */}
          <div className="w-full flex flex-col items-center justify-center my-auto py-2">
            {/* Gentle Cosmic Pulse Indicator when Microphone is Active */}
            {isListening && (
              <div
                id="voice-mic-active-pulse-badge"
                className="VoiceConversationModal-listening-pulse flex items-center justify-center gap-2 px-4 py-1.5 rounded-full border border-sky-400/40 bg-sky-500/15 text-sky-200 text-xs font-medium animate-cosmicPulse shadow-[0_0_20px_rgba(56,189,248,0.25)] mb-3 transition-all"
                style={{
                  animationDuration: `${pulseState.speedSec}s`,
                }}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"
                    style={{ animationDuration: `${Math.max(1.8, pulseState.speedSec * 0.55)}s` }}
                  />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-300" />
                </span>
                <span>
                  {audioLevel > 6
                    ? 'Ouvindo sua fala • Pulsação suave e profunda'
                    : 'Microfone Ativo • Sintonizando voz em harmonia cósmica'}
                </span>
              </div>
            )}

            {/* Animated Sphere / Audio Waves */}
            <div className="relative flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56">
              {/* Outer Ripple Rings and Cosmic Ambient Waves */}
              {isListening && (
                <>
                  {/* Cosmic Pulse Ambient Glow Aura sincronizada com atividade do microfone */}
                  <div
                    className="absolute -inset-6 sm:-inset-8 rounded-full bg-linear-to-tr from-sky-500/25 via-teal-400/20 to-indigo-500/25 blur-xl animate-cosmicPulse pointer-events-none"
                    style={{
                      animationDuration: `${pulseState.speedSec}s`,
                      filter: `blur(${16 + pulseState.intensity * 18}px)`,
                      transform: `scale(${1 + pulseState.intensity * 0.12})`,
                      opacity: Math.min(1.0, 0.45 + pulseState.intensity * 0.5),
                      transition: 'filter 0.2s ease-out, transform 0.2s ease-out',
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-full border border-sky-400/40 animate-ping opacity-60 pointer-events-none"
                    style={{ animationDuration: `${Math.max(2.2, pulseState.speedSec * 0.55)}s` }}
                  />
                  <div
                    className="absolute -inset-4 rounded-full border border-teal-400/40 animate-cosmicPulse pointer-events-none"
                    style={{
                      animationDuration: `${pulseState.speedSec}s`,
                      transform: `scale(${1 + audioLevel * 0.007})`,
                      boxShadow: `0 0 ${12 + pulseState.intensity * 20}px rgba(45, 212, 191, ${0.3 + pulseState.intensity * 0.35})`,
                      transition: 'transform 0.1s ease-out, box-shadow 0.2s ease-out',
                    }}
                  />
                </>
              )}

              {isAiSpeaking && (
                <>
                  <div
                    className="absolute inset-0 rounded-full border border-amber-400/40 animate-ping opacity-50 pointer-events-none"
                    style={{ animationDuration: '2.5s' }}
                  />
                  <div className="absolute -inset-5 rounded-full border border-sky-400/25 animate-pulse pointer-events-none" />
                </>
              )}

              {/* Dynamic Gradual Radial Glow (glow) while IA processes input */}
              {isProcessing && (
                <>
                  {/* Layer 1: Wide diffuse radial glow expanding and brightening gradually, with frequency subtly increased */}
                  <div
                    id="voice-radial-glow-diffuse"
                    className="absolute -inset-10 sm:-inset-16 rounded-full pointer-events-none transition-all duration-300 animate-gradualGlow"
                    style={{
                      background: `radial-gradient(circle, rgba(56, 189, 248, ${0.45 + glowIntensity * 0.45}) 0%, rgba(168, 85, 247, ${0.35 + glowIntensity * 0.45}) 40%, rgba(251, 191, 36, ${0.2 + glowIntensity * 0.4}) 65%, transparent 82%)`,
                      filter: `blur(${14 + glowIntensity * 16}px)`,
                      transform: `scale(${0.95 + glowIntensity * 0.22})`,
                      animationDuration: `${pulseState.speedSec}s`, // Frequência aumentada sutilmente
                    }}
                  />
                  {/* Layer 2: Focused energetic radial core glow */}
                  <div
                    id="voice-radial-glow-core"
                    className="absolute -inset-4 sm:-inset-6 rounded-full pointer-events-none transition-all duration-300 animate-cosmicPulse"
                    style={{
                      background: `radial-gradient(circle, rgba(251, 191, 36, ${0.35 + glowIntensity * 0.45}) 0%, rgba(56, 189, 248, ${0.4 + glowIntensity * 0.4}) 50%, transparent 75%)`,
                      filter: `blur(${8 + glowIntensity * 8}px)`,
                      transform: `scale(${1 + glowIntensity * 0.12})`,
                      animationDuration: `${pulseState.speedSec}s`, // Frequência aumentada sutilmente
                    }}
                  />
                  {/* Layer 3: Dashed orbital ring with speed and color reactive to processing */}
                  <div
                    className="absolute inset-0 rounded-full border-2 border-dashed pointer-events-none animate-spin"
                    style={{
                      borderColor: `rgba(251, 191, 36, ${0.5 + glowIntensity * 0.45})`,
                      boxShadow: `0 0 ${15 + glowIntensity * 25}px rgba(56, 189, 248, ${0.4 + glowIntensity * 0.45})`,
                      animationDuration: `${Math.max(1.2, 3.2 - glowIntensity * 1.8)}s`,
                    }}
                  />
                </>
              )}

              {/* Core Reactive Glowing Orb / Voice Button */}
              <button
                type="button"
                id="voice-central-orb-button"
                role="button"
                aria-label={
                  isListening
                    ? 'Microfone ativo. Toque para concluir a fala.'
                    : isAiSpeaking
                    ? 'IA falando. Toque para interromper a fala.'
                    : isProcessing
                    ? 'A IA está processando sua fala com carinho...'
                    : 'Toque para falar por voz com a IA do Meu Mundo.'
                }
                onClick={() => {
                  if (isListening) {
                    stopListening();
                  } else if (isAiSpeaking) {
                    stopAiSpeech();
                  } else if (!isProcessing) {
                    startListening();
                  }
                }}
                disabled={isProcessing}
                className={`w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl relative z-10 cursor-pointer focus:outline-none focus:ring-4 focus:ring-sky-400/50 ${
                  isListening
                    ? 'bg-linear-to-tr from-sky-600/80 via-teal-500/70 to-indigo-600/80 text-white shadow-[0_0_40px_rgba(56,189,248,0.5)] scale-105'
                    : isAiSpeaking
                    ? 'bg-linear-to-tr from-amber-500/80 via-rose-500/70 to-sky-500/80 text-white shadow-[0_0_40px_rgba(251,191,36,0.45)] scale-105'
                    : isProcessing
                    ? 'bg-linear-to-tr from-indigo-700/85 via-purple-600/85 to-amber-600/85 text-white scale-105'
                    : isHighContrast
                    ? 'bg-slate-100 border-2 border-slate-900 text-slate-900 hover:bg-slate-200'
                    : 'bg-linear-to-b from-white/10 to-white/5 border border-white/20 text-slate-200 hover:border-sky-400/50 hover:bg-white/10 hover:scale-102'
                }`}
                style={
                  isListening
                    ? {
                        boxShadow: `0 0 ${25 + pulseState.intensity * 40}px rgba(56, 189, 248, ${0.4 + pulseState.intensity * 0.35}), 0 0 ${50 + pulseState.intensity * 50}px rgba(45, 212, 191, ${0.25 + pulseState.intensity * 0.35})`,
                        transition: 'box-shadow 0.2s ease-out, transform 0.2s ease-out',
                      }
                    : isProcessing
                    ? {
                        boxShadow: `0 0 ${25 + glowIntensity * 40}px rgba(56, 189, 248, ${0.55 + glowIntensity * 0.4}), 0 0 ${50 + glowIntensity * 60}px rgba(168, 85, 247, ${0.4 + glowIntensity * 0.45}), 0 0 ${75 + glowIntensity * 75}px rgba(251, 191, 36, ${0.3 + glowIntensity * 0.45})`,
                        transition: 'box-shadow 0.2s ease-out, transform 0.2s ease-out',
                      }
                    : undefined
                }
              >
                {/* Dynamic Icon inside Orb */}
                {isListening ? (
                  <>
                    <DynamicIcon name="Mic" className="w-10 h-10 text-white animate-bounce" />
                    <span className="text-[11px] font-bold mt-1 tracking-wider uppercase">Ouvindo...</span>
                  </>
                ) : isAiSpeaking ? (
                  <>
                    <DynamicIcon name="Volume2" className="w-10 h-10 text-white animate-pulse" />
                    <span className="text-[11px] font-bold mt-1 tracking-wider uppercase">Falando...</span>
                  </>
                ) : isProcessing ? (
                  <>
                    <DynamicIcon name="Sparkles" className="w-10 h-10 text-amber-200 animate-spin" />
                    <span className="text-[11px] font-bold mt-1 tracking-wider uppercase">Pensando...</span>
                  </>
                ) : (
                  <>
                    <DynamicIcon name="Mic" className="w-10 h-10 text-sky-300" />
                    <span className="text-[11px] font-bold mt-1 tracking-wider uppercase">Toque p/ falar</span>
                  </>
                )}
              </button>
            </div>

            {/* Status indicator bar */}
            <div
              id="voice-status-indicator-bar"
              className={`mt-3 flex items-center justify-center gap-2 px-3.5 py-1 rounded-full transition-all ${
                isListening
                  ? isHighContrast
                    ? 'bg-slate-100 border border-slate-300 animate-cosmicPulse'
                    : 'bg-sky-500/15 border border-sky-400/40 text-sky-200 animate-cosmicPulse shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                  : ''
              }`}
              style={
                isListening
                  ? { animationDuration: `${pulseState.speedSec}s` }
                  : undefined
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isListening
                    ? 'bg-sky-400 animate-ping'
                    : isAiSpeaking
                    ? 'bg-amber-400 animate-pulse'
                    : isProcessing
                    ? 'bg-purple-400 animate-pulse'
                    : 'bg-emerald-400'
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  isHighContrast ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                {isListening
                  ? 'Escutando você com carinho e atenção...'
                  : isAiSpeaking
                  ? 'Apoio falando com voz acolhedora (toque para pausar)'
                  : isProcessing
                  ? 'Acolhendo o que você disse e refletindo com calma...'
                  : 'Pronta para te ouvir no seu tempo'}
              </span>
            </div>

            {/* Live user transcript preview */}
            {liveTranscript && (
              <div
                className={`mt-3 px-4 py-2 rounded-2xl max-w-md text-center text-xs sm:text-sm font-medium animate-fadeIn ${
                  isHighContrast
                    ? 'bg-slate-100 text-slate-900 border border-slate-300'
                    : 'bg-sky-500/15 border border-sky-400/30 text-sky-200'
                }`}
              >
                <span className="opacity-70 text-[10px] block uppercase font-semibold">Você está dizendo:</span>
                "{liveTranscript}"
              </div>
            )}

            {/* Latest AI response text box */}
            {!liveTranscript && latestTurn && (
              <div
                className={`mt-3 px-4 py-3 rounded-2xl max-w-lg text-center transition-all ${
                  latestTurn.role === 'model'
                    ? isHighContrast
                      ? 'bg-slate-50 border border-slate-300 text-slate-900'
                      : 'bg-white/5 border border-white/10 text-slate-100 shadow-inner'
                    : isHighContrast
                    ? 'bg-sky-50 text-slate-900'
                    : 'bg-sky-950/40 border border-sky-500/20 text-sky-200'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1 text-[11px] opacity-70">
                  <DynamicIcon
                    name={latestTurn.role === 'model' ? 'Heart' : 'User'}
                    className="w-3.5 h-3.5 text-amber-300"
                  />
                  <span>{latestTurn.role === 'model' ? 'Apoio Meu Mundo' : 'Você'}</span>
                </div>
                <p className="text-sm sm:text-base leading-relaxed">{latestTurn.text}</p>

                {/* Proposed Actions if any */}
                {latestTurn.actions && latestTurn.actions.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-white/10 flex flex-wrap gap-2 justify-center">
                    {latestTurn.actions.map((act) => (
                      <button
                        key={act.id}
                        id={`btn-voice-act-${act.id}`}
                        onClick={() => handleActionClick(act)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm ${
                          isHighContrast
                            ? 'bg-slate-900 text-white hover:bg-slate-800'
                            : 'bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 text-amber-200'
                        }`}
                      >
                        <DynamicIcon name="Sparkles" className="w-3.5 h-3.5 text-amber-300" />
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Voice Prompt Suggestions */}
          {!isListening && !isAiSpeaking && !isProcessing && (
            <div className="w-full">
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider block text-center mb-2 ${
                  isHighContrast ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                Perguntas rápidas para falar ou tocar:
              </span>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {voiceStarters.map((starter, idx) => (
                  <button
                    key={idx}
                    id={`btn-starter-${idx}`}
                    onClick={() => sendVoiceMessage(starter)}
                    className={`text-xs px-3 py-1.5 rounded-xl border text-left transition flex items-center gap-1.5 ${
                      isHighContrast
                        ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    <DynamicIcon name="MessageCircle" className="w-3 h-3 text-sky-400 shrink-0" />
                    <span className="truncate max-w-[280px]">{starter}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Transcript History Drawer (Collapsible) */}
          {showHistory && (
            <div
              className={`w-full max-h-48 overflow-y-auto rounded-2xl p-3 border text-xs space-y-2.5 ${
                isHighContrast ? 'bg-slate-100 border-slate-300' : 'bg-black/40 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between font-semibold border-b border-white/10 pb-1 text-[11px]">
                <span>Transcrição da Conversa</span>
                <span className="opacity-70">{turns.length} falas</span>
              </div>
              {turns.map((t) => (
                <div
                  key={t.id}
                  className={`p-2 rounded-xl ${
                    t.role === 'user'
                      ? isHighContrast
                        ? 'bg-sky-100 text-sky-950 font-medium ml-4'
                        : 'bg-sky-900/30 border border-sky-500/20 text-sky-200 ml-4'
                      : isHighContrast
                      ? 'bg-white border border-slate-300 text-slate-900 mr-4'
                      : 'bg-white/5 border border-white/10 text-slate-200 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-70 mb-0.5">
                    <span>{t.role === 'user' ? 'Você' : 'Apoio IA'}</span>
                    <span>{t.timestamp}</span>
                  </div>
                  <p>{t.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Manual Text Fallback Input */}
          {showManualInput && (
            <div className="w-full flex gap-2">
              <input
                id="input-voice-manual"
                type="text"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    sendVoiceMessage(manualText);
                    setManualText('');
                  }
                }}
                placeholder="Ou digite o que você precisa falar..."
                className={`flex-1 px-4 py-2.5 rounded-2xl text-xs sm:text-sm border focus:outline-none focus:ring-2 ${
                  isHighContrast
                    ? 'border-slate-900 bg-white text-slate-950 focus:ring-slate-900'
                    : 'border-white/15 bg-white/5 text-white placeholder-slate-400 focus:ring-sky-400/50'
                }`}
              />
              <button
                id="btn-send-manual-voice"
                onClick={() => {
                  sendVoiceMessage(manualText);
                  setManualText('');
                }}
                disabled={!manualText.trim()}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition disabled:opacity-50 ${
                  isHighContrast
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold'
                }`}
              >
                Enviar
              </button>
            </div>
          )}
        </div>

        {/* Modal Controls Bottom Bar */}
        <div
          className={`px-5 py-4 border-t flex items-center justify-between gap-3 ${
            isHighContrast ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/5'
          }`}
        >
          {/* Hands-Free Toggle */}
          <button
            id="btn-toggle-handsfree"
            onClick={() => setHandsFreeMode(!handsFreeMode)}
            title={
              handsFreeMode
                ? 'Modo mãos-livres ativo: escuta automaticamente após a resposta da IA'
                : 'Modo manual: você toca para falar cada vez'
            }
            className={`px-3 py-1.5 rounded-xl border text-xs transition flex items-center gap-1.5 font-medium ${
              handsFreeMode
                ? isHighContrast
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_10px_rgba(52,211,153,0.2)]'
                : isHighContrast
                ? 'border-slate-300 text-slate-600 hover:bg-slate-100'
                : 'border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <DynamicIcon name={handsFreeMode ? 'Sparkles' : 'MicOff'} className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mãos-Livres</span>
            <span className="text-[10px] opacity-75">{handsFreeMode ? 'Ativo' : 'Manual'}</span>
          </button>

          {/* Primary Big Voice Action Button */}
          <div className="flex items-center gap-2">
            {isAiSpeaking ? (
              <button
                id="btn-interrupt-ai-speech"
                onClick={stopAiSpeech}
                title="Pausar fala da IA"
                className={`px-5 py-2.5 rounded-2xl border font-semibold text-xs sm:text-sm flex items-center gap-2 transition active:scale-95 shadow-md ${
                  isHighContrast
                    ? 'border-slate-900 bg-rose-50 text-rose-900 hover:bg-rose-100'
                    : 'border-rose-500/40 bg-rose-950/40 text-rose-200 hover:bg-rose-900/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                }`}
              >
                <DynamicIcon name="Square" className="w-4 h-4 text-rose-400 fill-current" />
                <span>Interromper Fala</span>
              </button>
            ) : isListening ? (
              <button
                id="btn-stop-listening-action"
                onClick={stopListening}
                className={`px-6 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition active:scale-95 shadow-lg animate-cosmicPulse ${
                  isHighContrast
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : 'bg-linear-to-r from-rose-500 to-pink-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                }`}
              >
                <DynamicIcon name="MicOff" className="w-4 h-4 animate-pulse" />
                <span>Concluir Fala</span>
              </button>
            ) : isProcessing ? (
              <button
                id="btn-processing-voice-action"
                disabled
                className="relative px-6 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 text-white shadow-xl transition-all duration-300 overflow-visible"
                style={{
                  background: isHighContrast
                    ? '#0f172a'
                    : 'linear-gradient(135deg, rgba(79, 70, 229, 0.95), rgba(147, 51, 234, 0.95), rgba(245, 158, 11, 0.95))',
                  boxShadow: `0 0 ${18 + glowIntensity * 30}px rgba(56, 189, 248, ${0.5 + glowIntensity * 0.45}), 0 0 ${35 + glowIntensity * 45}px rgba(168, 85, 247, ${0.35 + glowIntensity * 0.45})`,
                }}
              >
                {/* Gradual Radial Glow (glow) around the voice processing button */}
                <span
                  id="btn-processing-radial-glow"
                  className="absolute -inset-2.5 rounded-3xl pointer-events-none transition-all duration-300 animate-gradualGlow"
                  style={{
                    background: `radial-gradient(ellipse at center, rgba(56, 189, 248, ${0.45 + glowIntensity * 0.45}) 0%, rgba(168, 85, 247, ${0.35 + glowIntensity * 0.4}) 45%, rgba(251, 191, 36, ${0.2 + glowIntensity * 0.35}) 70%, transparent 85%)`,
                    filter: `blur(${6 + glowIntensity * 8}px)`,
                    zIndex: -1,
                  }}
                />
                <DynamicIcon name="Sparkles" className="w-4 h-4 text-amber-200 animate-spin" />
                <span>Processando...</span>
              </button>
            ) : (
              <button
                id="btn-start-listening-action"
                onClick={startListening}
                className={`px-6 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition active:scale-95 shadow-lg ${
                  isHighContrast
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-linear-to-r from-sky-400 via-teal-400 to-sky-300 text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:brightness-110'
                }`}
              >
                <DynamicIcon name="Mic" className="w-4 h-4 text-slate-950" />
                <span>Falar Agora</span>
              </button>
            )}
          </div>

          {/* Toggle Text Keyboard Fallback */}
          <button
            id="btn-toggle-keyboard"
            onClick={() => setShowManualInput(!showManualInput)}
            title={showManualInput ? 'Ocultar teclado' : 'Digitar por texto'}
            className={`p-2 rounded-xl border text-xs transition ${
              showManualInput
                ? isHighContrast
                  ? 'bg-slate-900 text-white'
                  : 'bg-white/15 text-white border-white/20'
                : isHighContrast
                ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                : 'border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <DynamicIcon name="Keyboard" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
