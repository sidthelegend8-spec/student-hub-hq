import { motion } from "framer-motion";
import { BookOpen, Calculator, DollarSign, Calendar, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Note, Semester, Expense, CalendarEvent } from "@/lib/types";
import { SUBJECTS, GRADE_POINTS, SUBJECT_COLORS } from "@/lib/constants";
import { Link } from "react-router-dom";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Dashboard() {
  const [notes] = useLocalStorage<Note[]>("studyhub-notes", []);
  const [semesters] = useLocalStorage<Semester[]>("studyhub-semesters", []);
  const [expenses] = useLocalStorage<Expense[]>("studyhub-expenses", []);
  const [events] = useLocalStorage<CalendarEvent[]>("studyhub-events", []);

  const recentNotes = [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 3);

  const today = new Date().toISOString().split("T")[0];
  const upcomingEvents = events
    .filter((e) => e.date >= today && !e.completed)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const todayEvents = events.filter((e) => e.date === today);

  // Calculate current GPA
  const allCourses = semesters.flatMap((s) => s.courses);
  let gpa = 0;
  if (allCourses.length > 0) {
    const totalPoints = allCourses.reduce((sum, c) => {
      const base = GRADE_POINTS[c.grade] || 0;
      const bonus = c.isAP ? 1 : c.isHonors ? 0.5 : 0;
      return sum + (base + bonus) * c.creditHours;
    }, 0);
    const totalCredits = allCourses.reduce((sum, c) => sum + c.creditHours, 0);
    gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
  }

  // Monthly expense total
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthlyTotal = expenses
    .filter((e) => e.date.startsWith(thisMonth))
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold">
          Welcome back! <span className="text-gradient">📚</span>
        </h1>
        <p className="mt-1 text-muted-foreground">Here's your study overview for today</p>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="gradient-primary rounded-xl p-3">
              <Calculator className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current GPA</p>
              <p className="text-2xl font-bold">{gpa > 0 ? gpa.toFixed(2) : "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="gradient-accent rounded-xl p-3">
              <BookOpen className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Notes</p>
              <p className="text-2xl font-bold">{notes.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-xl bg-destructive/20 p-3">
              <DollarSign className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">${monthlyTotal.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-xl bg-secondary p-3">
              <Calendar className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today's Events</p>
              <p className="text-2xl font-bold">{todayEvents.length}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Assignments */}
        <motion.div variants={item}>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Upcoming Assignments</CardTitle>
              <Link to="/calendar">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  View All <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No upcoming events. Add some in the Calendar!</p>
              ) : (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: event.subject ? SUBJECT_COLORS[event.subject] : "hsl(var(--primary))" }}
                      />
                      <div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">{event.type}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Notes */}
        <motion.div variants={item}>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Recent Notes</CardTitle>
              <Link to="/notes">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  View All <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentNotes.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No notes yet. Start taking notes!</p>
              ) : (
                recentNotes.map((note) => {
                  const subj = SUBJECTS.find((s) => s.value === note.subject);
                  return (
                    <div key={note.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: SUBJECT_COLORS[note.subject] }}
                        />
                        <div>
                          <p className="text-sm font-medium">{note.title}</p>
                          <p className="text-xs text-muted-foreground">{subj?.label}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
