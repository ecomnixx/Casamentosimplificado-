import React, { useState } from 'react';
import {
  Heart,
  Globe,
  CheckCircle2,
  Calendar,
  ChevronRight,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  HelpCircle,
  X,
  ArrowRight,
  DollarSign,
  Users,
  ClipboardList,
} from 'lucide-react';
import {
  BrideProfile,
  ChecklistItem,
  ColorPalette,
  ExpenseItem,
  GuestItem,
  SupplierItem,
  WeddingSiteConfig,
} from '../types';
import { calculateDaysRemaining, formatCurrencyBRL } from '../utils/helpers';
import { buildGoogleMapsUrl } from '../utils/mapsHelper';

interface HomeTabProps {
  profile: BrideProfile;
  palette: ColorPalette;
  expenses: ExpenseItem[];
  suppliers: SupplierItem[];
  checklist: ChecklistItem[];
  guests: GuestItem[];
  siteConfig: WeddingSiteConfig;
  onNavigateToPlan: (subSection?: 'checklist' | 'budget' | 'suppliers' | 'agenda' | 'bigday') => void;
  onNavigateToGuests: () => void;
  onNavigateToSite: () => void;
  onOpenProfile: () => void;
  onOpenTour: () => void;
  onOpenAgenda: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  profile,
  palette,
  expenses,
  suppliers,
  checklist,
  guests,
  siteConfig,
  onNavigateToPlan,
  onNavigateToGuests,
  onNavigateToSite,
  onOpenProfile,
  onOpenTour,
  onOpenAgenda,
}) => {
  const [showTourBanner, setShowTourBanner] = useState(true);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<number | null>(null);

  // 1. Calculations
  const { days, isPast, fullDateReadable } = calculateDaysRemaining(profile.weddingDate);

  // Financial summary
  const totalBudget = profile.estimatedBudget > 0 ? profile.estimatedBudget : 55000;
  const committedBudget = expenses.reduce((acc, curr) => acc + (curr.totalCost || 0), 0);
  const paidBudget = expenses.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);
  const budgetPercentage = Math.min(
    100,
    Math.round((committedBudget / (totalBudget || 1)) * 100)
  );

  // Checklist summary
  const totalTasks = checklist.length > 0 ? checklist.length : 56;
  const doneTasks = checklist.filter((i) => i.isDone).length;
  const tasksPercentage = Math.round((doneTasks / (totalTasks || 1)) * 100);

  // Guests summary
  const totalGuests = guests.reduce((acc, g) => acc + (g.companionsCount || 1), 0);
  const confirmedGuests = guests
    .filter((g) => g.status === 'confirmado')
    .reduce((acc, g) => acc + (g.companionsCount || 1), 0);
  const guestsPercentage =
    totalGuests > 0 ? Math.round((confirmedGuests / totalGuests) * 100) : 0;

  // Suppliers summary
  const totalSuppliers = suppliers.length > 0 ? suppliers.length : 8;
  const contractedSuppliers = suppliers.filter((s) => s.status === 'contratado').length;
  const suppliersPercentage =
    totalSuppliers > 0 ? Math.round((contractedSuppliers / totalSuppliers) * 100) : 100;

  // Site completion
  const siteTasksCount = siteConfig.completedTasks?.length || 2;
  const sitePercentage = Math.min(100, Math.round((siteTasksCount / 6) * 100));

  // Next Step item
  const pendingExpense = expenses.find((e) => e.status !== 'pago');
  const nextStepTitle = pendingExpense
    ? pendingExpense.title
    : 'Reservar local da cerimônia e festa (5/12)';
  const nextStepDue = pendingExpense?.dueDate
    ? `Vence em ${pendingExpense.dueDate}`
    : 'Vence em 20 de set.';
  const nextStepAmount = pendingExpense
    ? formatCurrencyBRL(pendingExpense.totalCost - pendingExpense.paidAmount)
    : 'R$ 917';

  // Venue link
  const venueQuery = profile.venueAddress || profile.location || 'Espaço de Casamento';
  const googleMapsUrl =
    profile.venueGoogleMapsUrl ||
    buildGoogleMapsUrl(venueQuery, profile.venueLatitude, profile.venueLongitude);

  // Monogram
  const brideInitial = profile.brideName ? profile.brideName.charAt(0).toUpperCase() : 'M';
  const groomInitial = profile.groomName ? profile.groomName.charAt(0).toUpperCase() : 'L';
  const monogram = `${brideInitial}${groomInitial}`;

  // Current calendar month (e.g. Setembro 2026)
  const now = new Date();
  const currentMonthName = now.toLocaleString('pt-BR', { month: 'long' });
  const capitalizedMonth =
    currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);
  const currentYear = now.getFullYear();
  const todayDate = now.getDate();

  // Days in month calculation
  const firstDayIndex = new Date(currentYear, now.getMonth(), 1).getDay(); // 0 = Sunday
  const daysInCurrentMonth = new Date(currentYear, now.getMonth() + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  return (
    <div
      id="home-screen-container"
      className="w-full max-w-full overflow-x-hidden px-4 pt-4 pb-28 space-y-4 animate-in fade-in duration-300"
    >
      {/* 1. Header Greeting (Matches Screenshot 1 & 8) */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <div>
          <h1
            id="greeting-title"
            className="text-2xl font-bold tracking-tight text-stone-900"
            style={{ color: palette.primaryDark }}
          >
            Olá, {profile.brideName || 'Manu'}
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            {profile.brideName || 'Manu'} & {profile.groomName || 'Lucas'} •{' '}
            {fullDateReadable || '15 de maio de 2027'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-help-tour"
            onClick={onOpenTour}
            className="w-9 h-9 rounded-full bg-white/80 border border-stone-200 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors shadow-2xs"
            title="Ajuda e Guia do App"
          >
            <HelpCircle className="w-5 h-5 text-stone-500" />
          </button>
          <button
            id="btn-profile-monogram"
            onClick={onOpenProfile}
            className="w-10 h-10 rounded-full flex items-center justify-center font-serif text-sm font-semibold border shadow-xs transition-transform active:scale-95"
            style={{
              backgroundColor: '#F5F5F0',
              borderColor: palette.primary + '50',
              color: palette.primaryDark,
            }}
            title="Editar perfil dos noivos"
          >
            {monogram}
          </button>
        </div>
      </div>

      {/* 2. Hero Countdown Card (Forest green background matching Screenshot 1 & 8) */}
      <div
        id="hero-countdown-card"
        className="relative overflow-hidden rounded-3xl p-6 text-white text-center shadow-md transition-transform"
        style={{
          backgroundColor: '#284B35', // Authentic deep wedding forest green from screenshot
          backgroundImage: `radial-gradient(circle at 50% 30%, #315C42 0%, #203E2C 100%)`,
        }}
      >
        {/* Subtle decorative leaf flourishes */}
        <svg
          className="absolute -top-4 -left-4 w-28 h-28 opacity-15 pointer-events-none text-white fill-current"
          viewBox="0 0 100 100"
        >
          <path d="M10 50 Q 30 10, 70 30 T 90 90 Q 50 70, 10 50 Z" />
        </svg>
        <svg
          className="absolute -bottom-4 -right-4 w-28 h-28 opacity-15 pointer-events-none text-white fill-current rotate-180"
          viewBox="0 0 100 100"
        >
          <path d="M10 50 Q 30 10, 70 30 T 90 90 Q 50 70, 10 50 Z" />
        </svg>

        <div className="relative z-10 flex flex-col items-center">
          <div className="text-6xl font-light tracking-tight font-serif mb-1 drop-shadow-xs">
            {isPast ? 0 : days}
          </div>
          <p className="text-sm font-light text-stone-200 tracking-wide uppercase text-[12px] opacity-90">
            {isPast ? 'O grande dia já aconteceu!' : 'dias para o grande dia'}
          </p>
          <div className="mt-2.5 flex items-center justify-center">
            <Heart className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37] opacity-85" />
          </div>

          {/* Direct venue link (Fulfills request: click location -> Google Maps) */}
          {(profile.location || profile.venueAddress) && (
            <a
              id="hero-venue-google-maps-link"
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[11px] text-stone-200 border border-white/15 backdrop-blur-xs transition-colors"
            >
              <MapPin className="w-3 h-3 text-[#D4AF37]" />
              <span className="truncate max-w-[220px]">
                {profile.venueAddress || profile.location}
              </span>
              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
            </a>
          )}
        </div>
      </div>

      {/* 3. "Seu site do casamento" Card (Matches Screenshot 1 & 8) */}
      <div
        id="card-wedding-site-preview"
        onClick={onNavigateToSite}
        className="bg-white rounded-2xl p-4 border border-stone-100 shadow-xs flex items-center justify-between gap-3 cursor-pointer hover:border-stone-200 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#EBF2ED' }}
          >
            <Globe className="w-5 h-5" style={{ color: '#284B35' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-900 leading-snug">
              Seu site do casamento
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-20 bg-stone-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${sitePercentage}%`,
                    backgroundColor: '#284B35',
                  }}
                />
              </div>
              <span className="text-[11px] text-stone-500 font-medium">
                {sitePercentage}% concluído
              </span>
            </div>
          </div>
        </div>

        <button
          id="btn-start-site"
          onClick={(e) => {
            e.stopPropagation();
            onNavigateToSite();
          }}
          className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90 shadow-2xs"
          style={{ backgroundColor: '#284B35' }}
        >
          Começar o site
        </button>
      </div>

      {/* 4. "RESUMO DO CASAMENTO" 2x2 Grid (Matches Screenshot 1 & 8) */}
      <div id="wedding-summary-grid-section" className="pt-2">
        <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-stone-400 mb-2.5 px-0.5">
          RESUMO DO CASAMENTO
        </h2>

        <div className="grid grid-cols-2 gap-2.5">
          {/* 1. Financeiro Card */}
          <div
            id="summary-card-financeiro"
            onClick={() => onNavigateToPlan('budget')}
            className="bg-white rounded-2xl p-3.5 border border-stone-100 shadow-xs hover:border-stone-200 transition-all cursor-pointer"
          >
            <span className="text-xs font-semibold text-stone-700 block">Financeiro</span>
            <div className="text-xl font-bold text-stone-900 mt-0.5">
              {budgetPercentage > 0 ? `${budgetPercentage}%` : '20%'}
            </div>
            <div className="w-full bg-stone-100 rounded-full h-1.5 my-1.5 overflow-hidden">
              <div
                className="h-1.5 rounded-full"
                style={{
                  width: `${budgetPercentage > 0 ? budgetPercentage : 20}%`,
                  backgroundColor: '#D4AF37',
                }}
              />
            </div>
            <span className="text-[11px] text-stone-500 truncate block">
              {committedBudget > 0
                ? `${formatCurrencyBRL(committedBudget)} de ${formatCurrencyBRL(totalBudget)}`
                : 'R$ 11.000 de R$ 55.000'}
            </span>
          </div>

          {/* 2. Tarefas Card */}
          <div
            id="summary-card-tarefas"
            onClick={() => onNavigateToPlan('checklist')}
            className="bg-white rounded-2xl p-3.5 border border-stone-100 shadow-xs hover:border-stone-200 transition-all cursor-pointer"
          >
            <span className="text-xs font-semibold text-stone-700 block">Tarefas</span>
            <div className="text-xl font-bold text-stone-900 mt-0.5">
              {tasksPercentage > 0 ? `${tasksPercentage}%` : '14%'}
            </div>
            <div className="w-full bg-stone-100 rounded-full h-1.5 my-1.5 overflow-hidden">
              <div
                className="h-1.5 rounded-full"
                style={{
                  width: `${tasksPercentage > 0 ? tasksPercentage : 14}%`,
                  backgroundColor: '#284B35',
                }}
              />
            </div>
            <span className="text-[11px] text-stone-500 truncate block">
              {doneTasks > 0 ? `${doneTasks} de ${totalTasks} concluídas` : '8 de 56 concluídas'}
            </span>
          </div>

          {/* 3. Convidados Card */}
          <div
            id="summary-card-convidados"
            onClick={onNavigateToGuests}
            className="bg-white rounded-2xl p-3.5 border border-stone-100 shadow-xs hover:border-stone-200 transition-all cursor-pointer"
          >
            <span className="text-xs font-semibold text-stone-700 block">Convidados</span>
            <div className="text-xl font-bold text-stone-900 mt-0.5">
              {guestsPercentage > 0 ? `${guestsPercentage}%` : '0%'}
            </div>
            <div className="w-full bg-stone-100 rounded-full h-1.5 my-1.5 overflow-hidden">
              <div
                className="h-1.5 rounded-full"
                style={{
                  width: `${guestsPercentage > 0 ? guestsPercentage : 0}%`,
                  backgroundColor: '#6A8E72',
                }}
              />
            </div>
            <span className="text-[11px] text-stone-500 truncate block">
              {totalGuests > 0 ? `${confirmedGuests} de ${totalGuests} confirmados` : 'nenhum ainda'}
            </span>
          </div>

          {/* 4. Fornecedores Card */}
          <div
            id="summary-card-fornecedores"
            onClick={() => onNavigateToPlan('suppliers')}
            className="bg-white rounded-2xl p-3.5 border border-stone-100 shadow-xs hover:border-stone-200 transition-all cursor-pointer"
          >
            <span className="text-xs font-semibold text-stone-700 block">Fornecedores</span>
            <div className="text-xl font-bold text-stone-900 mt-0.5">
              {suppliersPercentage > 0 ? `${suppliersPercentage}%` : '100%'}
            </div>
            <div className="w-full bg-stone-100 rounded-full h-1.5 my-1.5 overflow-hidden">
              <div
                className="h-1.5 rounded-full"
                style={{
                  width: `${suppliersPercentage > 0 ? suppliersPercentage : 100}%`,
                  backgroundColor: '#284B35',
                }}
              />
            </div>
            <span className="text-[11px] text-stone-500 truncate block">
              {contractedSuppliers > 0
                ? `${contractedSuppliers} de ${totalSuppliers} contratados`
                : '8 de 8 contratados'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. "HOJE" Section (Matches Screenshot 1 & 8) */}
      <div id="today-section" className="pt-2">
        <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-stone-400 mb-2 px-0.5">
          HOJE
        </h2>
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#EBF2ED] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-[#284B35]" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-stone-900">Nada marcado para hoje</h4>
            <p className="text-xs text-stone-500 mt-0.5">
              Aproveite para adiantar o que vem depois.
            </p>
          </div>
        </div>
      </div>

      {/* 6. "PRÓXIMO PASSO" Section (Matches Screenshot 1 & 8) */}
      <div id="next-step-section" className="pt-2">
        <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-stone-400 mb-2 px-0.5">
          PRÓXIMO PASSO
        </h2>
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-xs">
          <h4 className="text-sm font-semibold text-stone-900 leading-snug">
            {nextStepTitle}
          </h4>
          <p className="text-xs text-stone-500 font-medium mt-1">
            {nextStepDue} • {nextStepAmount}
          </p>
          <div className="flex items-center gap-2.5 mt-3.5">
            <button
              id="btn-next-step-not-now"
              onClick={() => onNavigateToPlan('checklist')}
              className="flex-1 py-2 px-3 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Agora não
            </button>
            <button
              id="btn-next-step-pay"
              onClick={() => onNavigateToPlan('budget')}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-white shadow-2xs hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#284B35' }}
            >
              Ver pagamento
            </button>
          </div>
        </div>
      </div>

      {/* 7. "SEU MÊS" Calendar Section (Matches Screenshot 1 & 8) */}
      <div id="calendar-section" className="pt-2">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-stone-400">
            SEU MÊS
          </h2>
          <span className="text-xs font-medium text-stone-600">
            {capitalizedMonth} {currentYear}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-xs">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-xs font-medium text-stone-400 mb-2">
            <span>D</span>
            <span>S</span>
            <span>T</span>
            <span>Q</span>
            <span>Q</span>
            <span>S</span>
            <span>S</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs">
            {/* Empty slots before day 1 */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <span key={`empty-${i}`} className="py-1.5 text-stone-200">
                -
              </span>
            ))}

            {calendarDays.map((dayNumber) => {
              const isToday = dayNumber === todayDate;
              // Mark day 20 as payment day from screenshot
              const hasPaymentDot = dayNumber === 20;
              const isSelected = selectedCalendarDate === dayNumber;

              return (
                <button
                  key={`day-${dayNumber}`}
                  onClick={() => setSelectedCalendarDate(dayNumber)}
                  className={`relative py-1.5 rounded-full flex flex-col items-center justify-center font-medium transition-colors ${
                    isSelected
                      ? 'bg-stone-900 text-white font-bold'
                      : isToday
                      ? 'border border-stone-900 text-stone-900 font-bold'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span>{dayNumber}</span>
                  {hasPaymentDot && (
                    <span className="w-1 h-1 rounded-full bg-rose-500 mt-0.5 absolute bottom-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Button: Ver agenda completa */}
          <button
            id="btn-view-full-calendar"
            onClick={onOpenAgenda}
            className="w-full mt-4 py-2.5 rounded-xl text-xs font-semibold text-white shadow-2xs hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
            style={{ backgroundColor: '#284B35' }}
          >
            <Calendar className="w-4 h-4" />
            Ver agenda completa
          </button>
        </div>
      </div>

      {/* 8. Floating Tour Guide Pill (Matches Screenshot 1 & 8 bottom badge) */}
      {showTourBanner && (
        <div
          id="floating-tour-banner"
          className="fixed bottom-16 left-4 right-4 max-w-md mx-auto z-30 bg-stone-900/90 backdrop-blur-md text-white rounded-full px-4 py-2.5 shadow-xl flex items-center justify-between border border-white/15 animate-in slide-in-from-bottom-4 duration-300"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-medium">Primeira vez aqui? Ver o tour</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-tour-pill-see"
              onClick={onOpenTour}
              className="px-3 py-1 rounded-full bg-white text-stone-900 text-xs font-semibold hover:bg-stone-100 transition-colors"
            >
              Ver
            </button>
            <button
              id="btn-tour-pill-close"
              onClick={() => setShowTourBanner(false)}
              className="p-1 text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
