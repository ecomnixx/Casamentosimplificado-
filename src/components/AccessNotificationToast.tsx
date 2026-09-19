import React from 'react';
import { Bell, Check, ArrowRight, X, Sparkles } from 'lucide-react';
import { UserAccount, ColorPalette } from '../types';

interface AccessNotificationToastProps {
  user: UserAccount;
  palette: ColorPalette;
  onApprove: (userId: string) => void;
  onOpenAdmin: () => void;
  onDismiss: () => void;
}

export const AccessNotificationToast: React.FC<AccessNotificationToastProps> = ({
  user,
  palette,
  onApprove,
  onOpenAdmin,
  onDismiss,
}) => {
  return (
    <div
      id="access-notification-toast"
      className="fixed top-3 left-3 right-3 sm:left-auto sm:right-4 z-50 max-w-md mx-auto sm:max-w-sm bg-white rounded-2xl shadow-2xl border border-rose-200 p-3.5 animate-in slide-in-from-top-4 fade-in duration-300 backdrop-blur-md"
      style={{
        boxShadow: '0 20px 25px -5px rgba(244, 63, 94, 0.15), 0 8px 10px -6px rgba(244, 63, 94, 0.1)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0 mt-0.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-2xs">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Solicitação de Acesso
            </span>
          </div>

          <h4 className="text-xs font-bold text-stone-900 mt-1 truncate">
            {user.name || 'Nova Noiva'}
          </h4>
          <p className="text-[11px] text-stone-500 truncate">
            {user.email}
          </p>

          <p className="text-[11px] text-stone-600 mt-1 leading-snug">
            Realizou o cadastro e aguarda liberação do acesso.
          </p>

          <div className="flex items-center gap-2 mt-2.5">
            <button
              type="button"
              onClick={() => onApprove(user.id)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Aprovar Agora
            </button>

            <button
              type="button"
              onClick={onOpenAdmin}
              className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              Ver Painel
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors"
          title="Fechar notificação"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
