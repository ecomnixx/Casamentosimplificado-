import React from 'react';
import {
  HelpCircle,
  ChevronRight,
  Sparkles,
  Plane,
  PartyPopper,
  Gift,
  FileText,
  Settings,
  Palette,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  LogOut,
  Download,
} from 'lucide-react';
import { BrideProfile, ColorPalette, UserAccess } from '../types';
import { PALETTES } from '../data/palettes';

interface MoreTabProps {
  profile: BrideProfile;
  palette: ColorPalette;
  userAccess: UserAccess;
  pendingAccessCount?: number;
  onOpenProfile: () => void;
  onOpenPalette: () => void;
  onSelectPaletteQuick: (pal: ColorPalette) => void;
  onOpenTour: () => void;
  onOpenAdmin: () => void;
  onOpenExtraModal: (extraType: 'inspirations' | 'honeymoon' | 'party' | 'bonus' | 'reports' | 'settings') => void;
  onLogout: () => void;
}

export const MoreTab: React.FC<MoreTabProps> = ({
  profile,
  palette,
  userAccess,
  pendingAccessCount = 0,
  onOpenProfile,
  onOpenPalette,
  onSelectPaletteQuick,
  onOpenTour,
  onOpenAdmin,
  onOpenExtraModal,
  onLogout,
}) => {
  const isAdmin =
    userAccess.role === 'admin' ||
    userAccess.brideEmail?.toLowerCase() === 'familiacardoso21@gmail.com';

  const brideInitial = profile.brideName ? profile.brideName.charAt(0).toUpperCase() : 'M';
  const groomInitial = profile.groomName ? profile.groomName.charAt(0).toUpperCase() : 'L';
  const monogram = `${brideInitial}${groomInitial}`;

  const extras = [
    {
      id: 'inspirations' as const,
      label: 'Inspirações',
      desc: 'Moodboard e fotos',
      icon: Sparkles,
    },
    {
      id: 'honeymoon' as const,
      label: 'Lua de mel',
      desc: 'Roteiro e malas',
      icon: Plane,
    },
    {
      id: 'party' as const,
      label: 'Despedida',
      desc: 'Chá bar e lingerie',
      icon: PartyPopper,
    },
    {
      id: 'bonus' as const,
      label: 'Bônus',
      desc: 'Votos e etiquetas',
      icon: Gift,
    },
    {
      id: 'reports' as const,
      label: 'Relatórios e PDFs',
      desc: 'Exportar resumo',
      icon: FileText,
    },
    {
      id: 'settings' as const,
      label: 'Configurações',
      desc: 'Preferências e dados',
      icon: Settings,
    },
  ];

  // 4 quick palette circles matching the screenshot dots
  const quickPalettes = [
    PALETTES.sage,
    PALETTES.champagne,
    PALETTES.dustyRose,
    PALETTES.terracotta,
  ];

  return (
    <div
      id="more-screen-container"
      className="w-full max-w-full overflow-x-hidden px-4 pt-5 pb-28 space-y-4 animate-in fade-in duration-300"
    >
      {/* Header (Matching Screenshot 2 & 7) */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <div>
          <h1
            id="more-title"
            className="text-2xl font-bold tracking-tight text-stone-900"
            style={{ color: palette.primaryDark }}
          >
            Mais
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Recursos extras, ferramentas e personalização.
          </p>
        </div>

        <button
          id="btn-more-help"
          onClick={onOpenTour}
          className="w-9 h-9 rounded-full bg-white/80 border border-stone-200 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors shadow-2xs"
          title="Ajuda e Guia do App"
        >
          <HelpCircle className="w-5 h-5 text-stone-500" />
        </button>
      </div>

      {/* Couple Profile Card (Matching Screenshot 2 & 7) */}
      <button
        id="card-couple-profile"
        onClick={onOpenProfile}
        className="w-full bg-white rounded-3xl p-4 border border-stone-100 shadow-xs flex items-center justify-between gap-3 text-left hover:border-stone-200 transition-colors active:scale-[0.99]"
      >
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-serif text-base font-bold shadow-2xs"
            style={{
              backgroundColor: '#EBF2ED',
              color: '#284B35',
            }}
          >
            {monogram}
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 leading-snug">
              {profile.brideName || 'Manu'} & {profile.groomName || 'Lucas'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">
              {profile.weddingDate
                ? new Date(profile.weddingDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '15 de maio de 2027'}
            </p>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-stone-400 shrink-0" />
      </button>

      {/* EXTRAS 2x3 Grid (Matching Screenshot 2 & 7) */}
      <div id="section-extras" className="pt-2">
        <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-stone-400 mb-2 px-0.5">
          EXTRAS
        </h2>

        <div className="grid grid-cols-2 gap-2.5">
          {extras.map((extra) => {
            const Icon = extra.icon;
            return (
              <button
                key={extra.id}
                id={`btn-extra-${extra.id}`}
                onClick={() => onOpenExtraModal(extra.id)}
                className="bg-white rounded-2xl p-4 border border-stone-100 shadow-xs flex flex-col items-start text-left hover:border-stone-200 transition-all active:scale-95"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 shadow-2xs"
                  style={{ backgroundColor: '#EBF2ED' }}
                >
                  <Icon className="w-5 h-5 text-[#284B35]" />
                </div>
                <span className="text-xs font-bold text-stone-800 leading-snug">
                  {extra.label}
                </span>
                <span className="text-[10px] text-stone-400 mt-0.5 font-medium">
                  {extra.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* List Options: Guia do app, Tema do app, Suporte, etc. */}
      <div className="space-y-2 pt-2">
        {/* 1. Guia do app */}
        <button
          id="btn-more-tour-guide"
          onClick={onOpenTour}
          className="w-full bg-white rounded-2xl p-3.5 border border-stone-100 shadow-xs flex items-center justify-between text-left hover:border-stone-200 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-800">Guia do app</h4>
              <p className="text-[10px] text-stone-400">Tours e ajuda de cada tela</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        {/* 2. Tema do app (with interactive color dots preview from Screenshot 2!) */}
        <div
          id="row-theme-palette"
          className="w-full bg-white rounded-2xl p-3.5 border border-stone-100 shadow-xs flex items-center justify-between"
        >
          <div
            onClick={onOpenPalette}
            className="flex items-center gap-3 cursor-pointer flex-1"
          >
            <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-800">Tema do app</h4>
              <p className="text-[10px] text-stone-400">
                {palette.name || 'Oficial'}
              </p>
            </div>
          </div>

          {/* 4 Interactive Palette Dots from Screenshot 2 */}
          <div className="flex items-center gap-2">
            {quickPalettes.map((pal) => (
              <button
                key={pal.id}
                onClick={() => onSelectPaletteQuick(pal)}
                className={`w-5 h-5 rounded-full border-2 transition-transform active:scale-90 ${
                  palette.id === pal.id ? 'border-stone-900 scale-110' : 'border-white'
                }`}
                style={{ backgroundColor: pal.primary }}
                title={`Tema ${pal.name}`}
              />
            ))}
            <button
              onClick={onOpenPalette}
              className="p-1 text-stone-400 hover:text-stone-700"
              title="Mais cores e paletas"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3. Suporte via WhatsApp */}
        <a
          id="link-more-support"
          href="https://wa.me/5511970398752?text=Ol%C3%A1!%20Preciso%20de%20ajuda%20com%20o%20Casamento%20Facilitado."
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-white rounded-2xl p-3.5 border border-stone-100 shadow-xs flex items-center justify-between text-left hover:border-stone-200 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-800">Suporte no WhatsApp</h4>
              <p className="text-[10px] text-stone-400">Fale com a nossa equipe</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </a>

        {/* 4. Aprovações de Acesso (If Admin) */}
        {isAdmin && (
          <button
            id="btn-more-admin"
            onClick={onOpenAdmin}
            className={`w-full bg-white rounded-2xl p-3.5 border shadow-xs flex items-center justify-between text-left transition-colors ${
              pendingAccessCount > 0
                ? 'border-rose-300 hover:border-rose-400 bg-rose-50/20'
                : 'border-amber-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  pendingAccessCount > 0
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4
                    className={`text-xs font-bold ${
                      pendingAccessCount > 0 ? 'text-rose-900' : 'text-amber-900'
                    }`}
                  >
                    Gerenciar Acessos (Admin)
                  </h4>
                  {pendingAccessCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white animate-pulse">
                      {pendingAccessCount} {pendingAccessCount === 1 ? 'pendente' : 'pendentes'}
                    </span>
                  )}
                </div>
                <p
                  className={`text-[10px] ${
                    pendingAccessCount > 0 ? 'text-rose-600 font-medium' : 'text-amber-600'
                  }`}
                >
                  {pendingAccessCount > 0
                    ? 'Noiva(s) aguardando sua liberação agora'
                    : 'Aprovar noivas e cadastros'}
                </p>
              </div>
            </div>
            <ChevronRight
              className={`w-4 h-4 ${
                pendingAccessCount > 0 ? 'text-rose-500' : 'text-amber-500'
              }`}
            />
          </button>
        )}

        {/* 5. Logout */}
        <button
          id="btn-more-logout"
          onClick={onLogout}
          className="w-full bg-stone-50 rounded-2xl p-3 text-stone-500 text-xs font-semibold hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center justify-center gap-2 mt-2"
        >
          <LogOut className="w-4 h-4" />
          Sair da Conta
        </button>
      </div>
    </div>
  );
};
