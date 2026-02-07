import { Subject, ExpenseCategory } from "./types";

export const SUBJECTS: { value: Subject; label: string; color: string }[] = [
  { value: "math", label: "Enhanced Math", color: "subject-math" },
  { value: "science", label: "Science", color: "subject-science" },
  { value: "english", label: "English", color: "subject-english" },
  { value: "history", label: "US History", color: "subject-history" },
];

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: "food", label: "Food", icon: "🍔" },
  { value: "school", label: "School Supplies", icon: "📚" },
  { value: "entertainment", label: "Entertainment", icon: "🎮" },
  { value: "transport", label: "Transportation", icon: "🚌" },
  { value: "other", label: "Other", icon: "📦" },
];

export const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "D-": 0.7,
  "F": 0.0,
};

export const SUBJECT_COLORS: Record<Subject, string> = {
  math: "hsl(252, 85%, 63%)",
  science: "hsl(168, 70%, 42%)",
  english: "hsl(32, 95%, 55%)",
  history: "hsl(350, 80%, 58%)",
};
