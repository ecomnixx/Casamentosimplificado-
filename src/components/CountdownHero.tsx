import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Heart,
  Clock,
  MapPin,
  ExternalLink,
  DollarSign,
  Users,
  Sparkles,
  Edit3,
  ListChecks,
  Navigation,
  Quote,
} from 'lucide-react';
import { BrideProfile, ColorPalette } from '../types';
import { calculateDaysRemaining, formatCurrencyBRL } from '../utils/helpers';
import { buildGoogleMapsUrl } from '../utils/mapsHelper';

interface CountdownHeroProps {
  profile: BrideProfile;
  palette: ColorPalette;
  onViewSchedule: () => void;
  onEditProfile: () => void;
}

export const CountdownHero: React.FC<CountdownHeroProps> = ({
  profile,
  palette,
  onViewSchedule,
  onEditProfile,
}) => {
  const [detailedTime, setDetailedTime] = useState({
    totalDays: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  const { days, isPast, formattedDateBadge, fullDateReadable } = calculateDaysRemaining(profile.weddingDate);

  // Live timer tick for seconds, minutes, hours, days, months
  useEffect(() => {
    const updateTime = () => {
      if (!profile.weddingDate) {
        setDetailedTime({
          totalDays: 0,
          months: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: false,
        });
        return;
      }

      const target = new Date(`${profile.weddingDate}T${profile.weddingTime || '16:00'}:00`);
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff > 0) {
        const totalSecs = Math.floor(diff / 1000);
        const totalDays = Math.floor(totalSecs / 86400);
        const months = Math.floor(totalDays / 30.4375);
        const remainingDays = Math.floor(totalDays % 30.4375);
        const hours = Math.floor((totalSecs % 86400) / 3600);
        const minutes = Math.floor((totalSecs % 3600) / 60);
        const seconds = Math.floor(totalSecs % 60);

        setDetailedTime({
          totalDays,
          months,
          days: remainingDays,
          hours,
          minutes,
          seconds,
          isPast: false,
        });
      } else {
        setDetailedTime({
          totalDays: 0,
          months: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
        });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [profile.weddingDate, profile.weddingTime]);

  // Names of bride & groom
  const coupleTitle =
    profile.brideName && profile.groomName
      ? `${profile.brideName} & ${profile.groomName}`
      : profile.brideName
      ? `Casamento de ${profile.brideName}`
      : 'Nosso Casamento dos Sonhos';

  const activeVenueTarget = profile.venueAddress || profile.location;
  const googleMapsUrl = profile.venueGoogleMapsUrl || (activeVenueTarget ? buildGoogleMapsUrl(activeVenueTarget) : '');

  return (
    <section className="px-4 sm:px-6 my-2 w-full max-w-full overflow-x-hidden">
      <div
        id="hero-countdown-card"
        className="relative overflow-hidden rounded-[32px] p-5 sm:p-7 text-center border shadow-sm transition-all duration-500"
        style={{
          backgroundColor: palette.cardBg,
          borderColor: palette.primary + '25',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Decorative background glow */}
        <div
          className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-2xl opacity-20 pointer-events-none"
          style={{ backgroundColor: palette.primary }}
        />
        <div
          className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full blur-2xl opacity-25 pointer-events-none"
          style={{ backgroundColor: palette.accent }}
        />

        {/* Section Header with Names of the Couple */}
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Heart
            className="w-3.5 h-3.5 fill-current opacity-80"
            style={{ color: palette.primary }}
          />
          <span
            className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase"
            style={{ color: palette.primaryDark, opacity: 0.85 }}
          >
            CASAMENTO DOS SONHOS
          </span>
          <Heart
            className="w-3.5 h-3.5 fill-current opacity-80"
            style={{ color: palette.primary }}
          />
        </div>

        {/* Big Couple Names */}
        <h2
          onClick={onEditProfile}
          className="font-serif-display text-2xl sm:text-3xl font-bold tracking-tight mb-2 cursor-pointer hover:opacity-85 transition-opacity"
          style={{ color: palette.primaryDark }}
          title="Clique para editar dados do casal"
        >
          {coupleTitle}
        </h2>

        {/* Date & Time pill */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          <div
            id="wedding-date-badge"
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold shadow-2xs border"
            style={{
              backgroundColor: palette.badgeBg,
              borderColor: palette.primary + '25',
              color: palette.badgeText,
            }}
          >
            <Calendar className="w-3.5 h-3.5 opacity-80" />
            <span>{fullDateReadable || formattedDateBadge || 'Data a definir'}</span>
          </div>

          {profile.weddingTime && (
            <div
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/80 border shadow-2xs text-stone-700"
              style={{ borderColor: palette.primary + '20' }}
            >
              <Clock className="w-3 h-3 text-stone-500" />
              <span>às {profile.weddingTime}</span>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* DESTAQUE PRINCIPAL E EVIDENTE: "FALTAM X DIAS" */}
        {/* ========================================================= */}
        <div
          id="prominent-countdown-box"
          className="my-3 py-4 sm:py-5 px-4 rounded-3xl bg-white/80 border shadow-xs transition-all duration-300"
          style={{ borderColor: palette.primary + '30' }}
        >
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <Heart
              className="w-3.5 h-3.5 fill-current opacity-85"
              style={{ color: palette.primary }}
            />
            <span
              className="text-xs sm:text-sm font-extrabold tracking-[0.22em] uppercase"
              style={{ color: palette.primaryDark }}
            >
              FALTAM PARA O GRANDE DIA
            </span>
            <Heart
              className="w-3.5 h-3.5 fill-current opacity-85"
              style={{ color: palette.primary }}
            />
          </div>

          {/* Huge Number Display */}
          <div className="flex items-baseline justify-center gap-2 sm:gap-3 my-1">
            <span
              className="font-serif-display text-7xl sm:text-8xl md:text-9xl font-black tracking-tight leading-none drop-shadow-xs"
              style={{ color: palette.highlightText || palette.primary }}
            >
              {profile.weddingDate ? (detailedTime.isPast ? 0 : detailedTime.totalDays) : '--'}
            </span>
            <span
              className="font-serif-display italic text-3xl sm:text-5xl font-bold"
              style={{ color: palette.primaryDark }}
            >
              {profile.weddingDate ? (detailedTime.isPast ? 'dias passados' : 'dias') : 'dias'}
            </span>
          </div>

          {profile.weddingDate && !detailedTime.isPast && (
            <div className="mt-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-stone-600">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Contagem regressiva oficial para a celebração do casal</span>
            </div>
          )}
        </div>

        {/* CONTAGEM DETALHADA COMPLETA (Meses, Dias, Horas, Minutos, Segundos) */}
        <div className="my-3 p-3 sm:p-4 rounded-2xl bg-white/85 border shadow-xs" style={{ borderColor: palette.primary + '20' }}>
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-stone-100">
            <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-stone-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-400" />
              <span>Detalhamento em Tempo Real</span>
            </span>
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: palette.primaryLight,
                color: palette.primaryDark,
              }}
            >
              {detailedTime.isPast ? 'Dia Celebrado!' : `Total: ${detailedTime.totalDays} dias`}
            </span>
          </div>

          {/* 5-Column Live Ticking Timer Grid */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {/* Meses */}
            <div
              className="rounded-xl p-2 sm:p-2.5 bg-white border text-center transition-all"
              style={{ borderColor: palette.primary + '20' }}
            >
              <span
                className="block font-serif-display text-2xl sm:text-3xl font-extrabold leading-none"
                style={{ color: palette.primaryDark }}
              >
                {detailedTime.months}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider text-stone-500 mt-1 block">
                Meses
              </span>
            </div>

            {/* Dias */}
            <div
              className="rounded-xl p-2 sm:p-2.5 bg-white border text-center transition-all"
              style={{ borderColor: palette.primary + '20' }}
            >
              <span
                className="block font-serif-display text-2xl sm:text-3xl font-extrabold leading-none"
                style={{ color: palette.primaryDark }}
              >
                {detailedTime.days}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider text-stone-500 mt-1 block">
                Dias
              </span>
            </div>

            {/* Horas */}
            <div
              className="rounded-xl p-2 sm:p-2.5 bg-white border text-center transition-all"
              style={{ borderColor: palette.primary + '20' }}
            >
              <span
                className="block font-serif-display text-2xl sm:text-3xl font-extrabold leading-none"
                style={{ color: palette.primaryDark }}
              >
                {detailedTime.hours}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider text-stone-500 mt-1 block">
                Horas
              </span>
            </div>

            {/* Minutos */}
            <div
              className="rounded-xl p-2 sm:p-2.5 bg-white border text-center transition-all"
              style={{ borderColor: palette.primary + '20' }}
            >
              <span
                className="block font-serif-display text-2xl sm:text-3xl font-extrabold leading-none"
                style={{ color: palette.primaryDark }}
              >
                {detailedTime.minutes}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider text-stone-500 mt-1 block">
                Min
              </span>
            </div>

            {/* Segundos (Ticking live) */}
            <div
              className="rounded-xl p-2 sm:p-2.5 bg-white border text-center relative overflow-hidden"
              style={{
                borderColor: palette.primary,
                backgroundColor: palette.primaryLight + '50',
              }}
            >
              <span
                className="block font-serif-display text-2xl sm:text-3xl font-black leading-none animate-pulse"
                style={{ color: palette.primary }}
              >
                {String(detailedTime.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider text-stone-600 mt-1 block">
                Seg
              </span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* LOCAL DO CASAMENTO DIRETAMENTE ABAIXO DA CONTAGEM (LINK GOOGLE) */}
          {/* ========================================================= */}
          <div className="mt-3 pt-2.5 border-t border-stone-200/60">
            {activeVenueTarget ? (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="link-venue-google-maps"
                className="group flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-stone-50/90 hover:bg-blue-50/60 border border-stone-200/80 hover:border-blue-300 transition-all text-left shadow-2xs"
                title="Clique para abrir a localização exata no Google"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0 text-rose-500 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-stone-400 group-hover:text-blue-700 transition-colors">
                      Local / Espaço do Casamento
                    </span>
                    <span className="block text-xs sm:text-sm font-bold text-stone-900 group-hover:text-blue-700 truncate transition-colors">
                      {profile.location || profile.venueAddress}
                    </span>
                    {profile.venueAddress && profile.location && profile.venueAddress !== profile.location && (
                      <span className="block text-[11px] text-stone-500 truncate">
                        {profile.venueAddress}
                      </span>
                    )}
                  </div>
                </div>

                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 group-hover:text-blue-800 shrink-0 ml-2 bg-white px-2.5 py-1.5 rounded-lg border border-blue-100 shadow-2xs group-hover:scale-102 transition-transform">
                  <span>Abrir no Google</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>
            ) : (
              <button
                type="button"
                onClick={onEditProfile}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-dashed border-stone-300 text-stone-500 text-xs font-medium transition-all group"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-stone-400 group-hover:text-stone-600" />
                  <span>Local ainda não configurado (Clique para adicionar)</span>
                </div>
                <span className="text-[11px] font-bold text-stone-700 underline group-hover:text-stone-900">
                  Definir Local
                </span>
              </button>
            )}
          </div>
        </div>

        {/* TODAS AS INFORMAÇÕES CADASTRADAS DA NOIVA */}
        <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-white/70 border text-left space-y-2.5" style={{ borderColor: palette.primary + '18' }}>
          <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-stone-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Ficha Completa do Casamento</span>
            </span>
            <button
              type="button"
              onClick={onEditProfile}
              className="text-[11px] font-bold text-stone-500 hover:text-stone-900 inline-flex items-center gap-1 hover:underline"
            >
              <Edit3 className="w-3 h-3" />
              <span>Editar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Meta de Orçamento */}
            <div className="p-2.5 rounded-xl bg-stone-50/90 border border-stone-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1 mb-0.5">
                <DollarSign className="w-3 h-3 text-emerald-600" />
                <span>Orçamento Estipulado</span>
              </span>
              <span className="font-serif-display text-base font-bold text-emerald-800">
                {profile.estimatedBudget ? formatCurrencyBRL(profile.estimatedBudget) : 'Não definido'}
              </span>
            </div>

            {/* Convidados Estimados */}
            <div className="p-2.5 rounded-xl bg-stone-50/90 border border-stone-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1 mb-0.5">
                <Users className="w-3 h-3 text-purple-600" />
                <span>Total de Convidados</span>
              </span>
              <span className="font-serif-display text-base font-bold text-stone-900">
                {profile.guestCount ? `${profile.guestCount} pessoas` : 'A definir'}
              </span>
            </div>

            {/* Estilo do Casamento */}
            {profile.weddingStyle && (
              <div className="sm:col-span-2 p-2.5 rounded-xl bg-stone-50/90 border border-stone-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1 mb-0.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Estilo &amp; Tema</span>
                </span>
                <span className="font-medium text-stone-800 text-xs">
                  {profile.weddingStyle}
                </span>
              </div>
            )}

            {/* Mensagem ou Notas dos Noivos */}
            {profile.notes && (
              <div className="sm:col-span-2 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/70">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1 mb-0.5">
                  <Quote className="w-3 h-3 text-amber-600" />
                  <span>Mensagem dos Noivos</span>
                </span>
                <p className="text-[11px] text-stone-700 italic leading-relaxed">
                  "{profile.notes}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-center gap-2.5 max-w-sm mx-auto mt-4">
          <button
            id="btn-ver-cronograma"
            onClick={onViewSchedule}
            className="flex-1 py-2.5 px-4 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 hover:opacity-90 active:scale-98 shadow-xs flex items-center justify-center gap-1.5"
            style={{
              backgroundColor: palette.buttonBg,
              color: palette.buttonText,
            }}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>Ver Cronograma</span>
          </button>

          <button
            id="btn-meus-dados"
            onClick={onEditProfile}
            className="flex-1 py-2.5 px-4 rounded-full text-xs font-semibold tracking-wide border transition-all duration-200 hover:bg-white active:scale-98 shadow-xs flex items-center justify-center gap-1.5"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderColor: palette.primary + '30',
              color: palette.primaryDark,
            }}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar Meus Dados</span>
          </button>
        </div>
      </div>
    </section>
  );
};

