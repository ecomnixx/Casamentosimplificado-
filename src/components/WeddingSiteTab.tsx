import React, { useState } from 'react';
import {
  Globe,
  HelpCircle,
  CheckCircle2,
  Circle,
  ExternalLink,
  Edit3,
  Gift,
  Share2,
  Sparkles,
  CreditCard,
  ChevronRight,
  Eye,
  Check,
} from 'lucide-react';
import { BrideProfile, ColorPalette, WeddingSiteConfig } from '../types';

interface WeddingSiteTabProps {
  profile: BrideProfile;
  palette: ColorPalette;
  siteConfig: WeddingSiteConfig;
  onUpdateSiteConfig: (newConfig: WeddingSiteConfig) => void;
  onOpenVisualEditor: () => void;
  onOpenGiftRegistry: () => void;
  onOpenHelp: () => void;
}

export const WeddingSiteTab: React.FC<WeddingSiteTabProps> = ({
  profile,
  palette,
  siteConfig,
  onUpdateSiteConfig,
  onOpenVisualEditor,
  onOpenGiftRegistry,
  onOpenHelp,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const checklistTasks = [
    'Adicionar uma foto de capa',
    'Preencher os dados da cerimônia e recepção',
    'Configurar a confirmação de presença',
    'Escolher presentes para a sua lista',
    'Conectar sua conta do Mercado Pago',
    'Publicar o site',
  ];

  const completedCount = siteConfig.completedTasks?.length || 2;
  const progressPercent = Math.min(
    100,
    Math.round((completedCount / checklistTasks.length) * 100)
  );

  const toggleTask = (taskTitle: string) => {
    const current = siteConfig.completedTasks || [];
    const updated = current.includes(taskTitle)
      ? current.filter((t) => t !== taskTitle)
      : [...current, taskTitle];

    onUpdateSiteConfig({
      ...siteConfig,
      completedTasks: updated,
    });
  };

  const steps = [
    { num: 1, title: 'Editar visual', action: onOpenVisualEditor },
    { num: 2, title: 'Ativar confirmações', action: () => toggleTask('Configurar a confirmação de presença') },
    { num: 3, title: 'Configurar presentes', action: onOpenGiftRegistry },
    { num: 4, title: 'Conectar conta', action: () => toggleTask('Conectar sua conta do Mercado Pago') },
    { num: 5, title: 'Compartilhar', action: () => setIsPreviewOpen(true) },
  ];

  return (
    <div
      id="wedding-site-screen"
      className="w-full max-w-full overflow-x-hidden px-4 pt-5 pb-28 space-y-4 animate-in fade-in duration-300"
    >
      {/* Header (Exact text matching Screenshot 4) */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <div>
          <h1
            id="site-title"
            className="text-2xl font-bold tracking-tight text-stone-900"
            style={{ color: palette.primaryDark }}
          >
            Site do casamento
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Seu portal online para convidados e presentes.
          </p>
        </div>

        <button
          id="btn-site-help"
          onClick={onOpenHelp}
          className="w-9 h-9 rounded-full bg-white/80 border border-stone-200 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors shadow-2xs"
          title="Ajuda sobre o site"
        >
          <HelpCircle className="w-5 h-5 text-stone-500" />
        </button>
      </div>

      {/* Hero Card with Couple Image (Exact match to Screenshot 4) */}
      <div
        id="site-hero-card"
        className="relative overflow-hidden rounded-3xl text-white shadow-md"
        style={{ minHeight: '220px' }}
      >
        {/* Background Image with Dark Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform hover:scale-105 duration-700"
          style={{
            backgroundImage: `url(${
              siteConfig.coverUrl ||
              'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'
            })`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

        {/* Content */}
        <div className="relative z-10 p-5 flex flex-col justify-end h-full pt-16">
          <h2 className="text-xl font-bold tracking-tight text-white mb-1">
            Seu site já começou
          </h2>
          <p className="text-xs text-stone-200 font-medium mb-3">
            {progressPercent}% pronto
          </p>

          {/* Progress bar */}
          <div className="w-full bg-white/30 backdrop-blur-xs rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="h-2 rounded-full bg-[#D4AF37] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-customize-site"
              onClick={onOpenVisualEditor}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-stone-900 bg-white hover:bg-stone-100 shadow-md transition-colors text-center"
            >
              Personalizar meu site
            </button>
            <button
              id="btn-preview-site-quick"
              onClick={() => setIsPreviewOpen(true)}
              className="py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/20 transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              Ver
            </button>
          </div>
        </div>
      </div>

      {/* "FALTA PARA COMPLETAR" Checklist (Exact match to Screenshot 4) */}
      <div id="section-falta-completar" className="pt-2">
        <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-stone-400 mb-2 px-0.5">
          FALTA PARA COMPLETAR
        </h2>
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-xs space-y-3">
          {checklistTasks.map((task, idx) => {
            const isDone = siteConfig.completedTasks?.includes(task);

            return (
              <button
                key={`site-task-${idx}`}
                id={`site-check-task-${idx}`}
                onClick={() => toggleTask(task)}
                className="w-full flex items-center gap-3 text-left py-1 hover:bg-stone-50/50 rounded-lg transition-colors group"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                    isDone
                      ? 'bg-[#284B35] border-[#284B35] text-white'
                      : 'border-stone-300 group-hover:border-stone-400'
                  }`}
                >
                  {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span
                  className={`text-xs font-medium leading-relaxed ${
                    isDone
                      ? 'line-through text-stone-400'
                      : 'text-stone-700 group-hover:text-stone-900'
                  }`}
                >
                  {task}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* "PRÓXIMOS PASSOS" (Exact match to Screenshot 4) */}
      <div id="section-proximos-passos" className="pt-2">
        <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-stone-400 mb-2 px-0.5">
          PRÓXIMOS PASSOS
        </h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar overscroll-contain-x touch-pan-x">
          {steps.map((step) => (
            <button
              key={`step-${step.num}`}
              id={`btn-step-${step.num}`}
              onClick={step.action}
              className="bg-white rounded-2xl p-3 border border-stone-100 shadow-xs min-w-[125px] flex flex-col items-start hover:border-stone-200 transition-colors shrink-0 text-left active:scale-95"
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-2 text-white"
                style={{ backgroundColor: '#284B35' }}
              >
                {step.num}
              </span>
              <span className="text-xs font-semibold text-stone-800 leading-snug">
                {step.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* "GERENCIE SEU SITE" (Exact match to Screenshot 4) */}
      <div id="section-gerencie-site" className="pt-2">
        <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-stone-400 mb-2 px-0.5">
          GERENCIE SEU SITE
        </h2>
        <div className="space-y-2.5">
          {/* 1. Editar visual e conteúdo */}
          <button
            id="btn-edit-visual-content"
            onClick={onOpenVisualEditor}
            className="w-full bg-white rounded-2xl p-4 border border-stone-100 shadow-xs flex items-center justify-between gap-3 text-left hover:border-stone-200 transition-colors active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                style={{ backgroundColor: '#EBF2ED' }}
              >
                <Edit3 className="w-5 h-5 text-[#284B35]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 leading-snug">
                  Editar visual e conteúdo
                </h4>
                <p className="text-xs text-stone-500 mt-0.5 font-medium">
                  Foto, estilo, cores, textos e informações
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400 shrink-0" />
          </button>

          {/* 2. Lista de presentes */}
          <button
            id="btn-open-gift-registry"
            onClick={onOpenGiftRegistry}
            className="w-full bg-white rounded-2xl p-4 border border-stone-100 shadow-xs flex items-center justify-between gap-3 text-left hover:border-stone-200 transition-colors active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                style={{ backgroundColor: '#EBF2ED' }}
              >
                <Gift className="w-5 h-5 text-[#284B35]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 leading-snug">
                  Lista de presentes
                </h4>
                <p className="text-xs text-stone-500 mt-0.5 font-medium">
                  Escolha entre 60 sugestões e adicione em poucos toques.
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* Preview Modal for Wedding Site */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200">
            <div className="text-center pb-4 border-b border-stone-100">
              <div className="w-12 h-12 rounded-full mx-auto bg-[#EBF2ED] flex items-center justify-center text-[#284B35] mb-2">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900">
                Site dos Noivos
              </h3>
              <p className="text-xs text-stone-500 mt-0.5 font-medium">
                {profile.brideName || 'Manu'} & {profile.groomName || 'Lucas'}
              </p>
            </div>

            <div className="mt-4 space-y-4 text-center">
              <div className="rounded-2xl overflow-hidden shadow-xs border border-stone-200">
                <img
                  src={siteConfig.coverUrl}
                  alt="Casal"
                  className="w-full h-40 object-cover"
                />
              </div>

              <div>
                <h4 className="text-sm font-bold text-stone-800">
                  {siteConfig.welcomeTitle || 'Sejam bem-vindos!'}
                </h4>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {siteConfig.welcomeMessage ||
                    'Criamos este espaço para compartilhar todos os detalhes do nosso grande dia!'}
                </p>
              </div>

              <div className="bg-stone-50 p-3.5 rounded-2xl text-xs space-y-1.5 text-left border border-stone-100">
                <div className="font-semibold text-stone-800">Detalhes da Cerimônia:</div>
                <div className="text-stone-600">
                  📅 {profile.weddingDate || '15/05/2027'} às {profile.weddingTime || '16:30'}
                </div>
                <div className="text-stone-600">
                  📍 {profile.venueAddress || profile.location || 'Espaço de Casamento'}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert('Link do site copiado para a área de transferência!');
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white shadow-xs hover:opacity-90 flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: '#284B35' }}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Copiar Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
