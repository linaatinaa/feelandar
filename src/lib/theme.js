import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'feelandar_skin';

export const SKINS = {
  dreamy: {
    id: 'dreamy',
    label: 'Dreamy',
    tagline: 'Pastel, lembut, cute journal',
    swatches: ['#ff8fb1', '#b79ced', '#ffb84d', '#c3dbf7'],
  },
  bold: {
    id: 'bold',
    label: 'Bold',
    tagline: 'Vibrant, energetic, game dashboard',
    swatches: ['#3da9fc', '#ff6b45', '#a6ff5e', '#9d7bff'],
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
