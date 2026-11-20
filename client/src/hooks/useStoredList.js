import { useEffect, useState } from "react";

export default function useStoredList(key) {
  const [items, setItems] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(key));
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {
      // Keep the list usable in memory when browser storage is unavailable.
    }
  }, [items, key]);

  return [items, setItems];
}
