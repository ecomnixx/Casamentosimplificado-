export type PaletteId = string;

export interface ColorPalette {
  id: PaletteId;
  name: string;
  subtitle: string;
  category?: string;
  swatches: [string, string, string]; // 3 representative colors
  primary: string; // main accent color (e.g., #5E7760)
  primaryDark: string; // for high-contrast text
  primaryLight: string; // for subtle highlights
  accent: string; // gold/champagne complementary
  bgFrom: string;
  bgTo: string;
  cardBg: string;
  badgeBg: string;
  badgeText: string;
  buttonBg: string;
  buttonText: string;
  highlightText: string;
  isCustom?: boolean;
}

export interface BrideProfile {
  brideName: string;
  groomName: string;
  weddingDate: string; // YYYY-MM-DD
  weddingTime: string;
  location: string;
  venueAddress?: string; // Literal full street address verified
  venueGoogleMapsUrl?: string; // Direct link to Google Maps
  venueLatitude?: number;
  venueLongitude?: number;
  estimatedBudget: number;
  guestCount?: number;
  weddingStyle?: string;
  notes: string;
}

export type ExpenseCategory =
  | 'Espaço & Cerimônia'
  | 'Buffet & Bebidas'
  | 'Fotografia & Vídeo'
  | 'Decoração & Flores'
  | 'Vestido & Beleza'
  | 'Música & Banda/DJ'
  | 'Doces & Bolo'
  | 'Convites & Lembranças'
  | 'Assessoria & Cerimonial'
  | 'Outros';

export interface ExpenseItem {
  id: string;
  title: string;
  category: ExpenseCategory;
  totalCost: number;
  paidAmount: number;
  dueDate: string;
  status: 'pago' | 'pendente' | 'parcial';
  supplierName?: string;
  notes?: string;
  isSuggested?: boolean;
  isActive: boolean; // active in bride's budget
}

export type SupplierCategory =
  | 'Espaço de Casamento'
  | 'Buffet Gastronômico'
  | 'Barman & Open Bar'
  | 'Fotógrafo / Cinegrafista'
  | 'Vestido de Noiva / Atelier'
  | 'Decoração & Cenografia'
  | 'Música / Banda / DJ'
  | 'Cerimonialista / Assessora'
  | 'Beleza da Noiva (Cabelo/Make)'
  | 'Bolo & Doces Finos'
  | 'Convites & Papelaria'
  | 'Lembrancinhas'
  | 'Aluguel de Carro'
  | 'Bebidas Consignadas'
  | 'Cabine de Fotos & 360°'
  | 'Celebrante de Casamento'
  | 'Traje do Noivo'
  | 'Joias & Alianças'
  | 'Segurança & Valet'
  | 'Infraestrutura & Outros';

export type SupplierStatus = 'contratado' | 'negociando' | 'pesquisando' | 'descartado';

export interface SupplierItem {
  id: string;
  name: string;
  category: SupplierCategory;
  price: number;
  status: SupplierStatus;
  phone: string;
  instagram: string;
  notes: string;
  isSuggested: boolean;
  isAdded: boolean; // "sim adicionar ou não retirar"
  catalogRoleId?: string; // Links back to the catalog suggestion (e.g. 'barman', 'dj')
}

export interface SupplierSuggestionCatalog {
  id: string;
  role: string; // e.g. "Barman / Open Bar", "DJ / Sonorização"
  category: SupplierCategory;
  categoryGroup:
    | 'Bebidas & Bar'
    | 'Música & Festa'
    | 'Gastronomia & Buffet'
    | 'Espaço & Cerimônia'
    | 'Foto & Filme'
    | 'Decoração & Cenografia'
    | 'Trajes & Beleza'
    | 'Assessoria & Cerimonial'
    | 'Doces & Bolo'
    | 'Papelaria & Lembrancinhas'
    | 'Logística & Estrutura';
  description: string;
  importance: 'Essencial' | 'Recomendado' | 'Diferencial';
  defaultNotes?: string;
}

export type ChecklistPhase =
  | '12-18m'
  | '9-11m'
  | '6-8m'
  | '4-5m'
  | '2-3m'
  | '1m'
  | 'semana';

export interface ChecklistItem {
  id: string;
  phase: ChecklistPhase;
  phaseTitle: string;
  title: string;
  description: string;
  category: string;
  isDone: boolean;
  isAdded: boolean; // "sim adicionar ou não retirar"
  isCustom?: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  status: 'approved' | 'pending' | 'rejected';
  role?: 'admin' | 'user';
  createdAt?: string;
  paidAt?: string;
  paymentMethod?: 'pix' | 'cartao' | 'whatsapp' | 'manual';
  amountPaid: number;
}

export interface UserAccess {
  isUnlocked: boolean;
  accessCode: string;
  brideEmail: string;
  brideName: string;
  role?: 'admin' | 'user';
  whatsappContact: string;
  paymentStatus: 'unpaid' | 'paid';
  paidAt?: string;
}

export type GuestStatus = 'confirmado' | 'pendente' | 'recusou' | 'talvez';
export type GuestGroup = 'Família Noiva' | 'Família Noivo' | 'Padrinhos' | 'Amigos' | 'Trabalho' | 'Outros';

export interface GuestItem {
  id: string;
  name: string;
  group: GuestGroup;
  status: GuestStatus;
  companionsCount: number; // total people in nuclear family / companions
  tableNumber?: string;
  phone?: string;
  notes?: string;
}

export interface WeddingSiteConfig {
  coverUrl: string;
  welcomeTitle: string;
  welcomeMessage: string;
  completedTasks: string[];
  pixKey?: string;
  currentStep: number;
}
