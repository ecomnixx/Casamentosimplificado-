import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  Clock,
  UserX,
  HelpCircle,
  Plus,
  Table,
  MessageCircle,
  QrCode,
  Search,
  Trash2,
  Phone,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { ColorPalette, GuestGroup, GuestItem, GuestStatus } from '../types';

interface GuestsTabProps {
  palette: ColorPalette;
  guests: GuestItem[];
  onAddGuest: (guest: Omit<GuestItem, 'id'>) => void;
  onUpdateGuestStatus: (id: string, status: GuestStatus) => void;
  onDeleteGuest: (id: string) => void;
  onOpenTablesModal: () => void;
  onOpenRsvpModal: () => void;
  onOpenPixGiftsModal: () => void;
  onOpenHelp: () => void;
}

export const GuestsTab: React.FC<GuestsTabProps> = ({
  palette,
  guests,
  onAddGuest,
  onUpdateGuestStatus,
  onDeleteGuest,
  onOpenTablesModal,
  onOpenRsvpModal,
  onOpenPixGiftsModal,
  onOpenHelp,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState<GuestGroup>('Família Noiva');
  const [newStatus, setNewStatus] = useState<GuestStatus>('pendente');
  const [newCompanions, setNewCompanions] = useState(1);
  const [newTable, setNewTable] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Stats calculation
  const totalGuests = guests.reduce((acc, g) => acc + (g.companionsCount || 1), 0);
  const confirmedCount = guests
    .filter((g) => g.status === 'confirmado')
    .reduce((acc, g) => acc + (g.companionsCount || 1), 0);
  const pendingCount = guests
    .filter((g) => g.status === 'pendente')
    .reduce((acc, g) => acc + (g.companionsCount || 1), 0);
  const declinedCount = guests
    .filter((g) => g.status === 'recusou')
    .reduce((acc, g) => acc + (g.companionsCount || 1), 0);
  const maybeCount = guests
    .filter((g) => g.status === 'talvez')
    .reduce((acc, g) => acc + (g.companionsCount || 1), 0);

  // Filtered guests
  const filteredGuests = guests.filter((g) => {
    if (filterStatus === 'Pendentes' && g.status !== 'pendente') return false;
    if (filterStatus === 'Confirmados' && g.status !== 'confirmado') return false;
    if (filterStatus === 'Recusados' && g.status !== 'recusou') return false;
    if (filterStatus === 'Parcial' && g.companionsCount <= 1) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        g.name.toLowerCase().includes(q) ||
        g.group.toLowerCase().includes(q) ||
        (g.phone && g.phone.includes(q))
      );
    }
    return true;
  });

  const handleSaveNewGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddGuest({
      name: newName.trim(),
      group: newGroup,
      status: newStatus,
      companionsCount: Math.max(1, Number(newCompanions) || 1),
      tableNumber: newTable.trim() || undefined,
      phone: newPhone.trim() || undefined,
      notes: newNotes.trim() || undefined,
    });

    // Reset
    setNewName('');
    setNewCompanions(1);
    setNewTable('');
    setNewPhone('');
    setNewNotes('');
    setIsAddModalOpen(false);
  };

  return (
    <div
      id="guests-screen-container"
      className="w-full max-w-full overflow-x-hidden px-4 pt-5 pb-28 space-y-4 animate-in fade-in duration-300 relative"
    >
      {/* Header (Exact text matching Screenshot 5) */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <div>
          <h1
            id="guests-title"
            className="text-2xl font-bold tracking-tight text-stone-900"
            style={{ color: palette.primaryDark }}
          >
            Seus convidados
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Famílias e confirmações em um só lugar.
          </p>
        </div>

        <button
          id="btn-guests-help"
          onClick={onOpenHelp}
          className="w-9 h-9 rounded-full bg-white/80 border border-stone-200 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors shadow-2xs"
          title="Ajuda sobre convidados"
        >
          <HelpCircle className="w-5 h-5 text-stone-500" />
        </button>
      </div>

      {/* Top Green Summary Card (Matching Screenshot 5) */}
      <div
        id="guests-summary-card"
        className="rounded-3xl p-5 text-white shadow-md relative overflow-hidden"
        style={{
          backgroundColor: '#284B35',
          backgroundImage: `radial-gradient(circle at 80% 20%, #315C42 0%, #203E2C 100%)`,
        }}
      >
        <div className="text-3xl font-bold font-serif tracking-tight mb-3.5">
          {totalGuests} convidados
        </div>

        <div className="grid grid-cols-4 gap-1 border-t border-white/15 pt-3 text-center">
          <div>
            <span className="text-lg font-bold block">{confirmedCount}</span>
            <span className="text-[10px] text-stone-200 font-medium opacity-85">
              Confirmados
            </span>
          </div>
          <div>
            <span className="text-lg font-bold block">{pendingCount}</span>
            <span className="text-[10px] text-stone-200 font-medium opacity-85">
              Pendentes
            </span>
          </div>
          <div>
            <span className="text-lg font-bold block">{declinedCount}</span>
            <span className="text-[10px] text-stone-200 font-medium opacity-85">
              Recusaram
            </span>
          </div>
          <div>
            <span className="text-lg font-bold block">{maybeCount}</span>
            <span className="text-[10px] text-stone-200 font-medium opacity-85">
              Talvez
            </span>
          </div>
        </div>
      </div>

      {/* ORGANIZAR Section with 3 Quick Cards (Matching Screenshot 5) */}
      <div id="organize-section" className="pt-1">
        <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-stone-400 mb-2 px-0.5">
          ORGANIZAR
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {/* Card 1: Mesas */}
          <button
            id="btn-organize-tables"
            onClick={onOpenTablesModal}
            className="bg-white rounded-2xl p-3 border border-stone-100 shadow-xs flex flex-col items-center text-center hover:border-stone-200 transition-all active:scale-95"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-1.5"
              style={{ backgroundColor: '#EBF2ED' }}
            >
              <Table className="w-5 h-5 text-[#284B35]" />
            </div>
            <span className="text-xs font-semibold text-stone-800">Mesas</span>
            <span className="text-[10px] text-stone-400">Organizar</span>
          </button>

          {/* Card 2: Enviar confirmação (WhatsApp) */}
          <button
            id="btn-organize-whatsapp"
            onClick={onOpenRsvpModal}
            className="bg-white rounded-2xl p-3 border border-stone-100 shadow-xs flex flex-col items-center text-center hover:border-stone-200 transition-all active:scale-95"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-1.5"
              style={{ backgroundColor: '#EBF2ED' }}
            >
              <MessageCircle className="w-5 h-5 text-[#284B35]" />
            </div>
            <span className="text-xs font-semibold text-stone-800 truncate max-w-full">
              Enviar RSVP
            </span>
            <span className="text-[10px] text-stone-400">WhatsApp</span>
          </button>

          {/* Card 3: Presentes no Pix */}
          <button
            id="btn-organize-pix"
            onClick={onOpenPixGiftsModal}
            className="bg-white rounded-2xl p-3 border border-stone-100 shadow-xs flex flex-col items-center text-center hover:border-stone-200 transition-all active:scale-95"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-1.5"
              style={{ backgroundColor: '#EBF2ED' }}
            >
              <QrCode className="w-5 h-5 text-[#284B35]" />
            </div>
            <span className="text-xs font-semibold text-stone-800 truncate max-w-full">
              Presentes Pix
            </span>
            <span className="text-[10px] text-stone-400">Chave e cotas</span>
          </button>
        </div>
      </div>

      {/* Filter Bar & Chips (Matching Screenshot 5) */}
      <div id="guests-filters-section" className="pt-2">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-stone-400">
            FAMÍLIAS E GRUPOS
          </h2>
          <span className="text-xs text-stone-400 font-medium">
            {filteredGuests.length} listados
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar overscroll-contain-x">
          {['Todos', 'Pendentes', 'Parcial', 'Confirmados', 'Recusados'].map((status) => (
            <button
              key={status}
              id={`filter-guest-${status.toLowerCase()}`}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Guest List / Empty State (Matching Screenshot 5) */}
      {guests.length === 0 ? (
        <div
          id="guests-empty-state"
          className="bg-white rounded-3xl p-8 border border-stone-100 shadow-xs text-center flex flex-col items-center my-4"
        >
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
            <Users className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="text-sm font-bold text-stone-800">
            Nenhum convidado cadastrado
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-[240px]">
            Comece pelos núcleos familiares.
          </p>
          <button
            id="btn-add-first-guest"
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#284B35' }}
          >
            Adicionar primeiro
          </button>
        </div>
      ) : filteredGuests.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-center text-stone-500 text-xs border border-stone-100">
          Nenhum convidado encontrado para este filtro.
        </div>
      ) : (
        <div className="space-y-2 pt-1">
          {filteredGuests.map((guest) => {
            const isConfirmed = guest.status === 'confirmado';
            const isPending = guest.status === 'pendente';
            const isDeclined = guest.status === 'recusou';

            return (
              <div
                key={guest.id}
                id={`guest-card-${guest.id}`}
                className="bg-white rounded-2xl p-3.5 border border-stone-100 shadow-xs flex items-center justify-between gap-3 hover:border-stone-200 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-stone-900 truncate">
                      {guest.name}
                    </h4>
                    {guest.companionsCount > 1 && (
                      <span className="text-[10px] bg-stone-100 text-stone-600 font-semibold px-1.5 py-0.5 rounded-md shrink-0">
                        +{guest.companionsCount - 1} pessoa{guest.companionsCount > 2 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500 flex-wrap">
                    <span className="text-stone-600 font-medium">{guest.group}</span>
                    {guest.tableNumber && (
                      <>
                        <span>•</span>
                        <span>Mesa {guest.tableNumber}</span>
                      </>
                    )}
                    {guest.phone && (
                      <>
                        <span>•</span>
                        <a
                          href={`https://wa.me/${guest.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#284B35] font-medium hover:underline inline-flex items-center gap-0.5"
                        >
                          <Phone className="w-2.5 h-2.5" />
                          {guest.phone}
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Status Toggle Button */}
                  <button
                    onClick={() => {
                      const nextStatus: Record<GuestStatus, GuestStatus> = {
                        pendente: 'confirmado',
                        confirmado: 'recusou',
                        recusou: 'talvez',
                        talvez: 'pendente',
                      };
                      onUpdateGuestStatus(guest.id, nextStatus[guest.status]);
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                      isConfirmed
                        ? 'bg-emerald-100 text-emerald-800'
                        : isPending
                        ? 'bg-amber-100 text-amber-800'
                        : isDeclined
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                    title="Clique para alternar status"
                  >
                    {guest.status === 'confirmado'
                      ? 'Confirmado'
                      : guest.status === 'pendente'
                      ? 'Pendente'
                      : guest.status === 'recusou'
                      ? 'Recusou'
                      : 'Talvez'}
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => onDeleteGuest(guest.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Excluir convidado"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button (+) */}
      <button
        id="btn-fab-add-guest"
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-20 right-5 z-30 w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        style={{ backgroundColor: '#284B35' }}
        title="Adicionar convidado ou família"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal: Adicionar Convidado */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">Adicionar Convidado</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewGuest} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome do convidado ou família *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Família Silva ou Ana Souza"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-[#284B35]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Grupo / Núcleo
                  </label>
                  <select
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.target.value as GuestGroup)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-hidden"
                  >
                    <option value="Família Noiva">Família Noiva</option>
                    <option value="Família Noivo">Família Noivo</option>
                    <option value="Padrinhos">Padrinhos</option>
                    <option value="Amigos">Amigos</option>
                    <option value="Trabalho">Trabalho</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Qtd. pessoas (total)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={newCompanions}
                    onChange={(e) => setNewCompanions(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Status inicial
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as GuestStatus)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-hidden"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="recusou">Recusou</option>
                    <option value="talvez">Talvez</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Mesa (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 04"
                    value={newTable}
                    onChange={(e) => setNewTable(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  WhatsApp / Telefone (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 11988887777"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white shadow-xs hover:opacity-90"
                  style={{ backgroundColor: '#284B35' }}
                >
                  Salvar Convidado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
