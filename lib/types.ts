export interface Question {
  id: string
  type: "text" | "comment" | "radiogroup" | "checkbox" | "dropdown" | "rating" | "boolean"
  name: string
  title: string
  choices?: string[]
  required: boolean
  placeholder?: string
  rateMin?: number
  rateMax?: number
  rows?: number
  order?: number
  // Legacy fields for backward compatibility
  text?: string
  options?: string[]
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
