import React from 'react';
import { Users, ArrowRight, Plus, MessageCircle, Building2, Sparkles } from 'lucide-react';
import { ColorPalette, SupplierItem } from '../types';
import { formatCurrencyBRL, getWhatsAppUrl } from '../utils/helpers';
import { WEDDING_CATALOG_SUGGESTIONS } from '../data/weddingCatalog';

interface SuppliersHomePreviewProps {
  palette: ColorPalette;
  suppliers: SupplierItem[];
  onViewAllSuppliers: () => void;
  onAddNewSupplier: (prefillRoleId?: string) => void;
}

// Quick suggested highlights for the home screen
const QUICK_SUGGESTIONS = [
  { id: 'barman-openbar', icon: '🍸', role: 'Barman & Open Bar', category: 'Barman & Open Bar' },
  { id: 'dj-sonorizacao', icon: '🎧', role: 'DJ & Sonorização', category: 'Música / Banda / DJ' },
  { id: 'fotografo-casamento', icon: '📸', role: 'Fotógrafo de Casamento', category: 'Fotógrafo / Cinegrafista' },
  { id: 'buffet-gastronomico', icon: '🍽️', role: 'Buffet Gastronômico', category: 'Buffet Gastronômico' },
  { id: 'espaco-casamento', icon: '🏰', role: 'Espaço de Casamento', category: 'Espaço de Casamento' },
  { id: 'decoracao-cenografia', icon: '💐', role: 'Decoração & Flores', category: 'Decoração & Cenografia' },
  { id: 'vestido-noiva', icon: '👰', role: 'Vestido & Véu', category: 'Vestido de Noiva / Atelier' },
  { id: 'bolo-casamento', icon: '🎂', role: 'Bolo & Doces Finos', category: 'Bolo & Doces Finos' },
];

export const SuppliersHomePreview: React.FC<SuppliersHomePreviewProps> = ({
  palette,
  suppliers,
  onViewAllSuppliers,
  onAddNewSupplier,
}) => {
  const addedSuppliers = suppliers.filter((s) => s.isAdded);

  return (
    <section className="px-4 sm:px-6 my-4 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 opacity-70" style={{ color: palette.primary }} />
          <span
            className="text-[11px] sm:text-[12px] font-semibold tracking-[0.18em] uppercase"
            style={{ color: palette.primaryDark, opacity: 0.8 }}
          >
            FORNECEDORES &amp; SERVIÇOS ({addedSuppliers.length})
          </span>
        </div>
        <button
          onClick={onViewAllSuppliers}
          className="text-xs font-semibold hover:underline flex items-center gap-1"
          style={{ color: palette.primaryDark }}
        >
          <span>Guia Completo (38)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Suggestions Carousel with (+) Buttons */}
      <div className="mb-3 w-full max-w-full">
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" style={{ color: palette.primary }} />
            Sugestões Rápidas: toque no + para cadastrar
          </span>
        </div>
        <div
          data-horizontal-scroll="true"
          className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar overscroll-contain-x touch-pan-x"
          style={{ overscrollBehaviorX: 'contain', WebkitOverflowScrolling: 'touch' }}
        >
          {QUICK_SUGGESTIONS.map((item) => {
            const alreadyAdded = addedSuppliers.some(
              (s) => s.catalogRoleId === item.id || s.category === item.category
            );
            return (
              <div
                key={item.id}
                className={`px-3 py-2 rounded-2xl border bg-white shadow-2xs shrink-0 flex items-center gap-2 transition-all ${
                  alreadyAdded ? 'opacity-85' : 'hover:border-stone-400'
                }`}
                style={{
                  borderColor: alreadyAdded ? palette.primary + '60' : 'rgba(0,0,0,0.08)',
                }}
              >
                <span className="text-sm">{item.icon}</span>
                <div className="text-left">
                  <span className="text-xs font-bold text-stone-800 block whitespace-nowrap">
                    {item.role}
                  </span>
                  <span className="text-[10px] text-stone-600 block">
                    {alreadyAdded ? '✓ Já na lista' : 'Sugestão'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onAddNewSupplier(item.id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 shadow-2xs hover:scale-105 active:scale-95 transition-all ml-1"
                  style={{ backgroundColor: palette.buttonBg }}
                  title={`Adicionar ${item.role}`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real Suppliers Added by the Client */}
      {addedSuppliers.length === 0 ? (
        <div
          className="p-4 rounded-[22px] border text-center transition-all bg-white/90 shadow-2xs"
          style={{ borderColor: palette.primary + '20' }}
        >
          <div
            className="w-9 h-9 rounded-full mx-auto flex items-center justify-center mb-2 shadow-2xs border"
            style={{
              backgroundColor: palette.primaryLight,
              borderColor: palette.primary + '30',
              color: palette.primary,
            }}
          >
            <Building2 className="w-4 h-4" />
          </div>
          <h4 className="text-xs sm:text-sm font-semibold text-stone-900">
            Nenhum fornecedor cadastrado na sua lista ainda
          </h4>
          <p className="text-[11px] text-stone-500 mt-0.5 max-w-xs mx-auto">
            Toque no <strong>+</strong> nas sugestões acima ou acesse o Guia Completo para adicionar Barman, DJ, Buffet, Fotógrafo e outros.
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <button
              onClick={onViewAllSuppliers}
              className="py-2 px-4 rounded-full text-xs font-bold text-white inline-flex items-center gap-1.5 shadow-xs hover:opacity-95 transition-all"
              style={{ backgroundColor: palette.buttonBg }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Explorar Tudo do Casamento (38)
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {addedSuppliers.slice(0, 3).map((sup) => (
            <div
              key={sup.id}
              className="p-3.5 rounded-[20px] border bg-white/90 shadow-2xs flex items-center justify-between transition-all hover:shadow-xs"
              style={{ borderColor: palette.primary + '18' }}
            >
              <div className="min-w-0 flex-1 pr-3">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor:
                        sup.status === 'contratado'
                          ? palette.primaryLight
                          : sup.status === 'negociando'
                          ? '#FEF3C7'
                          : '#F3F4F6',
                      color:
                        sup.status === 'contratado'
                          ? palette.primaryDark
                          : sup.status === 'negociando'
                          ? '#92400E'
                          : '#4B5563',
                    }}
                  >
                    {sup.status === 'contratado'
                      ? 'Contratado'
                      : sup.status === 'negociando'
                      ? 'Em negociação'
                      : 'Em pesquisa'}
                  </span>
                  <span className="text-[11px] text-stone-500 truncate">{sup.category}</span>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-stone-900 truncate">{sup.name}</h4>
                <p className="text-xs font-serif-display font-medium text-stone-600 mt-0.5">
                  {formatCurrencyBRL(sup.price)}
                </p>
              </div>

              {/* Direct WhatsApp Action */}
              <div className="flex items-center gap-1.5">
                {sup.phone && (
                  <a
                    href={getWhatsAppUrl(
                      sup.phone,
                      `Olá! Gostaria de falar sobre o nosso casamento.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors shadow-2xs"
                    title="Falar no WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}

          {/* Quick link to see all */}
          <div className="pt-1">
            <button
              onClick={onViewAllSuppliers}
              className="w-full py-2.5 rounded-[16px] border border-dashed text-xs font-medium flex items-center justify-center gap-1.5 transition-colors bg-white/70 hover:bg-white"
              style={{
                borderColor: palette.primary + '40',
                color: palette.primaryDark,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ver todos os 38 serviços &amp; cadastrados ({addedSuppliers.length})
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
