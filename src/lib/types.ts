// Notes
export type Subject = "math" | "science" | "english" | "history";

export interface Note {
  id: string;
  subject: Subject;
  title: string;
  content: string;
  tags: string[];
  highlights: string[];
  links: string[];
  createdAt: string;
  updatedAt: string;
}

// GPA
export interface Course {
  id: string;
  name: string;
  grade: string;
  creditHours: number;
  isHonors: boolean;
  isAP: boolean;
  semester: string;
}

export interface Semester {
  id: string;
  name: string;
  year: string;
  courses: Course[];
}

// Expenses
export type ExpenseCategory = "food" | "school" | "entertainment" | "transport" | "other";

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
}

export interface SpendingLimit {
  category: ExpenseCategory;
  limit: number;
}

// Calendar
export type EventType = "assignment" | "test" | "event" | "reminder";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: EventType;
  subject?: Subject;
  description?: string;
  completed?: boolean;
}

// Study Tools
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  topic: string;
}
