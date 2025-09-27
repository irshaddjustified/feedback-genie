import { generateText, generateObject } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"
import type { SurveyTemplate } from "./types"

const questionSchema = z.object({
  type: z.enum(["text", "comment", "radiogroup", "checkbox", "dropdown", "rating", "boolean"]),
  name: z.string(),
  title: z.string(),
  choices: z.array(z.string()).optional(),
  required: z.boolean(),
  placeholder: z.string().optional(),
  rateMin: z.number().optional(),
  rateMax: z.number().optional(),
  rows: z.number().optional(),
  text: z.string().optional(), // For backward compatibility
  order: z.number().optional(), // For backward compatibility
  options: z.array(z.string()).optional(), // For backward compatibility
})

const surveySchema = z.object({
  name: z.string(),
  description: z.string(),
  questions: z.array(questionSchema),
})

// Initialize Gemini
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GEMINI_KEY,
})

export async function generateSurveyFromPrompt(
  prompt: string,
  type: "client-project" | "event-feedback",
): Promise<SurveyTemplate> {
  try {
    const { object } = await generateObject({
      model: google("gemini-1.5-flash"),
      prompt: `Create a ${type} survey based on this request: "${prompt}". 
      
      Generate 4-6 relevant questions that would gather meaningful feedback. 
      Use appropriate question types: text, comment, radiogroup, checkbox, dropdown, rating, boolean.
      
      For each question, provide:
      - A unique field name (use snake_case, descriptive, e.g., "overall_satisfaction", "communication_rating")
      - A clear, professional title
      - For multiple choice questions (radiogroup, checkbox, dropdown): provide 3-5 meaningful answer choices
      - For rating questions: set appropriate rateMin (usually 1) and rateMax (usually 5 or 10)
      - For text/comment questions: provide helpful placeholder text
      - For comment questions: set appropriate rows (3-5)
      - Mark important questions as required: true, others as required: false
      
      Survey type context:
      - client-project: Focus on project satisfaction, communication, deliverables, future collaboration
      - event-feedback: Focus on event experience, content quality, logistics, future improvements
      
      Make questions professional, actionable, and use varied question types for engaging surveys.`,
      schema: surveySchema,
    })

    return {
      name: object.name,
      type,
      description: object.description,
      questions: object.questions.map((q, index) => ({
        ...q,
        text: q.title, // For backward compatibility
        order: index + 1, // Add order field
        options: q.choices, // For backward compatibility
      })),
    }
  } catch (error) {
    console.error("Error generating survey:", error)
    // Fallback to a basic template with proper field names and customizable answers
    return {
      name: "Custom Survey",
      type,
      description: "AI-generated survey based on your requirements",
      questions: [
        {
          type: "rating",
          name: "overall_satisfaction",
          title: "How would you rate your overall experience?",
          text: "How would you rate your overall experience?", // For backward compatibility
          required: true,
          rateMin: 1,
          rateMax: 5,
          order: 1,
        },
        {
          type: "comment",
          name: "positive_feedback",
          title: "What did you like most about your experience?",
          text: "What did you like most about your experience?", // For backward compatibility
          required: false,
          placeholder: "Please share what you enjoyed...",
          rows: 3,
          order: 2,
        },
        {
          type: "comment",
          name: "improvement_suggestions",
          title: "What areas could we improve?",
          text: "What areas could we improve?", // For backward compatibility
          required: false,
          placeholder: "Please share your suggestions for improvement...",
          rows: 3,
          order: 3,
        },
        {
          type: "radiogroup",
          name: "recommendation_likelihood",
          title: "How likely are you to recommend us to others?",
          text: "How likely are you to recommend us to others?", // For backward compatibility
          required: true,
          choices: ["Very likely", "Likely", "Neutral", "Unlikely", "Very unlikely"],
          options: ["Very likely", "Likely", "Neutral", "Unlikely", "Very unlikely"], // For backward compatibility
          order: 4,
        },
      ],
    }
  }
}

export async function analyzeSentiment(text: string): Promise<"positive" | "neutral" | "negative"> {
  try {
    const { text: result } = await generateText({
      model: google("gemini-1.5-flash"),
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
      model: google("gemini-1.5-flash"),
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
