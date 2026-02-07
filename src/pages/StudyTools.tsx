import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Youtube, Link, Sparkles, Brain, MessageSquare, RotateCcw, CheckCircle2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Flashcard, QuizQuestion } from "@/lib/types";

export default function StudyTools() {
  const [flashcards, setFlashcards] = useLocalStorage<Flashcard[]>("studyhub-flashcards", []);
  const [quizQuestions, setQuizQuestions] = useLocalStorage<QuizQuestion[]>("studyhub-quiz", []);
  const [pastedContent, setPastedContent] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [activeTab, setActiveTab] = useState("upload");

  // Flashcard state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // Tutor state
  const [tutorMessages, setTutorMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Hi! I'm your AI tutor. Paste some notes or content above, then ask me questions about it! 📚" },
  ]);
  const [tutorInput, setTutorInput] = useState("");

  // Generate flashcards from pasted content
  const generateFlashcards = () => {
    if (!pastedContent.trim()) return;
    const lines = pastedContent.split("\n").filter((l) => l.trim());
    const cards: Flashcard[] = [];

    for (let i = 0; i < lines.length; i += 2) {
      if (lines[i]) {
        cards.push({
          id: crypto.randomUUID(),
          front: lines[i].trim(),
          back: lines[i + 1]?.trim() || "Add definition here",
          topic: "Generated",
        });
      }
    }

    if (cards.length === 0) {
      // Fallback: split by sentences
      const sentences = pastedContent.split(/[.!?]+/).filter((s) => s.trim().length > 10);
      sentences.slice(0, 10).forEach((s) => {
        cards.push({
          id: crypto.randomUUID(),
          front: s.trim().length > 50 ? s.trim().slice(0, 50) + "..." : s.trim(),
          back: s.trim(),
          topic: "Generated",
        });
      });
    }

    setFlashcards((prev) => [...prev, ...cards]);
    setActiveTab("flashcards");
  };

  // Generate quiz from pasted content
  const generateQuiz = () => {
    if (!pastedContent.trim()) return;
    const sentences = pastedContent.split(/[.!?]+/).filter((s) => s.trim().length > 15);
    const questions: QuizQuestion[] = sentences.slice(0, 5).map((s, i) => {
      const words = s.trim().split(" ");
      const keyWord = words[Math.floor(words.length / 2)] || words[0];
      return {
        id: crypto.randomUUID(),
        question: `Which of the following is related to: "${s.trim().slice(0, 60)}..."?`,
        options: [
          keyWord || "Option A",
          "Unrelated term",
          "Another topic",
          "None of the above",
        ],
        correctAnswer: 0,
        topic: "Generated",
      };
    });
    setQuizQuestions(questions);
    setActiveTab("quiz");
    setQuizStarted(false);
    setCurrentQuestion(0);
    setScore(0);
  };

  // Tutor chat
  const sendTutorMessage = () => {
    if (!tutorInput.trim()) return;
    const userMsg = tutorInput;
    setTutorMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setTutorInput("");

    // Simple response based on content
    setTimeout(() => {
      let response = "That's a great question! Based on the content you provided, ";
      if (pastedContent) {
        const relevant = pastedContent.split(/[.!?]+/).find((s) =>
          s.toLowerCase().includes(userMsg.toLowerCase().split(" ")[0])
        );
        if (relevant) {
          response += `here's what I found: "${relevant.trim()}"`;
        } else {
          response += "I'd recommend reviewing the key concepts in your notes. Try breaking down the topic into smaller parts!";
        }
      } else {
        response = "Please paste some study material above first, and then I can help you understand it better! 📝";
      }
      setTutorMessages((prev) => [...prev, { role: "bot", text: response }]);
    }, 500);
  };

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const answerQuestion = (index: number) => {
    setSelectedAnswer(index);
    if (index === quizQuestions[currentQuestion]?.correctAnswer) {
      setScore((prev) => prev + 1);
    }
    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Study Tools</h1>
        <p className="text-muted-foreground">Generate flashcards, quizzes, and get AI tutoring</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="gap-2"><Upload className="h-4 w-4" /> Upload</TabsTrigger>
          <TabsTrigger value="flashcards" className="gap-2"><RotateCcw className="h-4 w-4" /> Flashcards</TabsTrigger>
          <TabsTrigger value="quiz" className="gap-2"><CheckCircle2 className="h-4 w-4" /> Quiz</TabsTrigger>
          <TabsTrigger value="tutor" className="gap-2"><MessageSquare className="h-4 w-4" /> Tutor</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Paste Your Notes</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={pastedContent}
                onChange={(e) => setPastedContent(e.target.value)}
                placeholder="Paste your study notes, key terms, or any text content here...&#10;&#10;Tip: For best flashcards, put terms on odd lines and definitions on even lines."
                className="min-h-[200px]"
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={generateFlashcards} className="gradient-primary text-primary-foreground">
                  <Sparkles className="mr-2 h-4 w-4" /> Generate Flashcards
                </Button>
                <Button onClick={generateQuiz} variant="secondary">
                  <Brain className="mr-2 h-4 w-4" /> Generate Quiz
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader><CardTitle className="flex items-center gap-2"><Youtube className="h-5 w-5" /> YouTube Link</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input value={youtubeLink} onChange={(e) => setYoutubeLink(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
              <p className="text-xs text-muted-foreground">YouTube processing will be available with AI integration</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader><CardTitle className="flex items-center gap-2"><Link className="h-5 w-5" /> External Links</CardTitle></CardHeader>
            <CardContent>
              <Input placeholder="Paste Quizlet, Google Slides, or other study links..." />
              <p className="mt-2 text-xs text-muted-foreground">Link import will be available with AI integration</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flashcards Tab */}
        <TabsContent value="flashcards" className="mt-4">
          {flashcards.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <RotateCcw className="mb-4 h-12 w-12 text-muted-foreground/30" />
                <p className="text-lg font-medium">No flashcards yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Paste content in the Upload tab to generate flashcards</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Card {currentCardIndex + 1} of {flashcards.length}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => { setFlashcards([]); setCurrentCardIndex(0); }}
                >
                  Clear All
                </Button>
              </div>

              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="cursor-pointer perspective-1000"
              >
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Card className="glass-card min-h-[250px]">
                    <CardContent className="flex flex-col items-center justify-center p-8 min-h-[250px]">
                      <Badge variant="outline" className="mb-4">{isFlipped ? "Answer" : "Question"}</Badge>
                      <p className="text-center text-xl font-medium">
                        {isFlipped ? flashcards[currentCardIndex]?.back : flashcards[currentCardIndex]?.front}
                      </p>
                      <p className="mt-4 text-xs text-muted-foreground">Click to flip</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={prevCard}>Previous</Button>
                <Button onClick={nextCard} className="gradient-primary text-primary-foreground">Next</Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Quiz Tab */}
        <TabsContent value="quiz" className="mt-4">
          {quizQuestions.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 className="mb-4 h-12 w-12 text-muted-foreground/30" />
                <p className="text-lg font-medium">No quiz questions yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Paste content in the Upload tab to generate a quiz</p>
              </CardContent>
            </Card>
          ) : !quizStarted ? (
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Brain className="mb-4 h-12 w-12 text-primary" />
                <p className="text-lg font-medium">{quizQuestions.length} Questions Ready</p>
                <Button onClick={() => { setQuizStarted(true); setCurrentQuestion(0); setScore(0); setShowResult(false); }} className="mt-4 gradient-primary text-primary-foreground">
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          ) : showResult ? (
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-5xl font-bold text-gradient">{score}/{quizQuestions.length}</p>
                <p className="mt-2 text-lg">
                  {score === quizQuestions.length ? "Perfect! 🎉" : score > quizQuestions.length / 2 ? "Great job! 👏" : "Keep studying! 💪"}
                </p>
                <Button onClick={() => { setQuizStarted(true); setCurrentQuestion(0); setScore(0); setShowResult(false); setSelectedAnswer(null); }} className="mt-4" variant="outline">
                  Retry Quiz
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Question {currentQuestion + 1}/{quizQuestions.length}</Badge>
                  <Badge>Score: {score}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg font-medium">{quizQuestions[currentQuestion]?.question}</p>
                <div className="space-y-2">
                  {quizQuestions[currentQuestion]?.options.map((option, i) => (
                    <Button
                      key={i}
                      variant={selectedAnswer === null ? "outline" : i === quizQuestions[currentQuestion].correctAnswer ? "default" : selectedAnswer === i ? "destructive" : "outline"}
                      className="w-full justify-start text-left"
                      onClick={() => selectedAnswer === null && answerQuestion(i)}
                      disabled={selectedAnswer !== null}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tutor Tab */}
        <TabsContent value="tutor" className="mt-4">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" /> AI Study Tutor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-[400px] space-y-3 overflow-y-auto rounded-lg bg-secondary/30 p-4">
                {tutorMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                      msg.role === "user"
                        ? "gradient-primary text-primary-foreground"
                        : "bg-card border border-border"
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tutorInput}
                  onChange={(e) => setTutorInput(e.target.value)}
                  placeholder="Ask a question about your study material..."
                  onKeyDown={(e) => e.key === "Enter" && sendTutorMessage()}
                />
                <Button onClick={sendTutorMessage} className="gradient-primary text-primary-foreground">Send</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
