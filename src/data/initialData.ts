import { BrideProfile, ChecklistItem, ExpenseItem, GuestItem, SupplierItem, WeddingSiteConfig } from '../types';

export const INITIAL_PROFILE: BrideProfile = {
  brideName: 'Manu',
  groomName: 'Lucas',
  weddingDate: '2027-05-15',
  weddingTime: '16:30',
  location: 'São Paulo, SP',
  venueAddress: '',
  venueGoogleMapsUrl: '',
  estimatedBudget: 55000,
  guestCount: 120,
  weddingStyle: 'Clássico Contemporâneo',
  notes: '',
};

export const INITIAL_GUESTS: GuestItem[] = [];

export const INITIAL_SITE_CONFIG: WeddingSiteConfig = {
  coverUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
  welcomeTitle: 'Seu site já começou',
  welcomeMessage: 'Criamos este espaço para compartilhar todos os detalhes do nosso grande dia!',
  completedTasks: ['Adicionar uma foto de capa', 'Preencher os dados da cerimônia e recepção'],
  currentStep: 1,
  pixKey: '',
};

// Start clean without any internet/mock data: the client adds all their own expenses!
export const INITIAL_EXPENSES: ExpenseItem[] = [];

// Start clean without any internet/mock data: the client adds all their own suppliers!
export const INITIAL_SUPPLIERS: SupplierItem[] = [];

// Start clean without any internet/mock data: the client adds all their own checklist items!
export const INITIAL_CHECKLIST: ChecklistItem[] = [];
