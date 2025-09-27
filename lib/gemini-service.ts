import { GoogleGenerativeAI, EmbedContentRequest } from "@google/generative-ai"
import { collection, addDoc, query, where, orderBy, getDocs, limit } from "firebase/firestore"
import { db } from "./firebase"

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "")

// Get the embedding model
const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" })

// Get the chat model
const chatModel = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  }
})

export interface VectorDocument {
  id: string
  content: string
  embedding: number[]
  metadata: {
    surveyId: string
    surveyName: string
    responseId: string
    questionId: string
    questionText: string
    responseValue: string
    sentiment?: string
    timestamp: Date
  }
}

export interface ChatResponse {
  content: string
  sources: string[]
}

// Generate embeddings for text
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const result = await embeddingModel.embedContent(text)
    return result.embedding.values
  } catch (error) {
    console.error("Error generating embedding:", error)
    throw new Error("Failed to generate embedding")
  }
}

// Store vector document in Firestore
export async function storeVectorDocument(document: Omit<VectorDocument, "id">): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "vector_embeddings"), {
      ...document,
      createdAt: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error("Error storing vector document:", error)
    throw new Error("Failed to store vector document")
  }
}

// Search for similar documents using vector similarity
export async function searchSimilarDocuments(
  queryEmbedding: number[],
  limitCount: number = 5
): Promise<VectorDocument[]> {
  try {
    // Get all vector documents
    const vectorDocs = await getDocs(collection(db, "vector_embeddings"))
    const documents: VectorDocument[] = []
    
    vectorDocs.forEach((doc) => {
      const data = doc.data()
      documents.push({
        id: doc.id,
        content: data.content,
        embedding: data.embedding,
        metadata: {
          ...data.metadata,
          timestamp: data.metadata.timestamp.toDate()
        }
      })
    })

    // Calculate cosine similarity
    const similarities = documents.map((doc) => ({
      document: doc,
      similarity: cosineSimilarity(queryEmbedding, doc.embedding)
    }))

    // Sort by similarity and return top results
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limitCount)
      .map((item) => item.document)
  } catch (error) {
    console.error("Error searching similar documents:", error)
    throw new Error("Failed to search similar documents")
  }
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length")
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)

  if (normA === 0 || normB === 0) {
    return 0
  }

  return dotProduct / (normA * normB)
}

// Initialize vector store with existing survey data
export async function initializeVectorStore(): Promise<void> {
  try {
    console.log("Initializing vector store...")
    
    // Get all survey responses
    const responsesSnapshot = await getDocs(collection(db, "responses"))
    
    if (responsesSnapshot.empty) {
      console.log("No responses found to initialize vector store")
      return
    }

    let processedCount = 0
    const batchSize = 10 // Process in batches to avoid rate limits

    for (const responseDoc of responsesSnapshot.docs) {
      const responseData = responseDoc.data()
      
      // Process each question-answer pair
      for (const [questionId, answer] of Object.entries(responseData.data)) {
        if (typeof answer === "string" && answer.trim()) {
          // Create content for embedding
          const content = `Survey: ${responseData.surveyName}\nQuestion: ${questionId}\nAnswer: ${answer}`
          
          try {
            // Generate embedding
            const embedding = await generateEmbedding(content)
            
            // Store vector document
            await storeVectorDocument({
              content,
              embedding,
              metadata: {
                surveyId: responseData.surveyId,
                surveyName: responseData.surveyName,
                responseId: responseDoc.id,
                questionId,
                questionText: questionId, // In a real app, you'd fetch the actual question text
                responseValue: answer,
                sentiment: responseData.sentiment,
                timestamp: responseData.submittedAt.toDate()
              }
            })
            
            processedCount++
            
            // Add delay to avoid rate limits
            if (processedCount % batchSize === 0) {
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          } catch (error) {
            console.error(`Error processing response ${responseDoc.id}, question ${questionId}:`, error)
          }
        }
      }
    }

    console.log(`Vector store initialized with ${processedCount} documents`)
  } catch (error) {
    console.error("Error initializing vector store:", error)
    throw new Error("Failed to initialize vector store")
  }
}

// Chat with survey data using RAG
export async function chatWithSurveyData(userQuery: string): Promise<ChatResponse> {
  try {
    // Generate embedding for user query
    const queryEmbedding = await generateEmbedding(userQuery)
    
    // Search for relevant documents
    const relevantDocs = await searchSimilarDocuments(queryEmbedding, 5)
    
    if (relevantDocs.length === 0) {
      return {
        content: "I don't have enough survey data to answer your question. Please make sure you have survey responses in your database and that the vector store has been initialized.",
        sources: []
      }
    }

    // Prepare context from relevant documents
    const context = relevantDocs.map((doc, index) => 
      `[${index + 1}] Survey: ${doc.metadata.surveyName}\nQuestion: ${doc.metadata.questionText}\nAnswer: ${doc.metadata.responseValue}\nSentiment: ${doc.metadata.sentiment || 'neutral'}\n`
    ).join('\n')

    const sources = relevantDocs.map(doc => doc.metadata.surveyName)

    // Create prompt for Gemini
    const prompt = `You are an AI assistant that helps analyze survey feedback data. Based on the following context from survey responses, answer the user's question.

Context from survey data:
${context}

User Question: ${userQuery}

Instructions:
1. Answer the question based on the provided survey data context
2. Be specific and reference the actual data when possible
3. If the context doesn't contain enough information, say so
4. Provide actionable insights when appropriate
5. Keep your response concise but informative
6. If you notice patterns or trends, mention them

Answer:`

    // Get response from Gemini
    const result = await chatModel.generateContent(prompt)
    const response = await result.response
    const content = response.text()

    return {
      content,
      sources: [...new Set(sources)] // Remove duplicates
    }
  } catch (error) {
    console.error("Error in chat with survey data:", error)
    throw new Error("Failed to process your question. Please try again.")
  }
}

// Get vector store statistics
export async function getVectorStoreStats(): Promise<{
  totalDocuments: number
  surveys: string[]
  dateRange: { earliest: Date | null; latest: Date | null }
}> {
  try {
    const vectorDocs = await getDocs(collection(db, "vector_embeddings"))
    const documents: VectorDocument[] = []
    
    vectorDocs.forEach((doc) => {
      const data = doc.data()
      documents.push({
        id: doc.id,
        content: data.content,
        embedding: data.embedding,
        metadata: {
          ...data.metadata,
          timestamp: data.metadata.timestamp.toDate()
        }
      })
    })

    const surveys = [...new Set(documents.map(doc => doc.metadata.surveyName))]
    const timestamps = documents.map(doc => doc.metadata.timestamp)
    
    return {
      totalDocuments: documents.length,
      surveys,
      dateRange: {
        earliest: timestamps.length > 0 ? new Date(Math.min(...timestamps.map(t => t.getTime()))) : null,
        latest: timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => t.getTime()))) : null
      }
    }
  } catch (error) {
    console.error("Error getting vector store stats:", error)
    return {
      totalDocuments: 0,
      surveys: [],
      dateRange: { earliest: null, latest: null }
    }
  }
}
