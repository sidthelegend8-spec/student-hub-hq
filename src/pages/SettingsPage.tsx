import { motion } from "framer-motion";
import { Moon, Sun, Trash2, Download, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/useTheme";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  const clearAllData = () => {
    if (confirm("Are you sure? This will delete all your notes, GPA data, expenses, calendar events, and flashcards.")) {
      const keys = [
        "studyhub-notes", "studyhub-semesters", "studyhub-expenses",
        "studyhub-savings-goals", "studyhub-spending-limits", "studyhub-events",
        "studyhub-flashcards", "studyhub-quiz",
      ];
      keys.forEach((k) => localStorage.removeItem(k));
      window.location.reload();
    }
  };

  const exportData = () => {
    const keys = [
      "studyhub-notes", "studyhub-semesters", "studyhub-expenses",
      "studyhub-savings-goals", "studyhub-events", "studyhub-flashcards",
    ];
    const data: Record<string, unknown> = {};
    keys.forEach((k) => {
      const v = localStorage.getItem(k);
      if (v) data[k] = JSON.parse(v);
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `studyhub-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          Object.entries(data).forEach(([key, value]) => {
            localStorage.setItem(key, JSON.stringify(value));
          });
          window.location.reload();
        } catch {
          alert("Invalid backup file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Customize your StudyHub experience</p>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <div>
                <Label>Dark Mode</Label>
                <p className="text-xs text-muted-foreground">Toggle between light and dark theme</p>
              </div>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader><CardTitle>Data Management</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={exportData} className="flex-1">
              <Download className="mr-2 h-4 w-4" /> Export Data
            </Button>
            <Button variant="outline" onClick={importData} className="flex-1">
              <Upload className="mr-2 h-4 w-4" /> Import Data
            </Button>
          </div>
          <Button variant="destructive" onClick={clearAllData} className="w-full">
            <Trash2 className="mr-2 h-4 w-4" /> Clear All Data
          </Button>
          <p className="text-xs text-muted-foreground">
            All data is stored locally in your browser. Export your data to create a backup.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
