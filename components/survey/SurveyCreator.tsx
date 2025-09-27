'use client'

import { useEffect, useRef } from 'react'

// Mock SurveyJS Creator for development
// In production, this would use the actual SurveyJS Creator component

interface SurveyCreatorProps {
  json?: any
  onSurveyChange?: (json: any) => void
}

export default function SurveyCreator({ json, onSurveyChange }: SurveyCreatorProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Mock implementation - replace with actual SurveyJS Creator
    console.log('SurveyJS Creator would be initialized here with:', json)
  }, [json])

  const addQuestion = (type: string) => {
    const newQuestion = {
      type,
      name: `question_${Date.now()}`,
      title: `New ${type} question`,
      ...(type === 'rating' && { rateMin: 1, rateMax: 5 }),
      ...(type === 'radiogroup' && { choices: ['Option 1', 'Option 2'] }),
      ...(type === 'comment' && { rows: 3 })
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
      <div className="w-80 bg-gray-50 border-l p-4">
        <h3 className="font-semibold mb-4">Properties</h3>
        <div className="text-sm text-gray-600">
          Select a question to edit its properties
        </div>
      </div>
    </div>
  )
}

interface QuestionPreviewProps {
  element: any
  onEdit: (element: any) => void
  onDelete: () => void
}

function QuestionPreview({ element, onEdit, onDelete }: QuestionPreviewProps) {
  return (
    <div className="border rounded-lg p-4 hover:border-primary transition-colors group">
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
          <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
            ⚙️
          </button>
          <button 
            onClick={onDelete}
            className="p-1 hover:bg-red-100 rounded text-red-500"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Render question preview based on type */}
      <div className="opacity-75">
        {element.type === 'radiogroup' && (
          <div className="space-y-2">
            {(element.choices || ['Option 1', 'Option 2']).map((choice: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" disabled />
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
            placeholder="Text area for longer responses..."
          />
        )}

        {element.type === 'text' && (
          <input
            type="text"
            disabled
            className="w-full border rounded px-3 py-2 text-sm bg-gray-50"
            placeholder="Single line text input..."
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
