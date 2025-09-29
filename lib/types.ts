export interface Question {
  id: string
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "rating"
  text: string
  options?: string[]
  required: boolean
  order: number
}

export interface Organization {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Client {
  id: string
  organizationId: string
  name: string
  email?: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  clientId: string
  name: string
  description?: string
  status: "active" | "inactive" | "completed"
  createdAt: Date
  updatedAt: Date
}

export interface Survey {
  id: string
  projectId: string
  name: string
  slug: string
  type: "client-project" | "event-feedback"
  description: string
  questions: Question[]
  isActive: boolean
  shareLink?: string
  status: "DRAFT" | "ACTIVE" | "COMPLETED"
  createdAt: Date
  updatedAt: Date
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
