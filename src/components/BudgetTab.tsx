import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Trash2,
  Check,
  X,
  Calendar,
  AlertCircle,
  Tag,
  Receipt,
} from 'lucide-react';
import { ColorPalette, ExpenseCategory, ExpenseItem } from '../types';
import { formatCurrencyBRL } from '../utils/helpers';

interface BudgetTabProps {
  palette: ColorPalette;
  expenses: ExpenseItem[];
  onAddExpense: (expense: Omit<ExpenseItem, 'id' | 'isActive'>) => void;
  onUpdateExpenseStatus: (id: string, status: 'pago' | 'pendente' | 'parcial', paidAmount?: number) => void;
  onDeleteExpense: (id: string) => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Espaço & Cerimônia',
  'Buffet & Bebidas',
  'Fotografia & Vídeo',
  'Decoração & Flores',
  'Vestido & Beleza',
  'Música & Banda/DJ',
  'Doces & Bolo',
  'Convites & Lembranças',
  'Assessoria & Cerimonial',
  'Outros',
];

export const BudgetTab: React.FC<BudgetTabProps> = ({
  palette,
  expenses,
  onAddExpense,
  onUpdateExpenseStatus,
  onDeleteExpense,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // New expense form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('Espaço & Cerimônia');
  const [newTotalCost, setNewTotalCost] = useState('');
  const [newPaidAmount, setNewPaidAmount] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const activeExpenses = expenses.filter((e) => e.isActive);

  const totalCost = activeExpenses.reduce((acc, c) => acc + c.totalCost, 0);
  const totalPaid = activeExpenses.reduce((acc, c) => acc + c.paidAmount, 0);
  const totalRemaining = Math.max(0, totalCost - totalPaid);
  const percentage = totalCost > 0 ? Math.round((totalPaid / totalCost) * 100) : 0;

  const filteredExpenses = activeExpenses.filter((item) => {
    if (filter === 'paid') return item.status === 'pago';
    if (filter === 'pending') return item.status === 'pendente' || item.status === 'parcial';
    return true;
  });

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTotalCost) return;

    const total = parseFloat(newTotalCost) || 0;
    const paid = parseFloat(newPaidAmount) || 0;
    let status: 'pago' | 'pendente' | 'parcial' = 'pendente';
    if (paid >= total && total > 0) {
      status = 'pago';
    } else if (paid > 0) {
      status = 'parcial';
    }

    onAddExpense({
      title: newTitle.trim(),
      category: newCategory,
      totalCost: total,
      paidAmount: paid,
      dueDate: newDueDate || '',
      status,
      supplierName: newSupplierName.trim(),
      notes: newNotes.trim(),
    });

    // Reset form
    setNewTitle('');
    setNewTotalCost('');
    setNewPaidAmount('');
    setNewDueDate('');
    setNewSupplierName('');
    setNewNotes('');
    setShowAddForm(false);
  };

  return (
    <div className="pb-24 pt-2 px-4 sm:px-6 w-full max-w-full overflow-x-hidden">
      {/* Tab Header */}
      <div className="mb-4">
        <span
          className="text-[11px] font-bold tracking-[0.2em] uppercase"
          style={{ color: palette.primary }}
        >
          CONTROLE FINANCEIRO
        </span>
        <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900">
          Orçamentos e Pagamentos
        </h2>
        <p className="text-xs text-stone-600 mt-0.5">
          Cadastre suas contas e contratos para acompanhar o que já foi pago e o que falta acertar.
        </p>
      </div>

      {/* Top Summary Card */}
      <div
        className="rounded-[28px] p-5 border shadow-sm mb-5 transition-colors"
        style={{
          backgroundColor: palette.cardBg,
          borderColor: palette.primary + '25',
        }}
      >
        <div className="grid grid-cols-3 gap-2 text-center mb-3">
          <div className="p-3 rounded-2xl bg-white border border-stone-100 shadow-2xs">
            <span
              className="font-serif-display text-lg sm:text-xl font-bold block"
              style={{ color: palette.primaryDark }}
            >
              {formatCurrencyBRL(totalPaid)}
            </span>
            <span
              className="text-[10px] font-bold tracking-wider uppercase opacity-75"
              style={{ color: palette.primaryDark }}
            >
              Pago
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-amber-100 shadow-2xs">
            <span className="font-serif-display text-lg sm:text-xl font-bold text-amber-900 block">
              {formatCurrencyBRL(totalRemaining)}
            </span>
            <span className="text-[10px] font-bold tracking-wider uppercase text-amber-700">
              Falta
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-stone-100 shadow-2xs">
            <span className="font-serif-display text-lg sm:text-xl font-bold text-stone-700 block">
              {formatCurrencyBRL(totalCost)}
            </span>
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-500">
              Total
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span style={{ color: palette.primaryDark }}>Progresso de Quitação</span>
            <span style={{ color: palette.primaryDark }}>{percentage}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-stone-200/80 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percentage}%`,
                backgroundColor: palette.buttonBg,
              }}
            />
          </div>
        </div>
      </div>

      {/* Add New Expense Button or Form */}
      <div className="mb-5">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 px-4 rounded-2xl font-semibold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-98 hover:opacity-95"
            style={{ backgroundColor: palette.buttonBg }}
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Despesa / Conta</span>
          </button>
        ) : (
          <form
            onSubmit={handleSubmitNew}
            className="p-5 rounded-[24px] bg-white border shadow-md space-y-3 animate-in fade-in duration-200"
            style={{ borderColor: palette.primary + '30' }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h4 className="text-sm font-bold text-stone-900">Nova Despesa</h4>
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
                Descrição da Despesa *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Espaço da festa, Buffet, Fotografia..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Categoria</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white focus:outline-none focus:ring-2"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Fornecedor Vinculado
                </label>
                <input
                  type="text"
                  placeholder="Nome do profissional"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Valor Total (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={newTotalCost}
                  onChange={(e) => setNewTotalCost(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Valor Já Pago (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newPaidAmount}
                  onChange={(e) => setNewPaidAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono focus:outline-none focus:ring-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Data de Vencimento
              </label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Observações
              </label>
              <textarea
                rows={2}
                placeholder="Ex: 50% de entrada pagos no fechamento..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
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
                Salvar Despesa
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Filter Tabs */}
      {activeExpenses.length > 0 && (
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-stone-200/80 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === 'all' ? 'font-bold shadow-2xs' : 'text-stone-500'
            }`}
            style={{
              backgroundColor: filter === 'all' ? palette.primaryLight : 'transparent',
              color: filter === 'all' ? palette.primaryDark : undefined,
            }}
          >
            Todas ({activeExpenses.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === 'pending' ? 'font-bold shadow-2xs' : 'text-stone-500'
            }`}
            style={{
              backgroundColor: filter === 'pending' ? '#FEF3C7' : 'transparent',
              color: filter === 'pending' ? '#92400E' : undefined,
            }}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === 'paid' ? 'font-bold shadow-2xs' : 'text-stone-500'
            }`}
            style={{
              backgroundColor: filter === 'paid' ? palette.badgeBg : 'transparent',
              color: filter === 'paid' ? palette.badgeText : undefined,
            }}
          >
            Pagas
          </button>
        </div>
      )}

      {/* Expenses List */}
      <div className="space-y-3">
        {activeExpenses.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-stone-200/80 shadow-2xs">
            <div
              className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3 border shadow-2xs"
              style={{
                backgroundColor: palette.primaryLight,
                borderColor: palette.primary + '30',
                color: palette.primary,
              }}
            >
              <Receipt className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-stone-900">Nenhuma despesa cadastrada</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Adicione os contratos e pagamentos do seu casamento para ter total controle do orçamento.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 py-2.5 px-5 rounded-full text-xs font-bold text-white inline-flex items-center gap-1.5 shadow-xs hover:opacity-95"
              style={{ backgroundColor: palette.buttonBg }}
            >
              <Plus className="w-4 h-4" />
              Cadastrar Primeira Despesa
            </button>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-stone-100 text-stone-400 text-xs">
            Nenhuma despesa neste filtro.
          </div>
        ) : (
          filteredExpenses.map((item) => {
            const isFullyPaid = item.status === 'pago';
            const remaining = Math.max(0, item.totalCost - item.paidAmount);

            return (
              <div
                key={item.id}
                className="p-4 rounded-[22px] bg-white border border-stone-200/80 shadow-2xs transition-all hover:shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                        {item.category}
                      </span>
                      {item.supplierName && (
                        <span className="text-[11px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                          {item.supplierName}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-stone-900">{item.title}</h4>
                    {item.notes && <p className="text-xs text-stone-500 mt-0.5">{item.notes}</p>}
                  </div>

                  {/* Status badge */}
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        item.status === 'pago'
                          ? palette.primaryLight
                          : item.status === 'parcial'
                          ? '#FEF3C7'
                          : '#FEE2E2',
                      color:
                        item.status === 'pago'
                          ? palette.primaryDark
                          : item.status === 'parcial'
                          ? '#92400E'
                          : '#991B1B',
                    }}
                  >
                    {item.status === 'pago' ? 'Pago' : item.status === 'parcial' ? 'Parcial' : 'Pendente'}
                  </span>
                </div>

                {/* Values and actions */}
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100">
                  <div className="text-xs">
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif-display font-bold text-sm text-stone-900">
                        {formatCurrencyBRL(item.totalCost)}
                      </span>
                      {item.status !== 'pago' && (
                        <span className="text-[11px] text-stone-500">
                          (Falta: {formatCurrencyBRL(remaining)})
                        </span>
                      )}
                    </div>
                    {item.dueDate && (
                      <span className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        Vencimento: {item.dueDate}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isFullyPaid ? (
                      <button
                        onClick={() => onUpdateExpenseStatus(item.id, 'pago', item.totalCost)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white flex items-center gap-1 shadow-2xs hover:opacity-90"
                        style={{ backgroundColor: palette.buttonBg }}
                      >
                        <Check className="w-3 h-3" />
                        Quitar
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpdateExpenseStatus(item.id, 'pendente', 0)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100"
                      >
                        Desfazer
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteExpense(item.id)}
                      className="p-1 text-stone-300 hover:text-rose-500 transition-colors"
                      title="Excluir despesa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
