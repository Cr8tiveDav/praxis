'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TodoItem, NoteItem, Priority, ActiveView } from '../types';
import { 
  getStoredTodos, 
  saveStoredTodos, 
  getStoredNotes, 
  saveStoredNotes,
} from '../lib/storage';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { StatsOverview } from '../components/StatsOverview';
import { TodoList } from '../components/TodoList';
import { NotesView } from '../components/NotesView';
import { ItemModal } from '../components/ItemModal';
import { NoteModal } from '../components/NoteModal';
import { ConfirmModal } from '../components/ConfirmModal';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);

  // Navigation & Filtering
  const [activeView, setActiveView] = useState<ActiveView>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedPriority, setSelectedPriority] = useState<Priority | undefined>();
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt' | 'alphabetical'>('priority');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);

  // Deletion Confirmation
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'todo' | 'note';
    id: string;
    title: string;
  } | null>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    queueMicrotask(() => {
      setTodos(getStoredTodos());
      setNotes(getStoredNotes());
      setMounted(true);
    });
  }, []);

  // Persist todos and notes to localStorage
  useEffect(() => {
    if (mounted) saveStoredTodos(todos);
  }, [todos, mounted]);

  useEffect(() => {
    if (mounted) saveStoredNotes(notes);
  }, [notes, mounted]);


  // Derive unique categories across todos and notes
  const categories = useMemo(() => {
    const set = new Set<string>(['Engineering', 'Design', 'Product', 'Personal', 'Ideas']);
    todos.forEach((t) => { if (t.category) set.add(t.category); });
    notes.forEach((n) => { if (n.category) set.add(n.category); });
    return Array.from(set);
  }, [todos, notes]);

  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter and Sort Todos
  const filteredTodos = useMemo(() => {
    const result = todos.filter((todo) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = todo.title.toLowerCase().includes(q);
        const matchesDesc = todo.description?.toLowerCase().includes(q) || false;
        const matchesCat = todo.category?.toLowerCase().includes(q) || false;
        const matchesNote = todo.note?.toLowerCase().includes(q) || false;
        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesNote) return false;
      }

      // Explicit category filter
      if (selectedCategory && todo.category !== selectedCategory) return false;

      // Explicit priority filter
      if (selectedPriority && todo.priority !== selectedPriority) return false;

      // View filter
      if (activeView === 'today') {
        return todo.dueDate === todayStr;
      }
      if (activeView === 'upcoming') {
        return todo.dueDate && todo.dueDate > todayStr;
      }
      if (activeView === 'completed') {
        return todo.completed;
      }

      return true;
    });

    // Sorting
    const priorityWeight: Record<Priority, number> = { high: 3, medium: 2, low: 1 };

    result.sort((a, b) => {
      if (activeView !== 'completed') {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
      }

      if (sortBy === 'priority') {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'createdAt') {
        return b.createdAt.localeCompare(a.createdAt);
      }
      return 0;
    });

    return result;
  }, [todos, searchQuery, selectedCategory, selectedPriority, activeView, todayStr, sortBy]);

  // Task Mutations
  const handleToggleComplete = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            completed: !t.completed,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  }, []);

  const handleQuickAdd = (title: string, priority: Priority, category: string) => {
    const newTodo: TodoItem = {
      id: `todo-${Date.now()}`,
      title,
      completed: false,
      priority,
      category,
      dueDate: todayStr,
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTodos((prev) => [newTodo, ...prev]);
  };

  const handleSaveTodo = (todoData: Partial<TodoItem>) => {
    if (editingTodo) {
      setTodos((prev) =>
        prev.map((t) => (t.id === editingTodo.id ? ({ ...t, ...todoData, updatedAt: new Date().toISOString() } as TodoItem) : t))
      );
      setEditingTodo(null);
    } else {
      const newTodo: TodoItem = {
        id: `todo-${Date.now()}`,
        title: todoData.title || 'Untitled Task',
        description: todoData.description,
        completed: false,
        priority: todoData.priority || 'medium',
        category: todoData.category || 'General',
        dueDate: todoData.dueDate,
        note: todoData.note,
        subtasks: todoData.subtasks || [],
        color: todoData.color,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTodos((prev) => [newTodo, ...prev]);
    }
  };

  const handleRequestDeleteTodo = (id: string) => {
    const target = todos.find((t) => t.id === id);
    if (!target) return;
    setDeleteTarget({
      type: 'todo',
      id: target.id,
      title: target.title,
    });
  };



  const handleToggleSubtask = (todoId: string, subtaskId: string) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === todoId) {
          const updatedSubtasks = t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          );
          return {
            ...t,
            subtasks: updatedSubtasks,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  // Note Mutations
  const handleSaveNote = (noteData: Partial<NoteItem>) => {
    if (editingNote) {
      setNotes((prev) =>
        prev.map((n) => (n.id === editingNote.id ? ({ ...n, ...noteData, updatedAt: new Date().toISOString() } as NoteItem) : n))
      );
      setEditingNote(null);
    } else {
      const newNote: NoteItem = {
        id: `note-${Date.now()}`,
        title: noteData.title || 'Untitled Note',
        content: noteData.content || '',
        category: noteData.category || 'Ideas',
        color: noteData.color,
        isPinned: noteData.isPinned || false,
        linkedTodoId: noteData.linkedTodoId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes((prev) => [newNote, ...prev]);
    }
  };

  const handleRequestDeleteNote = (id: string) => {
    const target = notes.find((n) => n.id === id);
    if (!target) return;
    setDeleteTarget({
      type: 'note',
      id: target.id,
      title: target.title,
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'todo') {
      setTodos((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    } else if (deleteTarget.type === 'note') {
      setNotes((prev) => prev.filter((n) => n.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  const handleTogglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };



  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>('.search-input');
        input?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedPriority={selectedPriority}
        onSelectPriority={setSelectedPriority}
        categories={categories}
        todos={todos}
        notes={notes}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeView={activeView}
          onOpenTaskModal={() => {
            setEditingTodo(null);
            setIsTaskModalOpen(true);
          }}
          onOpenNoteModal={() => {
            setEditingNote(null);
            setIsNoteModalOpen(true);
          }}
          onToggleMobileMenu={() => setIsMobileOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(p => !p)}
        />

        <main className="content-body">
          {/* Top Metric Stats Overview */}
          <StatsOverview
            totalTasks={todos.length}
            completedTasks={todos.filter((t) => t.completed).length}
            highTasks={todos.filter((t) => !t.completed && t.priority === 'high').length}
            totalNotes={notes.length}
          />

          {/* View Dispatcher */}
          {activeView === 'notes' ? (
            <NotesView
              notes={notes}
              searchQuery={searchQuery}
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              onOpenNoteModal={() => {
                setEditingNote(null);
                setIsNoteModalOpen(true);
              }}
              onEditNote={(note) => {
                setEditingNote(note);
                setIsNoteModalOpen(true);
              }}
              onDeleteNote={handleRequestDeleteNote}
              onTogglePin={handleTogglePin}
            />
          ) : (
            <TodoList
              todos={filteredTodos}
              activeView={activeView}
              selectedCategory={selectedCategory}
              selectedPriority={selectedPriority}
              onPriorityChange={setSelectedPriority}
              searchQuery={searchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onToggleComplete={handleToggleComplete}
              onEdit={(todo) => {
                setEditingTodo(todo);
                setIsTaskModalOpen(true);
              }}
              onDelete={handleRequestDeleteTodo}
              onToggleSubtask={handleToggleSubtask}
              onQuickAdd={handleQuickAdd}
              onOpenTaskModal={() => {
                setEditingTodo(null);
                setIsTaskModalOpen(true);
              }}
              categories={categories}
            />
          )}
        </main>
      </div>

      {/* Task Creation & Editing Modal */}
      <ItemModal
        key={isTaskModalOpen ? (editingTodo?.id || 'new-todo') : 'closed-todo'}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTodo(null);
        }}
        onSave={handleSaveTodo}
        initialTodo={editingTodo}
        categories={categories}
      />

      {/* Note Creation & Editing Modal */}
      <NoteModal
        key={isNoteModalOpen ? (editingNote?.id || 'new-note') : 'closed-note'}
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        initialNote={editingNote}
        categories={categories}
      />

      {/* Global Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.type === 'todo' ? 'Delete Task' : 'Delete Note'}
        message={`Are you sure you want to delete this ${deleteTarget?.type === 'todo' ? 'task' : 'note'}?`}
        itemName={deleteTarget?.title}
        confirmLabel={deleteTarget?.type === 'todo' ? 'Delete Task' : 'Delete Note'}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
