import React, { useState, useEffect } from 'react';
import {
  BrideProfile,
  ChecklistItem,
  ColorPalette,
  ExpenseItem,
  GuestItem,
  GuestStatus,
  SupplierItem,
  SupplierStatus,
  UserAccess,
  UserAccount,
  WeddingSiteConfig,
} from './types';
import { PALETTES } from './data/palettes';
import { Header } from './components/Header';
import { CountdownHero } from './components/CountdownHero';
import { BudgetSummaryCard } from './components/BudgetSummaryCard';
import { SuppliersHomePreview } from './components/SuppliersHomePreview';
import { BudgetTab } from './components/BudgetTab';
import { SuppliersTab } from './components/SuppliersTab';
import { ChecklistTab } from './components/ChecklistTab';
import { AdminApprovalsTab } from './components/AdminApprovalsTab';
import { PlanningHubTab } from './components/PlanningHubTab';
import { GuestsTab } from './components/GuestsTab';
import { WeddingSiteTab } from './components/WeddingSiteTab';
import { MoreTab } from './components/MoreTab';
import { CalendarAgendaModal } from './components/CalendarAgendaModal';
import { BigDayTimelineModal } from './components/BigDayTimelineModal';
import { AccessNotificationToast } from './components/AccessNotificationToast';
import { BottomNav, TabType } from './components/BottomNav';
import { AccessModal } from './components/AccessModal';
import { ProfileModal } from './components/ProfileModal';
import { ColorPaletteModal } from './components/ColorPaletteModal';
import { AddSupplierModal } from './components/AddSupplierModal';
import { LoginPaymentScreen } from './components/LoginPaymentScreen';
import { InstallAppBanner } from './components/InstallAppBanner';
import { InstallAppModal } from './components/InstallAppModal';
import { WEDDING_CATALOG_SUGGESTIONS } from './data/weddingCatalog';
import { SupplierSuggestionCatalog } from './types';
import { mapSupplierCategoryToExpenseCategory } from './utils/helpers';
import { useAccessNotifications } from './hooks/useAccessNotifications';
import { fetchServerUsers, registerUserOnServer } from './services/api';
import {
  loadUserDataForEmail,
  saveUserExpenses,
  saveUserSuppliers,
  saveUserChecklist,
  saveUserProfile,
  saveUserPalette,
  saveUserGuests,
  saveUserSiteConfig,
  normalizeEmail,
} from './utils/userStorage';

const MASTER_EMAIL = 'familiacardoso21@gmail.com';

const getInitialAccess = (): UserAccess => {
  if (typeof window === 'undefined') {
    return {
      isUnlocked: false,
      accessCode: '',
      brideEmail: '',
      brideName: '',
      whatsappContact: '+55 11 97039-8752',
      paymentStatus: 'unpaid',
      role: 'user',
    };
  }
  const saved = localStorage.getItem('noiva_access');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed) {
        if (parsed.brideEmail === MASTER_EMAIL) {
          return {
            ...parsed,
            isUnlocked: true,
            role: 'admin',
          };
        }
        // Strict Check: User MUST be approved by Master in casamento_users
        const rawUsers = localStorage.getItem('casamento_users');
        if (rawUsers && parsed.brideEmail) {
          try {
            const usersList = JSON.parse(rawUsers);
            const foundUser = usersList.find((u: any) => u.email?.toLowerCase() === parsed.brideEmail?.toLowerCase());
            if (foundUser && foundUser.status !== 'approved') {
              return {
                ...parsed,
                isUnlocked: false,
              };
            }
          } catch (err) {
            console.error(err);
          }
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return {
    isUnlocked: false,
    accessCode: '',
    brideEmail: '',
    brideName: '',
    whatsappContact: '+55 11 97039-8752',
    paymentStatus: 'unpaid',
    role: 'user',
  };
};

export default function App() {
  // 1. User Access & Login State
  const [userAccess, setUserAccess] = useState<UserAccess>(getInitialAccess);
  const currentEmail = userAccess.brideEmail;
  const isAdmin = userAccess.role === 'admin' || userAccess.brideEmail === MASTER_EMAIL;

  // Real-time access notifications for Admin with audio chimes and quick approval
  const {
    pendingUsers,
    pendingCount,
    activeAlert,
    dismissAlert,
    approveUserQuick,
  } = useAccessNotifications(isAdmin);

  // Initial isolated user data for current email
  const initialUserData = loadUserDataForEmail(currentEmail, userAccess.brideName);

  // 2. Palette state (isolated per user)
  const [currentPalette, setCurrentPalette] = useState<ColorPalette>(initialUserData.palette);

  const handleSelectPalette = (newPalette: ColorPalette) => {
    setCurrentPalette(newPalette);
    saveUserPalette(userAccess.brideEmail, newPalette);
  };

  // 3. Navigation Tab state
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // 4. Bride Profile state (isolated per user)
  const [profile, setProfile] = useState<BrideProfile>(initialUserData.profile);

  const handleSaveProfile = (newProfile: BrideProfile) => {
    setProfile(newProfile);
    saveUserProfile(userAccess.brideEmail, newProfile);
  };

  // 5. Expenses & Budget state (isolated per user)
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialUserData.expenses);

  useEffect(() => {
    saveUserExpenses(userAccess.brideEmail, expenses);
  }, [expenses, userAccess.brideEmail]);

  const handleAddExpense = (newExp: Omit<ExpenseItem, 'id' | 'isActive'>) => {
    const item: ExpenseItem = {
      ...newExp,
      id: `exp-${Date.now()}`,
      isActive: true,
      isSuggested: false,
    };
    setExpenses((prev) => [item, ...prev]);
  };

  const handleUpdateExpenseStatus = (
    id: string,
    status: 'pago' | 'pendente' | 'parcial',
    paidAmount?: number
  ) => {
    setExpenses((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          return {
            ...e,
            status,
            paidAmount:
              status === 'pago'
                ? e.totalCost
                : status === 'pendente'
                ? 0
                : paidAmount ?? e.paidAmount,
          };
        }
        return e;
      })
    );
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // 6. Suppliers state (isolated per user)
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(initialUserData.suppliers);

  useEffect(() => {
    saveUserSuppliers(userAccess.brideEmail, suppliers);
  }, [suppliers, userAccess.brideEmail]);

  const handleAddSupplier = (newSup: Omit<SupplierItem, 'id' | 'notes'> & { notes?: string }) => {
    const item: SupplierItem = {
      ...newSup,
      id: `sup-${Date.now()}`,
      notes: newSup.notes || '',
    };
    setSuppliers((prev) => [item, ...prev]);

    // Also link to expenses automatically if price is specified
    if (newSup.price && newSup.price > 0) {
      const expExists = expenses.some((e) => e.supplierName === item.name);
      if (!expExists) {
        const expItem: ExpenseItem = {
          id: `exp-${Date.now()}`,
          title: item.name,
          category: mapSupplierCategoryToExpenseCategory(item.category),
          totalCost: item.price,
          paidAmount: item.status === 'contratado' ? item.price : 0,
          status: item.status === 'contratado' ? 'pago' : 'pendente',
          dueDate: '',
          supplierName: item.name,
          isActive: true,
          isSuggested: false,
        };
        setExpenses((prev) => [expItem, ...prev]);
      }
    }
  };

  const handleUpdateSupplierStatus = (id: string, status: SupplierStatus) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  // 7. Checklist state (isolated per user)
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialUserData.checklist);

  useEffect(() => {
    saveUserChecklist(userAccess.brideEmail, checklist);
  }, [checklist, userAccess.brideEmail]);

  const handleToggleChecklistDone = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isDone: !item.isDone } : item))
    );
  };

  const handleAddCustomChecklistItem = (newItem: Omit<ChecklistItem, 'id' | 'isAdded'>) => {
    const item: ChecklistItem = {
      ...newItem,
      id: `chk-${Date.now()}`,
      isAdded: true,
      isCustom: true,
    };
    setChecklist((prev) => [item, ...prev]);
  };

  const handleDeleteChecklistItem = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  // 8. Guests state (isolated per user)
  const [guests, setGuests] = useState<GuestItem[]>(initialUserData.guests);

  useEffect(() => {
    saveUserGuests(userAccess.brideEmail, guests);
  }, [guests, userAccess.brideEmail]);

  const handleAddGuest = (guest: Omit<GuestItem, 'id'>) => {
    const item: GuestItem = {
      ...guest,
      id: `guest-${Date.now()}`,
    };
    setGuests((prev) => [item, ...prev]);
  };

  const handleUpdateGuestStatus = (id: string, status: GuestStatus) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status } : g))
    );
  };

  const handleDeleteGuest = (id: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
  };

  // 9. Wedding Site Config state (isolated per user)
  const [siteConfig, setSiteConfig] = useState<WeddingSiteConfig>(initialUserData.siteConfig);

  useEffect(() => {
    saveUserSiteConfig(userAccess.brideEmail, siteConfig);
  }, [siteConfig, userAccess.brideEmail]);

  // Modals state
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPaletteModalOpen, setIsPaletteModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [isBigDayModalOpen, setIsBigDayModalOpen] = useState(false);

  // Quick Supplier Modal from Suggestions
  const [isHomeAddSupplierOpen, setIsHomeAddSupplierOpen] = useState(false);
  const [homeModalSug, setHomeModalSug] = useState<SupplierSuggestionCatalog | undefined>(undefined);

  const handleOpenHomeSupplierModal = (sug?: SupplierSuggestionCatalog) => {
    setHomeModalSug(sug);
    setIsHomeAddSupplierOpen(true);
  };

  // Synchronize server users and local storage on startup
  useEffect(() => {
    fetchServerUsers().then((serverList) => {
      // If there are existing local users not yet registered on server, sync them
      try {
        const localRaw = localStorage.getItem('casamento_users');
        if (localRaw) {
          const localList: UserAccount[] = JSON.parse(localRaw);
          if (Array.isArray(localList)) {
            localList.forEach((lu) => {
              if (lu && lu.email && !serverList.some((su) => su.email?.toLowerCase() === lu.email?.toLowerCase())) {
                registerUserOnServer(lu);
              }
            });
          }
        }
      } catch (err) {
        console.error('Error syncing local users to server:', err);
      }
    });
  }, []);

  const handleSuccessLogin = (account: {
    name: string;
    email: string;
    accessCode?: string;
    role?: 'admin' | 'user';
  }) => {
    const isMaster = account.email === MASTER_EMAIL || account.role === 'admin';
    const updated: UserAccess = {
      isUnlocked: true,
      accessCode: account.accessCode || (isMaster ? 'MASTER-ROOT' : 'PIX-9.99'),
      brideEmail: account.email,
      brideName: account.name || (isMaster ? 'Administrador Master' : 'Noiva VIP'),
      whatsappContact: '+55 11 97039-8752',
      paymentStatus: 'paid',
      paidAt: new Date().toISOString(),
      role: isMaster ? 'admin' : 'user',
    };
    setUserAccess(updated);
    localStorage.setItem('noiva_access', JSON.stringify(updated));

    // Instant switch to user's isolated data
    const userData = loadUserDataForEmail(account.email, account.name);
    setProfile(userData.profile);
    setExpenses(userData.expenses);
    setSuppliers(userData.suppliers);
    setChecklist(userData.checklist);
    setGuests(userData.guests);
    setSiteConfig(userData.siteConfig);
    setCurrentPalette(userData.palette);

    if (isMaster) {
      setActiveTab('admin');
    }
  };

  const handleUnlockWithCode = (code: string, email: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const isMaster = cleanEmail === MASTER_EMAIL || code.toUpperCase() === 'MASTER-ROOT';

    if (isMaster) {
      const updated: UserAccess = {
        isUnlocked: true,
        accessCode: 'MASTER-ROOT',
        brideEmail: MASTER_EMAIL,
        brideName: 'Administrador Master',
        whatsappContact: '+55 11 97039-8752',
        paymentStatus: 'paid',
        paidAt: new Date().toISOString(),
        role: 'admin',
      };
      setUserAccess(updated);
      localStorage.setItem('noiva_access', JSON.stringify(updated));
      const userData = loadUserDataForEmail(MASTER_EMAIL, 'Administrador Master');
      setProfile(userData.profile);
      setExpenses(userData.expenses);
      setSuppliers(userData.suppliers);
      setChecklist(userData.checklist);
      setGuests(userData.guests);
      setSiteConfig(userData.siteConfig);
      setCurrentPalette(userData.palette);
      setActiveTab('admin');
      return true;
    }

    const rawUsers = localStorage.getItem('casamento_users');
    const usersList: UserAccount[] = rawUsers ? JSON.parse(rawUsers) : [];
    const found = usersList.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!found || found.status !== 'approved') {
      return false;
    }

    const updated: UserAccess = {
      isUnlocked: true,
      accessCode: code,
      brideEmail: cleanEmail,
      brideName: found.name || profile.brideName || 'Noiva VIP',
      whatsappContact: '+55 11 97039-8752',
      paymentStatus: 'paid',
      paidAt: found.paidAt || new Date().toISOString(),
      role: 'user',
    };
    setUserAccess(updated);
    localStorage.setItem('noiva_access', JSON.stringify(updated));

    const userData = loadUserDataForEmail(cleanEmail, updated.brideName);
    setProfile(userData.profile);
    setExpenses(userData.expenses);
    setSuppliers(userData.suppliers);
    setChecklist(userData.checklist);
    setGuests(userData.guests);
    setSiteConfig(userData.siteConfig);
    setCurrentPalette(userData.palette);
    return true;
  };

  const handleLockApp = () => {
    const updated: UserAccess = {
      ...userAccess,
      isUnlocked: false,
      paymentStatus: 'unpaid',
    };
    setUserAccess(updated);
    localStorage.setItem('noiva_access', JSON.stringify(updated));
    setIsAccessModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('noiva_access');
    setUserAccess({
      isUnlocked: false,
      accessCode: '',
      brideEmail: '',
      brideName: '',
      whatsappContact: '+55 11 97039-8752',
      paymentStatus: 'unpaid',
      role: 'user',
    });
    setIsProfileModalOpen(false);
    setActiveTab('home');
  };

  // If user is not unlocked, show login/payment screen
  if (!userAccess.isUnlocked) {
    return (
      <div
        className="min-h-screen w-full max-w-full overflow-x-hidden overflow-y-auto flex flex-col justify-start sm:justify-center items-center py-6 px-3 relative font-sans-ui"
        style={{
          background: `linear-gradient(180deg, ${currentPalette.bgFrom} 0%, ${currentPalette.bgTo} 100%)`,
          minHeight: '100vh',
          maxWidth: '100vw',
        }}
      >
        <div className="w-full max-w-md mx-auto mb-2 flex justify-end px-2">
          <button
            type="button"
            onClick={() => setIsPaletteModalOpen(true)}
            className="text-[11px] font-semibold text-stone-600 bg-white/80 px-2.5 py-1 rounded-full border border-stone-200 shadow-2xs hover:bg-white"
          >
            Mudar Tema ({currentPalette.name})
          </button>
        </div>
        <LoginPaymentScreen
          palette={currentPalette}
          onSuccessLogin={handleSuccessLogin}
        />
        <ColorPaletteModal
          isOpen={isPaletteModalOpen}
          onClose={() => setIsPaletteModalOpen(false)}
          currentPalette={currentPalette}
          onSelectPalette={handleSelectPalette}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full max-w-full overflow-x-hidden transition-colors duration-500 font-sans-ui relative"
      style={{
        background: `linear-gradient(180deg, ${currentPalette.bgFrom} 0%, ${currentPalette.bgTo} 100%)`,
        minHeight: '100vh',
        maxWidth: '100vw',
      }}
    >
      {/* Real-time floating toast when an access request is received */}
      {activeAlert && isAdmin && (
        <AccessNotificationToast
          user={activeAlert}
          palette={currentPalette}
          onApprove={approveUserQuick}
          onOpenAdmin={() => {
            dismissAlert();
            setActiveTab('admin');
          }}
          onDismiss={dismissAlert}
        />
      )}

      {/* Mobile-sized container centered for perfect responsive display */}
      <div className="max-w-md w-full mx-auto min-h-screen relative flex flex-col justify-between overflow-x-hidden">
        <main className="flex-1 w-full max-w-full overflow-x-hidden pb-28">
          {/* Global Header */}
          <Header
            profile={profile}
            palette={currentPalette}
            userAccess={userAccess}
            pendingAccessCount={pendingCount}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenAccess={() => setIsAccessModalOpen(true)}
            onOpenPalette={() => setIsPaletteModalOpen(true)}
            onOpenInstall={() => setIsInstallModalOpen(true)}
            onLogout={handleLogout}
            onOpenAdmin={() => setActiveTab('admin')}
          />

          {/* PWA Mobile App Install Notification */}
          <InstallAppBanner palette={currentPalette} />

          {/* TAB 1: INÍCIO (Home Screen) */}
          {activeTab === 'home' && (
            <div className="w-full max-w-full overflow-x-hidden animate-in fade-in duration-300 pb-24">
              {/* Highlighted Countdown Hero Card */}
              <CountdownHero
                profile={profile}
                palette={currentPalette}
                onViewSchedule={() => setActiveTab('checklist')}
                onEditProfile={() => setIsProfileModalOpen(true)}
              />

              {/* Budget Overview Card */}
              <BudgetSummaryCard
                palette={currentPalette}
                expenses={expenses}
                onViewAllExpenses={() => setActiveTab('budget')}
                onAddNewExpense={() => setActiveTab('budget')}
              />

              {/* Suppliers Preview */}
              <SuppliersHomePreview
                palette={currentPalette}
                suppliers={suppliers}
                onViewAllSuppliers={() => setActiveTab('suppliers')}
                onAddNewSupplier={handleOpenHomeSupplierModal}
              />
            </div>
          )}

          {/* TAB 2: PLANEJAR (Planning Hub) */}
          {activeTab === 'plan' && (
            <div className="w-full max-w-full overflow-x-hidden animate-in fade-in duration-300">
              <PlanningHubTab
                profile={profile}
                palette={currentPalette}
                expenses={expenses}
                suppliers={suppliers}
                checklist={checklist}
                onSelectSection={(section) => {
                  if (section === 'checklist') setActiveTab('checklist');
                  else if (section === 'budget') setActiveTab('budget');
                  else if (section === 'suppliers') setActiveTab('suppliers');
                  else if (section === 'agenda') setIsAgendaModalOpen(true);
                  else if (section === 'bigday') setIsBigDayModalOpen(true);
                }}
              />
            </div>
          )}

          {/* TAB 3: CONVIDADOS (Guests Management) */}
          {activeTab === 'guests' && (
            <div className="w-full max-w-full overflow-x-hidden animate-in fade-in duration-300">
              <GuestsTab
                palette={currentPalette}
                guests={guests}
                onAddGuest={handleAddGuest}
                onUpdateGuestStatus={handleUpdateGuestStatus}
                onDeleteGuest={handleDeleteGuest}
                onOpenTablesModal={() => {}}
                onOpenRsvpModal={() => setActiveTab('site')}
                onOpenPixGiftsModal={() => setActiveTab('site')}
                onOpenHelp={() => {}}
              />
            </div>
          )}

          {/* TAB 4: SITE DOS NOIVOS */}
          {activeTab === 'site' && (
            <div className="w-full max-w-full overflow-x-hidden animate-in fade-in duration-300">
              <WeddingSiteTab
                profile={profile}
                palette={currentPalette}
                siteConfig={siteConfig}
                onUpdateSiteConfig={setSiteConfig}
                onOpenVisualEditor={() => {}}
                onOpenGiftRegistry={() => {}}
                onOpenHelp={() => {}}
              />
            </div>
          )}

          {/* TAB 5: MAIS (Options & Settings) */}
          {activeTab === 'more' && (
            <div className="w-full max-w-full overflow-x-hidden animate-in fade-in duration-300">
              <MoreTab
                profile={profile}
                palette={currentPalette}
                userAccess={userAccess}
                pendingAccessCount={pendingCount}
                onOpenProfile={() => setIsProfileModalOpen(true)}
                onOpenPalette={() => setIsPaletteModalOpen(true)}
                onSelectPaletteQuick={handleSelectPalette}
                onOpenTour={() => {}}
                onOpenAdmin={() => setActiveTab('admin')}
                onOpenExtraModal={() => {}}
                onLogout={handleLogout}
              />
            </div>
          )}

          {/* SUB-VIEW: FORNECEDORES COMPLETO */}
          {activeTab === 'suppliers' && (
            <div className="w-full max-w-full overflow-x-hidden animate-in fade-in duration-300">
              <SuppliersTab
                palette={currentPalette}
                suppliers={suppliers}
                onAddSupplier={handleAddSupplier}
                onUpdateSupplierStatus={handleUpdateSupplierStatus}
                onDeleteSupplier={handleDeleteSupplier}
              />
            </div>
          )}

          {/* SUB-VIEW: CONTAS / ORÇAMENTO COMPLETO */}
          {activeTab === 'budget' && (
            <div className="w-full max-w-full overflow-x-hidden animate-in fade-in duration-300">
              <BudgetTab
                palette={currentPalette}
                expenses={expenses}
                onAddExpense={handleAddExpense}
                onUpdateExpenseStatus={handleUpdateExpenseStatus}
                onDeleteExpense={handleDeleteExpense}
              />
            </div>
          )}

          {/* SUB-VIEW: CHECKLIST COMPLETO */}
          {activeTab === 'checklist' && (
            <div className="w-full max-w-full overflow-x-hidden animate-in fade-in duration-300">
              <ChecklistTab
                palette={currentPalette}
                items={checklist}
                onToggleItemDone={handleToggleChecklistDone}
                onAddCustomItem={handleAddCustomChecklistItem}
                onDeleteItem={handleDeleteChecklistItem}
              />
            </div>
          )}

          {/* APROVAÇÕES DE ACESSO (Admin Master Tab) */}
          {activeTab === 'admin' && (
            <div className="w-full max-w-full overflow-x-hidden animate-in fade-in duration-300 px-4 pt-2">
              <AdminApprovalsTab palette={currentPalette} />
            </div>
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          palette={currentPalette}
          isAdmin={isAdmin}
          pendingAccessCount={pendingCount}
        />

        {/* Access / WhatsApp Unlock Modal (R$ 9,99) */}
        <AccessModal
          isOpen={isAccessModalOpen}
          onClose={() => setIsAccessModalOpen(false)}
          palette={currentPalette}
          userAccess={userAccess}
          onUnlockWithCode={handleUnlockWithCode}
          onLockApp={handleLockApp}
        />

        {/* Bride Profile Edit Modal */}
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          profile={profile}
          palette={currentPalette}
          userEmail={userAccess.brideEmail}
          onSaveProfile={handleSaveProfile}
          onLogout={handleLogout}
        />

        {/* Huge Color Fan & Custom Color Picker Modal */}
        <ColorPaletteModal
          isOpen={isPaletteModalOpen}
          onClose={() => setIsPaletteModalOpen(false)}
          currentPalette={currentPalette}
          onSelectPalette={handleSelectPalette}
        />

        {/* Quick Add Supplier from Home Suggestions */}
        <AddSupplierModal
          isOpen={isHomeAddSupplierOpen}
          onClose={() => setIsHomeAddSupplierOpen(false)}
          palette={currentPalette}
          initialSuggestion={homeModalSug}
          onAddSupplier={handleAddSupplier}
        />

        {/* Install PWA Modal */}
        <InstallAppModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
          palette={currentPalette}
        />

        {/* Calendar & Deadlines Modal */}
        <CalendarAgendaModal
          isOpen={isAgendaModalOpen}
          onClose={() => setIsAgendaModalOpen(false)}
          palette={currentPalette}
          expenses={expenses}
        />

        {/* Big Day Timeline Cronograma Modal */}
        <BigDayTimelineModal
          isOpen={isBigDayModalOpen}
          onClose={() => setIsBigDayModalOpen(false)}
          palette={currentPalette}
        />
      </div>
    </div>
  );
}
