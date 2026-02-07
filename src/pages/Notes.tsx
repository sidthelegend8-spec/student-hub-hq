import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Trash2, Tag, X, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Note, Subject } from "@/lib/types";
import { SUBJECTS, SUBJECT_COLORS } from "@/lib/constants";

const newNote = (subject: Subject): Note => ({
  id: crypto.randomUUID(),
  subject,
  title: "",
  content: "",
  tags: [],
  highlights: [],
  links: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export default function Notes() {
  const [notes, setNotes] = useLocalStorage<Note[]>("studyhub-notes", []);
  const [activeSubject, setActiveSubject] = useState<Subject>("math");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [studyMode, setStudyMode] = useState(false);

  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => n.subject === activeSubject)
      .filter((n) =>
        search === "" ||
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase()) ||
        n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, activeSubject, search]);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  const createNote = () => {
    const note = newNote(activeSubject);
    setNotes((prev) => [...prev, note]);
    setSelectedNoteId(note.id);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n))
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedNoteId === id) setSelectedNoteId(null);
  };

  const addTag = (noteId: string) => {
    if (!tagInput.trim()) return;
    const note = notes.find((n) => n.id === noteId);
    if (note && !note.tags.includes(tagInput.trim())) {
      updateNote(noteId, { tags: [...note.tags, tagInput.trim()] });
    }
    setTagInput("");
  };

  const removeTag = (noteId: string, tag: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      updateNote(noteId, { tags: note.tags.filter((t) => t !== tag) });
    }
  };

  // Study mode - fullscreen distraction-free
  if (studyMode && selectedNote) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{selectedNote.title || "Untitled"}</h2>
          <Button variant="outline" onClick={() => setStudyMode(false)}>
            <EyeOff className="mr-2 h-4 w-4" /> Exit Study Mode
          </Button>
        </div>
        <Textarea
          value={selectedNote.content}
          onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
          className="flex-1 resize-none border-none bg-transparent text-lg leading-relaxed focus-visible:ring-0"
          placeholder="Start writing..."
        />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="text-muted-foreground">Organize your study notes by subject</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-10"
            />
          </div>
          <Button onClick={createNote} className="gradient-primary text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" /> New Note
          </Button>
        </div>
      </div>

      <Tabs value={activeSubject} onValueChange={(v) => { setActiveSubject(v as Subject); setSelectedNoteId(null); }}>
        <TabsList className="grid w-full grid-cols-4">
          {SUBJECTS.map((s) => (
            <TabsTrigger key={s.value} value={s.value} className="gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: SUBJECT_COLORS[s.value] }} />
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{s.label.split(" ").pop()}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {SUBJECTS.map((s) => (
          <TabsContent key={s.value} value={s.value} className="mt-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Notes List */}
              <div className="space-y-2 lg:col-span-1">
                <AnimatePresence>
                  {filteredNotes.length === 0 ? (
                    <Card className="glass-card">
                      <CardContent className="py-8 text-center text-sm text-muted-foreground">
                        No notes yet. Create one!
                      </CardContent>
                    </Card>
                  ) : (
                    filteredNotes.map((note) => (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                      >
                        <Card
                          className={`glass-card cursor-pointer transition-all hover:scale-[1.01] ${
                            selectedNoteId === note.id ? "ring-2 ring-primary" : ""
                          }`}
                          onClick={() => setSelectedNoteId(note.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{note.title || "Untitled"}</p>
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                  {note.content || "Empty note"}
                                </p>
                                {note.tags.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {note.tags.slice(0, 3).map((tag) => (
                                      <Badge key={tag} variant="secondary" className="text-[10px]">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <p className="mt-2 text-[10px] text-muted-foreground">
                              {new Date(note.updatedAt).toLocaleString()}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Note Editor */}
              <div className="lg:col-span-2">
                {selectedNote ? (
                  <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <Input
                        value={selectedNote.title}
                        onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                        placeholder="Note title..."
                        className="border-none bg-transparent text-xl font-bold focus-visible:ring-0"
                      />
                      <Button variant="outline" size="sm" onClick={() => setStudyMode(true)}>
                        <Eye className="mr-2 h-4 w-4" /> Study Mode
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        value={selectedNote.content}
                        onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                        placeholder="Start writing your notes..."
                        className="min-h-[300px] resize-none border-none bg-transparent focus-visible:ring-0"
                      />
                      {/* Tags */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Tags</Label>
                        <div className="flex flex-wrap gap-1">
                          {selectedNote.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="gap-1">
                              {tag}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => removeTag(selectedNote.id, tag)}
                              />
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder="Add a tag..."
                            className="h-8"
                            onKeyDown={(e) => e.key === "Enter" && addTag(selectedNote.id)}
                          />
                          <Button size="sm" variant="secondary" onClick={() => addTag(selectedNote.id)}>
                            <Tag className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {/* Links */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Links</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a link..."
                            className="h-8"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
                                updateNote(selectedNote.id, {
                                  links: [...selectedNote.links, (e.target as HTMLInputElement).value],
                                });
                                (e.target as HTMLInputElement).value = "";
                              }
                            }}
                          />
                        </div>
                        {selectedNote.links.map((link, i) => (
                          <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="block text-xs text-primary hover:underline truncate">
                            {link}
                          </a>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground">Auto-saved • Last updated: {new Date(selectedNote.updatedAt).toLocaleString()}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="glass-card">
                    <CardContent className="flex items-center justify-center py-20 text-muted-foreground">
                      Select a note or create a new one
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  );
}
