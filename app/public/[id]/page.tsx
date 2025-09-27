"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { analyzeSentiment } from "@/lib/ai-service"
import type { Question } from "@/lib/types"
import { Sparkles, Send, CheckCircle } from "lucide-react"
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { v4 as uuidv4 } from 'uuid';

export default function PublicSurvey() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params.id as string

  const [responses, setResponses] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [survey, setSurvey] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionUser, setSessionUser] = useState<{ uid: string; name: string | null; email: string | null; photoURL: string | null } | null>(null)
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true)

  // Load survey from Firestore (by 'id' field, not doc ID)
  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const q = query(collection(db, "surveys"), where("id", "==", surveyId))
        const snap = await getDocs(q)
        if (!snap.empty) {
          const d = snap.docs[0]
          setSurvey({ id: d.id, ...d.data() })
        } else {
          setSurvey(null)
        }

        console.log("Loaded survey by field id:", surveyId)
      } catch (e) {
        console.error("Failed to load survey:", e)
        setSurvey(null)
      } finally {
        setLoading(false)
      }
    }
    if (surveyId) fetchSurvey()
  }, [surveyId])

  // Load session user from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sessionUser")
      setSessionUser(raw ? JSON.parse(raw) : null)
    } catch (e) {
      setSessionUser(null)
    }
  }, [])
  // If survey requires authentication and user is not logged in, redirect to auth
  useEffect(() => {
    if (!loading && survey && survey.authenticationRequired && !sessionUser) {
      router.push(`/public/auth?redirect=${encodeURIComponent(`/public/${survey.id}`)}`)
    }
  }, [loading, survey, sessionUser, router])

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch {}
    localStorage.removeItem("sessionUser")
    router.push(`/public/auth?redirect=${encodeURIComponent(`/public/${survey?.id ?? surveyId}`)}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">Loading survey...</CardContent>
        </Card>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Survey Not Found</h2>
            <p className="text-muted-foreground">The survey you're looking for doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleInputChange = (questionId: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Analyze sentiment of text responses
      const textResponses = Object.entries(responses)
        .filter(([questionId, value]) => {
          const question = survey.questions.find((q: Question) => q.id === questionId)
          return question && (question.type === "text" || question.type === "textarea") && value
        })
        .map(([, value]) => value)
        .join(" ")

      const sentiment = textResponses ? await analyzeSentiment(textResponses) : "neutral"

      // Determine anonymity
      const requiresAuth = !!survey.authenticationRequired
      const isAnon = requiresAuth ? true : (isAnonymous || !sessionUser)

      // In a real app, this would save to the database
      const newResponse = {
        id: uuidv4(),
        surveyId: survey.id,
        surveyName: survey.surveyName,
        surveyType: survey.surveyType,
        responderUid: isAnon ? null : (sessionUser?.uid || null),
        isAnonymous: isAnon,
        data: responses,
        sentiment,
        submittedAt: new Date(),
      }

      console.log("New response:", newResponse)

      try {
        const docRef = await addDoc(collection(db, "responses"), newResponse);
        console.log("Document successfully written with ID: ", docRef.id);
        setIsSubmitted(true)
      } catch (e) {
        console.error("Error adding document: ", e);
        throw new Error("Failed to submit survey response.");
      }
    } catch (error) {
      console.error("Error submitting response:", error)
    } finally {
      setIsSubmitting(false)
    }
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

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-4">
              Your feedback has been submitted successfully. We appreciate your time and input.
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="w-full flex items-center justify-end gap-3">
          {sessionUser && (
            <>
              <span className="text-sm text-muted-foreground">{sessionUser.name || sessionUser.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>Log out</Button>
            </>
          )}
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-4">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-primary">FeedbackGenie</span>
            </div>
            <CardTitle className="text-2xl">{survey.surveyName}</CardTitle>
            <CardDescription className="text-base">{survey.surveyDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Anonymous option: only when authenticated is optional and user is signed in */}
              {sessionUser && !survey.authenticationRequired && (
                <div className="p-4 border rounded-md bg-muted/20">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="anonymous" checked={isAnonymous} onCheckedChange={(v) => setIsAnonymous(!!v)} />
                    <Label htmlFor="anonymous" className="text-base font-medium">Make this as anonymous</Label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">If checked, your user ID won’t be attached to this response.</p>
                </div>
              )}
              {survey.questions.map((question: Question, index: number) => (
                <div key={question.id} className="space-y-3">
                  <Label className="text-base font-medium">
                    {index + 1}. {question.text}
                    {question.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {renderQuestion(question)}
                </div>
              ))}

              <div className="pt-6 border-t">
                <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
                  {isSubmitting ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
