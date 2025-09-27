"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Question } from "@/lib/types"
import { ArrowLeft, Eye } from "lucide-react"

export default function PreviewPage() {
  const router = useRouter()
  const [surveyData, setSurveyData] = useState<any>(null)
  const [responses, setResponses] = useState<Record<string, any>>({})

  useEffect(() => {
    const data = localStorage.getItem("previewSurvey")
    if (data) {
      setSurveyData(JSON.parse(data))
    } else {
      router.push("/builder")
    }
  }, [router])

  if (!surveyData) {
    return <div>Loading...</div>
  }

  const handleInputChange = (questionId: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const renderQuestion = (question: Question) => {
    const value = responses[question.id]

    switch (question.type) {
      case "text":
        return (
          <Input
            value={value || ""}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder="Your answer"
          />
        )

      case "textarea":
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            placeholder="Your answer"
            className="min-h-[100px]"
          />
        )

      case "select":
        return (
          <Select value={value || ""} onValueChange={(val) => handleInputChange(question.id, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "radio":
        return (
          <RadioGroup value={value || ""} onValueChange={(val) => handleInputChange(question.id, val)}>
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "checkbox":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={(value || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValues = value || []
                    if (checked) {
                      handleInputChange(question.id, [...currentValues, option])
                    } else {
                      handleInputChange(
                        question.id,
                        currentValues.filter((v: string) => v !== option),
                      )
                    }
                  }}
                />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        )

      case "rating":
        return (
          <RadioGroup value={value || ""} onValueChange={(val) => handleInputChange(question.id, val)}>
            <div className="flex space-x-4">
              {question.options?.map((option) => (
                <div key={option} className="flex flex-col items-center space-y-2">
                  <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                  <Label htmlFor={`${question.id}-${option}`} className="text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Builder
            </Button>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>Preview Mode</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Survey Preview</h1>
          <p className="text-muted-foreground">This is how your survey will appear to respondents</p>
        </div>

        {/* Preview */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{surveyData.surveyName}</CardTitle>
              <CardDescription className="text-base">{surveyData.surveyDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {surveyData.questions.map((question: Question, index: number) => (
                  <div key={question.id} className="space-y-3">
                    <Label className="text-base font-medium">
                      {index + 1}. {question.text}
                      {question.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {renderQuestion(question)}
                  </div>
                ))}

                <div className="pt-6 border-t">
                  <Button className="w-full" size="lg" disabled>
                    Submit Feedback (Preview Mode)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
