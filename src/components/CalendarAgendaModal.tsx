import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, Plus, Trash2, MapPin, Check } from 'lucide-react';
import { ColorPalette, ExpenseItem } from '../types';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  location?: string;
  type: 'compromisso' | 'pagamento' | 'prova' | 'reuniao';
}

interface CalendarAgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  palette: ColorPalette;
  expenses: ExpenseItem[];
}

export const CalendarAgendaModal: React.FC<CalendarAgendaModalProps> = ({
  isOpen,
  onClose,
  palette,
  expenses,
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: 'evt-1',
      title: 'Degustação de Doces e Bolo',
      date: '2026-10-15',
      time: '15:00',
      location: 'Atelier dos Doces',
      type: 'degustacao' as any,
    },
    {
      id: 'evt-2',
      title: 'Primeira Prova do Vestido',
      date: '2026-11-20',
      time: '10:30',
      location: 'Atelier Noiva Elegante',
      type: 'prova',
    },
    {
      id: 'evt-3',
      title: 'Reunião com a Cerimonialista',
      date: '2026-12-05',
      time: '19:00',
      location: 'Online via Google Meet',
      type: 'reuniao',
    },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('15:00');
  const [newLoc, setNewLoc] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    setEvents([
      ...events,
      {
        id: `evt-${Date.now()}`,
        title: newTitle.trim(),
        date: newDate,
        time: newTime,
        location: newLoc.trim() || undefined,
        type: 'compromisso',
      },
    ]);

    setNewTitle('');
    setNewDate('');
    setNewLoc('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EBF2ED] text-[#284B35] flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Agenda do Casamento</h3>
              <p className="text-[11px] text-stone-500">Compromissos e datas importantes</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Action button to add new */}
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 px-3 rounded-2xl border border-dashed border-stone-300 hover:border-[#284B35] text-stone-600 hover:text-[#284B35] text-xs font-semibold flex items-center justify-center gap-2 transition-colors bg-stone-50/50"
            >
              <Plus className="w-4 h-4" />
              Novo Compromisso
            </button>
          ) : (
            <form onSubmit={handleAddEvent} className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2.5">
              <h4 className="text-xs font-bold text-stone-800">Adicionar compromisso</h4>
              <input
                type="text"
                required
                placeholder="Título (ex: Reunião com fotógrafo)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full text-xs p-2 rounded-xl bg-white border border-stone-200 focus:outline-hidden"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl bg-white border border-stone-200 focus:outline-hidden"
                />
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl bg-white border border-stone-200 focus:outline-hidden"
                />
              </div>
              <input
                type="text"
                placeholder="Local / Link (opcional)"
                value={newLoc}
                onChange={(e) => setNewLoc(e.target.value)}
                className="w-full text-xs p-2 rounded-xl bg-white border border-stone-200 focus:outline-hidden"
              />
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-600 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-xl text-xs text-white font-semibold shadow-xs"
                  style={{ backgroundColor: '#284B35' }}
                >
                  Salvar
                </button>
              </div>
            </form>
          )}

          {/* Events List */}
          <div className="space-y-2">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="bg-white p-3 rounded-2xl border border-stone-100 shadow-xs flex items-center justify-between gap-2"
              >
                <div>
                  <h4 className="text-xs font-bold text-stone-900">{evt.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500">
                    <span className="flex items-center gap-1 font-medium text-stone-700">
                      <CalendarIcon className="w-3 h-3 text-[#284B35]" />
                      {evt.date} {evt.time ? `às ${evt.time}` : ''}
                    </span>
                    {evt.location && (
                      <span className="flex items-center gap-1 text-stone-500">
                        <MapPin className="w-3 h-3" />
                        {evt.location}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(evt.id)}
                  className="p-1.5 text-stone-300 hover:text-rose-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
            Fechar Agenda
          </button>
        </div>
      </div>
    </div>
  );
};
