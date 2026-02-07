import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Target, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Expense, SavingsGoal, SpendingLimit, ExpenseCategory } from "@/lib/types";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const PIE_COLORS = ["hsl(252,85%,63%)", "hsl(168,70%,42%)", "hsl(32,95%,55%)", "hsl(350,80%,58%)", "hsl(200,80%,55%)"];

export default function Expenses() {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>("studyhub-expenses", []);
  const [goals, setGoals] = useLocalStorage<SavingsGoal[]>("studyhub-savings-goals", []);
  const [limits, setLimits] = useLocalStorage<SpendingLimit[]>("studyhub-spending-limits", []);
  const [addOpen, setAddOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);

  // New expense form state
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState<ExpenseCategory>("food");
  const [newDesc, setNewDesc] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);

  const addExpense = () => {
    if (!newAmount) return;
    const expense: Expense = {
      id: crypto.randomUUID(),
      amount: parseFloat(newAmount),
      category: newCategory,
      description: newDesc,
      date: newDate,
    };
    setExpenses((prev) => [...prev, expense]);
    setNewAmount("");
    setNewDesc("");
    setAddOpen(false);
  };

  const deleteExpense = (id: string) => setExpenses((prev) => prev.filter((e) => e.id !== id));

  // Monthly data
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthlyExpenses = expenses.filter((e) => e.date.startsWith(thisMonth));
  const monthlyTotal = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryData = EXPENSE_CATEGORIES.map((cat) => ({
    name: cat.label,
    value: monthlyExpenses.filter((e) => e.category === cat.value).reduce((sum, e) => sum + e.amount, 0),
    icon: cat.icon,
  })).filter((d) => d.value > 0);

  // Last 6 months bar chart
  const monthlyBarData: { month: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleString("default", { month: "short" });
    monthlyBarData.push({
      month: label,
      total: expenses.filter((e) => e.date.startsWith(key)).reduce((sum, e) => sum + e.amount, 0),
    });
  }

  // New goal form
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");

  const addGoal = () => {
    if (!newGoalName || !newGoalTarget) return;
    setGoals((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: newGoalName, targetAmount: parseFloat(newGoalTarget), currentAmount: 0 },
    ]);
    setNewGoalName("");
    setNewGoalTarget("");
    setGoalOpen(false);
  };

  const updateGoalAmount = (id: string, amount: number) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, currentAmount: Math.min(amount, g.targetAmount) } : g)));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">Track your spending and savings</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Target className="mr-2 h-4 w-4" /> Savings Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Savings Goal</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Goal Name</Label>
                  <Input value={newGoalName} onChange={(e) => setNewGoalName(e.target.value)} placeholder="e.g., New Laptop" />
                </div>
                <div>
                  <Label>Target Amount ($)</Label>
                  <Input type="number" value={newGoalTarget} onChange={(e) => setNewGoalTarget(e.target.value)} placeholder="500" />
                </div>
                <Button onClick={addGoal} className="w-full gradient-primary text-primary-foreground">Create Goal</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Amount ($)</Label>
                  <Input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={newCategory} onValueChange={(v) => setNewCategory(v as ExpenseCategory)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="What was it for?" />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                </div>
                <Button onClick={addExpense} className="w-full gradient-primary text-primary-foreground">Add Expense</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center p-6">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-4xl font-bold text-gradient">${monthlyTotal.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm">By Category</CardTitle></CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} innerRadius={30}>
                    {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-[140px] items-center justify-center text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Spending Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={monthlyBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Savings Goals */}
      {goals.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Savings Goals</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <Card key={goal.id} className="glass-card">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{goal.name}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => setGoals((prev) => prev.filter((g) => g.id !== goal.id))}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Progress value={(goal.currentAmount / goal.targetAmount) * 100} />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">${goal.currentAmount.toFixed(2)}</span>
                    <span className="font-medium">${goal.targetAmount.toFixed(2)}</span>
                  </div>
                  <Input
                    type="number"
                    placeholder="Update saved amount"
                    className="h-8"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        updateGoalAmount(goal.id, parseFloat((e.target as HTMLInputElement).value) || 0);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Expenses */}
      <Card className="glass-card">
        <CardHeader><CardTitle className="text-lg">Recent Expenses</CardTitle></CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No expenses yet. Add one!</p>
          ) : (
            <div className="space-y-2">
              {[...expenses]
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 20)
                .map((exp) => {
                  const cat = EXPENSE_CATEGORIES.find((c) => c.value === exp.category);
                  return (
                    <div key={exp.id} className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{cat?.icon}</span>
                        <div>
                          <p className="text-sm font-medium">{exp.description || cat?.label}</p>
                          <p className="text-xs text-muted-foreground">{new Date(exp.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-destructive">-${exp.amount.toFixed(2)}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteExpense(exp.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
