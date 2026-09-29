import { TodoItem, NoteItem } from '../types';

const TODOS_STORAGE_KEY = 'praxis_todos_v1';
const NOTES_STORAGE_KEY = 'praxis_notes_v1';

export function getStoredTodos(): TodoItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TODOS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TodoItem[];
  } catch (e) {
    console.error('Failed reading todos from localStorage:', e);
    return [];
  }
}

export function saveStoredTodos(todos: TodoItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
  } catch (e) {
    console.error('Failed saving todos to localStorage:', e);
  }
}

export function getStoredNotes(): NoteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as NoteItem[];
  } catch (e) {
    console.error('Failed reading notes from localStorage:', e);
    return [];
  }
}

export function saveStoredNotes(notes: NoteItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed saving notes to localStorage:', e);
  }
}
