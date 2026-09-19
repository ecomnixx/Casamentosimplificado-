import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  UserPlus,
  RefreshCw,
  Mail,
  Calendar,
  DollarSign,
  Copy,
  Check,
  Phone,
  Trash2,
  Sparkles,
  Lock,
  Unlock,
} from 'lucide-react';
import { ColorPalette, UserAccount } from '../types';
import { broadcastUserEvent, subscribeToUserEvents } from '../utils/notifications';
import {
  fetchServerUsers,
  approveUserOnServer,
  rejectUserOnServer,
  deleteUserOnServer,
  registerUserOnServer,
  subscribeToRealtimeServer,
} from '../services/api';

interface AdminApprovalsTabProps {
  palette: ColorPalette;
}

export const AdminApprovalsTab: React.FC<AdminApprovalsTabProps> = ({ palette }) => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);

  // Manual Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  // Load from server & cache in localStorage
  const loadUsers = async () => {
    try {
      const list = await fetchServerUsers();
      if (Array.isArray(list)) {
        const mapped = list.map((u) => ({
          ...u,
          status: u.status || (u.email === 'familiacardoso21@gmail.com' ? 'approved' : 'pending'),
          role: u.email === 'familiacardoso21@gmail.com' ? 'admin' : (u.role || 'user'),
        }));
        setUsers(mapped);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadUsers();

    // 1. Subscribe to real-time Server-Sent Events from the server
    const unsubscribeSse = subscribeToRealtimeServer(() => {
      loadUsers();
    });

    // 2. Listen to storage events from other tabs or actions
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'casamento_users') {
        loadUsers();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    const unsubscribeLocal = subscribeToUserEvents(() => loadUsers());
    const interval = setInterval(loadUsers, 2500);

    return () => {
      unsubscribeSse();
      window.removeEventListener('storage', handleStorageChange);
      unsubscribeLocal();
      clearInterval(interval);
    };
  }, []);

  const saveUsers = (updated: UserAccount[]) => {
    setUsers(updated);
    localStorage.setItem('casamento_users', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('casamento_users_updated'));
  };

  const handleApprove = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    // Optimistic local update
    const updated = users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          status: 'approved' as const,
          paidAt: u.paidAt || new Date().toISOString(),
        };
      }
      return u;
    });
    saveUsers(updated);
    broadcastUserEvent('user_approved', user || { id: userId });

    // Server-side approval broadcast
    await approveUserOnServer(userId, user?.email);
    showFeedback(`Acesso liberado com sucesso para ${user?.name || 'a noiva'}!`);
  };

  const handleReject = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    const updated = users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          status: 'rejected' as const,
        };
      }
      return u;
    });
    saveUsers(updated);

    // Server-side rejection broadcast
    await rejectUserOnServer(userId, user?.email);
    showFeedback('Acesso suspenso ou recusado.');
  };

  const handleDeleteClick = (user: UserAccount) => {
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    const targetId = userToDelete.id;
    const targetEmail = userToDelete.email.trim().toLowerCase();

    // 1. Remove from active users list
    const updated = users.filter(
      (u) => u.id !== targetId && u.email.trim().toLowerCase() !== targetEmail
    );
    saveUsers(updated);

    // 2. Clean up any auxiliary localStorage keys associated with this user
    try {
      localStorage.removeItem(`casamento_user_data_${targetEmail}`);
      const activeRaw = localStorage.getItem('noiva_access');
      if (activeRaw) {
        const active = JSON.parse(activeRaw);
        if (active.brideEmail?.trim().toLowerCase() === targetEmail) {
          localStorage.removeItem('noiva_access');
        }
      }
    } catch (e) {
      console.error('Erro ao limpar dados locais do usuário:', e);
    }

    // 3. Delete from server
    await deleteUserOnServer(targetId, targetEmail);

    showFeedback(`Contato de ${userToDelete.name} excluído definitivamente.`);
    setUserToDelete(null);
  };

  const handleCreateManualUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    const newAcc: UserAccount = {
      id: 'user_' + Date.now(),
      name: newName.trim() || 'Noiva',
      email: newEmail.trim().toLowerCase(),
      phone: newPhone.trim() || undefined,
      password: newPassword.trim() || '123456',
      status: 'approved',
      role: 'user',
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
      paymentMethod: 'manual',
      amountPaid: 9.99,
    };

    const updated = [newAcc, ...users];
    saveUsers(updated);
    await registerUserOnServer(newAcc);

    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewPassword('');
    setShowAddModal(false);
    showFeedback(`Cliente ${newAcc.name} cadastrada e com acesso liberado!`);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered List
  const filteredUsers = users.filter((u) => {
    // Search matches name or email
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'all') return true;
    return u.status === filterStatus;
  });

  const pendingCount = users.filter((u) => u.status === 'pending').length;
  const approvedCount = users.filter((u) => u.status === 'approved').length;
  const rejectedCount = users.filter((u) => u.status === 'rejected').length;

  return (
    <div className="space-y-4 pb-16">
      {/* Admin Header Banner */}
      <div
        className="p-4 rounded-3xl border shadow-xs"
        style={{
          backgroundColor: palette.cardBg,
          borderColor: palette.primary + '35',
        }}
      >
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center border shadow-2xs shrink-0"
            style={{
              backgroundColor: palette.primaryLight,
              borderColor: palette.primary + '40',
              color: palette.primaryDark,
            }}
          >
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200 font-bold">
                ADMINISTRADOR MASTER
              </span>
              <span className="text-xs text-stone-500 font-medium truncate">Painel de Gestão</span>
            </div>
            <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-stone-900 mt-0.5">
              Gerenciar Acessos &amp; Noivas
            </h2>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Desbloqueie acessos, aprove comprovantes e gerencie cadastros de noivas com facilidade.
            </p>
          </div>
        </div>
      </div>

      {/* Dedicated Primary Action: Adicionar Cliente / Liberar Acesso */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center border shrink-0"
            style={{
              backgroundColor: palette.primaryLight,
              borderColor: palette.primary + '30',
              color: palette.primary,
            }}
          >
            <UserPlus className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-stone-900">Adicionar Cliente Manualmente</div>
            <div className="text-[11px] text-stone-500">
              Cadastre o e-mail da noiva para liberar o acesso imediatamente sem cobrar Pix
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs flex items-center justify-center gap-1.5 hover:opacity-95 active:scale-[0.99] transition-all shrink-0"
          style={{ backgroundColor: palette.buttonBg }}
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Adicionar Cliente (Liberar Acesso)</span>
        </button>
      </div>

      {/* Action Feedback Toast */}
      {actionFeedback && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-amber-900 font-semibold">Pendentes</div>
            <div className="text-xl font-bold text-amber-950">{pendingCount}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-emerald-900 font-semibold">Liberados</div>
            <div className="text-xl font-bold text-emerald-950">{approvedCount}</div>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-stone-600 font-semibold">Total Arrecadado</div>
            <div className="text-xl font-bold text-stone-900">
              R$ {(approvedCount * 9.99).toFixed(2).replace('.', ',')}
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between pt-1">
        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none focus:ring-2"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterStatus === 'all'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Todos ({users.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterStatus === 'pending'
                ? 'bg-amber-50 text-amber-900 shadow-2xs font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Aguardando ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterStatus === 'approved'
                ? 'bg-emerald-50 text-emerald-900 shadow-2xs font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Aprovados ({approvedCount})
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterStatus === 'rejected'
                ? 'bg-rose-50 text-rose-900 shadow-2xs font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Bloqueados ({rejectedCount})
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center space-y-2">
            <Clock className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-sm font-semibold text-stone-700">Nenhum cadastro encontrado</p>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Quando noivos realizarem o cadastro ou efetuarem o Pix de R$ 9,99, eles aparecerão aqui para sua aprovação.
            </p>
          </div>
        ) : (
          filteredUsers.map((u) => {
            const isMaster = u.email === 'familiacardoso21@gmail.com';
            const isApproved = u.status === 'approved';
            const isPending = u.status === 'pending';
            const isBlocked = u.status === 'rejected';

            return (
              <div
                key={u.id}
                className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-stone-300"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-stone-900">{u.name}</span>
                    {isMaster ? (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                        MASTER
                      </span>
                    ) : isApproved ? (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Acesso Liberado
                      </span>
                    ) : isPending ? (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Aguardando Aprovação
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                        <Lock className="w-3 h-3 text-rose-600" />
                        Acesso Bloqueado
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-stone-600 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-stone-400" />
                      <span>{u.email}</span>
                      <button
                        onClick={() => handleCopy(u.email, `mail-${u.id}`)}
                        className="text-stone-400 hover:text-stone-700 ml-0.5"
                        title="Copiar e-mail"
                      >
                        {copiedId === `mail-${u.id}` ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {u.phone && (
                      <div className="flex items-center gap-1 text-emerald-700">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{u.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-stone-400" />
                      <span>R$ 9,99 ({u.paymentMethod === 'manual' ? 'Manual' : 'Pix'})</span>
                    </div>

                    {u.createdAt && (
                      <div className="flex items-center gap-1 text-[11px] text-stone-500">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>{new Date(u.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {!isMaster && (
                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 w-full sm:w-auto">
                    {/* Botão de Desbloquear (para usuários pendentes ou bloqueados) */}
                    {(isPending || isBlocked) && (
                      <button
                        type="button"
                        onClick={() => handleApprove(u.id)}
                        className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-98"
                        title="Desbloquear e liberar acesso da pessoa"
                      >
                        <Unlock className="w-4 h-4 stroke-[2.5]" />
                        <span>Desbloquear</span>
                      </button>
                    )}

                    {/* Botão de Bloquear (para usuários atualmente liberados) */}
                    {isApproved && (
                      <button
                        type="button"
                        onClick={() => handleReject(u.id)}
                        className="py-1.5 px-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1 transition-all"
                        title="Bloquear acesso temporariamente"
                      >
                        <Lock className="w-3.5 h-3.5 text-stone-400" />
                        <span>Bloquear</span>
                      </button>
                    )}

                    {/* Botão Lixeirinha: Exclui o contato definitivamente para não aparecer mais */}
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(u)}
                      className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all shrink-0"
                      title="Excluir contato definitivamente (não aparecerá mais)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Manual Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2 border border-emerald-200">
                <UserPlus className="w-6 h-6" />
              </div>
              <h3 className="font-serif-display text-xl font-bold text-stone-900">
                Adicionar Cliente &amp; Liberar Acesso
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Cadastre a noiva para que ela acesse instantaneamente sem precisar pagar Pix.
              </p>
            </div>

            <form onSubmit={handleCreateManualUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome da Noiva / Cliente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Larissa Mendes"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  E-mail de Acesso *
                </label>
                <input
                  type="email"
                  required
                  placeholder="noiva@exemplo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  WhatsApp / Celular (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Senha Provisória (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Padrão: 123456"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-mono focus:outline-none focus:ring-2"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-xs flex items-center justify-center gap-1.5 hover:opacity-95 transition-all"
                  style={{ backgroundColor: palette.buttonBg }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cadastrar e Liberar Acesso Imediato</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full py-2 text-xs font-semibold text-stone-500 hover:text-stone-700"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Contact Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-stone-200 text-center space-y-4">
            <div className="w-13 h-13 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center border border-rose-200">
              <Trash2 className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif-display text-xl font-bold text-stone-900">
                Excluir Cadastro do Contato?
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Deseja realmente remover o contato de <strong className="text-stone-900">{userToDelete.name}</strong> ({userToDelete.email})?
              </p>
              <p className="text-[11px] text-rose-600 font-semibold pt-1">
                Ao excluir, o contato será removido da base de dados e não aparecerá mais nesta lista.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-98"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Excluir Definitivamente</span>
              </button>

              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="w-full py-2 text-xs font-semibold text-stone-500 hover:text-stone-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
