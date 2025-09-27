'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  Plus, 
  FileText, 
  Users, 
  Calendar,
  Loader2,
  ArrowRight 
} from 'lucide-react'
import { api } from '@/lib/trpc-client'
import { toast } from 'sonner'

const createSurveySchema = z.object({
  title: z.string().min(1, 'Survey title is required'),
  description: z.string().optional(),
  projectId: z.string().optional(),
  eventId: z.string().optional(),
  templateId: z.string(),
  type: z.enum(['PROJECT_FEEDBACK', 'EVENT_FEEDBACK', 'CUSTOM'])
})

type CreateSurveyForm = z.infer<typeof createSurveySchema>

const surveyTemplates = [
  {
    id: 'project-feedback',
    title: 'Project Feedback',
    description: 'Comprehensive feedback collection for client projects',
    type: 'PROJECT_FEEDBACK' as const,
    estimatedTime: '3-5 minutes',
    questionCount: 8
  },
  {
    id: 'event-feedback',
    title: 'Event Feedback',
    description: 'Post-event feedback and satisfaction survey',
    type: 'EVENT_FEEDBACK' as const,
    estimatedTime: '2-3 minutes', 
    questionCount: 6
  },
  {
    id: 'custom',
    title: 'Custom Survey',
    description: 'Build your own survey with AI assistance',
    type: 'CUSTOM' as const,
    estimatedTime: 'Variable',
    questionCount: 'Custom'
  }
]

export default function CreateSurveyPage() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<any>(null)

  const form = useForm<CreateSurveyForm>({
    resolver: zodResolver(createSurveySchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'CUSTOM'
    }
  })

  // Get projects for selection
  const { data: projects } = api.project.list.useQuery({ limit: 50 })

  // Create survey mutation
  const createSurvey = api.survey.create.useMutation({
    onSuccess: (survey) => {
      toast.success('Survey created successfully!')
      router.push(`/admin/surveys/${survey.id}/builder`)
    },
    onError: (error) => {
      toast.error('Failed to create survey: ' + error.message)
    }
  })

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = surveyTemplates.find(t => t.id === templateId)
    if (template) {
      form.setValue('templateId', templateId)
      form.setValue('type', template.type)
    }
  }

  const generateWithAI = async () => {
    const projectId = form.getValues('projectId')
    const selectedProjectData = projects?.find(p => p.id === projectId)
    
    if (!selectedProjectData) {
      toast.error('Please select a project first')
      return
    }

    setAiGenerating(true)
    try {
      const suggestions = await api.ai.generateSurvey.mutate({
        context: `Create a feedback survey for project: ${selectedProjectData.name}`,
        clientName: selectedProjectData.clientName,
        projectType: 'software_development'
      })
      
      setAiSuggestions(suggestions)
      form.setValue('title', suggestions.title)
      form.setValue('description', suggestions.description)
      
      toast.success('AI suggestions generated!')
    } catch (error) {
      toast.error('Failed to generate AI suggestions')
    } finally {
      setAiGenerating(false)
    }
  }

  const handleSubmit = async (data: CreateSurveyForm) => {
    if (!selectedTemplate) {
      toast.error('Please select a survey template')
      return
    }

    await createSurvey.mutateAsync(data)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="flex h-16 items-center px-6">
          <h1 className="text-2xl font-bold">Create New Survey</h1>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Survey Details</CardTitle>
            <CardDescription>
              Configure your survey settings and select a template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Project Selection */}
              <div className="space-y-2">
                <Label>Select Project (Optional)</Label>
                <Select onValueChange={(value) => form.setValue('projectId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a project or leave empty for general survey" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{project.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {project.clientName} • {project.status}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Survey Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Survey Title</Label>
                <div className="flex gap-2">
                  <Input
                    id="title"
                    placeholder="e.g., Q4 2024 Project Feedback Survey"
                    {...form.register('title')}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateWithAI}
                    disabled={aiGenerating || !form.getValues('projectId')}
                  >
                    {aiGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    AI Suggest
                  </Button>
                </div>
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              {/* Survey Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the survey purpose and what you hope to learn..."
                  rows={3}
                  {...form.register('description')}
                />
              </div>

              {/* AI Suggestions Display */}
              {aiSuggestions && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      AI Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium">Estimated Duration:</Label>
                      <p className="text-sm">{aiSuggestions.estimatedDuration}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Recommended Questions:</Label>
                      <p className="text-sm">{aiSuggestions.recommendedQuestions}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Template Selection */}
              <div className="space-y-4">
                <Label>Choose Survey Template</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {surveyTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate === template.id 
                          ? 'ring-2 ring-primary border-primary' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-base">{template.title}</CardTitle>
                            <Badge variant="outline" className="text-xs">
                              {template.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          {template.type === 'PROJECT_FEEDBACK' && <FileText className="h-5 w-5 text-muted-foreground" />}
                          {template.type === 'EVENT_FEEDBACK' && <Calendar className="h-5 w-5 text-muted-foreground" />}
                          {template.type === 'CUSTOM' && <Plus className="h-5 w-5 text-muted-foreground" />}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="text-sm mb-3">
                          {template.description}
                        </CardDescription>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{template.estimatedTime}</span>
                          <span>{template.questionCount} questions</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {!selectedTemplate && (
                  <p className="text-sm text-red-500">Please select a template to continue</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={createSurvey.isPending || !selectedTemplate}
                  className="min-w-32"
                >
                  {createSurvey.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Survey
                      <ArrowRight className="ml-2 h-4 w-4" />
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
