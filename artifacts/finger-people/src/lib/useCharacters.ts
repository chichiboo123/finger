import { useState, useEffect, useCallback } from 'react';
import { 
  Character, 
  getAllCharacters, 
  saveCharacter as dbSaveCharacter, 
  deleteCharacter as dbDeleteCharacter, 
  clearAllCharacters 
} from './db';

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllCharacters();

      // Migrate legacy '새끼' → '소지' in stored characters
      const toMigrate = data.filter(c => c.fingerName === '새끼');
      if (toMigrate.length > 0) {
        await Promise.all(
          toMigrate.map(c => dbSaveCharacter({ ...c, fingerName: '소지' }))
        );
      }

      setCharacters(
        data.map(c => c.fingerName === '새끼' ? { ...c, fingerName: '소지' } : c)
      );
    } catch (error) {
      console.error("Failed to load characters", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const saveCharacter = useCallback(async (character: Character) => {
    await dbSaveCharacter(character);
    setCharacters(prev => {
      const exists = prev.find(c => c.id === character.id);
      if (exists) {
        return prev.map(c => c.id === character.id ? character : c);
      }
      return [...prev, character];
    });
  }, []);

  const deleteCharacter = useCallback(async (id: string) => {
    await dbDeleteCharacter(id);
    setCharacters(prev => prev.filter(c => c.id !== id));
  }, []);

  const clearAll = useCallback(async () => {
    await clearAllCharacters();
    setCharacters([]);
  }, []);

  return { characters, saveCharacter, deleteCharacter, clearAll, loadAll, isLoading };
}