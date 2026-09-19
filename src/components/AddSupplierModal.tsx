import React, { useState, useEffect } from 'react';
import { X, Check, Building2, Sparkles, Phone, MessageCircle } from 'lucide-react';
import { ColorPalette, SupplierCategory, SupplierItem, SupplierStatus, SupplierSuggestionCatalog } from '../types';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  palette: ColorPalette;
  prefillRole?: string;
  prefillCategory?: SupplierCategory;
  prefillNotes?: string;
  catalogRoleId?: string;
  initialSuggestion?: SupplierSuggestionCatalog | null;
  onAddSupplier: (supplier: Omit<SupplierItem, 'id'>) => void;
}

const ALL_CATEGORIES: SupplierCategory[] = [
  'Barman & Open Bar',
  'Música / Banda / DJ',
  'Espaço de Casamento',
  'Buffet Gastronômico',
  'Bebidas Consignadas',
  'Fotógrafo / Cinegrafista',
  'Cabine de Fotos & 360°',
  'Decoração & Cenografia',
  'Vestido de Noiva / Atelier',
  'Traje do Noivo',
  'Beleza da Noiva (Cabelo/Make)',
  'Cerimonialista / Assessora',
  'Celebrante de Casamento',
  'Bolo & Doces Finos',
  'Convites & Papelaria',
  'Lembrancinhas',
  'Joias & Alianças',
  'Aluguel de Carro',
  'Segurança & Valet',
  'Infraestrutura & Outros',
];

export const AddSupplierModal: React.FC<AddSupplierModalProps> = ({
  isOpen,
  onClose,
  palette,
  prefillRole = '',
  prefillCategory = 'Barman & Open Bar',
  prefillNotes = '',
  catalogRoleId = '',
  initialSuggestion = null,
  onAddSupplier,
}) => {
  const effectiveRole = initialSuggestion ? initialSuggestion.role : prefillRole;
  const effectiveCategory = initialSuggestion ? initialSuggestion.category : prefillCategory;
  const effectiveNotes = initialSuggestion ? initialSuggestion.defaultNotes : prefillNotes;
  const effectiveCatalogId = initialSuggestion ? initialSuggestion.id : catalogRoleId;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<SupplierCategory>(effectiveCategory || 'Barman & Open Bar');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<SupplierStatus>('pesquisando');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [notes, setNotes] = useState('');

  // Reset or update when modal opens or prefill changes
  useEffect(() => {
    if (isOpen) {
      setName('');
      setCategory(effectiveCategory || 'Barman & Open Bar');
      setPrice('');
      setStatus('pesquisando');
      setPhone('');
      setInstagram('');
      setNotes(effectiveNotes || '');
    }
  }, [isOpen, effectiveRole, effectiveCategory, effectiveNotes]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddSupplier({
      name: name.trim(),
      category,
      price: parseFloat(price) || 0,
      status,
      phone: phone.trim(),
      instagram: instagram.trim(),
      notes: notes.trim(),
      isSuggested: false,
      isAdded: true,
      catalogRoleId: effectiveCatalogId || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-[32px] sm:rounded-[28px] p-5 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 relative animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center border"
              style={{
                backgroundColor: palette.primaryLight,
                borderColor: palette.primary + '30',
                color: palette.primary,
              }}
            >
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-display text-lg sm:text-xl font-bold text-stone-900">
                Cadastrar Fornecedor
              </h3>
              <p className="text-[11px] text-stone-500">
                {effectiveRole ? `Serviço sugerido: ${effectiveRole}` : 'Adicione à sua lista de fornecedores'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggestion banner if role provided */}
        {effectiveRole && (
          <div
            className="mt-3 p-2.5 rounded-xl border flex items-center gap-2 text-xs"
            style={{
              backgroundColor: palette.primaryLight + '50',
              borderColor: palette.primary + '30',
              color: palette.primaryDark,
            }}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: palette.primary }} />
            <span className="font-medium">
              Item do catálogo: <strong>{effectiveRole}</strong>
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
          {/* Supplier / Company Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Nome da Empresa ou Profissional *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Bartenders Imperial, DJ Alok, Buffet Requinte..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Categoria do Serviço *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SupplierCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 bg-white"
            >
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Price / Budget & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Valor Total (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Status de Negociação
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SupplierStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 bg-white font-medium"
              >
                <option value="pesquisando">🔍 Pesquisando</option>
                <option value="negociando">💬 Negociando</option>
                <option value="contratado">💍 Contratado</option>
                <option value="descartado">❌ Descartado</option>
              </select>
            </div>
          </div>

          {/* WhatsApp / Phone */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Telefone / WhatsApp para Orçamento
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2"
              />
            </div>
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Instagram ou Site (Opcional)
            </label>
            <input
              type="text"
              placeholder="@perfil.fornecedor ou link"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Anotações, O que está incluso &amp; Condições
            </label>
            <textarea
              rows={3}
              placeholder="Ex: 5 horas de festa, cardápio de 6 drinks, parcelamento em 4x sem juros..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 leading-relaxed"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs hover:opacity-95 active:scale-98 transition-all flex items-center gap-1.5"
              style={{ backgroundColor: palette.buttonBg }}
            >
              <Check className="w-4 h-4" />
              Salvar Fornecedor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
