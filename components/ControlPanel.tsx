import React, { useState } from 'react';
import { RaffleConfig, AnimationType, VisualTheme } from '../types';

interface ControlPanelProps {
  config: RaffleConfig;
  setConfig: (config: RaffleConfig) => void;
  onStart: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ config, setConfig, onStart }) => {
  const [tab, setTab] = useState<'rules' | 'appearance'>('rules');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (type === 'checkbox') {
      setConfig({ ...config, [name]: checked });
    } else if (type === 'number' || type === 'range') {
      const numValue = parseFloat(value);
      setConfig({
        ...config,
        [name]: isNaN(numValue) ? 0 : numValue
      });
    } else {
      setConfig({ ...config, [name]: value });
    }
  };

  const rangeSize = config.max - config.min + 1;
  const isValidRange = config.max > config.min;
  const isValidQuantity = config.quantity > 0 && config.quantity <= rangeSize;
  const isValid = isValidRange && isValidQuantity;

  return (
    <div className="w-full max-w-lg mx-auto bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 animate-fade-in flex flex-col">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setTab('rules')}
          className={`flex-1 py-4 text-sm font-semibold uppercase tracking-wider transition-colors ${
            tab === 'rules' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Regras
        </button>
        <button
          onClick={() => setTab('appearance')}
          className={`flex-1 py-4 text-sm font-semibold uppercase tracking-wider transition-colors ${
            tab === 'appearance' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Aparência
        </button>
      </div>

      <div className="p-8 space-y-6">
        {tab === 'rules' ? (
          <>
            {/* Intervalo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Mínimo</label>
                <input
                  type="number"
                  name="min"
                  value={config.min}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Máximo</label>
                <input
                  type="number"
                  name="max"
                  value={config.max}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition text-lg"
                />
              </div>
            </div>

            {!isValidRange && (
               <p className="text-red-400 text-sm">O valor máximo deve ser maior que o mínimo.</p>
            )}

            {/* Quantidade */}
            <div>
               <label className="block text-sm font-medium text-slate-400 mb-2">
                 Quantos números sortear?
                 <span className="text-xs ml-2 text-slate-500">(Total disponível: {rangeSize > 0 ? rangeSize : 0})</span>
               </label>
               <input
                  type="number"
                  name="quantity"
                  min="1"
                  max={isValidRange ? rangeSize : 1}
                  value={config.quantity}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition text-lg"
                />
                 {!isValidQuantity && isValidRange && (
                  <p className="text-red-400 text-sm mt-1">A quantidade deve ser menor ou igual ao intervalo disponível.</p>
                )}
            </div>

            {/* Modo */}
            <div className="flex items-center space-x-3 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <input
                type="checkbox"
                id="drawAllAtOnce"
                name="drawAllAtOnce"
                checked={config.drawAllAtOnce}
                onChange={handleChange}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 bg-slate-700 border-slate-500"
              />
              <label htmlFor="drawAllAtOnce" className="text-slate-200 cursor-pointer select-none">
                Sortear todos de uma vez?
              </label>
            </div>
          </>
        ) : (
          <>
            {/* Animation Type */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-3">Tipo de Sorteio</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`
                  cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all
                  ${config.animationType === 'roulette' 
                    ? 'border-indigo-500 bg-indigo-500/10' 
                    : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                  }
                `}>
                  <input 
                    type="radio" 
                    name="animationType" 
                    value="roulette" 
                    checked={config.animationType === 'roulette'}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="text-2xl">🎡</span>
                  <span className="font-semibold text-white">Roleta</span>
                </label>

                <label className={`
                  cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all
                  ${config.animationType === 'slot-machine' 
                    ? 'border-indigo-500 bg-indigo-500/10' 
                    : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                  }
                `}>
                  <input 
                    type="radio" 
                    name="animationType" 
                    value="slot-machine" 
                    checked={config.animationType === 'slot-machine'}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="text-2xl">🎰</span>
                  <span className="font-semibold text-white">Caça-Níquel</span>
                </label>
              </div>
            </div>

            {/* Visual Theme */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Tema Visual</label>
              <select
                name="theme"
                value={config.theme}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition text-lg"
              >
                <option value="classic">Clássico (Colorido)</option>
                <option value="neon">Neon (Cyberpunk)</option>
                <option value="gold">Luxo (Dourado)</option>
              </select>
            </div>

            {/* Duration Slider */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 flex justify-between">
                <span>Duração do Giro</span>
                <span className="text-indigo-400 font-bold">{config.spinDuration}s</span>
              </label>
              <input
                type="range"
                name="spinDuration"
                min="1"
                max="10"
                step="0.5"
                value={config.spinDuration}
                onChange={handleChange}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Rápido (1s)</span>
                <span>Lento (10s)</span>
              </div>
            </div>
          </>
        )}

        <button
          onClick={onStart}
          disabled={!isValid}
          className={`
            w-full py-4 rounded-xl font-bold text-xl tracking-wide uppercase shadow-lg transform transition-all mt-4
            ${!isValid 
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-400 hover:to-purple-500 hover:-translate-y-1 hover:shadow-indigo-500/30'
            }
          `}
        >
          Iniciar Sorteio
        </button>
      </div>
    </div>
  );
};