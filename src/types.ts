export type Priority = 'low' | 'medium' | 'high';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  category: string;
  dueDate?: string; // YYYY-MM-DD
  note?: string; // Markdown supported attached note
  subtasks: SubTask[];
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: string;
  color?: string;
  isPinned: boolean;
  linkedTodoId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ActiveView = 'all' | 'today' | 'upcoming' | 'completed' | 'notes';

export interface FilterState {
  view: ActiveView;
  search: string;
  selectedCategory?: string;
  selectedPriority?: Priority;
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'alphabetical';
  sortOrder: 'asc' | 'desc';
}

export interface StatsData {
  total: number;
  completed: number;
  pending: number;
  high: number;
  notesCount: number;
  completionRate: number;
}
