import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'feelandar_skin';

export const SKINS = {
  bubblegum: {
    id: 'bubblegum',
    label: 'Bubblegum',
    tagline: 'Girly · manis & pink',
    emoji: '🍬',
    dark: false,
    swatches: ['#ffd9e8', '#ff7ab0', '#ffe6a7', '#fff7fa'],
  },
  lavender: {
    id: 'lavender',
    label: 'Lavender Dream',
    tagline: 'Girly · lembut & dreamy',
    emoji: '🦄',
    dark: false,
    swatches: ['#e6ddff', '#a37bea', '#c8e8f5', '#faf7ff'],
  },
  nature: {
    id: 'nature',
    label: 'Nature',
    tagline: 'Netral · adem & earthy',
    emoji: '🌿',
    dark: false,
    swatches: ['#dceccd', '#4e9a6f', '#e9d8a6', '#f7faf2'],
  },
  bold: {
    id: 'bold',
    label: 'Bold Arena',
    tagline: 'Cowo · gelap & tegas',
    emoji: '🔥',
    dark: true,
    swatches: ['#2a2320', '#ff7a33', '#ffc247', '#3a312c'],
  },
  cyber: {
    id: 'cyber',
    label: 'Cyber Night',
    tagline: 'Cowo · neon futuristik',
    emoji: '🎮',
    dark: true,
    swatches: ['#20223f', '#3fe0d0', '#b06bff', '#2c2f52'],
  },
};

export function getStoredSkin() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value && SKINS[value] ? value : null;
  } catch {
    return null;
  }
}

export function applySkin(skinId) {
  if (!SKINS[skinId]) return;
  document.documentElement.setAttribute('data-skin', skinId);
  try {
    localStorage.setItem(STORAGE_KEY, skinId);
  } catch {
    // localStorage unavailable (e.g. private mode) — skin just won't persist
  }
}

/** Returns [skin, setSkin]. `skin` is null until the user has chosen one. */
export function useSkin() {
  const [skin, setSkinState] = useState(getStoredSkin);

  useEffect(() => {
    if (skin) document.documentElement.setAttribute('data-skin', skin);
  }, [skin]);

  const setSkin = useCallback((skinId) => {
    applySkin(skinId);
    setSkinState(skinId);
  }, []);

  return [skin, setSkin];
}
