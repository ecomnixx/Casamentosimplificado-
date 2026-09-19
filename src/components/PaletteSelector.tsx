import React from 'react';
import { Sparkles, Palette, Pipette, ChevronRight } from 'lucide-react';
import { ColorPalette } from '../types';
import { PALETTES } from '../data/palettes';

interface PaletteSelectorProps {
  currentPalette: ColorPalette;
  onSelectPalette: (palette: ColorPalette) => void;
  onOpenPaletteModal: () => void;
}

export const PaletteSelector: React.FC<PaletteSelectorProps> = ({
  currentPalette,
  onSelectPalette,
  onOpenPaletteModal,
}) => {
  const defaultList = Object.values(PALETTES);

  // If current palette is a custom one not in default list, put it first!
  const isCustomActive = !PALETTES[currentPalette.id];

  return (
    <section className="px-4 sm:px-6 my-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5" style={{ color: currentPalette.primary }} />
          <span
            className="text-[11px] sm:text-[12px] font-bold tracking-[0.18em] uppercase"
            style={{ color: currentPalette.primaryDark }}
          >
            PALETA DO DIA
          </span>
        </div>

        {/* Big CTA button to open the huge fan of colors */}
        <button
          onClick={onOpenPaletteModal}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-97 border"
          style={{
            backgroundColor: currentPalette.primaryLight,
            borderColor: currentPalette.primary + '35',
            color: currentPalette.primaryDark,
          }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: currentPalette.primary }} />
          <span>Abrir Leque de Cores</span>
          <ChevronRight className="w-3 h-3 opacity-70" />
        </button>
      </div>

      {/* Horizontal Scrollable Row with Instant Custom Picker Button + Palettes */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
        {/* Special Button: Escolher Qualquer Cor (Seletor Livre) */}
        <button
          onClick={onOpenPaletteModal}
          className="flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-[22px] transition-all duration-200 border border-dashed hover:border-solid hover:scale-[1.02] shadow-2xs bg-white/80 hover:bg-white text-stone-700"
          style={{
            borderColor: currentPalette.primary + '60',
            minWidth: '88px',
          }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center mb-1.5 shadow-2xs"
            style={{
              backgroundColor: currentPalette.primaryLight,
              color: currentPalette.primary,
            }}
          >
            <Pipette className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-center leading-tight">
            Personalizar<br />
            <span style={{ color: currentPalette.primary }}>+ Escolher</span>
          </span>
        </button>

        {/* Custom Palette card if active */}
        {isCustomActive && (
          <button
            onClick={() => onSelectPalette(currentPalette)}
            className="flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-[22px] transition-all duration-200 border cursor-pointer scale-[1.03] shadow-md ring-2 ring-offset-2 bg-white"
            style={{
              borderColor: currentPalette.primary,
              minWidth: '82px',
              // @ts-ignore
              '--tw-ring-color': currentPalette.primary,
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              {currentPalette.swatches.map((color, idx) => (
                <span
                  key={idx}
                  className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full shadow-2xs block border border-black/5"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span
              className="text-[12px] font-bold transition-colors"
              style={{ color: currentPalette.primaryDark }}
            >
              Minha Cor
            </span>
          </button>
        )}

        {/* Pre-curated palettes */}
        {defaultList.map((p) => {
          const isSelected = p.id === currentPalette.id;

          return (
            <button
              key={p.id}
              id={`palette-option-${p.id}`}
              onClick={() => onSelectPalette(p)}
              className={`flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-[22px] transition-all duration-200 border cursor-pointer ${
                isSelected
                  ? 'scale-[1.03] shadow-md ring-2 ring-offset-2 bg-white'
                  : 'hover:scale-[1.02] shadow-2xs hover:bg-white bg-white/70'
              }`}
              style={{
                borderColor: isSelected ? p.primary : 'rgba(0, 0, 0, 0.08)',
                minWidth: '82px',
                // @ts-ignore
                '--tw-ring-color': p.primary,
              }}
            >
              {/* Swatch dots */}
              <div className="flex items-center gap-1.5 mb-2">
                {p.swatches.map((color, idx) => (
                  <span
                    key={idx}
                    className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full shadow-2xs block border border-black/5"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Label */}
              <span
                className={`text-[12px] font-medium transition-colors ${
                  isSelected ? 'font-bold' : 'text-stone-600'
                }`}
                style={{
                  color: isSelected ? p.primaryDark : undefined,
                }}
              >
                {p.name}
              </span>
            </button>
          );
        })}

        {/* View all button at the end of scroll */}
        <button
          onClick={onOpenPaletteModal}
          className="flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-[22px] transition-all duration-200 border bg-white/60 hover:bg-white text-stone-600 shadow-2xs"
          style={{ minWidth: '78px' }}
        >
          <Sparkles className="w-5 h-5 mb-1.5 opacity-60" style={{ color: currentPalette.primary }} />
          <span className="text-[11px] font-semibold text-center leading-tight text-stone-600">
            Ver todas<br />as cores
          </span>
        </button>
      </div>
    </section>
  );
};
