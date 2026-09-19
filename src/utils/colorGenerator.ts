import { ColorPalette } from '../types';

// Convert Hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Convert HSL to Hex
export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const rHex = Math.round((r + m) * 255)
    .toString(16)
    .padStart(2, '0');
  const gHex = Math.round((g + m) * 255)
    .toString(16)
    .padStart(2, '0');
  const bHex = Math.round((b + m) * 255)
    .toString(16)
    .padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`.toUpperCase();
}

/**
 * Generates a full, cohesive wedding theme palette from ANY single hex color.
 */
export function createPaletteFromHex(
  hexColor: string,
  customName: string = 'Minha Cor Especial',
  customSubtitle: string = 'Paleta Personalizada da Noiva'
): ColorPalette {
  let normalizedHex = hexColor.trim();
  if (!normalizedHex.startsWith('#')) {
    normalizedHex = '#' + normalizedHex;
  }

  // Validate hex
  if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(normalizedHex)) {
    normalizedHex = '#708238'; // fallback to sage
  }

  const rgb = hexToRgb(normalizedHex);
  const { h, s } = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Compute refined harmonic color tokens
  const primary = normalizedHex;
  const primaryDark = hslToHex(h, Math.min(s, 70), 18);
  const primaryLight = hslToHex(h, Math.min(s, 40), 96);
  const accent = hslToHex((h + 35) % 360, Math.min(s + 15, 75), 58);

  const bgFrom = hslToHex(h, Math.min(s, 24), 97.5);
  const bgTo = hslToHex((h + 12) % 360, Math.min(s, 30), 92.5);

  const badgeBg = hslToHex(h, Math.min(s, 35), 92);
  const badgeText = hslToHex(h, Math.min(s, 75), 20);

  const buttonBg = primary;
  // Calculate relative luminance for buttonText contrast
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  const buttonText = luminance > 0.7 ? '#1F2937' : '#FFFFFF';

  const highlightText = hslToHex(h, Math.min(s, 80), 28);

  const swatches: [string, string, string] = [
    primary,
    hslToHex(h, Math.min(s, 60), 72),
    accent,
  ];

  const cleanId = `custom-${normalizedHex.replace('#', '').toLowerCase()}`;

  return {
    id: cleanId,
    name: customName,
    subtitle: customSubtitle,
    category: 'Personalizada',
    swatches,
    primary,
    primaryDark,
    primaryLight,
    accent,
    bgFrom,
    bgTo,
    cardBg: 'rgba(255, 255, 255, 0.92)',
    badgeBg,
    badgeText,
    buttonBg,
    buttonText,
    highlightText,
    isCustom: true,
  };
}
