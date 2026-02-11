import { useState, useCallback } from "react";

const STORAGE_KEY = "foxtown_favorites";

function readFavorites(): number[] {
  // Récupère les favoris persistés pour conserver les préférences visiteur.
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>(readFavorites);

  const toggle = useCallback((id: number) => {
    // Ajoute/retire une boutique de la liste puis persiste en local.
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);

  return { favorites, toggle, isFavorite };
}
