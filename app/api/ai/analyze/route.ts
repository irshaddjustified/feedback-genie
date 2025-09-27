import { NextRequest, NextResponse } from 'next/server'
import { createContext } from '@/lib/context'
import { database } from '@/lib/prisma'
import { aiService } from '@/lib/ai/ai-service'

export async function POST(request: NextRequest) {
  try {
    const context = await createContext(request)
    
    if (!context.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { responseId, text } = body
    
    if (!responseId || !text) {
      return NextResponse.json({ 
        error: 'Response ID and text are required' 
      }, { status: 400 })
    }

    // Use actual AI service powered by Google Gemini
    const analysis = await aiService.analyzeComprehensive(text)
    
    // Transform to expected format
    const result = {
      responseId,
      sentimentScore: (analysis.sentiment.score * 2) - 1, // Convert 0-1 to -1 to 1 scale
      sentimentLabel: analysis.sentiment.label,
      confidence: analysis.sentiment.confidence,
      categories: analysis.categories.map(cat => ({
        name: cat.name,
        score: cat.score
      })),
      keyPhrases: analysis.keyPhrases,
      priority: analysis.priority,
      modelUsed: 'google-gemini-1.5-flash',
      processingTime: analysis.processingTime,
      reasoning: analysis.sentiment.reasoning,
      suggestedActions: analysis.suggestedActions,
      topics: analysis.topics
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error analyzing response:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze response',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
