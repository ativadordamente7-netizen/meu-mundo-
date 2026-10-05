import React from 'react';
import { DynamicIcon } from './IconHelper';

interface WelcomeTourModalProps {
  onClose: () => void;
}

export const WelcomeTourModal: React.FC<WelcomeTourModalProps> = ({ onClose }) => {
  const pillars = [
    {
      title: 'Rotina Visual Previsível',
      icon: 'Calendar',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      description:
        'Crie sequências de atividades ilustradas com horários opcionais e a ferramenta essencial de preparação para mudanças (avisos prévios e transições suaves).',
    },
    {
      title: 'Cartões de Comunicação (CAA)',
      icon: 'MessageSquare',
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      description:
        'Apoie a expressão de necessidades básicas, escolhas, sentimentos e recusas com cartões visuais amplos e leitor de voz em português.',
    },
    {
      title: 'Cuidando de Quem Cuida',
      icon: 'Heart',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      description:
        'Acolhimento real para pais e cuidadores: artigos breves e práticos, pausas guiadas de respiração e lembretes de que você não precisa ser perfeito.',
    },
    {
      title: 'Diário de Observações da Família',
      icon: 'BookOpen',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description:
        'Registre o que aconteceu antes, reações e o que ajudou no momento. Exporte resumos limpos para levar às consultas com terapeutas.',
    },
    {
      title: 'Converse com o Apoio',
      icon: 'HelpCircle',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      description:
        'Tire dúvidas do dia a dia sobre transições, descompressão sensorial e rotinas, com respostas acolhedoras, sem prescrição e sempre valorizando a singularidade.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0a1128]/95 backdrop-blur-xl rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-xl w-full p-6 md:p-8 border border-indigo-900/60 flex flex-col max-h-[90vh] text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-indigo-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/15 flex items-center justify-center text-amber-300 border border-amber-300/30 shadow-[0_0_10px_rgba(251,191,36,0.2)]">
              <DynamicIcon name="Sparkles" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Conhecendo o aplicativo</h3>
              <p className="text-xs text-slate-400">Um companheiro seguro para o dia a dia da sua família</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Fechar"
          >
            <DynamicIcon name="X" className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 overflow-y-auto pr-1 flex-1">
          {pillars.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl border border-indigo-900/40 hover:border-indigo-800/60 bg-slate-900/60 transition flex items-start gap-3.5 shadow-sm"
            >
              <div className={`p-2 rounded-xl border shrink-0 ${item.color}`}>
                <DynamicIcon name={item.icon} className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs md:text-sm font-bold text-white">{item.title}</h4>
                <p className="mt-0.5 text-xs text-slate-300 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}

          <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-300/20 text-left shadow-[0_0_15px_rgba(251,191,36,0.05)]">
            <p className="text-xs text-amber-200 leading-relaxed font-medium">
              "Cada criança tem seu jeito. Cada família tem seu caminho. Vamos caminhar juntos, um passo de cada vez."
            </p>
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-indigo-950/80">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs md:text-sm font-bold shadow-[0_0_15px_rgba(251,191,36,0.3)] transition active:scale-98"
          >
            Entendido, começar a usar
          </button>
        </div>
      </div>
    </div>
  );
};
