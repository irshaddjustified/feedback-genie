'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowRight, ArrowLeft } from 'lucide-react'

interface SurveyPreviewProps {
  json: any
}

export default function SurveyPreview({ json }: SurveyPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [responses, setResponses] = useState<Record<string, any>>({})

  if (!json || !json.pages || json.pages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No survey content to preview</p>
      </div>
    )
  }

  const totalPages = json.pages.length
  const currentPageData = json.pages[currentPage]

  const handleValueChange = (questionName: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionName]: value
    }))
  }

  const canGoNext = currentPage < totalPages - 1
  const canGoPrev = currentPage > 0

  return (
    <div className="max-w-2xl mx-auto">
      {/* Survey Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{json.title}</h1>
        {json.description && (
          <p className="text-gray-600">{json.description}</p>
        )}
      </div>

      {/* Progress Indicator */}
      {totalPages > 1 && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Page {currentPage + 1} of {totalPages}</span>
            <span>{Math.round(((currentPage + 1) / totalPages) * 100)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Current Page Content */}
      <div className="space-y-8 mb-8">
        {currentPageData.elements?.map((element: any, index: number) => (
          <QuestionRenderer
            key={element.name || index}
            element={element}
            value={responses[element.name]}
            onChange={(value) => handleValueChange(element.name, value)}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(prev => prev - 1)}
          disabled={!canGoPrev}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <span className="text-sm text-gray-500">
          Preview Mode - Responses not saved
        </span>
        
        {canGoNext ? (
          <Button onClick={() => setCurrentPage(prev => prev + 1)}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button>
            Submit
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}

interface QuestionRendererProps {
  element: any
  value: any
  onChange: (value: any) => void
}

function QuestionRenderer({ element, value, onChange }: QuestionRendererProps) {
  const { type, title, name, isRequired, choices, rateMin = 1, rateMax = 5, rows = 3 } = element

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">
        {title}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {type === 'text' && (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your response..."
        />
      )}

      {type === 'comment' && (
        <Textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder="Enter your detailed response..."
        />
      )}

      {type === 'radiogroup' && (
        <RadioGroup value={value} onValueChange={onChange}>
          <div className="space-y-3">
            {(choices || []).map((choice: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={choice} id={`${name}-${index}`} />
                <Label htmlFor={`${name}-${index}`} className="font-normal">
                  {choice}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      )}

      {type === 'checkbox' && (
        <div className="space-y-3">
          {(choices || []).map((choice: string, index: number) => {
            const isChecked = Array.isArray(value) ? value.includes(choice) : false
            return (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${name}-${index}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    const currentValues = Array.isArray(value) ? value : []
                    if (checked) {
                      onChange([...currentValues, choice])
                    } else {
                      onChange(currentValues.filter((v: string) => v !== choice))
                    }
                  }}
                />
                <Label htmlFor={`${name}-${index}`} className="font-normal">
                  {choice}
                </Label>
              </div>
            )
          })}
        </div>
      )}

      {type === 'rating' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {Array.from({ length: rateMax - rateMin + 1 }, (_, i) => {
              const rating = rateMin + i
              return (
                <Button
                  key={rating}
                  variant={value === rating ? 'default' : 'outline'}
                  size="sm"
                  className="w-10 h-10"
                  onClick={() => onChange(rating)}
                >
                  {rating}
                </Button>
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
        </div>
      )}

      {type === 'boolean' && (
        <RadioGroup value={value?.toString()} onValueChange={(v) => onChange(v === 'true')}>
          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`${name}-yes`} />
              <Label htmlFor={`${name}-yes`} className="font-normal">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`${name}-no`} />
              <Label htmlFor={`${name}-no`} className="font-normal">No</Label>
            </div>
          </div>
        </RadioGroup>
      )}

      {type === 'dropdown' && (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md bg-white"
        >
          <option value="">Select an option...</option>
          {(choices || []).map((choice: string, index: number) => (
            <option key={index} value={choice}>
              {choice}
            </option>
          ))}
        </select>
      )}

      {type === 'matrix' && (
        <div className="text-center py-4 text-gray-500">
          Matrix questions not supported in preview
        </div>
      )}
    </div>
  )
}
