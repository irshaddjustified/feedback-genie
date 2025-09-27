"use client"

import { useState, useTransition } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { surveyTemplates } from "@/lib/mock-data"
import { generateSurveyFromPrompt } from "@/lib/ai-service"
import type { Question, SurveyTemplate } from "@/lib/types"
import { Plus, Trash2, Sparkles, Save, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

export default function FormBuilder() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<SurveyTemplate | null>(null)
  const [surveyName, setSurveyName] = useState("")
  const [surveyDescription, setSurveyDescription] = useState("")
  const [surveyType, setSurveyType] = useState<"client-project" | "event-feedback">("client-project")
  const [questions, setQuestions] = useState<Question[]>([])
  const [aiPrompt, setAiPrompt] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleTemplateSelect = (template: SurveyTemplate) => {
    setSelectedTemplate(template)
    setSurveyName(template.name)
    setSurveyDescription(template.description)
    setSurveyType(template.type)
    setQuestions(template.questions.map((q, i) => ({ ...q, id: `q${i + 1}` })))
  }

  const handleAiGenerate = () => {
    if (!aiPrompt.trim()) return

    startTransition(async () => {
      try {
        const template = await generateSurveyFromPrompt(aiPrompt, surveyType)
        setSurveyName(template.name)
        setSurveyDescription(template.description)
        setQuestions(template.questions.map((q, i) => ({ ...q, id: `q${i + 1}` })))
        setAiPrompt("")
      } catch (error) {
        console.error("Error generating survey:", error)
      }
    })
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q${questions.length + 1}`,
      type: "text",
      text: "",
      required: false,
      order: questions.length + 1,
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)))
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const handleSave = () => {
    // In a real app, this would save to the database
    console.log("Saving survey:", { surveyName, surveyDescription, surveyType, questions })
    alert("Survey saved successfully!")
  }

  const handlePreview = () => {
    // Store survey data in localStorage for preview
    const surveyData = { surveyName, surveyDescription, surveyType, questions }
    localStorage.setItem("previewSurvey", JSON.stringify(surveyData))
    router.push("/preview")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">Form Builder</h1>
          <p className="text-muted-foreground">Create configurable feedback forms with AI assistance</p>
        </div>

        {/* AI Generation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>AI Form Generator</span>
            </CardTitle>
            <CardDescription>Describe what kind of survey you want and let AI create it for you</CardDescription>
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
                {isPending ? "Generating..." : "Generate Survey with AI"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Templates */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Start Templates</CardTitle>
            <CardDescription>Choose from pre-built survey templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {surveyTemplates.map((template, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{template.name}</h3>
                    <Badge variant="outline">{template.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 text-pretty">{template.description}</p>
                  <p className="text-xs text-muted-foreground">{template.questions.length} questions</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Survey Builder */}
        <Card>
          <CardHeader>
            <CardTitle>Survey Configuration</CardTitle>
            <CardDescription>Customize your survey details and questions</CardDescription>
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
                </div>
                <div>
                  <Label htmlFor="survey-description">Description</Label>
                  <Textarea
                    id="survey-description"
                    value={surveyDescription}
                    onChange={(e) => setSurveyDescription(e.target.value)}
                    placeholder="Describe the purpose of this survey"
                  />
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
                          onValueChange={(value) => updateQuestion(question.id, { type: value as Question["type"] })}
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
                          onCheckedChange={(checked) => updateQuestion(question.id, { required: !!checked })}
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
                      />
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
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex space-x-4 pt-6 border-t">
                <Button onClick={handleSave} disabled={!surveyName || questions.length === 0}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Survey
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
  )
}
