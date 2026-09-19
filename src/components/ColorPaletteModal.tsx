import React, { useState, useId } from 'react';
import {
  Palette,
  X,
  Check,
  Sparkles,
  Pipette,
  Sliders,
  RefreshCw,
  Search,
} from 'lucide-react';
import { ColorPalette } from '../types';
import { PALETTES, PALETTE_CATEGORIES } from '../data/palettes';
import { createPaletteFromHex } from '../utils/colorGenerator';

interface ColorPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPalette: ColorPalette;
  onSelectPalette: (palette: ColorPalette) => void;
}

// Quick spectrum dots for instant inspiration
const QUICK_SPECTRUM_HEXES = [
  { name: 'Sage Folhagem', hex: '#55765B' },
  { name: 'Oliva Imperial', hex: '#696B36' },
  { name: 'Menta Pastel', hex: '#4E9B8F' },
  { name: 'Esmeralda', hex: '#1C5D44' },
  { name: 'Azul Serenity', hex: '#6B9AC4' },
  { name: 'Azul Céu Claro', hex: '#87B0CD' },
  { name: 'Azul Tiffany', hex: '#0ABAB5' },
  { name: 'Azul Oceano', hex: '#38719C' },
  { name: 'Azul Petróleo', hex: '#1C4E68' },
  { name: 'Azul Marinho', hex: '#172745' },
  { name: 'Lavanda Francesa', hex: '#886BA6' },
  { name: 'Lilás Suave', hex: '#A395C8' },
  { name: 'Rosa Blush', hex: '#D67C8E' },
  { name: 'Rosa Rosewood', hex: '#933B56' },
  { name: 'Vinho Marsala', hex: '#7A2838' },
  { name: 'Bordô Veludo', hex: '#561329' },
  { name: 'Pêssego Fuzz', hex: '#F28C6E' },
  { name: 'Terracota Boho', hex: '#A34B2E' },
  { name: 'Cobre Queimado', hex: '#9E472A' },
  { name: 'Mostarda Âmbar', hex: '#C48B27' },
  { name: 'Caramelo Rústico', hex: '#894F27' },
  { name: 'Champagne Ouro', hex: '#8F7133' },
  { name: 'Areia Pérola', hex: '#A3937C' },
  { name: 'Prata Acetinada', hex: '#6B7280' },
];

export const ColorPaletteModal: React.FC<ColorPaletteModalProps> = ({
  isOpen,
  onClose,
  currentPalette,
  onSelectPalette,
}) => {
  const colorInputId = useId();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas as Cores');
  const [searchTerm, setSearchTerm] = useState('');

  // Custom Color Builder state
  const [customHex, setCustomHex] = useState(currentPalette.primary || '#55765B');
  const [customName, setCustomName] = useState('Meu Tom Personalizado');

  if (!isOpen) return null;

  const allPalettes = Object.values(PALETTES);

  const filteredPalettes = allPalettes.filter((p) => {
    const matchesCategory =
      selectedCategory === 'Todas as Cores' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleApplyCustomHex = (hexToApply: string, nameToApply?: string) => {
    const newPal = createPaletteFromHex(
      hexToApply,
      nameToApply || customName || 'Minha Cor Exclusiva',
      `Tonalidade única criada pela noiva (${hexToApply.toUpperCase()})`
    );
    onSelectPalette(newPal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-[32px] bg-white border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        style={{ borderColor: currentPalette.primary + '35' }}
      >
        {/* Top Header */}
        <div
          className="p-5 pb-4 border-b flex items-start justify-between shrink-0"
          style={{
            background: `linear-gradient(135deg, ${currentPalette.bgFrom} 0%, ${currentPalette.bgTo} 100%)`,
            borderColor: currentPalette.primary + '20',
          }}
        >
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Palette className="w-4 h-4" style={{ color: currentPalette.primary }} />
              <span
                className="text-[11px] font-bold tracking-[0.2em] uppercase"
                style={{ color: currentPalette.primaryDark }}
              >
                LEQUE DE CORES DO CASAMENTO
              </span>
            </div>
            <h3 className="font-serif-display text-2xl font-bold text-stone-900 leading-tight">
              Escolha a Paleta do Seu Dia
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Toque em qualquer cor ou escolha o tom exato para transformar o visual do app.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-600 flex items-center justify-center shadow-xs transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* SECTION 1: SELETOR LIVRE DE COR (CHOOSE EXACT COLOR / HEX) */}
          <div
            className="p-4 sm:p-5 rounded-[26px] border shadow-2xs"
            style={{
              backgroundColor: currentPalette.cardBg,
              borderColor: currentPalette.primary + '25',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Pipette className="w-4 h-4" style={{ color: currentPalette.primary }} />
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wide">
                  Escolher Cor Exata no Seletor
                </h4>
              </div>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                style={{
                  backgroundColor: currentPalette.badgeBg,
                  color: currentPalette.badgeText,
                }}
              >
                100% Personalizado
              </span>
            </div>

            {/* Custom Color Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Color Wheel input trigger */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative group shrink-0">
                  <input
                    id={colorInputId}
                    type="color"
                    value={customHex}
                    onChange={(e) => {
                      const newColor = e.target.value;
                      setCustomHex(newColor);
                      handleApplyCustomHex(newColor);
                    }}
                    className="w-14 h-14 rounded-2xl cursor-pointer border-2 border-white shadow-md p-0 overflow-hidden bg-transparent"
                  />
                  <label
                    htmlFor={colorInputId}
                    className="absolute inset-0 rounded-2xl flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 bg-black/20 text-white transition-opacity"
                  >
                    <Pipette className="w-5 h-5 drop-shadow-md" />
                  </label>
                </div>

                <div className="flex-1">
                  <label
                    htmlFor={colorInputId}
                    className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1 cursor-pointer"
                  >
                    Toque no círculo para abrir o seletor
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-stone-400">HEX:</span>
                    <input
                      type="text"
                      maxLength={7}
                      placeholder="#55765B"
                      value={customHex}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomHex(val);
                        if (/^#([0-9A-Fa-f]{6})$/.test(val)) {
                          handleApplyCustomHex(val);
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-xl border border-stone-200 text-xs font-mono font-bold text-stone-800 uppercase focus:outline-none focus:ring-2 focus:ring-stone-400 w-28 text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Instant Apply Button */}
              <button
                onClick={() => handleApplyCustomHex(customHex, customName)}
                className="w-full sm:w-auto sm:ml-auto px-4 py-2.5 rounded-2xl font-bold text-xs text-white shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98"
                style={{ backgroundColor: customHex }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Aplicar no App</span>
              </button>
            </div>

            {/* Quick Palette Rainbow Dot spectrum */}
            <div className="mt-4 pt-3 border-t border-stone-100">
              <span className="block text-[11px] font-medium text-stone-500 mb-2">
                Ou toque em um tom do espectro para experimentar:
              </span>
              <div className="flex flex-wrap gap-1.5 items-center">
                {QUICK_SPECTRUM_HEXES.map((item) => (
                  <button
                    key={item.hex}
                    title={item.name}
                    onClick={() => {
                      setCustomHex(item.hex);
                      setCustomName(item.name);
                      handleApplyCustomHex(item.hex, item.name);
                    }}
                    className="w-7 h-7 rounded-xl shadow-2xs border border-black/10 transition-transform hover:scale-115 active:scale-95 flex items-center justify-center relative"
                    style={{ backgroundColor: item.hex }}
                  >
                    {currentPalette.primary.toUpperCase() === item.hex.toUpperCase() && (
                      <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: LEQUE COMPLETO DE CASAMENTOS (CURATED PALETTES) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-sm font-bold text-stone-900">
                  Leque de Paletas Harmonizadas ({allPalettes.length})
                </h4>
                <p className="text-xs text-stone-500">
                  Combinações completas com fundos, botões e cartões prontos.
                </p>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
              {PALETTE_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all ${
                      isSelected
                        ? 'font-bold shadow-2xs'
                        : 'text-stone-600 bg-stone-100/80 hover:bg-stone-200/70'
                    }`}
                    style={{
                      backgroundColor: isSelected ? currentPalette.primaryLight : undefined,
                      color: isSelected ? currentPalette.primaryDark : undefined,
                      borderColor: isSelected ? currentPalette.primary + '40' : undefined,
                      borderWidth: isSelected ? 1 : 0,
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Grid of Curated Palettes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredPalettes.map((p) => {
                const isSelected = currentPalette.id === p.id;

                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectPalette(p)}
                    className={`p-3.5 rounded-[22px] border text-left transition-all duration-200 flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'shadow-md scale-[1.01] ring-2'
                        : 'bg-white hover:bg-stone-50/90 shadow-2xs border-stone-200'
                    }`}
                    style={{
                      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.98)' : undefined,
                      borderColor: isSelected ? p.primary : undefined,
                      // @ts-ignore
                      '--tw-ring-color': p.primary,
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: p.primary }}
                        />
                        <h5 className="font-serif-display text-sm font-bold text-stone-900 truncate">
                          {p.name}
                        </h5>
                      </div>
                      <p className="text-[11px] text-stone-500 truncate">{p.subtitle}</p>
                    </div>

                    {/* 3 harmonic swatches */}
                    <div className="flex items-center gap-1 shrink-0">
                      {p.swatches.map((color, idx) => (
                        <span
                          key={idx}
                          className="w-4 h-6 rounded-md shadow-2xs block border border-black/5"
                          style={{ backgroundColor: color }}
                        />
                      ))}

                      {isSelected && (
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center ml-1 text-white shadow-2xs shrink-0"
                          style={{ backgroundColor: p.buttonBg }}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div
          className="p-4 border-t flex items-center justify-between bg-stone-50 shrink-0"
          style={{ borderColor: currentPalette.primary + '20' }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full shadow-2xs border border-white"
              style={{ backgroundColor: currentPalette.primary }}
            />
            <span className="text-xs font-semibold text-stone-700">
              Cor ativa:{' '}
              <strong style={{ color: currentPalette.primaryDark }}>{currentPalette.name}</strong>
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-90"
            style={{ backgroundColor: currentPalette.buttonBg }}
          >
            Concluir Escolha
          </button>
        </div>
      </div>
    </div>
  );
};
