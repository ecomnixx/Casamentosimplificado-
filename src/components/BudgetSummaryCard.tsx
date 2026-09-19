import React from 'react';
import { Wallet, Plus, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { ColorPalette, ExpenseItem } from '../types';
import { formatCurrencyBRL } from '../utils/helpers';

interface BudgetSummaryCardProps {
  palette: ColorPalette;
  expenses: ExpenseItem[];
  onViewAllExpenses: () => void;
  onAddNewExpense: () => void;
}

export const BudgetSummaryCard: React.FC<BudgetSummaryCardProps> = ({
  palette,
  expenses,
  onViewAllExpenses,
  onAddNewExpense,
}) => {
  // Only calculate active expenses
  const activeExpenses = expenses.filter((e) => e.isActive);

  const totalBudget = activeExpenses.reduce((acc, curr) => acc + curr.totalCost, 0);
  const totalPaid = activeExpenses.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalRemaining = Math.max(0, totalBudget - totalPaid);
  const percentPaid = totalBudget > 0 ? Math.round((totalPaid / totalBudget) * 100) : 0;

  return (
    <section className="px-4 sm:px-6 my-4 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5 opacity-70" style={{ color: palette.primary }} />
          <span
            className="text-[11px] sm:text-[12px] font-semibold tracking-[0.18em] uppercase"
            style={{ color: palette.primaryDark, opacity: 0.8 }}
          >
            ORÇAMENTO
          </span>
        </div>
        <button
          onClick={onViewAllExpenses}
          className="text-xs font-semibold hover:underline flex items-center gap-0.5"
          style={{ color: palette.primaryDark }}
        >
          <span>{formatCurrencyBRL(totalPaid)}</span>
          <span className="opacity-50">/</span>
          <span>{formatCurrencyBRL(totalBudget)}</span>
        </button>
      </div>

      {/* Main Budget Card */}
      <div
        id="budget-overview-card"
        className="rounded-[26px] p-5 sm:p-6 border shadow-xs transition-all duration-300"
        style={{
          backgroundColor: palette.cardBg,
          borderColor: palette.primary + '20',
        }}
      >
        {/* Status indicator dots */}
        <div className="flex items-center justify-between text-[11px] font-medium text-stone-500 mb-4 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: palette.primary }} />
            <span>Pago ({percentPaid}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Pendente</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-stone-300" />
            <span>Total Previsto</span>
          </div>
        </div>

        {/* 3 Metric Pill Columns */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
          {/* Pago */}
          <div
            className="py-3.5 px-2 rounded-[20px] border flex flex-col justify-center items-center transition-colors"
            style={{
              backgroundColor: palette.badgeBg,
              borderColor: palette.primary + '25',
            }}
          >
            <span
              className="font-serif-display text-lg sm:text-2xl font-bold tracking-tight block"
              style={{ color: palette.primaryDark }}
            >
              {formatCurrencyBRL(totalPaid)}
            </span>
            <span
              className="text-[10px] font-bold tracking-[0.15em] uppercase mt-0.5 opacity-80"
              style={{ color: palette.badgeText }}
            >
              PAGO
            </span>
          </div>

          {/* Falta */}
          <div className="py-3.5 px-2 rounded-[20px] border border-amber-200/70 bg-amber-50/70 flex flex-col justify-center items-center">
            <span className="font-serif-display text-lg sm:text-2xl font-bold tracking-tight text-amber-900 block">
              {formatCurrencyBRL(totalRemaining)}
            </span>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-amber-700/90 mt-0.5">
              FALTA
            </span>
          </div>

          {/* Total */}
          <div className="py-3.5 px-2 rounded-[20px] border border-stone-200/80 bg-stone-50/80 flex flex-col justify-center items-center">
            <span className="font-serif-display text-lg sm:text-2xl font-bold tracking-tight text-stone-800 block">
              {formatCurrencyBRL(totalBudget)}
            </span>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-stone-500 mt-0.5">
              TOTAL
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-1">
          <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden flex">
            <div
              className="h-full transition-all duration-700 rounded-full"
              style={{
                width: `${Math.min(100, percentPaid)}%`,
                backgroundColor: palette.primary,
              }}
            />
          </div>
        </div>

        {/* Action Row inside card */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100">
          <button
            onClick={onAddNewExpense}
            className="inline-flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-full border transition-all hover:bg-white active:scale-95 shadow-2xs"
            style={{
              borderColor: palette.primary + '30',
              color: palette.primaryDark,
              backgroundColor: palette.primaryLight,
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            Nova despesa
          </button>

          <button
            onClick={onViewAllExpenses}
            className="inline-flex items-center gap-1 text-xs font-medium hover:underline text-stone-600 transition-colors"
          >
            <span>Ver detalhes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
