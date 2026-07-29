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
      setCharacters(data);
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