import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  X,
  Trash2,
  ListTodo,
} from 'lucide-react';
import { ChecklistItem, ChecklistPhase, ColorPalette } from '../types';

interface ChecklistTabProps {
  palette: ColorPalette;
  items: ChecklistItem[];
  onToggleItemDone: (id: string) => void;
  onAddCustomItem: (item: Omit<ChecklistItem, 'id' | 'isAdded'>) => void;
  onDeleteItem: (id: string) => void;
}

const PHASES: { id: ChecklistPhase | 'all'; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: '12-18m', label: '12-18 Meses' },
  { id: '9-11m', label: '9-11 Meses' },
  { id: '6-8m', label: '6-8 Meses' },
  { id: '4-5m', label: '4-5 Meses' },
  { id: '2-3m', label: '2-3 Meses' },
  { id: '1m', label: '1 Mês Antes' },
  { id: 'semana', label: 'Na Semana' },
];

export const ChecklistTab: React.FC<ChecklistTabProps> = ({
  palette,
  items,
  onToggleItemDone,
  onAddCustomItem,
  onDeleteItem,
}) => {
  const [selectedPhase, setSelectedPhase] = useState<ChecklistPhase | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [phase, setPhase] = useState<ChecklistPhase>('6-8m');
  const [category, setCategory] = useState('Geral');

  const addedItems = items.filter((i) => i.isAdded);

  const doneCount = addedItems.filter((i) => i.isDone).length;
  const totalAdded = addedItems.length;
  const progressPercent = totalAdded > 0 ? Math.round((doneCount / totalAdded) * 100) : 0;

  const filteredItems = addedItems.filter((item) => {
    if (selectedPhase === 'all') return true;
    return item.phase === selectedPhase;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const phaseObj = PHASES.find((p) => p.id === phase);
    onAddCustomItem({
      title: title.trim(),
      description: description.trim(),
      phase,
      phaseTitle: phaseObj?.label || 'Geral',
      category: category.trim() || 'Geral',
      isDone: false,
      isCustom: true,
    });

    setTitle('');
    setDescription('');
    setShowAddForm(false);
  };

  return (
    <div className="pb-24 pt-2 px-4 sm:px-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="mb-4">
        <span
          className="text-[11px] font-bold tracking-[0.2em] uppercase"
          style={{ color: palette.primary }}
        >
          CRONOGRAMA &amp; CHECKLIST
        </span>
        <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900">
          Lista de Tarefas
        </h2>
        <p className="text-xs text-stone-600 mt-0.5">
          Organize e acompanhe cada passo do planejamento do seu casamento.
        </p>
      </div>

      {/* Progress Card */}
      <div
        className="rounded-[28px] p-5 border shadow-sm mb-5 transition-colors"
        style={{
          backgroundColor: palette.cardBg,
          borderColor: palette.primary + '25',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wide">
            Progresso das Tarefas
          </span>
          <span
            className="font-serif-display text-lg sm:text-xl font-bold"
            style={{ color: palette.primaryDark }}
          >
            {doneCount} de {totalAdded} concluídas ({progressPercent}%)
          </span>
        </div>

        <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: palette.buttonBg,
            }}
          />
        </div>
      </div>

      {/* Add Custom Task Button or Form */}
      <div className="mb-4">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 px-4 rounded-2xl font-semibold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-98 hover:opacity-95"
            style={{ backgroundColor: palette.buttonBg }}
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Nova Tarefa</span>
          </button>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-5 rounded-[24px] bg-white border shadow-md space-y-3 animate-in fade-in duration-200"
            style={{ borderColor: palette.primary + '30' }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h4 className="text-sm font-bold text-stone-900">Nova Tarefa</h4>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Título da Tarefa *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Agendar degustação, Definir lembrancinhas..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Fase / Período</label>
                <select
                  value={phase}
                  onChange={(e) => setPhase(e.target.value as ChecklistPhase)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white focus:outline-none focus:ring-2"
                >
                  <option value="12-18m">12 a 18 Meses Antes</option>
                  <option value="9-11m">9 a 11 Meses Antes</option>
                  <option value="6-8m">6 a 8 Meses Antes</option>
                  <option value="4-5m">4 a 5 Meses Antes</option>
                  <option value="2-3m">2 a 3 Meses Antes</option>
                  <option value="1m">1 Mês Antes</option>
                  <option value="semana">Na Semana do Casamento</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Categoria</label>
                <input
                  type="text"
                  placeholder="Ex: Vestido, Cerimônia, Festa"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Detalhes ou Lembrete (Opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Observações importantes para esta tarefa..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95"
                style={{ backgroundColor: palette.buttonBg }}
              >
                Salvar Tarefa
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Phase Filter Buttons */}
      {addedItems.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 no-scrollbar">
          {PHASES.map((p) => {
            const isSelected = selectedPhase === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPhase(p.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all ${
                  isSelected ? 'font-bold shadow-2xs' : 'text-stone-600 bg-white border border-stone-200'
                }`}
                style={{
                  backgroundColor: isSelected ? palette.primaryLight : undefined,
                  color: isSelected ? palette.primaryDark : undefined,
                  borderColor: isSelected ? palette.primary + '30' : undefined,
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Checklist Items */}
      <div className="space-y-2.5">
        {addedItems.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-stone-200/80 shadow-2xs">
            <div
              className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3 border shadow-2xs"
              style={{
                backgroundColor: palette.primaryLight,
                borderColor: palette.primary + '30',
                color: palette.primary,
              }}
            >
              <ListTodo className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-stone-900">Sua lista está pronta</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Adicione suas tarefas para planejar mês a mês, marcar o que já foi feito e não esquecer de nada.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 py-2.5 px-5 rounded-full text-xs font-bold text-white inline-flex items-center gap-1.5 shadow-xs hover:opacity-95"
              style={{ backgroundColor: palette.buttonBg }}
            >
              <Plus className="w-4 h-4" />
              Adicionar Primeira Tarefa
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-stone-100 text-stone-400 text-xs">
            Nenhuma tarefa cadastrada nesta fase.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onToggleItemDone(item.id)}
              className={`p-4 rounded-[22px] border bg-white shadow-2xs flex items-start gap-3 cursor-pointer transition-all hover:border-stone-300 ${
                item.isDone ? 'opacity-70 bg-stone-50/70' : ''
              }`}
              style={{ borderColor: item.isDone ? 'rgba(0,0,0,0.06)' : palette.primary + '18' }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleItemDone(item.id);
                }}
                className="mt-0.5 shrink-0"
              >
                {item.isDone ? (
                  <CheckSquare
                    className="w-5 h-5 transition-transform scale-110"
                    style={{ color: palette.primary }}
                  />
                ) : (
                  <Square className="w-5 h-5 text-stone-300 hover:text-stone-400" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: palette.badgeBg,
                      color: palette.badgeText,
                    }}
                  >
                    {item.phaseTitle}
                  </span>
                  <span className="text-[11px] text-stone-600">{item.category}</span>
                </div>
                <h4
                  className={`text-sm font-semibold text-stone-900 ${
                    item.isDone ? 'line-through text-stone-400' : ''
                  }`}
                >
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-xs text-stone-500 mt-0.5">{item.description}</p>
                )}
              </div>

              {/* Action: Delete */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteItem(item.id);
                }}
                className="p-1 text-stone-300 hover:text-rose-500 shrink-0 transition-colors"
                title="Remover tarefa"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
