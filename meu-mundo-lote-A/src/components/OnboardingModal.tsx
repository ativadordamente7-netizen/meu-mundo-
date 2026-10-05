import React, { useState } from 'react';
import { FamilyProfile } from '../types';
import { DynamicIcon } from './IconHelper';

interface OnboardingModalProps {
  profile: FamilyProfile;
  onSave: (updated: FamilyProfile) => void;
  onExploreTour: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  profile,
  onSave,
  onExploreTour,
}) => {
  const [step, setStep] = useState<'welcome' | 'form'>('welcome');
  const [parentName, setParentName] = useState(profile.parentName || '');
  const [childName, setChildName] = useState(profile.childName || '');
  const [childAge, setChildAge] = useState(profile.childAge || '');
  const [focusArea, setFocusArea] = useState(profile.focusArea || 'Organizar a rotina');

  const focusOptions = [
    'Organizar a rotina',
    'Ajudar na comunicação',
    'Compreender melhor as necessidades da criança',
    'Lidar com momentos de sobrecarga',
    'Encontrar apoio para mim',
    'Um pouco de tudo',
  ];

  const handleFinish = (skip = false) => {
    onSave({
      ...profile,
      parentName: skip ? (parentName || 'Você') : (parentName || 'Você'),
      childName: skip ? (childName || 'Sua criança') : (childName || 'Sua criança'),
      childAge: skip ? childAge : childAge,
      focusArea: skip ? focusArea : focusArea,
      onboardingCompleted: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0a1128]/95 backdrop-blur-xl rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-lg w-full overflow-hidden border border-indigo-900/60 flex flex-col max-h-[92vh] text-slate-200">
        {step === 'welcome' ? (
          <div className="p-6 md:p-8 flex flex-col items-center text-center overflow-y-auto">
            {/* Soft Inclusive Family SVG Illustration */}
            <div className="w-full max-w-xs my-2 py-4 bg-indigo-950/40 rounded-2xl flex items-center justify-center border border-indigo-900/40 shadow-inner">
              <svg
                viewBox="0 0 320 180"
                className="w-56 h-32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="160" cy="90" r="70" fill="#38BDF8" opacity="0.15" />
                {/* Parent figure 1 */}
                <circle cx="115" cy="65" r="18" fill="#FDBA74" />
                <path d="M90 135 C90 100 140 100 140 135 Z" fill="#38BDF8" />
                <path d="M102 52 C106 48 126 48 128 55 C124 55 110 54 102 52 Z" fill="#78350F" />
                
                {/* Child figure */}
                <circle cx="160" cy="85" r="15" fill="#FED7AA" />
                <path d="M142 135 C142 110 178 110 178 135 Z" fill="#34D399" />
                <path d="M150 75 C155 72 168 72 170 78 C166 78 156 77 150 75 Z" fill="#9A3412" />

                {/* Parent figure 2 / Supporter */}
                <circle cx="205" cy="68" r="17" fill="#FDE047" />
                <path d="M182 135 C182 102 228 102 228 135 Z" fill="#A78BFA" />
                <path d="M192 54 C198 50 216 50 218 57 C212 56 200 56 192 54 Z" fill="#1E293B" />

                {/* Connecting gentle bond */}
                <path d="M130 115 Q160 125 190 115" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" />
                <circle cx="160" cy="120" r="4" fill="#F43F5E" />
              </svg>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-300 text-xs font-semibold mb-3">
              <DynamicIcon name="Heart" className="w-3.5 h-3.5 text-amber-300" />
              <span>Meu Mundo — Apoio à Família</span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
              "Você não precisa entender tudo de uma vez. Vamos dar um passo de cada vez, juntos."
            </h2>

            <p className="mt-2.5 text-sm md:text-base text-slate-300 leading-relaxed max-w-md">
              Um espaço para organizar a rotina, apoiar a comunicação e cuidar de quem cuida.
            </p>

            <div className="mt-4 p-3.5 rounded-xl bg-slate-900/70 border border-indigo-900/60 text-xs text-slate-300 text-left w-full leading-relaxed">
              <span className="font-semibold text-amber-300 block mb-0.5">❤️ Cada criança é única:</span>
              Não existe uma maneira única de vivenciar o autismo. Este aplicativo é um suporte acolhedor e adaptável ao ritmo singular da sua família.
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5 w-full">
              <button
                id="btn-start-journey"
                onClick={() => setStep('form')}
                className="flex-1 bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold py-3 px-5 rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.3)] transition active:scale-98 flex items-center justify-center gap-2 text-sm"
              >
                <span>Começar minha jornada</span>
                <DynamicIcon name="ChevronRight" className="w-4 h-4 text-slate-950" />
              </button>

              <button
                id="btn-tour-app"
                onClick={onExploreTour}
                className="py-3 px-4 rounded-xl border border-white/10 hover:bg-white/10 text-slate-200 text-sm font-medium transition flex items-center justify-center gap-1.5"
              >
                <DynamicIcon name="Eye" className="w-4 h-4 text-slate-400" />
                <span>Conhecer o aplicativo</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 md:p-8 overflow-y-auto flex-1">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-indigo-950/80">
              <div>
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Passo 1 de 1</span>
                <h3 className="text-lg font-bold text-white">Personalização inicial</h3>
              </div>
              <button
                onClick={() => handleFinish(true)}
                className="text-xs text-slate-400 hover:text-white font-medium px-2 py-1 rounded hover:bg-white/10 transition"
              >
                Pular por agora
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Perguntas simples para deixar as mensagens acolhedoras e adequadas. Não solicitamos documentos, laudos ou dados sensíveis.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleFinish(false);
              }}
              className="space-y-4 text-left"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  1. Como podemos chamar você? (responsável)
                </label>
                <input
                  id="input-parent-name"
                  type="text"
                  placeholder="Ex: Mariana, Carlos, Tia Bia..."
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-900/80 bg-slate-950 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  2. Como podemos chamar sua criança?
                </label>
                <input
                  id="input-child-name"
                  type="text"
                  placeholder="Ex: Lucas, Sofia, Gabriel..."
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-900/80 bg-slate-950 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  3. Qual é a idade da criança? (opcional)
                </label>
                <input
                  id="input-child-age"
                  type="text"
                  placeholder="Ex: 4 anos, 7 anos..."
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-900/80 bg-slate-950 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  4. O que você mais gostaria de melhorar neste momento?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                  {focusOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFocusArea(opt)}
                      className={`text-left p-2.5 rounded-xl text-xs font-medium border transition flex items-center justify-between ${
                        focusArea === opt
                          ? 'bg-amber-400/20 border-amber-400 text-amber-200 shadow-sm'
                          : 'bg-slate-900/80 border-indigo-900/60 text-slate-300 hover:bg-indigo-950/40'
                      }`}
                    >
                      <span className="leading-snug">{opt}</span>
                      {focusArea === opt && (
                        <DynamicIcon name="Check" className="w-3.5 h-3.5 text-amber-300 shrink-0 ml-1.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('welcome')}
                  className="py-2.5 px-4 rounded-xl border border-white/10 text-slate-300 text-xs font-medium hover:bg-white/10 transition"
                >
                  Voltar
                </button>
                <button
                  id="btn-save-onboarding"
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold shadow-[0_0_15px_rgba(251,191,36,0.3)] transition active:scale-98"
                >
                  Concluir e entrar no Meu Espaço
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
