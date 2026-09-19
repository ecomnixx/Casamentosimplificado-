import React, { useState, useEffect } from 'react';
import { Download, X, Share2, PlusSquare, Sparkles, Smartphone, Check } from 'lucide-react';
import { ColorPalette } from '../types';

interface InstallAppBannerProps {
  palette: ColorPalette;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallAppBanner({ palette }: InstallAppBannerProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalledSuccess, setIsInstalledSuccess] = useState(false);

  useEffect(() => {
    // Detect if inside an iframe (like AI Studio preview)
    const isFrame = typeof window !== 'undefined' && window.self !== window.top;

    // Check if already installed / standalone
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(isStandaloneMode);

    // Check if dismissed recently (in the last 24 hours)
    const dismissedTimestamp = localStorage.getItem('casamento_pwa_dismissed');
    if (dismissedTimestamp) {
      const hoursPassed = (Date.now() - parseInt(dismissedTimestamp, 10)) / (1000 * 60 * 60);
      if (hoursPassed < 24) {
        setIsDismissed(true);
      }
    }

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Capture standard PWA install prompt on Android/Chrome/Edge
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalledSuccess(true);
      setDeferredPrompt(null);
      setTimeout(() => {
        setIsStandalone(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger native Android / Chrome prompt
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalledSuccess(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('Install prompt error:', err);
      }
    } else if (isIOS) {
      // Open iOS Instructions guide
      setShowIOSInstructions(true);
    } else {
      // Generic mobile instructions
      setShowIOSInstructions(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('casamento_pwa_dismissed', Date.now().toString());
  };

  // If already running as an installed standalone app or dismissed, don't show
  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <div className="mx-4 my-3">
      <div
        id="install-app-banner"
        className="relative overflow-hidden rounded-3xl border shadow-md transition-all duration-300 animate-in fade-in slide-in-from-top-3"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: palette.primary + '35',
        }}
      >
        {/* Top Decorative Color Ribbon */}
        <div
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(90deg, ${palette.primary} 0%, ${palette.accent} 50%, ${palette.primary} 100%)`,
          }}
        />

        <div className="p-4">
          <div className="flex items-start gap-3.5">
            {/* App Icon Preview */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs"
              style={{
                backgroundColor: palette.primary,
                borderColor: palette.accent,
                color: '#FFFFFF',
              }}
            >
              <Smartphone className="w-6 h-6 stroke-[2]" />
            </div>

            {/* Content Text */}
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1"
                  style={{
                    backgroundColor: palette.primaryLight,
                    color: palette.primaryDark,
                    borderColor: palette.primary + '30',
                  }}
                >
                  <Sparkles className="w-3 h-3" />
                  Instalar no Celular
                </span>
              </div>

              <h3 className="font-serif-display text-base sm:text-lg font-bold text-stone-900 mt-1 leading-snug">
                Adicione à sua Área de Trabalho
              </h3>
              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                Acesse o aplicativo direto da tela inicial do seu celular, com um toque e sem precisar abrir o navegador toda vez!
              </p>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Fechar notificação"
              className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-400 hover:text-stone-600 flex items-center justify-center transition-colors shrink-0 -mr-1 -mt-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Button */}
          {!showIOSInstructions ? (
            <div className="mt-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                id="btn-install-app"
                onClick={handleInstallClick}
                className="py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-all"
                style={{ backgroundColor: palette.buttonBg }}
              >
                {isInstalledSuccess ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Aplicativo Instalado com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>Instalar Aplicativo na Tela Inicial</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="py-2 px-3 text-xs font-medium text-stone-500 hover:text-stone-700 text-center transition-colors"
              >
                Lembrar mais tarde
              </button>
            </div>
          ) : (
            /* Visual Instructions for iOS or browsers without native prompt */
            <div className="mt-3.5 pt-3 border-t border-stone-100 animate-in fade-in duration-200">
              <div className="rounded-2xl p-3 bg-stone-50 border border-stone-200/80 space-y-2.5 text-xs text-stone-700">
                <p className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  Como adicionar à tela inicial no celular:
                </p>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <div>
                    {isIOS ? (
                      <>
                        <span>No iPhone/Safari, toque no botão </span>
                        <strong className="inline-flex items-center gap-1 font-semibold text-stone-900 bg-white px-1.5 py-0.5 rounded border border-stone-300">
                          <Share2 className="w-3 h-3 text-blue-600" /> Compartilhar
                        </strong>
                      </>
                    ) : (
                      <>
                        <span>No Android/Chrome, toque nos </span>
                        <strong className="inline-flex items-center gap-1 font-semibold text-stone-900 bg-white px-1.5 py-0.5 rounded border border-stone-300">
                          três pontinhos (⋮)
                        </strong>
                        <span> no canto superior do navegador.</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <div>
                    <span>Selecione </span>
                    <strong className="inline-flex items-center gap-1 font-semibold text-stone-900 bg-white px-1.5 py-0.5 rounded border border-stone-300">
                      <PlusSquare className="w-3 h-3 text-emerald-600" /> {isIOS ? 'Adicionar à Tela de Início' : 'Instalar aplicativo'}
                    </strong>
                    <span>.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <div>
                    <span>Confirme em </span>
                    <strong className="font-semibold text-stone-900">{isIOS ? 'Adicionar' : 'Instalar'}</strong>
                    <span>. O ícone oficial do Casamento Facilitado será adicionado à sua área de trabalho!</span>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowIOSInstructions(false)}
                  className="text-xs font-semibold text-stone-500 hover:text-stone-800 px-3 py-1"
                >
                  Entendi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
