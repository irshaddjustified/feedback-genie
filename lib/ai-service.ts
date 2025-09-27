import { generateText, generateObject } from "ai"
import { z } from "zod"
import type { SurveyTemplate } from "./types"

const questionSchema = z.object({
  type: z.enum(["text", "textarea", "select", "radio", "checkbox", "rating"]),
  text: z.string(),
  options: z.array(z.string()).optional(),
  required: z.boolean(),
  order: z.number(),
})

const surveySchema = z.object({
  name: z.string(),
  description: z.string(),
  questions: z.array(questionSchema),
})

export async function generateSurveyFromPrompt(
  prompt: string,
  type: "client-project" | "event-feedback",
): Promise<SurveyTemplate> {
  try {
    const { object } = await generateObject({
      model: "openai/gpt-4o-mini",
      prompt: `Create a ${type} survey based on this request: "${prompt}". 
      
      Generate 4-6 relevant questions that would gather meaningful feedback. 
      Use appropriate question types (text, textarea, select, radio, checkbox, rating).
      For rating questions, use options ["1", "2", "3", "4", "5"].
      Make sure questions are professional and actionable.
      
      Survey type context:
      - client-project: Focus on project satisfaction, communication, deliverables, future collaboration
      - event-feedback: Focus on event experience, content quality, logistics, future improvements`,
      schema: surveySchema,
    })

    return {
      name: object.name,
      type,
      description: object.description,
      questions: object.questions,
    }
  } catch (error) {
    console.error("Error generating survey:", error)
    // Fallback to a basic template
    return {
      name: "Custom Survey",
      type,
      description: "AI-generated survey based on your requirements",
      questions: [
        {
          type: "rating",
          text: "How would you rate your overall experience?",
          required: true,
          order: 1,
          options: ["1", "2", "3", "4", "5"],
        },
        {
          type: "textarea",
          text: "What did you like most?",
          required: false,
          order: 2,
        },
        {
          type: "textarea",
          text: "What could be improved?",
          required: false,
          order: 3,
        },
      ],
    }
  }
}

export async function analyzeSentiment(text: string): Promise<"positive" | "neutral" | "negative"> {
  try {
    const { text: result } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Analyze the sentiment of this feedback text and respond with only one word: "positive", "neutral", or "negative".
      
      Text: "${text}"`,
    })

    const sentiment = result.trim().toLowerCase()
    if (sentiment.includes("positive")) return "positive"
    if (sentiment.includes("negative")) return "negative"
    return "neutral"
  } catch (error) {
    console.error("Error analyzing sentiment:", error)
    return "neutral"
  }
}

export async function generateInsights(responses: any[]): Promise<string> {
  try {
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Analyze these survey responses and provide 2-3 key insights and actionable recommendations:
      
      Responses: ${JSON.stringify(responses, null, 2)}
      
      Focus on:
      - Common themes and patterns
      - Areas of strength and improvement
      - Actionable recommendations
      
      Keep it concise and business-focused.`,
    })

    return text
  } catch (error) {
    console.error("Error generating insights:", error)
    return "Unable to generate insights at this time."
  }
}
