import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface Character {
  id: string; // "left-1" ~ "left-5", "right-1" ~ "right-5"
  hand: 'left' | 'right';
  fingerIndex: 1 | 2 | 3 | 4 | 5;
  fingerName: string;
  name: string;
  appearance: string;
  likes: string;
  dislikes: string;
  goal: string;
  catchphrase: string;
  color: string;
  colorName: string;
  drawingDataUrl: string | null;
  isCompleted: boolean;
  updatedAt: number;
}

interface FingerPeopleDB extends DBSchema {
  characters: {
    key: string;
    value: Character;
  };
}

let dbPromise: Promise<IDBPDatabase<FingerPeopleDB>>;

export function initDB() {
  if (!dbPromise) {
    dbPromise = openDB<FingerPeopleDB>('fingerpeople-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('characters')) {
          db.createObjectStore('characters', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveCharacter(character: Character): Promise<void> {
  const db = await initDB();
  await db.put('characters', character);
}

export async function getCharacter(id: string): Promise<Character | undefined> {
  const db = await initDB();
  return db.get('characters', id);
}

export async function getAllCharacters(): Promise<Character[]> {
  const db = await initDB();
  return db.getAll('characters');
}

export async function deleteCharacter(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('characters', id);
}

export async function clearAllCharacters(): Promise<void> {
  const db = await initDB();
  await db.clear('characters');
}