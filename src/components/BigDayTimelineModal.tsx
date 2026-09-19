import React, { useState } from 'react';
import { X, Clock, Heart, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { ColorPalette } from '../types';

interface TimelineStep {
  id: string;
  time: string;
  title: string;
  desc: string;
  isDone?: boolean;
}

interface BigDayTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  palette: ColorPalette;
}

export const BigDayTimelineModal: React.FC<BigDayTimelineModalProps> = ({
  isOpen,
  onClose,
  palette,
}) => {
  const [steps, setSteps] = useState<TimelineStep[]>([
    {
      id: 'step-1',
      time: '11:00',
      title: 'Início do Making Of da Noiva',
      desc: 'Cabelo, maquiagem, fotos com madrinhas e mãe da noiva',
    },
    {
      id: 'step-2',
      time: '13:00',
      title: 'Making Of do Noivo & Padrinhos',
      desc: 'Alinhamento de ternos, gravatas e brinde dos padrinhos',
    },
    {
      id: 'step-3',
      time: '15:30',
      title: 'Chegada dos Convidados & Músicos',
      desc: 'Recepção com welcome drink e música ambiente',
    },
    {
      id: 'step-4',
      time: '16:30',
      title: 'Início da Cerimônia Religiosa',
      desc: 'Entrada dos pais, padrinhos, noivo, daminhas e noiva',
    },
    {
      id: 'step-5',
      time: '17:45',
      title: 'Sessão de Fotos Oficiais',
      desc: 'Fotos protocolares com pais, padrinhos e ensaio do casal',
    },
    {
      id: 'step-6',
      time: '18:30',
      title: 'Entrada Triunfal dos Noivos na Festa',
      desc: 'Brinde com os convidados e abertura do buffet/jantar',
    },
    {
      id: 'step-7',
      time: '20:30',
      title: 'Corte do Bolo & Primeira Dança',
      desc: 'Momento doce e a dança romântica dos noivos',
    },
    {
      id: 'step-8',
      time: '21:00',
      title: 'Abertura da Pista de Dança!',
      desc: 'DJ / Banda, open bar e muita animação até a madrugada',
    },
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EBF2ED] text-[#284B35] flex items-center justify-center">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">O Grande Dia</h3>
              <p className="text-[11px] text-stone-500">Cronograma minuto a minuto</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="relative pl-6 border-l-2 border-[#284B35]/30 ml-2 space-y-4 my-2">
            {steps.map((step) => (
              <div key={step.id} className="relative">
                {/* Dot */}
                <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#284B35] border-2 border-white shadow-xs" />

                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#284B35]">
                      ⏰ {step.time}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 mt-0.5">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-stone-100 bg-stone-50/50 rounded-b-3xl">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-white shadow-xs"
            style={{ backgroundColor: '#284B35' }}
          >
            Fechar Cronograma
          </button>
        </div>
      </div>
    </div>
  );
};
