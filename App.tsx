import React, { useState } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { RaffleArea } from './components/RaffleArea';
import { RaffleConfig } from './types';

type Tab = 'config' | 'raffle';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('config');
  
  // Estado de Configuração
  const [config, setConfig] = useState<RaffleConfig>({
    min: 1,
    max: 100,
    quantity: 1,
    drawAllAtOnce: false,
    animationType: 'roulette',
    theme: 'classic',
    spinDuration: 5
  });

  // Estado do Jogo
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);

  // Função para gerar número aleatório criptograficamente seguro (CSPRNG)
  // Isso garante uma distribuição uniforme e justa, melhor que Math.random()
  const getSecureRandomInt = (min: number, max: number) => {
    const range = max - min + 1;
    
    // Utilizamos Uint32Array para obter um número inteiro de 32 bits do sistema operacional
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    
    // Normalizamos o valor para um float entre 0 (inclusivo) e 1 (exclusivo).
    // Dividimos por (0xffffffff + 1) para cobrir todo o espectro do Uint32.
    // Isso evita o viés de módulo que ocorre ao fazer apenas (values[0] % range)
    const randomFloat = values[0] / (0xffffffff + 1);
    
    return Math.floor(randomFloat * range) + min;
  };

  const startRaffle = () => {
    setDrawnNumbers([]); // Reset history
    setActiveTab('raffle');
  };

  const resetRaffle = () => {
    setActiveTab('config');
  };

  const drawNumbers = () => {
    // Quantos faltam para completar a quantidade desejada?
    const remaining = config.quantity - drawnNumbers.length;
    if (remaining <= 0) return;

    // Se "All at once", sorteamos o 'remaining' (que é tudo se for o primeiro giro).
    // Se não, sorteamos apenas 1.
    const countToDraw = config.drawAllAtOnce ? remaining : 1;

    const newNumbers: number[] = [];
    const currentSet = new Set(drawnNumbers);
    
    // Safety check: intervalo válido
    if (config.max - config.min + 1 < config.quantity) {
        alert("Erro: O intervalo é menor que a quantidade de números pedidos.");
        return;
    }

    let safetyCounter = 0;
    while (newNumbers.length < countToDraw && safetyCounter < 1000000) {
        const candidate = getSecureRandomInt(config.min, config.max);
        
        // Garante unicidade no histórico e no batch atual
        if (!currentSet.has(candidate)) {
            currentSet.add(candidate); // Adiciona ao set temporário para verificar duplicatas no mesmo loop
            newNumbers.push(candidate);
        }
        safetyCounter++;
    }

    if (safetyCounter >= 1000000) {
        console.error("Infinite loop prevention triggered. Range might be too full.");
    }

    setDrawnNumbers(prev => [...prev, ...newNumbers]);
  };

  return (
    <div className={`min-h-screen text-slate-100 flex flex-col transition-colors duration-500
      ${config.theme === 'neon' ? 'bg-black' : config.theme === 'gold' ? 'bg-slate-900' : 'bg-slate-900'}
    `}>
      {/* Header Simplificado */}
      <header className={`py-6 backdrop-blur-md sticky top-0 z-10 border-b transition-colors duration-500
        ${config.theme === 'neon' 
          ? 'bg-black/80 border-fuchsia-500/30' 
          : config.theme === 'gold' 
            ? 'bg-slate-900/90 border-yellow-600/30' 
            : 'bg-slate-900/50 border-slate-800'
        }
      `}>
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-2xl shadow-lg
                  ${config.theme === 'neon' 
                    ? 'bg-gradient-to-br from-fuchsia-600 to-cyan-600 text-white shadow-fuchsia-500/50' 
                    : config.theme === 'gold' 
                      ? 'bg-gradient-to-br from-yellow-400 to-amber-700 text-black shadow-yellow-500/30' 
                      : 'bg-gradient-to-br from-pink-500 to-indigo-600 text-white'
                  }
                `}>
                    SR
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-200">
                Sorteio <span className={`text-transparent bg-clip-text 
                  ${config.theme === 'neon' 
                    ? 'bg-gradient-to-r from-fuchsia-400 to-cyan-400' 
                    : config.theme === 'gold' 
                      ? 'bg-gradient-to-r from-yellow-300 to-amber-500' 
                      : 'bg-gradient-to-r from-pink-400 to-indigo-400'
                  }
                `}>Roleta Mágica</span>
                </h1>
            </div>
            
            {/* Navigation Tabs (Visual only if in config, or breadcrumb) */}
            <div className="flex gap-2">
                <button 
                    onClick={() => setActiveTab('config')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'config' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Configuração
                </button>
                <button 
                    disabled={activeTab === 'config'} // Cannot jump to raffle without setup
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'raffle' ? 'bg-slate-800 text-white' : 'text-slate-500 opacity-50 cursor-not-allowed'}`}
                >
                    Sorteio
                </button>
            </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        {activeTab === 'config' ? (
          <ControlPanel 
            config={config} 
            setConfig={setConfig} 
            onStart={startRaffle} 
          />
        ) : (
          <RaffleArea 
            config={config}
            drawnNumbers={drawnNumbers}
            onDraw={drawNumbers}
            onReset={resetRaffle}
          />
        )}
      </main>

      <footer className="py-6 text-center text-slate-600 text-sm">
        Sorteio Roleta Mágica &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}