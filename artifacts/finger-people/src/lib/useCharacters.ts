import { useCallback, useEffect, useSyncExternalStore } from 'react';
import {
  Character,
  getAllCharacters,
  saveCharacter as dbSaveCharacter,
  deleteCharacter as dbDeleteCharacter,
  clearAllCharacters,
} from './db';

/**
 * A single module-level store shared by every `useCharacters()` caller.
 * The header, the hand canvas and the editor all read the same list, so a
 * write in one place is immediately visible everywhere.
 */
let characters: Character[] = [];
let isLoading = true;
let loadPromise: Promise<void> | null = null;

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setCharacters(next: Character[]) {
  characters = next;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getCharactersSnapshot = () => characters;
const getLoadingSnapshot = () => isLoading;

async function load() {
  try {
    const data = await getAllCharacters();

    // Migrate legacy '새끼' → '소지' in stored characters
    const toMigrate = data.filter((c) => c.fingerName === '새끼');
    if (toMigrate.length > 0) {
      await Promise.all(toMigrate.map((c) => dbSaveCharacter({ ...c, fingerName: '소지' })));
    }

    characters = data.map((c) => (c.fingerName === '새끼' ? { ...c, fingerName: '소지' } : c));
  } catch (error) {
    console.error('Failed to load characters', error);
  } finally {
    isLoading = false;
    emit();
  }
}

function ensureLoaded() {
  if (!loadPromise) loadPromise = load();
  return loadPromise;
}

export function useCharacters() {
  const list = useSyncExternalStore(subscribe, getCharactersSnapshot, getCharactersSnapshot);
  const loading = useSyncExternalStore(subscribe, getLoadingSnapshot, getLoadingSnapshot);

  useEffect(() => {
    ensureLoaded();
  }, []);

  const saveCharacter = useCallback(async (character: Character) => {
    await dbSaveCharacter(character);
    const exists = characters.some((c) => c.id === character.id);
    setCharacters(
      exists ? characters.map((c) => (c.id === character.id ? character : c)) : [...characters, character],
    );
  }, []);

  const deleteCharacter = useCallback(async (id: string) => {
    await dbDeleteCharacter(id);
    setCharacters(characters.filter((c) => c.id !== id));
  }, []);

  const clearAll = useCallback(async () => {
    await clearAllCharacters();
    setCharacters([]);
  }, []);

  const loadAll = useCallback(async () => {
    loadPromise = load();
    await loadPromise;
  }, []);

  return { characters: list, saveCharacter, deleteCharacter, clearAll, loadAll, isLoading: loading };
}
