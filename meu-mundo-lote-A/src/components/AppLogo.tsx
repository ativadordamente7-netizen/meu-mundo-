import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  textClassName?: string;
}

/**
 * Logotipo oficial do Meu Mundo
 * Representação artística de neurodiversidade:
 * - Hemisfério cerebral esquerdo traçado com dobras orgânicas
 * - Ramos que se expandem como uma árvore viva
 * - Peças de quebra-cabeça multicoloridas (azul, vermelho, amarelo, turquesa)
 * - Girassóis da neurodiversidade / deficiências invisíveis
 * - Partículas harmônicas de desenvolvimento e potencial
 */
export const AppLogo: React.FC<AppLogoProps> = ({
  className = 'w-10 h-10',
  size,
  showText = false,
  textClassName = 'text-white',
}) => {
  const dimensionStyle = size ? { width: size, height: size } : {};

  return (
    <div className="inline-flex items-center gap-2 select-none">
      <svg
        viewBox="0 0 320 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={dimensionStyle}
        aria-label="Logotipo Meu Mundo — Neurodiversidade, Amor e Acolhimento"
      >
        <defs>
          {/* Sombras suaves e brilhos cósmicos */}
          <filter id="logoShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="1" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.35" />
          </filter>
          <filter id="glowYellow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#facc15" floodOpacity="0.5" />
          </filter>
          <filter id="glowBlue" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38bdf8" floodOpacity="0.4" />
          </filter>

          {/* Gradientes dos elementos */}
          <linearGradient id="brainStrokeGrad" x1="40" y1="40" x2="200" y2="300" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="60%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <linearGradient id="sunflowerCenter" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#451a03" />
            <stop offset="100%" stopColor="#1c1917" />
          </linearGradient>

          <linearGradient id="puzzleRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>

          <linearGradient id="puzzleBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          <linearGradient id="puzzleYellow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>

          <linearGradient id="puzzleCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* 1. ESTRUTURA DO CÉREBRO & TRONCO DA ÁRVORE (Linhas grossas marcantes) */}
        <g filter="url(#logoShadow)">
          {/* Contorno externo do hemisfério esquerdo do cérebro */}
          <path
            d="M 165 95 
               C 150 70, 120 60, 95 72
               C 65 85, 55 120, 60 148
               C 42 165, 45 200, 68 220
               C 55 245, 78 275, 110 275
               C 135 275, 160 260, 168 238
               C 185 248, 205 235, 208 200
               C 210 175, 195 145, 185 130
               L 165 95 Z"
            fill="none"
            stroke="#0a0f24"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Sulcos e convoluções internas do cérebro */}
          <path
            d="M 85 125 C 105 130, 125 110, 135 118"
            fill="none"
            stroke="#0a0f24"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M 82 170 C 102 188, 138 175, 142 160"
            fill="none"
            stroke="#0a0f24"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M 125 185 C 122 210, 145 225, 165 210"
            fill="none"
            stroke="#0a0f24"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M 98 225 C 108 245, 130 250, 148 242"
            fill="none"
            stroke="#0a0f24"
            strokeWidth="8.5"
            strokeLinecap="round"
          />

          {/* Tronco que sobe do cérebro dividindo-se em galhos orgânicos */}
          {/* Galho 1 (Principal central para a direita) */}
          <path
            d="M 188 170 C 195 130, 210 95, 240 70"
            fill="none"
            stroke="#0a0f24"
            strokeWidth="8.5"
            strokeLinecap="round"
          />
          {/* Galho 2 (Para cima e ligeiramente à esquerda) */}
          <path
            d="M 175 140 C 182 105, 178 75, 195 50"
            fill="none"
            stroke="#0a0f24"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Galho 3 (Extensão lateral direita) */}
          <path
            d="M 195 160 C 220 150, 245 155, 270 135"
            fill="none"
            stroke="#0a0f24"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* Galho 4 (Bifurcação suave) */}
          <path
            d="M 215 110 C 235 115, 255 105, 265 92"
            fill="none"
            stroke="#0a0f24"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>

        {/* 2. GIRASSÓIS (Símbolo de Deficiências Ocultas & Autismo) */}
        {/* Girassol Superior Direito (Destaque) */}
        <g transform="translate(208, 62) scale(0.9)" filter="url(#glowYellow)">
          {/* Pétalas Amarelas Radiantes */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
            <path
              key={i}
              d="M 0 -16 C -3 -9, -4 0, 0 0 C 4 0, 3 -9, 0 -16 Z"
              fill="#eab308"
              transform={`rotate(${angle})`}
            />
          ))}
          {/* Miolo Castanho/Preto do Girassol */}
          <circle cx="0" cy="0" r="7.5" fill="url(#sunflowerCenter)" stroke="#ca8a04" strokeWidth="1.5" />
        </g>

        {/* Girassol Médio Esquerdo */}
        <g transform="translate(162, 92) scale(0.7)">
          {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((angle, i) => (
            <path
              key={i}
              d="M 0 -15 C -3 -8, -3 0, 0 0 C 3 0, 3 -8, 0 -15 Z"
              fill="#facc15"
              transform={`rotate(${angle})`}
            />
          ))}
          <circle cx="0" cy="0" r="6.5" fill="url(#sunflowerCenter)" stroke="#ca8a04" strokeWidth="1" />
        </g>

        {/* Girassol Lateral Direito */}
        <g transform="translate(262, 138) scale(0.65)">
          {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((angle, i) => (
            <path
              key={i}
              d="M 0 -15 C -3 -8, -3 0, 0 0 C 3 0, 3 -8, 0 -15 Z"
              fill="#eab308"
              transform={`rotate(${angle})`}
            />
          ))}
          <circle cx="0" cy="0" r="6" fill="url(#sunflowerCenter)" stroke="#ca8a04" strokeWidth="1" />
        </g>

        {/* 3. PEÇAS DE QUEBRA-CABEÇA (Autismo / Neurodiversidade) */}
        {/* Peça 1: Vermelha Grande no topo direito */}
        <g transform="translate(245, 75) rotate(12)" filter="url(#logoShadow)">
          <path
            d="M 0 0 
               H 12 C 12 3, 15 5, 18 5 C 21 5, 24 3, 24 0 H 36 
               V 12 C 39 12, 41 15, 41 18 C 41 21, 39 24, 36 24 V 36 
               H 24 C 24 33, 21 31, 18 31 C 15 31, 12 33, 12 36 H 0 
               V 24 C -3 24, -5 21, -5 18 C -5 15, -3 12, 0 12 Z"
            fill="url(#puzzleRed)"
            stroke="#991b1b"
            strokeWidth="1.2"
          />
        </g>

        {/* Peça 2: Azul Média inferior direita */}
        <g transform="translate(225, 150) rotate(-15)" filter="url(#glowBlue)">
          <path
            d="M 0 0 
               H 10 C 10 2.5, 12.5 4, 15 4 C 17.5 4, 20 2.5, 20 0 H 30 
               V 10 C 32.5 10, 34 12.5, 34 15 C 34 17.5, 32.5 20, 30 20 V 30 
               H 20 C 20 27.5, 17.5 26, 15 26 C 12.5 26, 10 27.5, 10 30 H 0 
               V 20 C -2.5 20, -4 17.5, -4 15 C -4 12.5, -2.5 10, 0 10 Z"
            fill="url(#puzzleCyan)"
            stroke="#0369a1"
            strokeWidth="1"
          />
        </g>

        {/* Peça 3: Amarela Central */}
        <g transform="translate(210, 98) rotate(45)">
          <path
            d="M 0 0 
               H 8 C 8 2, 10 3.5, 12 3.5 C 14 3.5, 16 2, 16 0 H 24 
               V 8 C 26 8, 27.5 10, 27.5 12 C 27.5 14, 26 16, 24 16 V 24 
               H 16 C 16 22, 14 20.5, 12 20.5 C 10 20.5, 8 22, 8 24 H 0 
               V 16 C -2 16, -3.5 14, -3.5 12 C -3.5 10, -2 8, 0 8 Z"
            fill="url(#puzzleYellow)"
            stroke="#a16207"
            strokeWidth="0.8"
          />
        </g>

        {/* Peça 4: Azul Escura Superior Esquerda */}
        <g transform="translate(170, 68) rotate(-20)">
          <path
            d="M 0 0 
               H 6 C 6 1.5, 7.5 2.5, 9 2.5 C 10.5 2.5, 12 1.5, 12 0 H 18 
               V 6 C 19.5 6, 20.5 7.5, 20.5 9 C 20.5 10.5, 19.5 12, 18 12 V 18 
               H 12 C 12 16.5, 10.5 15.5, 9 15.5 C 7.5 15.5, 6 16.5, 6 18 H 0 
               V 12 C -1.5 12, -2.5 10.5, -2.5 9 C -2.5 7.5, -1.5 6, 0 6 Z"
            fill="url(#puzzleBlue)"
            stroke="#1e3a8a"
            strokeWidth="0.8"
          />
        </g>

        {/* Peça 5: Amarela à Esquerda */}
        <g transform="translate(142, 80) rotate(-10)">
          <path
            d="M 0 0 
               H 6 C 6 1.5, 7.5 2.5, 9 2.5 C 10.5 2.5, 12 1.5, 12 0 H 18 
               V 6 C 19.5 6, 20.5 7.5, 20.5 9 C 20.5 10.5, 19.5 12, 18 12 V 18 
               H 12 C 12 16.5, 10.5 15.5, 9 15.5 C 7.5 15.5, 6 16.5, 6 18 H 0 
               V 12 C -1.5 12, -2.5 10.5, -2.5 9 C -2.5 7.5, -1.5 6, 0 6 Z"
            fill="url(#puzzleYellow)"
            stroke="#a16207"
            strokeWidth="0.8"
          />
        </g>

        {/* Peça 6: Azul Claro Pequena no Galho */}
        <g transform="translate(185, 110) rotate(15)">
          <path
            d="M 0 0 
               H 5 C 5 1.5, 6 2, 7.5 2 C 9 2, 10 1.5, 10 0 H 15 
               V 5 C 16.5 5, 17 6, 17 7.5 C 17 9, 16.5 10, 15 10 V 15 
               H 10 C 10 13.5, 9 13, 7.5 13 C 6 13, 5 13.5, 5 15 H 0 
               V 10 C -1.5 10, -2 9, -2 7.5 C -2 6, -1.5 5, 0 5 Z"
            fill="url(#puzzleBlue)"
            stroke="#1e3a8a"
            strokeWidth="0.8"
          />
        </g>

        {/* Peça 7: Vermelha Pequena intermediária */}
        <g transform="translate(195, 88) rotate(30)">
          <path
            d="M 0 0 
               H 5 C 5 1.5, 6 2, 7.5 2 C 9 2, 10 1.5, 10 0 H 15 
               V 5 C 16.5 5, 17 6, 17 7.5 C 17 9, 16.5 10, 15 10 V 15 
               H 10 C 10 13.5, 9 13, 7.5 13 C 6 13, 5 13.5, 5 15 H 0 
               V 10 C -1.5 10, -2 9, -2 7.5 C -2 6, -1.5 5, 0 5 Z"
            fill="url(#puzzleRed)"
            stroke="#991b1b"
            strokeWidth="0.8"
          />
        </g>

        {/* Peça 8: Vermelha Inferior Direita */}
        <g transform="translate(197, 138) rotate(-10)">
          <path
            d="M 0 0 
               H 5 C 5 1.5, 6 2, 7.5 2 C 9 2, 10 1.5, 10 0 H 15 
               V 5 C 16.5 5, 17 6, 17 7.5 C 17 9, 16.5 10, 15 10 V 15 
               H 10 C 10 13.5, 9 13, 7.5 13 C 6 13, 5 13.5, 5 15 H 0 
               V 10 C -1.5 10, -2 9, -2 7.5 C -2 6, -1.5 5, 0 5 Z"
            fill="url(#puzzleRed)"
            stroke="#991b1b"
            strokeWidth="0.8"
          />
        </g>

        {/* Peça 9: Azul Claro no topo do cacho */}
        <g transform="translate(242, 115) rotate(20)">
          <path
            d="M 0 0 
               H 5 C 5 1.5, 6 2, 7.5 2 C 9 2, 10 1.5, 10 0 H 15 
               V 5 C 16.5 5, 17 6, 17 7.5 C 17 9, 16.5 10, 15 10 V 15 
               H 10 C 10 13.5, 9 13, 7.5 13 C 6 13, 5 13.5, 5 15 H 0 
               V 10 C -1.5 10, -2 9, -2 7.5 C -2 6, -1.5 5, 0 5 Z"
            fill="url(#puzzleCyan)"
            stroke="#0369a1"
            strokeWidth="0.8"
          />
        </g>

        {/* Peça 10: Amarela Lateral Flutuante */}
        <g transform="translate(220, 122) rotate(-5)">
          <path
            d="M 0 0 
               H 5 C 5 1.5, 6 2, 7.5 2 C 9 2, 10 1.5, 10 0 H 15 
               V 5 C 16.5 5, 17 6, 17 7.5 C 17 9, 16.5 10, 15 10 V 15 
               H 10 C 10 13.5, 9 13, 7.5 13 C 6 13, 5 13.5, 5 15 H 0 
               V 10 C -1.5 10, -2 9, -2 7.5 C -2 6, -1.5 5, 0 5 Z"
            fill="url(#puzzleYellow)"
            stroke="#a16207"
            strokeWidth="0.8"
          />
        </g>

        {/* 4. ESFERAS / PONTOS COLORIDOS POLINIZADORES */}
        {/* Esferas Amarelas */}
        <circle cx="187" cy="53" r="3.5" fill="#facc15" />
        <circle cx="270" cy="115" r="3" fill="#facc15" />

        {/* Esferas Vermelhas */}
        <circle cx="153" cy="108" r="3.5" fill="#ef4444" />
        <circle cx="236" cy="60" r="3" fill="#ef4444" />
        <circle cx="218" cy="170" r="3" fill="#ef4444" />

        {/* Esferas Azuis */}
        <circle cx="205" cy="105" r="3" fill="#38bdf8" />
      </svg>

      {showText && (
        <div className="flex flex-col text-left">
          <span className={`font-bold text-base tracking-tight leading-none ${textClassName}`}>
            Meu Mundo
          </span>
          <span className="text-[10px] text-amber-300 font-semibold tracking-wider uppercase mt-0.5">
            Apoio à Família
          </span>
        </div>
      )}
    </div>
  );
};
