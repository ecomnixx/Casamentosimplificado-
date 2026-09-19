import React, { useState } from 'react';
import { SlidersHorizontal, Palette, Lock, CheckCircle2, LogOut, ShieldCheck, Smartphone, X, Bell } from 'lucide-react';
import { BrideProfile, ColorPalette, UserAccess } from '../types';

interface HeaderProps {
  profile: BrideProfile;
  palette: ColorPalette;
  userAccess: UserAccess;
  pendingAccessCount?: number;
  onOpenProfile: () => void;
  onOpenAccess: () => void;
  onOpenPalette?: () => void;
  onLogout?: () => void;
  onOpenAdmin?: () => void;
  onOpenInstall?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  palette,
  userAccess,
  pendingAccessCount = 0,
  onOpenProfile,
  onOpenAccess,
  onOpenPalette,
  onLogout,
  onOpenAdmin,
  onOpenInstall,
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const initial = profile.brideName ? profile.brideName.charAt(0).toUpperCase() : '💍';
  const isAdmin = userAccess.role === 'admin' || userAccess.brideEmail === 'familiacardoso21@gmail.com';

  return (
    <>
      <header className="flex items-center justify-between pt-5 pb-3 px-4 sm:px-6 w-full max-w-full overflow-x-hidden">
        <div className="flex items-center gap-3.5">
          {/* Monogram Circle */}
          <button
            onClick={onOpenProfile}
            id="monogram-avatar"
            className="w-12 h-12 rounded-full flex items-center justify-center border shadow-xs transition-transform hover:scale-105"
            style={{
              backgroundColor: palette.primaryLight,
              borderColor: palette.primary + '40',
              color: palette.primaryDark,
            }}
            title="Editar dados do casal"
          >
            <span className="font-serif-display text-2xl font-light italic">{initial}</span>
          </button>

          {/* Title & Names */}
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] font-semibold tracking-[0.2em] uppercase opacity-75"
                style={{ color: palette.primaryDark }}
              >
                CASAMENTO FACILITADO
              </span>

              {isAdmin ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onOpenAdmin}
                    className="cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200 transition-all hover:scale-105"
                    title="Acessar Gestão de Aprovações (Master Admin)"
                  >
                    <ShieldCheck className="w-3 h-3 text-purple-700" />
                    MASTER
                  </button>

                  {pendingAccessCount > 0 && (
                    <button
                      type="button"
                      onClick={onOpenAdmin}
                      className="cursor-pointer inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-xs animate-pulse transition-all hover:scale-105"
                      title={`${pendingAccessCount} noiva(s) aguardando sua aprovação!`}
                    >
                      <Bell className="w-2.5 h-2.5" />
                      {pendingAccessCount} {pendingAccessCount === 1 ? 'pendente' : 'pendentes'}
                    </button>
                  )}
                </div>
              ) : userAccess.isUnlocked ? (
                <span
                  onClick={onOpenAccess}
                  className="cursor-pointer inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border transition-all hover:scale-105"
                  style={{
                    backgroundColor: palette.badgeBg,
                    borderColor: palette.primary + '30',
                    color: palette.badgeText,
                  }}
                  title="Acesso VIP Ativo (R$ 9,99 Pago)"
                >
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  VIP
                </span>
              ) : (
                <button
                  onClick={onOpenAccess}
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 transition-all hover:bg-amber-100 hover:scale-105"
                  title="Desbloquear App por R$ 9,99"
                >
                  <Lock className="w-2.5 h-2.5" />
                  R$ 9,99
                </button>
              )}
            </div>
            <h1
              onClick={onOpenProfile}
              className="font-serif-display text-2xl sm:text-3xl font-medium tracking-tight leading-tight cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: palette.primaryDark }}
              title="Toque para editar nomes do casal"
            >
              {profile.brideName && profile.groomName
                ? `${profile.brideName} & ${profile.groomName}`
                : profile.brideName || 'Meu Casamento'}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isAdmin && onOpenAdmin && (
            <button
              id="btn-open-admin-approvals"
              onClick={onOpenAdmin}
              aria-label="Gestão de Aprovações"
              title={
                pendingAccessCount > 0
                  ? `${pendingAccessCount} noiva(s) aguardando liberação de acesso`
                  : 'Painel de Aprovação de Acessos'
              }
              className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 ${
                pendingAccessCount > 0
                  ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100 ring-2 ring-rose-300/60'
                  : 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
              }`}
            >
              {pendingAccessCount > 0 ? (
                <Bell className="w-4 h-4 text-rose-600 animate-bounce" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-purple-700" />
              )}

              {pendingAccessCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-white text-[9px] font-black shadow-xs">
                  {pendingAccessCount}
                </span>
              )}
            </button>
          )}

          {onOpenPalette && (
            <button
              id="btn-open-palette"
              onClick={onOpenPalette}
              aria-label="Abrir leque de cores"
              title={`Paleta: ${palette.name}`}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 relative"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                borderColor: palette.primary + '25',
                color: palette.primaryDark,
              }}
            >
              <Palette className="w-4 h-4" style={{ color: palette.primary }} />
              <span
                className="w-2.5 h-2.5 rounded-full absolute top-1 right-1 border border-white shadow-2xs"
                style={{ backgroundColor: palette.primary }}
              />
            </button>
          )}

          {onOpenInstall && (
            <button
              id="btn-open-install-app"
              onClick={onOpenInstall}
              aria-label="Instalar no celular"
              title="Instalar App no Celular / Área de Trabalho"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border shadow-xs transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: palette.primaryLight,
                borderColor: palette.primary + '35',
                color: palette.primaryDark,
              }}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          )}

          <button
            id="btn-open-profile"
            onClick={onOpenProfile}
            aria-label="Configurar casamento"
            title="Configurar Dados do Casamento"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border shadow-xs transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              borderColor: palette.primary + '25',
              color: palette.primaryDark,
            }}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {onLogout && (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              id="btn-header-logout"
              aria-label="Sair do aplicativo"
              title="Sair da Conta (Logout)"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 text-stone-500 hover:text-rose-600 hover:border-rose-300 bg-white/90"
              style={{ borderColor: palette.primary + '25' }}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl border border-stone-200 text-center animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-200">
              <LogOut className="w-6 h-6" />
            </div>

            <h3 className="font-serif-display text-xl font-bold text-stone-900">
              Sair do Aplicativo?
            </h3>

            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Você será desconectado com segurança. Seus dados permanecerão salvos para quando você retornar
              {userAccess.brideEmail && (
                <> com o e-mail <strong className="text-stone-900">{userAccess.brideEmail}</strong></>
              )}.
            </p>

            <div className="flex gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  if (onLogout) onLogout();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs transition-colors"
              >
                Sim, Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

