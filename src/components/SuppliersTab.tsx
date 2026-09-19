import React, { useState } from 'react';
import {
  Users,
  Plus,
  MessageCircle,
  Instagram,
  Check,
  Search,
  Sparkles,
  Building2,
  Trash2,
  ListFilter,
  CheckCircle2,
  Phone,
} from 'lucide-react';
import { ColorPalette, SupplierCategory, SupplierItem, SupplierStatus, SupplierSuggestionCatalog } from '../types';
import { WEDDING_CATALOG_SUGGESTIONS } from '../data/weddingCatalog';
import { formatCurrencyBRL, getWhatsAppUrl } from '../utils/helpers';
import { AddSupplierModal } from './AddSupplierModal';

interface SuppliersTabProps {
  palette: ColorPalette;
  suppliers: SupplierItem[];
  onAddSupplier: (supplier: Omit<SupplierItem, 'id'>) => void;
  onUpdateSupplierStatus: (id: string, status: SupplierStatus) => void;
  onDeleteSupplier: (id: string) => void;
}

const CATEGORY_GROUPS = [
  'Todos',
  'Bebidas & Bar',
  'Música & Festa',
  'Gastronomia & Buffet',
  'Espaço & Cerimônia',
  'Foto & Filme',
  'Decoração & Cenografia',
  'Trajes & Beleza',
  'Assessoria & Cerimonial',
  'Doces & Bolo',
  'Papelaria & Lembrancinhas',
  'Logística & Estrutura',
];

export const SuppliersTab: React.FC<SuppliersTabProps> = ({
  palette,
  suppliers,
  onAddSupplier,
  onUpdateSupplierStatus,
  onDeleteSupplier,
}) => {
  // Main view toggle: 'suggestions' or 'my-suppliers'
  const [activeView, setActiveView] = useState<'suggestions' | 'my-suppliers'>('suggestions');

  // Search and group filters for suggestions
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Todos');

  // Filter for my suppliers
  const [statusFilter, setStatusFilter] = useState<'all' | 'contratado' | 'negociando' | 'pesquisando'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<SupplierSuggestionCatalog | null>(null);

  const addedSuppliers = suppliers.filter((s) => s.isAdded);
  const contractedCount = addedSuppliers.filter((s) => s.status === 'contratado').length;
  const negotiatingCount = addedSuppliers.filter((s) => s.status === 'negociando').length;

  // Filtered suppliers
  const filteredMySuppliers = addedSuppliers.filter((s) => {
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  // Filtered suggestions
  const filteredSuggestions = WEDDING_CATALOG_SUGGESTIONS.filter((sug) => {
    const matchesGroup = selectedGroup === 'Todos' || sug.categoryGroup === selectedGroup;
    const matchesQuery =
      searchQuery.trim() === '' ||
      sug.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sug.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sug.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesQuery;
  });

  // Open modal from a specific suggestion
  const handleOpenFromSuggestion = (sug: SupplierSuggestionCatalog) => {
    setSelectedSuggestion(sug);
    setIsModalOpen(true);
  };

  // Open blank modal
  const handleOpenBlankModal = () => {
    setSelectedSuggestion(null);
    setIsModalOpen(true);
  };

  return (
    <div className="pb-24 pt-2 px-4 sm:px-6 w-full max-w-full overflow-x-hidden">
      {/* Top Header */}
      <div className="mb-4">
        <span
          className="text-[11px] font-bold tracking-[0.2em] uppercase"
          style={{ color: palette.primary }}
        >
          GUIA COMPLETO &amp; CONTRATOS
        </span>
        <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900">
          Fornecedores do Casamento
        </h2>
        <p className="text-xs text-stone-600 mt-0.5">
          Veja tudo o que realmente envolve um casamento. Escolha o que deseja ter e clique no <strong>+ (Maisinho)</strong> para cadastrar seus profissionais e valores.
        </p>
      </div>

      {/* Top Navigation Tabs: Sugestões (Tudo do Casamento) vs Meus Fornecedores */}
      <div className="flex items-center p-1 rounded-2xl bg-white border border-stone-200/80 shadow-2xs mb-4">
        <button
          onClick={() => setActiveView('suggestions')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeView === 'suggestions'
              ? 'font-bold shadow-2xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
          style={{
            backgroundColor: activeView === 'suggestions' ? palette.primaryLight : 'transparent',
            color: activeView === 'suggestions' ? palette.primaryDark : undefined,
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tudo do Casamento (38)</span>
        </button>

        <button
          onClick={() => setActiveView('my-suppliers')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeView === 'my-suppliers'
              ? 'font-bold shadow-2xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
          style={{
            backgroundColor: activeView === 'my-suppliers' ? palette.primaryLight : 'transparent',
            color: activeView === 'my-suppliers' ? palette.primaryDark : undefined,
          }}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Meus Cadastrados ({addedSuppliers.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: SUGESTÕES & TUDO QUE ENVOLVE UM CASAMENTO (38 ITENS) */}
      {/* ======================================================== */}
      {activeView === 'suggestions' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Quick Search & Explanation */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar serviço (ex: barman, DJ, fotógrafo, bolo...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:border-stone-400 shadow-2xs"
            />
          </div>

          {/* Category Group Filter Pills */}
          <div
            className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar overscroll-contain-x touch-pan-x"
            style={{ overscrollBehaviorX: 'contain', WebkitOverflowScrolling: 'touch' }}
          >
            {CATEGORY_GROUPS.map((group) => {
              const isSelected = selectedGroup === group;
              return (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                    isSelected ? 'font-bold shadow-2xs' : 'text-stone-600 bg-white border border-stone-200'
                  }`}
                  style={{
                    backgroundColor: isSelected ? palette.primaryLight : undefined,
                    color: isSelected ? palette.primaryDark : undefined,
                    borderColor: isSelected ? palette.primary + '40' : undefined,
                  }}
                >
                  {group}
                </button>
              );
            })}
          </div>

          {/* Instruction banner */}
          <div
            className="p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-colors"
            style={{
              backgroundColor: palette.cardBg,
              borderColor: palette.primary + '25',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">💡</span>
              <span className="text-stone-700 font-medium">
                Toque no botão <strong>+ (Maisinho)</strong> em qualquer serviço para cadastrar seu fornecedor!
              </span>
            </div>
            <button
              onClick={handleOpenBlankModal}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-white shrink-0 ml-2 shadow-2xs hover:opacity-90"
              style={{ backgroundColor: palette.buttonBg }}
            >
              + Outro Fornecedor
            </button>
          </div>

          {/* Suggestions List */}
          <div className="space-y-3">
            {filteredSuggestions.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-stone-100 text-stone-400 text-xs">
                Nenhum serviço encontrado para &quot;{searchQuery}&quot;.
              </div>
            ) : (
              filteredSuggestions.map((sug) => {
                // Check if the bride already registered any supplier for this role or category
                const matchesExisting = addedSuppliers.filter(
                  (s) => s.catalogRoleId === sug.id || s.category === sug.category
                );
                const isAlreadyRegistered = matchesExisting.length > 0;

                return (
                  <div
                    key={sug.id}
                    className="p-4 rounded-[22px] bg-white border shadow-2xs transition-all hover:shadow-xs relative"
                    style={{
                      borderColor: isAlreadyRegistered ? palette.primary + '50' : 'rgba(0,0,0,0.08)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                            style={{
                              backgroundColor:
                                sug.importance === 'Essencial'
                                  ? palette.primaryLight
                                  : sug.importance === 'Recomendado'
                                  ? '#FEF3C7'
                                  : '#F3F4F6',
                              color:
                                sug.importance === 'Essencial'
                                  ? palette.primaryDark
                                  : sug.importance === 'Recomendado'
                                  ? '#92400E'
                                  : '#4B5563',
                            }}
                          >
                            {sug.importance}
                          </span>
                          <span className="text-[11px] font-medium text-stone-500">
                            {sug.categoryGroup}
                          </span>
                        </div>

                        {/* Title of the Role */}
                        <h4 className="text-sm font-bold text-stone-900 leading-snug">
                          {sug.role}
                        </h4>

                        {/* Clear explanation of what this service involves in a wedding */}
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                          {sug.description}
                        </p>

                        {/* Status if already registered */}
                        {isAlreadyRegistered && (
                          <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              Cadastrado ({matchesExisting.length}):
                            </span>
                            {matchesExisting.map((s) => (
                              <span
                                key={s.id}
                                className="text-[11px] font-medium text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md"
                              >
                                {s.name} ({s.status})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Prominent (+) "Maisinho" Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenFromSuggestion(sug)}
                        className="shrink-0 w-10 h-10 sm:w-auto sm:px-3.5 sm:h-9 rounded-full flex items-center justify-center gap-1.5 text-white font-bold text-xs shadow-xs hover:scale-105 active:scale-95 transition-all"
                        style={{ backgroundColor: palette.buttonBg }}
                        title={`Cadastrar ${sug.role}`}
                      >
                        <Plus className="w-5 h-5 stroke-[2.5]" />
                        <span className="hidden sm:inline">Adicionar</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: MEUS FORNECEDORES CADASTRADOS */}
      {/* ======================================================== */}
      {activeView === 'my-suppliers' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Summary KPI Pills */}
          <div className="grid grid-cols-2 gap-2.5">
            <div
              className="p-3.5 rounded-2xl border bg-white flex items-center justify-between shadow-2xs"
              style={{ borderColor: palette.primary + '20' }}
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Contratados</span>
                <span
                  className="font-serif-display text-2xl font-bold"
                  style={{ color: palette.primaryDark }}
                >
                  {contractedCount}
                </span>
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: palette.primaryLight, color: palette.primary }}
              >
                <Check className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border bg-white flex items-center justify-between shadow-2xs border-amber-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-700 block">Em Negociação</span>
                <span className="font-serif-display text-2xl font-bold text-amber-900">
                  {negotiatingCount}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Action button: Add supplier from scratch */}
          <button
            onClick={handleOpenBlankModal}
            className="w-full py-3 px-4 rounded-2xl font-semibold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-98 hover:opacity-95"
            style={{ backgroundColor: palette.buttonBg }}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Cadastrar Novo Fornecedor</span>
          </button>

          {/* Filter Tabs */}
          {addedSuppliers.length > 0 && (
            <div
              className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-stone-200/80 overflow-x-auto no-scrollbar overscroll-contain-x touch-pan-x"
              style={{ overscrollBehaviorX: 'contain', WebkitOverflowScrolling: 'touch' }}
            >
              <button
                onClick={() => setStatusFilter('all')}
                className={`flex-1 min-w-[70px] py-1.5 rounded-xl text-xs font-medium transition-all ${
                  statusFilter === 'all' ? 'font-bold shadow-2xs' : 'text-stone-500'
                }`}
                style={{
                  backgroundColor: statusFilter === 'all' ? palette.primaryLight : 'transparent',
                  color: statusFilter === 'all' ? palette.primaryDark : undefined,
                }}
              >
                Todos ({addedSuppliers.length})
              </button>
              <button
                onClick={() => setStatusFilter('contratado')}
                className={`flex-1 min-w-[90px] py-1.5 rounded-xl text-xs font-medium transition-all ${
                  statusFilter === 'contratado' ? 'font-bold shadow-2xs' : 'text-stone-500'
                }`}
                style={{
                  backgroundColor: statusFilter === 'contratado' ? palette.badgeBg : 'transparent',
                  color: statusFilter === 'contratado' ? palette.badgeText : undefined,
                }}
              >
                Contratados ({contractedCount})
              </button>
              <button
                onClick={() => setStatusFilter('negociando')}
                className={`flex-1 min-w-[90px] py-1.5 rounded-xl text-xs font-medium transition-all ${
                  statusFilter === 'negociando' ? 'font-bold shadow-2xs' : 'text-stone-500'
                }`}
                style={{
                  backgroundColor: statusFilter === 'negociando' ? '#FEF3C7' : 'transparent',
                  color: statusFilter === 'negociando' ? '#92400E' : undefined,
                }}
              >
                Negociando ({negotiatingCount})
              </button>
            </div>
          )}

          {/* Added Suppliers Cards */}
          <div className="space-y-3">
            {addedSuppliers.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-stone-200/80 shadow-2xs">
                <div
                  className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3 border shadow-2xs"
                  style={{
                    backgroundColor: palette.primaryLight,
                    borderColor: palette.primary + '30',
                    color: palette.primary,
                  }}
                >
                  <Building2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-stone-900">
                  Nenhum fornecedor cadastrado ainda
                </h4>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Veja a aba de sugestões completas de casamento (Barman, DJ, Espaço...) e clique no <strong>+ (Maisinho)</strong> para adicionar!
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
                  <button
                    onClick={() => setActiveView('suggestions')}
                    className="py-2.5 px-5 rounded-full text-xs font-bold text-white inline-flex items-center justify-center gap-1.5 shadow-xs hover:opacity-95"
                    style={{ backgroundColor: palette.buttonBg }}
                  >
                    <Sparkles className="w-4 h-4" />
                    Ver Tudo que Envolve Casamento (38)
                  </button>
                  <button
                    onClick={handleOpenBlankModal}
                    className="py-2.5 px-5 rounded-full text-xs font-semibold border border-stone-300 text-stone-700 bg-white hover:bg-stone-50"
                  >
                    + Cadastrar Manualmente
                  </button>
                </div>
              </div>
            ) : filteredMySuppliers.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-stone-100 text-stone-400 text-xs">
                Nenhum fornecedor encontrado com este filtro.
              </div>
            ) : (
              filteredMySuppliers.map((sup) => (
                <div
                  key={sup.id}
                  className="p-4 rounded-[22px] bg-white border border-stone-200/80 shadow-2xs transition-all hover:shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-0.5">
                        {sup.category}
                      </span>
                      <h4 className="text-sm font-bold text-stone-900">{sup.name}</h4>
                      {sup.notes && <p className="text-xs text-stone-600 mt-1">{sup.notes}</p>}
                    </div>

                    {/* Status Dropdown */}
                    <select
                      value={sup.status}
                      onChange={(e) => onUpdateSupplierStatus(sup.id, e.target.value as SupplierStatus)}
                      className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-stone-200 bg-stone-50 focus:outline-none"
                    >
                      <option value="contratado">Contratado</option>
                      <option value="negociando">Negociando</option>
                      <option value="pesquisando">Pesquisando</option>
                      <option value="descartado">Descartado</option>
                    </select>
                  </div>

                  {/* Price & Contact links */}
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100">
                    <div className="text-xs">
                      <span className="text-[10px] text-stone-500 block">Valor acordado</span>
                      <span className="font-serif-display font-bold text-sm text-stone-800">
                        {formatCurrencyBRL(sup.price)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {sup.phone && (
                        <a
                          href={getWhatsAppUrl(
                            sup.phone,
                            `Olá! Gostaria de conversar sobre os preparativos do nosso casamento.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors"
                          title="Falar no WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      {sup.instagram && (
                        <a
                          href={`https://instagram.com/${sup.instagram.replace('@', '').replace('https://instagram.com/', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl bg-pink-50 text-pink-700 text-xs font-medium hover:bg-pink-100 transition-colors"
                          title="Instagram"
                        >
                          <Instagram className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <button
                        onClick={() => onDeleteSupplier(sup.id)}
                        className="p-1.5 text-stone-300 hover:text-rose-500 transition-colors"
                        title="Remover fornecedor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Unified Add Supplier Modal */}
      <AddSupplierModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSuggestion(null);
        }}
        palette={palette}
        prefillRole={selectedSuggestion?.role}
        prefillCategory={selectedSuggestion?.category}
        prefillNotes={selectedSuggestion?.defaultNotes}
        catalogRoleId={selectedSuggestion?.id}
        onAddSupplier={(newSup) => {
          onAddSupplier(newSup);
          // Also switch to 'my-suppliers' so the bride sees her newly added supplier right away!
          setActiveView('my-suppliers');
        }}
      />
    </div>
  );
};
