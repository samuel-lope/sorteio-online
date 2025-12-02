import React, { useState, useEffect } from 'react';
import { RouletteWheel } from './RouletteWheel';
import { SlotMachine } from './SlotMachine';
import { WheelItem, RaffleConfig } from '../types';
import { generateLuckyMessage } from '../services/geminiService';

// Itens decorativos para a roleta
const GENERIC_WHEEL_ITEMS: WheelItem[] = [
  { label: '★', value: 0, color: '#EF476F' },
  { label: '✦', value: 1, color: '#FFD166' },
  { label: '●', value: 2, color: '#06D6A0' },
  { label: '♦', value: 3, color: '#118AB2' },
  { label: '♥', value: 4, color: '#073B4C' },
  { label: '♠', value: 5, color: '#9D4EDD' },
  { label: '★', value: 6, color: '#F78C6B' },
  { label: '♣', value: 7, color: '#48C9B0' },
];

interface RaffleAreaProps {
  config: RaffleConfig;
  drawnNumbers: number[];
  onDraw: () => void;
  onReset: () => void;
}

export const RaffleArea: React.FC<RaffleAreaProps> = ({ config, drawnNumbers, onDraw, onReset }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [visualIndex, setVisualIndex] = useState<number | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [fortune, setFortune] = useState<string>('');
  
  // Identifica quais foram os números sorteados na ÚLTIMA rodada
  const [lastDrawnBatch, setLastDrawnBatch] = useState<number[]>([]);

  // Monitora mudanças no histórico para detectar novo sorteio
  useEffect(() => {
    if (drawnNumbers.length > 0) {
      if (config.drawAllAtOnce) {
        setLastDrawnBatch(drawnNumbers);
      } else {
        setLastDrawnBatch([drawnNumbers[drawnNumbers.length - 1]]);
      }
    }
  }, [drawnNumbers, config.drawAllAtOnce]);

  const handleSpinClick = () => {
    if (isSpinning) return;
    
    // Inicia a animação visual
    setIsSpinning(true);
    setVisualIndex(Math.floor(Math.random() * GENERIC_WHEEL_ITEMS.length));
    setFortune('');
    setShowResultModal(false);
  };

  const handleSpinComplete = async () => {
    // Executa a lógica de sorteio (gera os números)
    onDraw();
    setIsSpinning(false);
    setShowResultModal(true);
  };

  // Efeito para buscar frase quando o modal abre e temos um número único
  useEffect(() => {
    if (showResultModal && lastDrawnBatch.length === 1) {
        generateLuckyMessage(lastDrawnBatch[0], config.min, config.max).then(setFortune);
    }
  }, [showResultModal, lastDrawnBatch, config.min, config.max]);

  

  const isFinished = drawnNumbers.length >= config.quantity;

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto animate-fade-in">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        
        {/* Lado Esquerdo: Roleta/Slot e Ação */}
        <div className="flex flex-col items-center space-y-8 order-2 md:order-1">
          <div className="relative w-full max-w-[350px]">
            {config.animationType === 'slot-machine' ? (
              <SlotMachine 
                items={GENERIC_WHEEL_ITEMS}
                isSpinning={isSpinning}
                onSpinComplete={handleSpinComplete}
                duration={config.spinDuration}
                theme={config.theme}
              />
            ) : (
              <RouletteWheel 
                items={GENERIC_WHEEL_ITEMS}
                winningIndex={visualIndex}
                isSpinning={isSpinning}
                onSpinComplete={handleSpinComplete}
                duration={config.spinDuration}
                theme={config.theme}
              />
            )}
          </div>

          {!isFinished ? (
            <button
              onClick={handleSpinClick}
              disabled={isSpinning}
              className={`
                px-12 py-4 rounded-full font-bold text-xl uppercase tracking-wider shadow-lg transform transition-all
                ${isSpinning 
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                  : config.theme === 'neon'
                    ? 'bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:shadow-fuchsia-500/50 text-white'
                    : config.theme === 'gold'
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-700 hover:shadow-yellow-500/50 text-black'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white'
                }
              `}
            >
              {isSpinning ? 'Sorteando...' : config.drawAllAtOnce ? 'Sortear Todos' : 'Sortear Próximo'}
            </button>
          ) : (
            <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <p className="text-green-400 font-bold text-lg mb-2">Sorteio Finalizado!</p>
              <button 
                onClick={onReset}
                className="text-sm text-slate-400 hover:text-white underline decoration-dashed"
              >
                Configurar novo sorteio
              </button>
            </div>
          )}
        </div>

        {/* Lado Direito: Informações e Histórico */}
        <div className="flex flex-col space-y-6 order-1 md:order-2">
            
            {/* Cards de Status */}
            <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border text-center transition-colors
                   ${config.theme === 'neon' ? 'bg-slate-900 border-fuchsia-500/30' : config.theme === 'gold' ? 'bg-slate-900 border-yellow-600/30' : 'bg-slate-800 border-slate-700'}
                `}>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Intervalo</p>
                    <p className={`text-xl font-bold ${config.theme === 'gold' ? 'text-yellow-400' : 'text-white'}`}>
                      {config.min} - {config.max}
                    </p>
                </div>
                <div className={`p-4 rounded-xl border text-center transition-colors
                   ${config.theme === 'neon' ? 'bg-slate-900 border-cyan-500/30' : config.theme === 'gold' ? 'bg-slate-900 border-yellow-600/30' : 'bg-slate-800 border-slate-700'}
                `}>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Progresso</p>
                    <p className={`text-xl font-bold ${config.theme === 'neon' ? 'text-cyan-400' : config.theme === 'gold' ? 'text-yellow-400' : 'text-indigo-400'}`}>
                      {drawnNumbers.length} / {config.quantity}
                    </p>
                </div>
            </div>

            {/* Histórico */}
            <div className={`flex-grow rounded-2xl border p-4 flex flex-col min-h-[300px]
               ${config.theme === 'neon' ? 'bg-slate-900 border-fuchsia-900' : config.theme === 'gold' ? 'bg-slate-900 border-yellow-900' : 'bg-slate-800 border-slate-700'}
            `}>
                <h3 className="text-slate-400 font-medium mb-4 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${config.theme === 'neon' ? 'bg-fuchsia-500' : 'bg-green-500'}`}></span>
                    Números Sorteados
                </h3>
                
                {drawnNumbers.length === 0 ? (
                    <div className="flex-grow flex items-center justify-center text-slate-600 italic">
                        Nenhum número sorteado ainda.
                    </div>
                ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 content-start overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                        {drawnNumbers.map((num, idx) => (
                            <div key={`${num}-${idx}`} className={`
                              aspect-square rounded-lg flex items-center justify-center font-bold border animate-pop-in
                              ${config.theme === 'neon' 
                                ? 'bg-black border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]' 
                                : config.theme === 'gold'
                                  ? 'bg-gradient-to-br from-yellow-700 to-yellow-900 border-yellow-500 text-white'
                                  : 'bg-slate-700 border-slate-600 text-white'
                              }
                            `}>
                                {num}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Modal de Resultado */}
      {showResultModal && lastDrawnBatch.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`
             border rounded-3xl p-8 max-w-2xl w-full text-center shadow-2xl relative overflow-hidden
             ${config.theme === 'neon' 
               ? 'bg-slate-900 border-fuchsia-500 shadow-fuchsia-900/50' 
               : config.theme === 'gold'
                 ? 'bg-slate-900 border-yellow-500 shadow-yellow-900/50'
                 : 'bg-slate-900 border-slate-600'
             }
          `}>
             
            <h2 className={`text-2xl uppercase tracking-widest font-bold mb-8
              ${config.theme === 'neon' ? 'text-fuchsia-400' : config.theme === 'gold' ? 'text-yellow-400' : 'text-slate-300'}
            `}>
                {lastDrawnBatch.length > 1 ? 'Números Sorteados!' : 'Número Sorteado!'}
            </h2>

            <div className={`
                flex flex-wrap justify-center gap-4 mb-8 max-h-[60vh] overflow-y-auto p-4
                ${lastDrawnBatch.length === 1 ? 'items-center' : ''}
            `}>
                {lastDrawnBatch.map((num) => (
                    <div 
                        key={num}
                        className={`
                            font-black text-transparent bg-clip-text filter drop-shadow-md
                            ${config.theme === 'neon'
                               ? 'bg-gradient-to-br from-fuchsia-400 to-cyan-400'
                               : config.theme === 'gold'
                                 ? 'bg-gradient-to-br from-yellow-300 to-amber-600'
                                 : 'bg-gradient-to-br from-yellow-300 to-orange-500'
                            }
                            ${lastDrawnBatch.length === 1 ? 'text-9xl' : 'text-5xl border-2 border-slate-700 rounded-xl p-4 bg-slate-800/50'}
                        `}
                    >
                        {num}
                    </div>
                ))}
            </div>

            {/* Mensagem da sorte (apenas se for 1 número) */}
            {lastDrawnBatch.length === 1 && (
                <div className="bg-slate-800/50 rounded-xl p-4 mb-8 min-h-[60px] flex items-center justify-center max-w-md mx-auto">
                    {fortune ? (
                        <p className={`italic ${config.theme === 'neon' ? 'text-cyan-300' : 'text-indigo-300'}`}>"{fortune}"</p>
                    ) : (
                         <span className="text-slate-600 text-sm animate-pulse">Consultando os astros...</span>
                    )}
                </div>
            )}

            <button 
              onClick={() => setShowResultModal(false)}
              className={`
                px-8 py-3 rounded-full font-semibold transition border
                ${config.theme === 'neon'
                   ? 'bg-fuchsia-900/50 hover:bg-fuchsia-900 text-white border-fuchsia-500'
                   : config.theme === 'gold'
                     ? 'bg-yellow-900/50 hover:bg-yellow-900 text-white border-yellow-500'
                     : 'bg-slate-700 hover:bg-slate-600 text-white border-slate-500'
                }
              `}
            >
              {isFinished ? 'Ver Resultado Final' : 'Continuar Sorteio'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};