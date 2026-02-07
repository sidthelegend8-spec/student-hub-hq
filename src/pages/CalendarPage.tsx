import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight, Check, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CalendarEvent, EventType, Subject } from "@/lib/types";
import { SUBJECTS, SUBJECT_COLORS } from "@/lib/constants";

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "assignment", label: "📝 Assignment" },
  { value: "test", label: "📊 Test" },
  { value: "event", label: "🎉 Event" },
  { value: "reminder", label: "⏰ Reminder" },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>("studyhub-events", []);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [view, setView] = useState<"monthly" | "weekly" | "daily">("monthly");

  // New event form
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newType, setNewType] = useState<EventType>("assignment");
  const [newSubject, setNewSubject] = useState<Subject | "">("");
  const [newDesc, setNewDesc] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const addEvent = () => {
    if (!newTitle) return;
    const event: CalendarEvent = {
      id: crypto.randomUUID(),
      title: newTitle,
      date: newDate,
      type: newType,
      subject: newSubject || undefined,
      description: newDesc,
      completed: false,
    };
    setEvents((prev) => [...prev, event]);
    setNewTitle("");
    setNewDesc("");
    setAddOpen(false);
  };

  const toggleComplete = (id: string) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e)));
  };

  const deleteEvent = (id: string) => setEvents((prev) => prev.filter((e) => e.id !== id));

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const today = new Date().toISOString().split("T")[0];

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter((e) => e.date === selectedDate).sort((a, b) => a.title.localeCompare(b.title));
  }, [events, selectedDate]);

  // Homework checklist (incomplete assignments)
  const homework = events
    .filter((e) => e.type === "assignment" && !e.completed && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Exam countdowns
  const upcomingTests = events
    .filter((e) => e.type === "test" && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  // Calendar days
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Plan your assignments, tests, and events</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" /> Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Event</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Event title" /></div>
              <div><Label>Date</Label><Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} /></div>
              <div>
                <Label>Type</Label>
                <Select value={newType} onValueChange={(v) => setNewType(v as EventType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{EVENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subject (optional)</Label>
                <Select value={newSubject} onValueChange={(v) => setNewSubject(v as Subject)}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Optional details" /></div>
              <Button onClick={addEvent} className="w-full gradient-primary text-primary-foreground">Add Event</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="h-5 w-5" /></Button>
              <CardTitle>{currentDate.toLocaleString("default", { month: "long", year: "numeric" })}</CardTitle>
              <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="h-5 w-5" /></Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground">{day}</div>
                ))}
                {calendarDays.map((day, i) => {
                  if (day === null) return <div key={`empty-${i}`} />;
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const dayEvents = events.filter((e) => e.date === dateStr);
                  const isToday = dateStr === today;
                  const isSelected = dateStr === selectedDate;

                  return (
                    <div
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`cursor-pointer rounded-lg p-2 text-center text-sm transition-all hover:bg-secondary/50 min-h-[60px] ${
                        isToday ? "ring-2 ring-primary" : ""
                      } ${isSelected ? "bg-primary/20" : ""}`}
                    >
                      <span className={isToday ? "font-bold text-primary" : ""}>{day}</span>
                      <div className="mt-1 flex flex-wrap justify-center gap-0.5">
                        {dayEvents.slice(0, 3).map((e) => (
                          <div
                            key={e.id}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: e.subject ? SUBJECT_COLORS[e.subject] : "hsl(var(--primary))" }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected date events */}
          {selectedDate && (
            <Card className="glass-card mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric" })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedDateEvents.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">No events on this day</p>
                ) : (
                  selectedDateEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
                      <div className="flex items-center gap-3">
                        <Checkbox checked={event.completed} onCheckedChange={() => toggleComplete(event.id)} />
                        <div className={event.completed ? "line-through opacity-50" : ""}>
                          <p className="text-sm font-medium">{event.title}</p>
                          {event.description && <p className="text-xs text-muted-foreground">{event.description}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">{event.type}</Badge>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteEvent(event.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Homework Checklist */}
          <Card className="glass-card">
            <CardHeader className="pb-2"><CardTitle className="text-lg">📝 Homework</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {homework.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">All caught up! 🎉</p>
              ) : (
                homework.slice(0, 8).map((hw) => (
                  <div key={hw.id} className="flex items-center gap-3 rounded-lg bg-secondary/30 p-2">
                    <Checkbox checked={hw.completed} onCheckedChange={() => toggleComplete(hw.id)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{hw.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(hw.date).toLocaleDateString()}</p>
                    </div>
                    {hw.subject && (
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: SUBJECT_COLORS[hw.subject] }} />
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Exam Countdowns */}
          <Card className="glass-card">
            <CardHeader className="pb-2"><CardTitle className="text-lg">📊 Exam Countdown</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {upcomingTests.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No upcoming tests</p>
              ) : (
                upcomingTests.map((test) => {
                  const daysUntil = Math.ceil((new Date(test.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={test.id} className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
                      <div>
                        <p className="text-sm font-medium">{test.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(test.date).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={daysUntil <= 3 ? "destructive" : "secondary"}>
                        {daysUntil === 0 ? "Today!" : `${daysUntil}d`}
                      </Badge>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
