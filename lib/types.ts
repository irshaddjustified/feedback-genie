export interface Question {
  id: string
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "rating"
  text: string
  options?: string[]
  required: boolean
  order: number
}

export interface Survey {
  id: string
  name: string
  type: "client-project" | "event-feedback"
  description: string
  questions: Question[]
  isActive: boolean
  createdAt: Date
}

export interface Response {
  id: string
  surveyId: string
  surveyName: string
  surveyType: string
  data: Record<string, any>
  sentiment?: "positive" | "neutral" | "negative"
  aiInsights?: string
  submittedAt: Date
}

export interface SurveyTemplate {
  name: string
  type: "client-project" | "event-feedback"
  description: string
  questions: Omit<Question, "id">[]
}
