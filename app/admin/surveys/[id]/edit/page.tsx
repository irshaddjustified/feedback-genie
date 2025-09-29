"use client";

import { useState, useTransition, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { generateSurveyFromPrompt } from "@/lib/ai-service";
import type { Question } from "@/lib/types";
import { Plus, Trash2, Sparkles, Save, Eye, ArrowLeft, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "sonner";

export default function EditSurvey() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.id as string;

  const [surveyName, setSurveyName] = useState("");
  const [surveyDescription, setSurveyDescription] = useState("");
  const [surveySlug, setSurveySlug] = useState("");
  const [surveyType, setSurveyType] = useState<"client-project" | "event-feedback">("client-project");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [errors, setErrors] = useState<{
    surveyName?: string;
    surveyDescription?: string;
    surveySlug?: string;
    questions?: Record<string, { text?: string; options?: string }>;
  }>({});

  // Load existing survey data
  useEffect(() => {
    const loadSurvey = async () => {
      try {
        setIsLoading(true);

        // Try to find by document ID first
        let surveyDoc = await getDoc(doc(db, "surveys", surveyId));

        // If not found by doc ID, try to find by survey ID field
        if (!surveyDoc.exists()) {
          const q = query(collection(db, "surveys"), where("id", "==", surveyId));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            surveyDoc = querySnapshot.docs[0];
          }
        }

        if (surveyDoc.exists()) {
          const data = surveyDoc.data();
          setSurveyName(data.surveyName || "");
          setSurveyDescription(data.surveyDescription || "");
          setSurveySlug(data.surveySlug || data.id || "");
          setSurveyType(data.surveyType || "client-project");
          setQuestions(data.questions || []);
          setAuthRequired(data.authenticationRequired || false);
        } else {
          toast.error("Survey not found");
          router.push("/admin/surveys");
        }
      } catch (error) {
        console.error("Error loading survey:", error);
        toast.error("Failed to load survey");
        router.push("/admin/surveys");
      } finally {
        setIsLoading(false);
      }
    };

    if (surveyId) {
      loadSurvey();
    }
  }, [surveyId, router]);

  const validateForm = () => {
    const newErrors: {
      surveyName?: string;
      surveyDescription?: string;
      surveySlug?: string;
      questions?: Record<string, { text?: string; options?: string }>;
    } = {};

    if (!surveyName.trim()) {
      newErrors.surveyName = "Survey name is required";
    }

    if (!surveyDescription.trim()) {
      newErrors.surveyDescription = "Description is required";
    }

    if (!surveySlug.trim()) {
      newErrors.surveySlug = "URL slug is required";
    } else if (!/^[a-z0-9-]+$/.test(surveySlug)) {
      newErrors.surveySlug = "URL slug can only contain lowercase letters, numbers, and hyphens";
    }

    const qErrors: Record<string, { text?: string; options?: string }> = {};
    questions.forEach((q) => {
      const qe: { text?: string; options?: string } = {};
      if (!q.text?.trim()) {
        qe.text = "Question text is required";
      }
      if (q.type === "select" || q.type === "radio" || q.type === "checkbox") {
        const opts = q.options || [];
        if (opts.length === 0) {
          qe.options = "At least one option is required";
        }
      }
      if (Object.keys(qe).length > 0) {
        qErrors[q.id] = qe;
      }
    });

    if (Object.keys(qErrors).length > 0) {
      newErrors.questions = qErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-generate slug from survey name
  const generateSlugFromName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
  };

  const formHasBlockingIssues = () => {
    if (!surveyName.trim()) return true;
    if (!surveyDescription.trim()) return true;
    if (!surveySlug.trim()) return true;
    if (questions.length === 0) return true;
    for (const q of questions) {
      if (!q.text?.trim()) return true;
      if ((q.type === "select" || q.type === "radio" || q.type === "checkbox") && (!q.options || q.options.length === 0)) {
        return true;
      }
    }
    return false;
  };

  const handleAiGenerate = () => {
    if (!aiPrompt.trim()) return;

    startTransition(async () => {
      try {
        const template = await generateSurveyFromPrompt(aiPrompt, surveyType);
        setSurveyName(template.name);
        setSurveyDescription(template.description);
        setSurveySlug(generateSlugFromName(template.name));
        setQuestions(template.questions.map((q, i) => ({ ...q, id: `q${i + 1}` })));
        setAiPrompt("");
      } catch (error) {
        console.error("Error generating survey:", error);
        toast.error("Failed to generate survey with AI");
      }
    });
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q${questions.length + 1}`,
      type: "text",
      text: "",
      required: false,
      order: questions.length + 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSave = async () => {
    // Validate before proceeding
    const ok = validateForm();
    if (!ok) {
      return;
    }

    setIsSaving(true);

    try {
      const surveyData = {
        surveyName: surveyName,
        surveyDescription: surveyDescription,
        surveySlug: surveySlug,
        surveyType: surveyType,
        questions: questions,
        authenticationRequired: authRequired,
        updatedAt: new Date(),
      };

      // Update the document
      await updateDoc(doc(db, "surveys", surveyId), surveyData);

      toast.success("Survey updated successfully!");
      router.push("/admin/surveys");
    } catch (error) {
      console.error('Error updating survey:', error);
      toast.error("Error updating survey. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    // Store survey data in localStorage for preview
    const surveyData = {
      surveyName,
      surveyDescription,
      surveyType,
      questions,
      authenticationRequired: authRequired,
      surveySlug
    };
    localStorage.setItem("previewSurvey", JSON.stringify(surveyData));
    router.push("/preview");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading survey...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">Edit Survey</h1>
            <p className="text-muted-foreground">Update your survey details and questions</p>
          </div>
        </div>

        {/* AI Generation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>AI Survey Generator</span>
            </CardTitle>
            <CardDescription>Replace current survey with AI-generated content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="survey-type">Survey Type</Label>
                  <Select
                    value={surveyType}
                    onValueChange={(value: "client-project" | "event-feedback") => setSurveyType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client-project">Client Project Feedback</SelectItem>
                      <SelectItem value="event-feedback">Event Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="ai-prompt">Describe your survey</Label>
                <Textarea
                  id="ai-prompt"
                  placeholder="e.g., 'Create a survey to collect feedback on our mobile app redesign project, focusing on usability and design satisfaction'"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <Button onClick={handleAiGenerate} disabled={isPending || !aiPrompt.trim()} className="w-full">
                {isPending ? "Generating..." : "Replace with AI Generated Survey"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Survey Builder */}
        <Card>
          <CardHeader>
            <CardTitle>Survey Configuration</CardTitle>
            <CardDescription>Update your survey details and questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="survey-name">Survey Name</Label>
                  <Input
                    id="survey-name"
                    value={surveyName}
                    onChange={(e) => setSurveyName(e.target.value)}
                    placeholder="Enter survey name"
                  />
                  {errors.surveyName && (
                    <p className="text-sm text-red-500 mt-1">{errors.surveyName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="survey-description">Description</Label>
                  <Textarea
                    id="survey-description"
                    value={surveyDescription}
                    onChange={(e) => setSurveyDescription(e.target.value)}
                    placeholder="Describe the purpose of this survey"
                  />
                  {errors.surveyDescription && (
                    <p className="text-sm text-red-500 mt-1">{errors.surveyDescription}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="survey-slug">Custom URL (Slug)</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">yourdomain.com/survey/</span>
                    <Input
                      id="survey-slug"
                      value={surveySlug}
                      onChange={(e) => setSurveySlug(e.target.value)}
                      placeholder="my-survey-name"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSurveySlug(generateSlugFromName(surveyName))}
                      disabled={!surveyName.trim()}
                    >
                      Generate
                    </Button>
                  </div>
                  {errors.surveySlug && (
                    <p className="text-sm text-red-500 mt-1">{errors.surveySlug}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Only lowercase letters, numbers, and hyphens allowed
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="auth-required"
                    checked={authRequired}
                    onCheckedChange={(checked: boolean) => setAuthRequired(checked)}
                  />
                  <Label htmlFor="auth-required">Authentication required</Label>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Questions</h3>
                  <Button onClick={addQuestion} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>

                {questions.map((question, index) => (
                  <div key={question.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Question {index + 1}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeQuestion(question.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Question Type</Label>
                        <Select
                          value={question.type}
                          onValueChange={(value: Question["type"]) => updateQuestion(question.id, { type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Short Text</SelectItem>
                            <SelectItem value="textarea">Long Text</SelectItem>
                            <SelectItem value="select">Dropdown</SelectItem>
                            <SelectItem value="radio">Multiple Choice</SelectItem>
                            <SelectItem value="checkbox">Checkboxes</SelectItem>
                            <SelectItem value="rating">Rating Scale</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`required-${question.id}`}
                          checked={question.required}
                          onCheckedChange={(checked: boolean) => updateQuestion(question.id, { required: checked })}
                        />
                        <Label htmlFor={`required-${question.id}`}>Required</Label>
                      </div>
                    </div>
                    <div>
                      <Label>Question Text</Label>
                      <Input
                        value={question.text}
                        onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                        placeholder="Enter your question"
                        className={errors.questions?.[question.id]?.text ? "border-red-500" : ""}
                      />
                      {errors.questions?.[question.id]?.text && (
                        <p className="text-sm text-red-500 mt-1">{errors.questions?.[question.id]?.text}</p>
                      )}
                    </div>

                    {(question.type === "select" || question.type === "radio" || question.type === "checkbox") && (
                      <div>
                        <Label>Options (one per line)</Label>
                        <Textarea
                          value={question.options?.join("\n") || ""}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              options: e.target.value.split("\n").filter((opt) => opt.trim()),
                            })
                          }
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                          className={errors.questions?.[question.id]?.options ? "border-red-500" : ""}
                        />
                        {errors.questions?.[question.id]?.options && (
                          <p className="text-sm text-red-500 mt-1">{errors.questions?.[question.id]?.options}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex space-x-4 pt-6 border-t">
                <Button onClick={handleSave} disabled={formHasBlockingIssues() || isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Updating..." : "Update Survey"}
                </Button>
                <Button variant="outline" onClick={handlePreview} disabled={!surveyName || questions.length === 0}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}