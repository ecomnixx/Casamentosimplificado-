import {
  BrideProfile,
  ChecklistItem,
  ColorPalette,
  ExpenseItem,
  GuestItem,
  SupplierItem,
  WeddingSiteConfig,
} from '../types';
import { PALETTES } from '../data/palettes';
import {
  INITIAL_CHECKLIST,
  INITIAL_EXPENSES,
  INITIAL_GUESTS,
  INITIAL_PROFILE,
  INITIAL_SITE_CONFIG,
  INITIAL_SUPPLIERS,
} from '../data/initialData';

export function normalizeEmail(email?: string): string {
  if (!email) return 'guest';
  return email.trim().toLowerCase();
}

function getStorageKey(email: string, itemKey: string): string {
  const clean = normalizeEmail(email);
  return `casamento_user_${clean}_${itemKey}`;
}

export interface UserWeddingState {
  profile: BrideProfile;
  expenses: ExpenseItem[];
  suppliers: SupplierItem[];
  checklist: ChecklistItem[];
  palette: ColorPalette;
  guests: GuestItem[];
  siteConfig: WeddingSiteConfig;
}

/**
 * Loads the private data strictly belonging to the given user email.
 * Guarantees that data is isolated per email and never resets previously saved data.
 */
export function loadUserDataForEmail(email: string, fallbackName?: string): UserWeddingState {
  const cleanEmail = normalizeEmail(email);

  // 1. Profile
  let profile: BrideProfile = { ...INITIAL_PROFILE };
  const profileKey = getStorageKey(cleanEmail, 'profile');
  const savedProfile = localStorage.getItem(profileKey);

  if (savedProfile) {
    try {
      const parsed = JSON.parse(savedProfile);
      if (parsed && typeof parsed === 'object') {
        profile = parsed;
      }
    } catch (e) {
      console.error('Error parsing user profile:', e);
    }
  } else {
    // If not saved yet under this email, check if there was a global profile or use fallback name
    const globalProfile = localStorage.getItem('noiva_profile');
    if (globalProfile) {
      try {
        const parsed = JSON.parse(globalProfile);
        if (parsed && !parsed.brideName?.includes('Manuela')) {
          profile = parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (fallbackName && (!profile.brideName || profile.brideName === 'Manuela')) {
      profile.brideName = fallbackName;
    }
    // Save to user's isolated key immediately
    localStorage.setItem(profileKey, JSON.stringify(profile));
  }

  // 2. Expenses
  let expenses: ExpenseItem[] = [...INITIAL_EXPENSES];
  const expensesKey = getStorageKey(cleanEmail, 'expenses');
  const savedExpenses = localStorage.getItem(expensesKey);

  if (savedExpenses) {
    try {
      const parsed = JSON.parse(savedExpenses);
      if (Array.isArray(parsed)) {
        expenses = parsed;
      }
    } catch (e) {
      console.error('Error parsing user expenses:', e);
    }
  } else {
    // Check if there was previously saved global expenses to migrate for this user
    const globalExpenses = localStorage.getItem('noiva_expenses');
    if (globalExpenses) {
      try {
        const parsed = JSON.parse(globalExpenses);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const userItems = parsed.filter(
            (e: ExpenseItem) => !e.isSuggested && !e.id.startsWith('exp-mock-')
          );
          if (userItems.length > 0) {
            expenses = userItems;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem(expensesKey, JSON.stringify(expenses));
  }

  // 3. Suppliers
  let suppliers: SupplierItem[] = [...INITIAL_SUPPLIERS];
  const suppliersKey = getStorageKey(cleanEmail, 'suppliers');
  const savedSuppliers = localStorage.getItem(suppliersKey);

  if (savedSuppliers) {
    try {
      const parsed = JSON.parse(savedSuppliers);
      if (Array.isArray(parsed)) {
        suppliers = parsed;
      }
    } catch (e) {
      console.error('Error parsing user suppliers:', e);
    }
  } else {
    const globalSuppliers = localStorage.getItem('noiva_suppliers');
    if (globalSuppliers) {
      try {
        const parsed = JSON.parse(globalSuppliers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const userItems = parsed.filter((s: SupplierItem) => !s.id.startsWith('sup-mock-'));
          if (userItems.length > 0) {
            suppliers = userItems;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem(suppliersKey, JSON.stringify(suppliers));
  }

  // 4. Checklist
  let checklist: ChecklistItem[] = [...INITIAL_CHECKLIST];
  const checklistKey = getStorageKey(cleanEmail, 'checklist');
  const savedChecklist = localStorage.getItem(checklistKey);

  if (savedChecklist) {
    try {
      const parsed = JSON.parse(savedChecklist);
      if (Array.isArray(parsed)) {
        checklist = parsed;
      }
    } catch (e) {
      console.error('Error parsing user checklist:', e);
    }
  } else {
    const globalChecklist = localStorage.getItem('noiva_checklist');
    if (globalChecklist) {
      try {
        const parsed = JSON.parse(globalChecklist);
        if (Array.isArray(parsed) && parsed.length > 0) {
          checklist = parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem(checklistKey, JSON.stringify(checklist));
  }

  // 5. Palette
  let palette: ColorPalette = PALETTES.sage;
  const paletteKey = getStorageKey(cleanEmail, 'palette');
  const savedPalette = localStorage.getItem(paletteKey);

  if (savedPalette) {
    try {
      const parsed = JSON.parse(savedPalette);
      if (parsed && parsed.id) {
        palette = parsed;
      }
    } catch (e) {
      console.error('Error parsing user palette:', e);
    }
  } else {
    const savedCustom = localStorage.getItem('noiva_custom_palette');
    if (savedCustom) {
      try {
        palette = JSON.parse(savedCustom);
      } catch (e) {
        console.error(e);
      }
    } else {
      const savedId = localStorage.getItem('noiva_palette_id');
      if (savedId && PALETTES[savedId]) {
        palette = PALETTES[savedId];
      }
    }
    localStorage.setItem(paletteKey, JSON.stringify(palette));
  }

  // 6. Guests
  let guests: GuestItem[] = [...INITIAL_GUESTS];
  const guestsKey = getStorageKey(cleanEmail, 'guests');
  const savedGuests = localStorage.getItem(guestsKey);
  if (savedGuests) {
    try {
      const parsed = JSON.parse(savedGuests);
      if (Array.isArray(parsed)) {
        guests = parsed;
      }
    } catch (e) {
      console.error('Error parsing guests:', e);
    }
  }

  // 7. Site Config
  let siteConfig: WeddingSiteConfig = { ...INITIAL_SITE_CONFIG };
  const siteKey = getStorageKey(cleanEmail, 'site_config');
  const savedSite = localStorage.getItem(siteKey);
  if (savedSite) {
    try {
      const parsed = JSON.parse(savedSite);
      if (parsed && typeof parsed === 'object') {
        siteConfig = parsed;
      }
    } catch (e) {
      console.error('Error parsing site config:', e);
    }
  }

  return { profile, expenses, suppliers, checklist, palette, guests, siteConfig };
}

/**
 * Saves specific items directly to the user's private storage key.
 */
export function saveUserExpenses(email: string, expenses: ExpenseItem[]): void {
  const key = getStorageKey(email, 'expenses');
  localStorage.setItem(key, JSON.stringify(expenses));
}

export function saveUserSuppliers(email: string, suppliers: SupplierItem[]): void {
  const key = getStorageKey(email, 'suppliers');
  localStorage.setItem(key, JSON.stringify(suppliers));
}

export function saveUserChecklist(email: string, checklist: ChecklistItem[]): void {
  const key = getStorageKey(email, 'checklist');
  localStorage.setItem(key, JSON.stringify(checklist));
}

export function saveUserProfile(email: string, profile: BrideProfile): void {
  const key = getStorageKey(email, 'profile');
  localStorage.setItem(key, JSON.stringify(profile));
}

export function saveUserPalette(email: string, palette: ColorPalette): void {
  const key = getStorageKey(email, 'palette');
  localStorage.setItem(key, JSON.stringify(palette));
}

export function saveUserGuests(email: string, guests: GuestItem[]): void {
  const key = getStorageKey(email, 'guests');
  localStorage.setItem(key, JSON.stringify(guests));
}

export function saveUserSiteConfig(email: string, siteConfig: WeddingSiteConfig): void {
  const key = getStorageKey(email, 'site_config');
  localStorage.setItem(key, JSON.stringify(siteConfig));
}
