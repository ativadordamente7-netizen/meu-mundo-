import React from 'react';

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Erro inesperado no app:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#060919] text-slate-100">
        <div className="max-w-sm text-center space-y-4">
          <h1 className="text-xl font-bold">Algo não saiu como esperado</h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Calma, está tudo bem. O que você já tinha salvo neste aparelho continua aqui.
            Vamos tentar abrir de novo.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm"
          >
            Abrir novamente
          </button>
        </div>
      </div>
    );
  }
}
