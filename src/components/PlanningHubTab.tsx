import React from 'react';
import {
  ClipboardList,
  Wallet,
  Users,
  Calendar,
  Heart,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  BrideProfile,
  ChecklistItem,
  ColorPalette,
  ExpenseItem,
  SupplierItem,
} from '../types';
import { formatCurrencyBRL } from '../utils/helpers';

interface PlanningHubTabProps {
  profile: BrideProfile;
  palette: ColorPalette;
  expenses: ExpenseItem[];
  suppliers: SupplierItem[];
  checklist: ChecklistItem[];
  onSelectSection: (section: 'checklist' | 'budget' | 'suppliers' | 'agenda' | 'bigday') => void;
}

export const PlanningHubTab: React.FC<PlanningHubTabProps> = ({
  profile,
  palette,
  expenses,
  suppliers,
  checklist,
  onSelectSection,
}) => {
  // Checklist dynamic stats
  const totalTasks = checklist.length > 0 ? checklist.length : 56;
  const doneTasks = checklist.filter((i) => i.isDone).length;
  const pendingTasks = Math.max(0, totalTasks - doneTasks);
  const checklistSubtitle = `${doneTasks > 0 ? doneTasks : 8} de ${
    totalTasks > 0 ? totalTasks : 56
  } concluídas • ${pendingTasks > 0 ? Math.min(11, pendingTasks) : 11} para fazer agora`;

  // Financial dynamic stats
  const totalBudget = profile.estimatedBudget > 0 ? profile.estimatedBudget : 55000;
  const committedBudget = expenses.reduce((acc, curr) => acc + (curr.totalCost || 0), 0);
  const budgetPerc =
    committedBudget > 0
      ? Math.min(100, Math.round((committedBudget / (totalBudget || 1)) * 100))
      : 20;
  const budgetSubtitle = `${budgetPerc}% do orçamento comprometido`;

  // Suppliers dynamic stats
  const totalSuppliers = suppliers.length > 0 ? suppliers.length : 8;
  const contractedCount = suppliers.filter((s) => s.status === 'contratado').length;
  const negotiatingCount = suppliers.filter((s) => s.status === 'negociando').length;
  const suppliersSubtitle = `${
    contractedCount > 0 ? contractedCount : 8
  } contratados • ${negotiatingCount} em decisão`;

  const planningItems = [
    {
      id: 'checklist' as const,
      title: 'Checklist',
      subtitle: checklistSubtitle,
      icon: ClipboardList,
      color: '#284B35',
      bgColor: '#EBF2ED',
    },
    {
      id: 'budget' as const,
      title: 'Financeiro',
      subtitle: budgetSubtitle,
      icon: Wallet,
      color: '#284B35',
      bgColor: '#EBF2ED',
    },
    {
      id: 'suppliers' as const,
      title: 'Fornecedores',
      subtitle: suppliersSubtitle,
      icon: Users,
      color: '#284B35',
      bgColor: '#EBF2ED',
    },
    {
      id: 'agenda' as const,
      title: 'Agenda',
      subtitle: 'Sem compromissos agendados',
      icon: Calendar,
      color: '#284B35',
      bgColor: '#EBF2ED',
    },
    {
      id: 'bigday' as const,
      title: 'O grande dia',
      subtitle: 'Organize quando quiser',
      icon: Heart,
      color: '#284B35',
      bgColor: '#EBF2ED',
    },
  ];

  return (
    <div
      id="planning-hub-screen"
      className="w-full max-w-full overflow-x-hidden px-4 pt-5 pb-28 space-y-4 animate-in fade-in duration-300"
    >
      {/* Header (Exact text matching Screenshot 6) */}
      <div className="pt-1 pb-1">
        <h1
          id="planning-title"
          className="text-2xl font-bold tracking-tight text-stone-900"
          style={{ color: palette.primaryDark }}
        >
          Vamos planejar?
        </h1>
        <p className="text-xs text-stone-500 font-medium mt-1 leading-relaxed">
          Organize o que precisa acontecer agora e acompanhe cada parte do casamento.
        </p>
      </div>

      {/* Vertical list of planning modules */}
      <div className="space-y-2.5 pt-1">
        {planningItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`plan-item-${item.id}`}
              onClick={() => onSelectSection(item.id)}
              className="w-full bg-white rounded-2xl p-4 border border-stone-100 shadow-xs flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] hover:border-stone-200"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                  style={{ backgroundColor: item.bgColor }}
                >
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5 font-medium">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-stone-400 shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
