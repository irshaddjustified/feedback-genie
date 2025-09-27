"use client"

import { useState, useRef, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Bot, User, Loader2, Database, Sparkles } from "lucide-react"
import { chatWithSurveyData, initializeVectorStore } from "@/lib/gemini-service"
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  sources?: string[]
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [surveyCount, setSurveyCount] = useState(0)
  const [responseCount, setResponseCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Load initial data stats
    loadDataStats()
  }, [])

  const loadDataStats = async () => {
    try {
      // Get survey count
      const surveysQuery = query(collection(db, "surveys"))
      const surveysSnapshot = await getDocs(surveysQuery)
      setSurveyCount(surveysSnapshot.size)

      // Get response count
      const responsesQuery = query(collection(db, "responses"))
      const responsesSnapshot = await getDocs(responsesQuery)
      setResponseCount(responsesSnapshot.size)
    } catch (error) {
      console.error("Error loading data stats:", error)
    }
  }

  const handleInitializeVectorStore = async () => {
    setIsInitializing(true)
    try {
      await initializeVectorStore()
      // Reload stats after initialization
      await loadDataStats()
      addMessage("assistant", "Vector store initialized successfully! I can now help you analyze your survey data.")
    } catch (error) {
      console.error("Error initializing vector store:", error)
      addMessage("assistant", "Failed to initialize vector store. Please check your API keys and try again.")
    } finally {
      setIsInitializing(false)
    }
  }

  const addMessage = (role: "user" | "assistant", content: string, sources?: string[]) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      sources,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage("")
    addMessage("user", userMessage)
    setIsLoading(true)

    try {
      const response = await chatWithSurveyData(userMessage)
      addMessage("assistant", response.content, response.sources)
    } catch (error) {
      console.error("Error getting chat response:", error)
      addMessage("assistant", "Sorry, I encountered an error while processing your request. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">Survey Data Chat</h1>
          <p className="text-muted-foreground">Ask questions about your survey data and get AI-powered insights</p>
        </div>

        {/* Data Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{surveyCount}</div>
              <p className="text-xs text-muted-foreground">Available for analysis</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{responseCount}</div>
              <p className="text-xs text-muted-foreground">Feedback entries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vector Store</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleInitializeVectorStore}
                disabled={isInitializing}
                size="sm"
                variant="outline"
                className="w-full"
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  "Initialize RAG"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Messages */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <span>Chat with Survey Data</span>
                  </CardTitle>
                  <CardDescription>Ask questions about your feedback data</CardDescription>
                </div>
                <Button onClick={clearChat} variant="outline" size="sm">
                  Clear Chat
                </Button>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                      <p className="text-muted-foreground mb-4">
                        Ask me anything about your survey data. For example:
                      </p>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• "What are the main themes in the feedback?"</p>
                        <p>• "Which surveys have the highest satisfaction scores?"</p>
                        <p>• "What improvements do customers suggest most often?"</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex space-x-3 ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex space-x-3 max-w-[80%] ${
                            message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {message.role === "user" ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                          </div>
                          <div
                            className={`rounded-lg px-4 py-2 ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            {message.sources && message.sources.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-border/50">
                                <p className="text-xs text-muted-foreground mb-1">Sources:</p>
                                <div className="flex flex-wrap gap-1">
                                  {message.sources.map((source, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {source}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex space-x-3 justify-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="rounded-lg px-4 py-2 bg-muted">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="flex space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about your survey data..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Questions</CardTitle>
                <CardDescription>Try these sample questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => setInputMessage("What are the main themes in the feedback?")}
                >
                  <div className="text-sm">
                    <div className="font-medium">Main Themes</div>
                    <div className="text-muted-foreground">Identify common feedback patterns</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => setInputMessage("Which surveys have the highest satisfaction scores?")}
                >
                  <div className="text-sm">
                    <div className="font-medium">Satisfaction Analysis</div>
                    <div className="text-muted-foreground">Find top-performing surveys</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => setInputMessage("What improvements do customers suggest most often?")}
                >
                  <div className="text-sm">
                    <div className="font-medium">Improvement Areas</div>
                    <div className="text-muted-foreground">Common suggestions</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => setInputMessage("Show me sentiment trends over time")}
                >
                  <div className="text-sm">
                    <div className="font-medium">Sentiment Trends</div>
                    <div className="text-muted-foreground">Track feedback sentiment</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Be specific in your questions for better results</p>
                <p>• Ask about trends, patterns, or specific surveys</p>
                <p>• Request comparisons between different time periods</p>
                <p>• Ask for actionable insights and recommendations</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
