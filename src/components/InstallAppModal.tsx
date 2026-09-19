import React, { useState, useEffect } from 'react';
import { X, Smartphone, Share2, PlusSquare, Download, Check, ExternalLink } from 'lucide-react';
import { ColorPalette } from '../types';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  palette: ColorPalette;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  palette,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleTriggerNativeInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('Install prompt error:', err);
      }
    }
  };

  const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200"
        style={{ borderColor: palette.primary + '30' }}
      >
        {/* Top Header */}
        <div
          className="p-5 flex items-center justify-between text-white"
          style={{
            background: `linear-gradient(135deg, ${palette.primaryDark} 0%, ${palette.primary} 100%)`,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-serif-display text-xl font-bold leading-tight">
                Instalar no Celular
              </h2>
              <p className="text-xs text-white/80">
                Acesse como aplicativo na sua Área de Trabalho
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Quick Native Install Button if prompt ready */}
          {deferredPrompt && (
            <button
              onClick={handleTriggerNativeInstall}
              className="w-full py-3 px-4 rounded-2xl font-bold text-sm text-white shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98"
              style={{ backgroundColor: palette.buttonBg }}
            >
              {isInstalled ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Aplicativo Instalado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Instalar com 1 Toque Agora</span>
                </>
              )}
            </button>
          )}

          {/* Iframe Hint */}
          {isInsideIframe && (
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                Dica para Instalar no Celular:
              </p>
              <p className="text-amber-800 leading-relaxed">
                Abra o link no navegador nativo do celular (Chrome no Android ou Safari no iPhone). O navegador liberará a instalação instantânea para a tela de início.
              </p>
            </div>
          )}

          {/* Step-by-Step for iOS Safari */}
          <div className="rounded-2xl p-4 bg-stone-50 border border-stone-200 space-y-3">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>🍎</span> No iPhone (Safari)
            </h4>

            <div className="space-y-2.5 text-xs text-stone-700">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <span>Toque no botão <strong className="inline-flex items-center gap-1 font-semibold text-stone-900 bg-white px-1.5 py-0.5 rounded border border-stone-300"><Share2 className="w-3 h-3 text-blue-600" /> Compartilhar</strong> na barra inferior do Safari.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <span>Role a lista e toque em <strong className="inline-flex items-center gap-1 font-semibold text-stone-900 bg-white px-1.5 py-0.5 rounded border border-stone-300"><PlusSquare className="w-3 h-3 text-emerald-600" /> Adicionar à Tela de Início</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <span>Toque em <strong className="font-semibold text-stone-900">Adicionar</strong> no canto superior direito.</span>
              </div>
            </div>
          </div>

          {/* Step-by-Step for Android Chrome */}
          <div className="rounded-2xl p-4 bg-stone-50 border border-stone-200 space-y-3">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>🤖</span> No Android (Google Chrome)
            </h4>

            <div className="space-y-2.5 text-xs text-stone-700">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <span>Toque no menu de <strong className="font-semibold text-stone-900 bg-white px-1.5 py-0.5 rounded border border-stone-300">três pontinhos (⋮)</strong> no canto superior direito do Chrome.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <span>Selecione <strong className="inline-flex items-center gap-1 font-semibold text-stone-900 bg-white px-1.5 py-0.5 rounded border border-stone-300"><PlusSquare className="w-3 h-3 text-emerald-600" /> Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <span>Confirme em <strong className="font-semibold text-stone-900">Instalar</strong>. O ícone aparecerá diretamente na tela do seu celular!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200/80 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl font-semibold text-xs text-stone-700 hover:bg-stone-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
