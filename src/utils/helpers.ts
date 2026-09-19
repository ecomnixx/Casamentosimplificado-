import { ExpenseCategory, SupplierCategory } from '../types';

export function calculateDaysRemaining(targetDateStr: string): {
  days: number;
  isPast: boolean;
  formattedDateBadge: string;
  fullDateReadable: string;
  hasDate: boolean;
} {
  if (!targetDateStr) {
    return {
      days: 0,
      isPast: false,
      formattedDateBadge: 'DEFINIR DATA DO CASAMENTO',
      fullDateReadable: 'Data a definir pela noiva',
      hasDate: false,
    };
  }

  const target = new Date(`${targetDateStr}T00:00:00`);
  if (isNaN(target.getTime())) {
    return {
      days: 0,
      isPast: false,
      formattedDateBadge: 'DEFINIR DATA DO CASAMENTO',
      fullDateReadable: 'Data a definir pela noiva',
      hasDate: false,
    };
  }

  const now = new Date();
  // reset time to midnight for accurate day difference
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isPast = diffDays < 0;
  const days = Math.abs(diffDays);

  const daysOfWeek = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const fullMonths = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayWeek = daysOfWeek[target.getDay()] || 'SÁBADO';
  const dayNum = String(target.getDate()).padStart(2, '0');
  const monthStr = months[target.getMonth()] || 'MAI';
  const year = target.getFullYear();

  const formattedDateBadge = `${dayWeek}, ${dayNum} ${monthStr} ${year}`;
  const fullDateReadable = `${dayNum} de ${fullMonths[target.getMonth()]} de ${year}`;

  return {
    days: isPast ? 0 : days,
    isPast,
    formattedDateBadge,
    fullDateReadable,
    hasDate: true,
  };
}

export function formatCurrencyBRL(val: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(val || 0);
}

export function formatCurrencyBRLWithDecimals(val: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val || 0);
}

export function cleanPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits.startsWith('55') && digits.length >= 10) {
    return `55${digits}`;
  }
  return digits;
}

export function getWhatsAppUrl(phone: string, text: string): string {
  const cleaned = cleanPhoneForWhatsApp(phone);
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`;
}

export function mapSupplierCategoryToExpenseCategory(supplierCat: SupplierCategory): ExpenseCategory {
  switch (supplierCat) {
    case 'Espaço de Casamento':
      return 'Espaço & Cerimônia';
    case 'Buffet Gastronômico':
    case 'Bebidas Consignadas':
    case 'Barman & Open Bar':
      return 'Buffet & Bebidas';
    case 'Fotógrafo / Cinegrafista':
    case 'Cabine de Fotos & 360°':
      return 'Fotografia & Vídeo';
    case 'Decoração & Cenografia':
      return 'Decoração & Flores';
    case 'Vestido de Noiva / Atelier':
    case 'Traje do Noivo':
    case 'Beleza da Noiva (Cabelo/Make)':
    case 'Joias & Alianças':
      return 'Vestido & Beleza';
    case 'Música / Banda / DJ':
      return 'Música & Banda/DJ';
    case 'Bolo & Doces Finos':
      return 'Doces & Bolo';
    case 'Convites & Papelaria':
    case 'Lembrancinhas':
      return 'Convites & Lembranças';
    case 'Cerimonialista / Assessora':
    case 'Celebrante de Casamento':
      return 'Assessoria & Cerimonial';
    default:
      return 'Outros';
  }
}

export function buildGoogleMapsUrl(query: string, lat?: number, lng?: number): string {
  if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
