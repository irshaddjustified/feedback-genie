'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Plus, Settings, GripVertical } from 'lucide-react'

interface SurveyCreatorProps {
  json?: any
  onSurveyChange?: (json: any) => void
}

interface QuestionElement {
  type: string
  name: string
  title: string
  choices?: string[]
  rateMin?: number
  rateMax?: number
  rows?: number
  required?: boolean
  placeholder?: string
}

export default function SurveyCreator({ json, onSurveyChange }: SurveyCreatorProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Mock implementation - replace with actual SurveyJS Creator
    console.log('SurveyJS Creator would be initialized here with:', json)
  }, [json])

  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null)

  const addQuestion = (type: string) => {
    const timestamp = Date.now()
    const newQuestion: QuestionElement = {
      type,
      name: `question_${timestamp}`,
      title: `New ${type.replace(/([A-Z])/g, ' $1').trim()} Question`,
      required: false,
      ...(type === 'rating' && { rateMin: 1, rateMax: 5 }),
      ...(type === 'radiogroup' && { choices: ['Option 1', 'Option 2', 'Option 3'] }),
      ...(type === 'checkbox' && { choices: ['Option 1', 'Option 2', 'Option 3'] }),
      ...(type === 'dropdown' && { choices: ['Select an option', 'Option 1', 'Option 2'] }),
      ...(type === 'comment' && { rows: 3, placeholder: 'Enter your detailed response here...' }),
      ...(type === 'text' && { placeholder: 'Enter your answer here...' })
    }

    const currentJson = json || { 
      title: 'New Survey', 
      pages: [{ name: 'page1', elements: [] }] 
    }

    const updatedJson = {
      ...currentJson,
      pages: [
        {
          ...currentJson.pages[0],
          elements: [...(currentJson.pages[0]?.elements || []), newQuestion]
        }
      ]
    }

    onSurveyChange?.(updatedJson)
  }

  const questionTypes = [
    { type: 'radiogroup', label: 'Multiple Choice', icon: '◉' },
    { type: 'checkbox', label: 'Checkbox', icon: '☐' },
    { type: 'comment', label: 'Text Area', icon: '📝' },
    { type: 'text', label: 'Text Input', icon: 'Aa' },
    { type: 'rating', label: 'Rating Scale', icon: '⭐' },
    { type: 'dropdown', label: 'Dropdown', icon: '▼' },
    { type: 'boolean', label: 'Yes/No', icon: '✓' },
    { type: 'matrix', label: 'Matrix', icon: '⊞' }
  ]

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Toolbox */}
      <div className="w-64 bg-gray-50 border-r p-4">
        <h3 className="font-semibold mb-4">Question Types</h3>
        <div className="space-y-2">
          {questionTypes.map((questionType) => (
            <button
              key={questionType.type}
              onClick={() => addQuestion(questionType.type)}
              className="w-full flex items-center gap-3 p-3 text-left bg-white border rounded-lg hover:bg-gray-100 hover:border-primary transition-colors"
            >
              <span className="text-lg">{questionType.icon}</span>
              <div>
                <div className="font-medium text-sm">{questionType.label}</div>
                <div className="text-xs text-gray-500 capitalize">{questionType.type}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium mb-3">AI Tools</h4>
          <button className="w-full flex items-center gap-2 p-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
            <span>✨</span>
            Generate Questions
          </button>
        </div>
      </div>

      {/* Designer Surface */}
      <div className="flex-1 bg-white">
        <div className="h-full overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">
                {json?.title || 'Survey Builder'}
              </h2>
              <p className="text-gray-600">
                {json?.description || 'Drag question types from the left panel to build your survey'}
              </p>
            </div>

            {json?.pages?.[0]?.elements?.length > 0 ? (
              <div className="space-y-6">
                {json.pages[0].elements.map((element: any, index: number) => (
                  <QuestionPreview
                    key={element.name || index}
                    element={element}
                    index={index}
                    isSelected={selectedQuestionIndex === index}
                    onSelect={() => setSelectedQuestionIndex(index)}
                    onEdit={(updatedElement) => {
                      const updatedElements = [...json.pages[0].elements]
                      updatedElements[index] = updatedElement
                      onSurveyChange?.({
                        ...json,
                        pages: [{
                          ...json.pages[0],
                          elements: updatedElements
                        }]
                      })
                    }}
                    onDelete={() => {
                      const updatedElements = json.pages[0].elements.filter(
                        (_: any, i: number) => i !== index
                      )
                      setSelectedQuestionIndex(null)
                      onSurveyChange?.({
                        ...json,
                        pages: [{
                          ...json.pages[0],
                          elements: updatedElements
                        }]
                      })
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="font-medium mb-2">Start Building Your Survey</h3>
                <p className="text-gray-600 mb-4">
                  Add questions by clicking on the question types in the left panel
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-80 bg-gray-50 border-l p-4 overflow-y-auto">
        <h3 className="font-semibold mb-4">Properties</h3>
        {selectedQuestionIndex !== null && json?.pages?.[0]?.elements?.[selectedQuestionIndex] ? (
          <QuestionProperties
            element={json.pages[0].elements[selectedQuestionIndex]}
            onUpdate={(updatedElement) => {
              const updatedElements = [...json.pages[0].elements]
              updatedElements[selectedQuestionIndex] = updatedElement
              onSurveyChange?.({
                ...json,
                pages: [{
                  ...json.pages[0],
                  elements: updatedElements
                }]
              })
            }}
          />
        ) : (
          <div className="text-sm text-gray-600">
            Select a question to edit its properties, field names, and answer options
          </div>
        )}
      </div>
    </div>
  )
}

interface QuestionPreviewProps {
  element: QuestionElement
  index: number
  isSelected: boolean
  onSelect: () => void
  onEdit: (element: QuestionElement) => void
  onDelete: () => void
}

function QuestionPreview({ element, index, isSelected, onSelect, onEdit, onDelete }: QuestionPreviewProps) {
  return (
    <div 
      className={`border rounded-lg p-4 transition-colors group cursor-pointer ${
        isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <input
            type="text"
            value={element.title}
            onChange={(e) => onEdit({ ...element, title: e.target.value })}
            className="w-full font-medium bg-transparent border-none outline-none focus:bg-white focus:border focus:rounded px-2 py-1 -mx-2 -my-1"
            placeholder="Question title"
          />
          <div className="text-xs text-gray-500 mt-1 capitalize">
            {element.type.replace(/([A-Z])/g, ' $1').trim()}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <GripVertical className="h-3 w-3" />
            #{index + 1}
          </div>
          <Button
            size="sm" 
            variant="ghost"
            className="h-6 w-6 p-0 text-gray-500 hover:text-primary"
            onClick={(e) => {
              e.stopPropagation()
              onSelect()
            }}
          >
            <Settings className="h-3 w-3" />
          </Button>
          <Button
            size="sm" 
            variant="ghost"
            className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Render question preview based on type */}
      <div className="opacity-75">
        {(element.type === 'radiogroup' || element.type === 'dropdown') && (
          <div className="space-y-2">
            {(element.choices || ['Option 1', 'Option 2']).map((choice: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                {element.type === 'radiogroup' ? (
                  <input type="radio" disabled />
                ) : (
                  <span className="text-xs text-gray-400">•</span>
                )}
                <span className="text-sm">{choice}</span>
              </div>
            ))}
          </div>
        )}

        {element.type === 'checkbox' && (
          <div className="space-y-2">
            {(element.choices || ['Option 1', 'Option 2']).map((choice: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <input type="checkbox" disabled />
                <span className="text-sm">{choice}</span>
              </div>
            ))}
          </div>
        )}

        {element.type === 'comment' && (
          <textarea
            disabled
            rows={element.rows || 3}
            className="w-full border rounded px-3 py-2 text-sm bg-gray-50"
            placeholder={element.placeholder || "Text area for longer responses..."}
          />
        )}

        {element.type === 'text' && (
          <input
            type="text"
            disabled
            className="w-full border rounded px-3 py-2 text-sm bg-gray-50"
            placeholder={element.placeholder || "Single line text input..."}
          />
        )}

        {element.type === 'rating' && (
          <div className="flex items-center gap-2">
            {Array.from({ length: element.rateMax || 5 }, (_, i) => (
              <button key={i} className="w-8 h-8 border rounded text-sm">
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {element.type === 'boolean' && (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" disabled />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" disabled />
              <span className="text-sm">No</span>
            </label>
          </div>
        )}
      </div>
    </div>
  )
}

interface QuestionPropertiesProps {
  element: QuestionElement
  onUpdate: (element: QuestionElement) => void
}

function QuestionProperties({ element, onUpdate }: QuestionPropertiesProps) {
  const updateElement = (updates: Partial<QuestionElement>) => {
    onUpdate({ ...element, ...updates })
  }

  const updateChoice = (index: number, value: string) => {
    const newChoices = [...(element.choices || [])]
    newChoices[index] = value
    updateElement({ choices: newChoices })
  }

  const addChoice = () => {
    const newChoices = [...(element.choices || []), `Option ${(element.choices?.length || 0) + 1}`]
    updateElement({ choices: newChoices })
  }

  const removeChoice = (index: number) => {
    const newChoices = element.choices?.filter((_, i) => i !== index) || []
    updateElement({ choices: newChoices })
  }

  return (
    <div className="space-y-4">
      {/* Basic Properties */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="question-title" className="text-sm font-medium">
            Question Title
          </Label>
          <Input
            id="question-title"
            value={element.title}
            onChange={(e) => updateElement({ title: e.target.value })}
            placeholder="Enter question title..."
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="field-name" className="text-sm font-medium">
            Field Name (ID)
          </Label>
          <Input
            id="field-name"
            value={element.name}
            onChange={(e) => updateElement({ name: e.target.value })}
            placeholder="field_name"
            className="mt-1 font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Used to identify this field in responses. Use lowercase, numbers, and underscores only.
          </p>
        </div>

        {(element.type === 'text' || element.type === 'comment') && (
          <div>
            <Label htmlFor="placeholder" className="text-sm font-medium">
              Placeholder Text
            </Label>
            <Input
              id="placeholder"
              value={element.placeholder || ''}
              onChange={(e) => updateElement({ placeholder: e.target.value })}
              placeholder="Enter placeholder text..."
              className="mt-1"
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="required"
            checked={element.required || false}
            onChange={(e) => updateElement({ required: e.target.checked })}
            className="rounded"
          />
          <Label htmlFor="required" className="text-sm font-medium">
            Required field
          </Label>
        </div>
      </div>

      {/* Type-specific Properties */}
      {element.type === 'comment' && (
        <div>
          <Label htmlFor="rows" className="text-sm font-medium">
            Number of Rows
          </Label>
          <Input
            id="rows"
            type="number"
            min="2"
            max="10"
            value={element.rows || 3}
            onChange={(e) => updateElement({ rows: parseInt(e.target.value) || 3 })}
            className="mt-1"
          />
        </div>
      )}

      {element.type === 'rating' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="rate-min" className="text-sm font-medium">
                Min Value
              </Label>
              <Input
                id="rate-min"
                type="number"
                value={element.rateMin || 1}
                onChange={(e) => updateElement({ rateMin: parseInt(e.target.value) || 1 })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="rate-max" className="text-sm font-medium">
                Max Value
              </Label>
              <Input
                id="rate-max"
                type="number"
                value={element.rateMax || 5}
                onChange={(e) => updateElement({ rateMax: parseInt(e.target.value) || 5 })}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Answer Options for Multiple Choice Questions */}
      {(element.type === 'radiogroup' || element.type === 'checkbox' || element.type === 'dropdown') && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium">
              Answer Options
            </Label>
            <Button
              size="sm"
              variant="outline"
              onClick={addChoice}
              className="h-7 px-2 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Option
            </Button>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {(element.choices || []).map((choice, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 text-xs text-gray-400 bg-gray-100 rounded">
                  {index + 1}
                </div>
                <Input
                  value={choice}
                  onChange={(e) => updateChoice(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 text-sm"
                />
                {element.choices && element.choices.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeChoice(index)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            {element.type === 'dropdown' && 'First option will be used as placeholder'}
            {element.type === 'radiogroup' && 'Respondents can select one option'}
            {element.type === 'checkbox' && 'Respondents can select multiple options'}
          </p>
        </div>
      )}

      {/* Preview */}
      <div className="pt-4 border-t">
        <Label className="text-sm font-medium mb-2 block">Preview</Label>
        <div className="p-3 bg-white border rounded-lg">
          <div className="font-medium text-sm mb-2">
            {element.title}
            {element.required && <span className="text-red-500 ml-1">*</span>}
          </div>
          
          {element.type === 'text' && (
            <Input
              disabled
              placeholder={element.placeholder}
              className="text-sm"
            />
          )}
          
          {element.type === 'comment' && (
            <Textarea
              disabled
              rows={element.rows || 3}
              placeholder={element.placeholder}
              className="text-sm"
            />
          )}
          
          {element.type === 'radiogroup' && (
            <div className="space-y-2">
              {(element.choices || []).map((choice, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="radio" disabled className="text-sm" />
                  <span className="text-sm">{choice}</span>
                </div>
              ))}
            </div>
          )}
          
          {element.type === 'checkbox' && (
            <div className="space-y-2">
              {(element.choices || []).map((choice, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="checkbox" disabled className="text-sm" />
                  <span className="text-sm">{choice}</span>
                </div>
              ))}
            </div>
          )}
          
          {element.type === 'dropdown' && (
            <select disabled className="w-full border rounded px-3 py-2 text-sm bg-gray-50">
              {(element.choices || []).map((choice, i) => (
                <option key={i}>{choice}</option>
              ))}
            </select>
          )}
          
          {element.type === 'rating' && (
            <div className="flex items-center gap-2">
              {Array.from({ length: (element.rateMax || 5) - (element.rateMin || 1) + 1 }, (_, i) => (
                <button key={i} className="w-8 h-8 border rounded text-sm bg-gray-50">
                  {(element.rateMin || 1) + i}
                </button>
              ))}
            </div>
          )}
          
          {element.type === 'boolean' && (
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" disabled />
                <span className="text-sm">Yes</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" disabled />
                <span className="text-sm">No</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
