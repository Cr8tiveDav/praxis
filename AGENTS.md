<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md - Praxis Workspace Specification

This document provides technical specifications, architectural guidelines, and conventions for AI agents developing, maintaining, or extending the **Praxis** Todo & Notes application.

---

## 1. Project Overview & Vision

**Praxis** is a personal productivity web application built with Next.js (App Router), React 19, TypeScript, and modern CSS. It pairs disciplined task execution and checklist tracking with rich, contextual note-taking.

- **Project Root:** `/Users/david/workspace/HNG-15/todo-note`
- **Framework:** Next.js 16 (App Router with Turbopack)
- **Runtime / UI:** React 19, TypeScript 5
- **Styling:** Custom CSS Design System with CSS variables and dark/light modes
- **Iconography:** `lucide-react`
- **Persistence:** LocalStorage with client-side synchronization and JSON export/import

---

## 2. Directory & Component Architecture

todo-note/
├── src/
│   ├── app/
│   │   ├── globals.css         # Design tokens, theme variables, reset & layout styles
│   │   ├── layout.tsx          # Root layout, Google font setup, and SEO metadata
│   │   └── page.tsx            # Main application state orchestrator
│   ├── components/
│   │   ├── Header.tsx          # Search bar, theme toggle, backup export/import, quick actions
│   │   ├── Sidebar.tsx         # Navigation views (All, Today, Upcoming, Notes, Completed), tags & categories (flyout when collapsed)
│   │   ├── StatsOverview.tsx   # Productivity metrics (progress rate, pending, urgent, notes count)
│   │   ├── TodoList.tsx        # Filterable & sortable list of todos, inline priority filter, quick inline adder
│   │   ├── TodoCard.tsx        # Interactive task card with subtasks checklist, priority badge, and edit trigger
│   │   ├── NotesView.tsx       # Grid view of notes with search and pin management
│   │   ├── NoteCard.tsx        # Individual note display with color tint, tag pill, pin toggle, edit/delete
│   │   ├── ItemModal.tsx       # Modal dialog for creating and editing tasks with subtasks and unified markdown notes
│   │   └── NoteModal.tsx       # Modal dialog for creating and editing notes with real-time inline WYSIWYG editor
│   ├── lib/
│   │   └── storage.ts          # LocalStorage persistence, default seeds, and backup import/export
│   └── types.ts                # Domain models (TodoItem, NoteItem, Priority, ActiveView, FilterState)
├── AGENTS.md                   # Project architectural specification and agent instructions
├── package.json                # Project dependencies and npm scripts
└── tsconfig.json               # TypeScript configuration

---

## 3. Functional Features

### 3.1 Task Management
- **Full CRUD:** Create, read, update, duplicate, and delete tasks.
- **Checklist Subtasks:** Add, toggle, and delete individual subtasks with dynamic progress calculation.
- **Priority Levels:** `urgent` (Coral), `high` (Amber), `medium` (Blue), and `low` (Green).
- **Inline Priority Filter:** Filter tasks by priority directly in the task header (context-specific, not in the global sidebar).
- **Due Dates & Status:** Due date selection with overdue, today, and upcoming badges.
- **Unified Notes & Descriptions:** Single auto-resizing Markdown field for notes, specs, or meeting details.
- **Quick Inline Add:** Fast input at the top of the task list to create tasks with one keystroke.
- **Sorting Options:** Sort tasks by Priority level, Due Date, Date Created, or Alphabetical (A-Z).

### 3.2 Notes & Docs Management
- **Full CRUD:** Create, read, update, and delete rich notes.
- **Real-Time WYSIWYG Editor:** Unified canvas supporting Bold, Italic, Underline, Strikethrough, Code, and Lists with synchronized caret state inspection.
- **Pinned Notes:** Pin high-priority scratchpads to the top of the notes view.
- **Color Accent:** Customizable color strips for card categorization.
- **Task Linking:** Link notes to tasks for contextual reference.

### 3.3 Views & Filtering
- **Navigation Views:**
  - `All Tasks`: Overview of active tasks (with completed section collapsible or separated).
  - `Today`: Tasks due on the current date.
  - `Upcoming`: Tasks with due dates in the future.
  - `Notes & Docs`: Dedicated masonry/grid notes view.
  - `Completed`: Archive of finished tasks.
- **Tag / Category Filtering:** Dynamically derived tag filters. When the sidebar is collapsed to icons, tags collapse into a single Tag icon that opens a styled popover menu.
- **Global Search:** Real-time search across task titles, descriptions, categories, and notes with `Cmd/Ctrl + K` shortcut.

### 3.4 Productivity Metrics
- **Progress Rate:** Percentage of completed tasks with a full-width track progress bar.
- **Pending Tasks:** Active count of uncompleted tasks.
- **High / Urgent Priority:** Highlights critical priority tasks needing immediate action.
- **Active Notes:** Count of active documentation items.

### 3.5 Data Persistence & Backup
- **Client Storage:** Instant sync to `localStorage` on any state update.
- **Backup Export:** Download entire workspace as a formatted `.json` file.
- **Backup Restore:** Upload previously exported `.json` file to restore workspace state.

---

## 4. Data Models (src/types.ts)

### TodoItem
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TodoItem {
  id: string;
  title: string;
  description?: string; // Unified markdown notes and task description
  completed: boolean;
  priority: Priority;
  category: string;
  dueDate?: string;     // YYYY-MM-DD
  subtasks: SubTask[];
  color?: string;
  createdAt: string;
  updatedAt: string;
}

### NoteItem
export interface NoteItem {
  id: string;
  title: string;
  content: string;      // Formatted rich text / HTML content
  category: string;
  color?: string;
  isPinned: boolean;
  linkedTodoId?: string;
  createdAt: string;
  updatedAt: string;
}

### ActiveView
export type ActiveView = 'all' | 'today' | 'upcoming' | 'completed' | 'notes';

---

## 5. Design System & Aesthetics Guidelines

1. **Color Palette & Theme Tokens**:
   - **Dark Theme (Default):**
     - Base Canvas: `#0B0B0B`
     - Sidebar & Header: `#121212`
     - Elevated Surfaces & Cards: `#181818`
     - Dividers & Borders: `#262626`
     - Primary Accent & Action Color: Warm Amber `#F5A623` (hover: `#E09418`)
     - Text Primary: `#FFFFFF`
     - Text Secondary: `#9CA3AF`
     - Text Muted: `#55555B`
   - **Light Theme ([data-theme='light']):**
     - Base Canvas: `#F8F9FA`
     - Elevated Surfaces & Cards: `#FFFFFF` with `#E5E7EB` borders
     - Active Pills: Soft gray `#F3F4F6` with dark text and amber accent (no pure black fills)
     - Text Primary: `#111827`
     - Text Secondary: `#4B5563`

2. **Visual Standards**:
   - **Sidebar Active Indicator:** Straight rectangular left indicator (`border-l-[3px] border-[#F5A623]`), avoiding curved border pills.
   - **Buttons:** Solid amber `#F5A623` reserved strictly for primary actions (`+ New Task`). Secondary actions use elevated neutral dark gray (`#1F1F1F`).
   - **Completed Items:** Kept legible using muted gray (`#9CA3AF`) with line-through and softened priority badges.
   - **Responsive Layout:** Sidebar collapses to a compact rail with popovers for secondary items.

---

## 6. Development & Operational Commands

All commands are executed from the project root:

- **Start Dev Server:** `npm run dev`
- **Build Production Bundle:** `npm run build`
- **Lint Codebase:** `npm run lint`

---

## 7. Rules for Collaborating AI Agents

1. **Keep Code Functional:** Avoid adding unnecessary placeholder features, meta-modals, or gimmicks. Focus strictly on functional productivity features.
2. **Preserve Type Contracts:** Ensure all changes maintain strict typing matching `src/types.ts`.
3. **Persist State:** All user operations (create, update, delete, reorder) must update `localStorage`.
4. **Follow React Best Practices:** Avoid calling synchronous `setState` in effects to avoid cascading renders.
5. **Maintain Visual Cohesion:** Adhere strictly to the `#0B0B0B` dark neutral canvas and `#F5A623` amber accent palette. Never introduce arbitrary teal, blue, or cyan card backgrounds.
