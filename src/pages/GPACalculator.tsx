import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Semester, Course } from "@/lib/types";
import { GRADE_POINTS } from "@/lib/constants";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const GRADES = Object.keys(GRADE_POINTS);

function calcGPA(courses: Course[], weighted: boolean) {
  if (courses.length === 0) return 0;
  const totalPoints = courses.reduce((sum, c) => {
    const base = GRADE_POINTS[c.grade] || 0;
    const bonus = weighted ? (c.isAP ? 1 : c.isHonors ? 0.5 : 0) : 0;
    return sum + (base + bonus) * c.creditHours;
  }, 0);
  const totalCredits = courses.reduce((sum, c) => sum + c.creditHours, 0);
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

export default function GPACalculator() {
  const [semesters, setSemesters] = useLocalStorage<Semester[]>("studyhub-semesters", []);
  const [weighted, setWeighted] = useState(true);
  const [activeSemester, setActiveSemester] = useState<string | null>(semesters[0]?.id || null);

  const addSemester = () => {
    const sem: Semester = {
      id: crypto.randomUUID(),
      name: `Semester ${semesters.length + 1}`,
      year: new Date().getFullYear().toString(),
      courses: [],
    };
    setSemesters((prev) => [...prev, sem]);
    setActiveSemester(sem.id);
  };

  const deleteSemester = (id: string) => {
    setSemesters((prev) => prev.filter((s) => s.id !== id));
    if (activeSemester === id) setActiveSemester(null);
  };

  const addCourse = (semId: string) => {
    const course: Course = {
      id: crypto.randomUUID(),
      name: "",
      grade: "A",
      creditHours: 1,
      isHonors: false,
      isAP: false,
      semester: semId,
    };
    setSemesters((prev) =>
      prev.map((s) => (s.id === semId ? { ...s, courses: [...s.courses, course] } : s))
    );
  };

  const updateCourse = (semId: string, courseId: string, updates: Partial<Course>) => {
    setSemesters((prev) =>
      prev.map((s) =>
        s.id === semId
          ? { ...s, courses: s.courses.map((c) => (c.id === courseId ? { ...c, ...updates } : c)) }
          : s
      )
    );
  };

  const deleteCourse = (semId: string, courseId: string) => {
    setSemesters((prev) =>
      prev.map((s) =>
        s.id === semId ? { ...s, courses: s.courses.filter((c) => c.id !== courseId) } : s
      )
    );
  };

  const allCourses = semesters.flatMap((s) => s.courses);
  const cumulativeGPA = calcGPA(allCourses, weighted);

  const trendData = semesters.map((s) => ({
    name: s.name,
    gpa: Number(calcGPA(s.courses, weighted).toFixed(2)),
  }));

  const currentSemester = semesters.find((s) => s.id === activeSemester);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">GPA Calculator</h1>
          <p className="text-muted-foreground">Track your grades across semesters</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm">Weighted</Label>
            <Switch checked={weighted} onCheckedChange={setWeighted} />
          </div>
          <Button onClick={addSemester} className="gradient-primary text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" /> Add Semester
          </Button>
        </div>
      </div>

      {/* GPA Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-sm text-muted-foreground">Cumulative GPA</p>
            <p className="text-5xl font-bold text-gradient">{cumulativeGPA > 0 ? cumulativeGPA.toFixed(2) : "—"}</p>
            <Badge variant="outline" className="mt-2">{weighted ? "Weighted" : "Unweighted"}</Badge>
          </CardContent>
        </Card>

        <Card className="glass-card md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" /> GPA Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis domain={[0, 5]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Line type="monotone" dataKey="gpa" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-[160px] items-center justify-center text-sm text-muted-foreground">Add semesters to see trends</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Semesters */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Semester List */}
        <div className="space-y-2">
          {semesters.map((sem) => (
            <Card
              key={sem.id}
              className={`glass-card cursor-pointer transition-all hover:scale-[1.01] ${
                activeSemester === sem.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setActiveSemester(sem.id)}
            >
              <CardContent className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-medium">{sem.name}</p>
                  <p className="text-xs text-muted-foreground">
                    GPA: {calcGPA(sem.courses, weighted).toFixed(2)} • {sem.courses.length} courses
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); deleteSemester(sem.id); }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {semesters.length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">No semesters yet</p>
          )}
        </div>

        {/* Courses */}
        <div className="lg:col-span-3">
          {currentSemester ? (
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <Input
                    value={currentSemester.name}
                    onChange={(e) =>
                      setSemesters((prev) =>
                        prev.map((s) => (s.id === currentSemester.id ? { ...s, name: e.target.value } : s))
                      )
                    }
                    className="border-none bg-transparent text-lg font-bold focus-visible:ring-0 h-8 p-0"
                  />
                  <p className="text-sm text-muted-foreground">
                    Semester GPA: {calcGPA(currentSemester.courses, weighted).toFixed(2)}
                  </p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => addCourse(currentSemester.id)}>
                  <Plus className="mr-1 h-4 w-4" /> Add Course
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentSemester.courses.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">Add courses to calculate GPA</p>
                  ) : (
                    <>
                      <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
                        <div className="col-span-4">Course Name</div>
                        <div className="col-span-2">Grade</div>
                        <div className="col-span-2">Credits</div>
                        <div className="col-span-1">Honors</div>
                        <div className="col-span-1">AP</div>
                        <div className="col-span-1">Points</div>
                        <div className="col-span-1"></div>
                      </div>
                      {currentSemester.courses.map((course) => {
                        const base = GRADE_POINTS[course.grade] || 0;
                        const bonus = weighted ? (course.isAP ? 1 : course.isHonors ? 0.5 : 0) : 0;
                        return (
                          <div key={course.id} className="grid grid-cols-12 items-center gap-2 rounded-lg bg-secondary/30 p-2">
                            <div className="col-span-12 sm:col-span-4">
                              <Input
                                value={course.name}
                                onChange={(e) => updateCourse(currentSemester.id, course.id, { name: e.target.value })}
                                placeholder="Course name"
                                className="h-8"
                              />
                            </div>
                            <div className="col-span-4 sm:col-span-2">
                              <Select
                                value={course.grade}
                                onValueChange={(v) => updateCourse(currentSemester.id, course.id, { grade: v })}
                              >
                                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-3 sm:col-span-2">
                              <Input
                                type="number"
                                min={0.5}
                                max={10}
                                step={0.5}
                                value={course.creditHours}
                                onChange={(e) => updateCourse(currentSemester.id, course.id, { creditHours: Number(e.target.value) })}
                                className="h-8"
                              />
                            </div>
                            <div className="col-span-1 flex justify-center">
                              <Switch
                                checked={course.isHonors}
                                onCheckedChange={(v) => updateCourse(currentSemester.id, course.id, { isHonors: v, isAP: v ? false : course.isAP })}
                              />
                            </div>
                            <div className="col-span-1 flex justify-center">
                              <Switch
                                checked={course.isAP}
                                onCheckedChange={(v) => updateCourse(currentSemester.id, course.id, { isAP: v, isHonors: v ? false : course.isHonors })}
                              />
                            </div>
                            <div className="col-span-1 text-center text-sm font-medium">
                              {(base + bonus).toFixed(1)}
                            </div>
                            <div className="col-span-1 flex justify-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteCourse(currentSemester.id, course.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card">
              <CardContent className="flex items-center justify-center py-20 text-muted-foreground">
                Select or create a semester
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
