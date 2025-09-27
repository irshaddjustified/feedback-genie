import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      clientName: 'TechCorp Inc.',
      description: 'Complete redesign of corporate website with modern UI/UX',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-30'),
      status: 'COMPLETED'
    }
  })

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      clientName: 'StartupXYZ',
      description: 'Native iOS and Android app for food delivery service',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-06-15'),
      status: 'ACTIVE'
    }
  })

  const project3 = await prisma.project.create({
    data: {
      name: 'E-commerce Platform',
      clientName: 'RetailCorp',
      description: 'Full-featured e-commerce platform with inventory management',
      startDate: new Date('2024-03-10'),
      status: 'ACTIVE'
    }
  })

  // Create events
  const event1 = await prisma.event.create({
    data: {
      name: 'Annual Tech Conference 2024',
      type: 'Conference',
      location: 'San Francisco Convention Center',
      date: new Date('2024-05-15'),
      attendeeCount: 500
    }
  })

  const event2 = await prisma.event.create({
    data: {
      name: 'Product Launch Webinar',
      type: 'Webinar',
      location: 'Online',
      date: new Date('2024-04-20'),
      attendeeCount: 150
    }
  })

  // Create survey templates
  const projectTemplate = await prisma.surveyTemplate.create({
    data: {
      name: 'Project Feedback Template',
      type: 'PROJECT_FEEDBACK',
      description: 'Standard template for collecting project feedback',
      schema: {
        title: 'Project Feedback Survey',
        pages: [
          {
            name: 'overall',
            elements: [
              {
                type: 'rating',
                name: 'satisfaction',
                title: 'Overall satisfaction with the project outcome',
                isRequired: true,
                rateMin: 1,
                rateMax: 10
              },
              {
                type: 'radiogroup',
                name: 'recommendation',
                title: 'Would you recommend our services?',
                isRequired: true,
                choices: ['Definitely', 'Probably', 'Not sure', 'Probably not', 'Definitely not']
              },
              {
                type: 'radiogroup',
                name: 'timeline',
                title: 'How would you rate our project timeline adherence?',
                choices: ['Excellent', 'Good', 'Fair', 'Poor']
              }
            ]
          },
          {
            name: 'detailed',
            elements: [
              {
                type: 'comment',
                name: 'strengths',
                title: 'What did you like most about working with us?',
                rows: 4
              },
              {
                type: 'comment',
                name: 'improvements',
                title: 'What areas could we improve?',
                rows: 4
              },
              {
                type: 'comment',
                name: 'additional_comments',
                title: 'Any additional comments or suggestions?',
                rows: 4
              }
            ]
          }
        ]
      },
      aiConfig: {
        enableSentimentAnalysis: true,
        enableCategorization: true,
        categories: ['Communication', 'Quality', 'Timeline', 'Support', 'Value']
      }
    }
  })

  const eventTemplate = await prisma.surveyTemplate.create({
    data: {
      name: 'Event Feedback Template',
      type: 'EVENT_FEEDBACK',
      description: 'Template for post-event feedback collection',
      schema: {
        title: 'Event Feedback Survey',
        pages: [
          {
            name: 'event_rating',
            elements: [
              {
                type: 'rating',
                name: 'overall_rating',
                title: 'Overall event rating',
                isRequired: true,
                rateMin: 1,
                rateMax: 5
              },
              {
                type: 'rating',
                name: 'content_quality',
                title: 'Content quality',
                rateMin: 1,
                rateMax: 5
              },
              {
                type: 'rating',
                name: 'organization',
                title: 'Event organization',
                rateMin: 1,
                rateMax: 5
              }
            ]
          },
          {
            name: 'feedback',
            elements: [
              {
                type: 'comment',
                name: 'best_aspects',
                title: 'What were the best aspects of the event?',
                rows: 3
              },
              {
                type: 'comment',
                name: 'improvements',
                title: 'What could be improved for future events?',
                rows: 3
              }
            ]
          }
        ]
      }
    }
  })

  // Create sample surveys
  const survey1 = await prisma.survey.create({
    data: {
      templateId: projectTemplate.id,
      projectId: project1.id,
      title: 'TechCorp Website Redesign Feedback',
      description: 'Please share your feedback on the completed website redesign project',
      status: 'PUBLISHED',
      publishedAt: new Date('2024-04-01'),
      expiresAt: new Date('2024-12-31')
    }
  })

  const survey2 = await prisma.survey.create({
    data: {
      templateId: projectTemplate.id,
      projectId: project2.id,
      title: 'Mobile App Development - Mid-Project Review',
      description: 'Your feedback on the current progress of the mobile app development',
      status: 'PUBLISHED',
      publishedAt: new Date('2024-04-10')
    }
  })

  const survey3 = await prisma.survey.create({
    data: {
      templateId: eventTemplate.id,
      eventId: event1.id,
      title: 'Annual Tech Conference 2024 Feedback',
      description: 'Help us improve future conferences with your valuable feedback',
      status: 'PUBLISHED',
      publishedAt: new Date('2024-05-16')
    }
  })

  // Create sample responses with AI analysis
  const responses = [
    {
      surveyId: survey1.id,
      respondentName: 'John Smith',
      respondentEmail: 'john.smith@techcorp.com',
      responseData: {
        satisfaction: 9,
        recommendation: 'Definitely',
        timeline: 'Excellent',
        strengths: 'The team was extremely professional and delivered exactly what we needed. The design is modern and user-friendly.',
        improvements: 'Perhaps more frequent progress updates during development would be helpful.',
        additional_comments: 'Overall very satisfied with the outcome. Would definitely work with this team again.'
      },
      completionRate: 1.0,
      submittedAt: new Date('2024-04-05T10:30:00Z')
    },
    {
      surveyId: survey1.id,
      respondentName: 'Sarah Johnson',
      respondentEmail: 'sarah.j@techcorp.com',
      responseData: {
        satisfaction: 7,
        recommendation: 'Probably',
        timeline: 'Good',
        strengths: 'Good technical execution and attention to detail.',
        improvements: 'Communication could be improved. Sometimes hard to reach the team during development.',
        additional_comments: 'Good work overall but room for improvement in project management.'
      },
      completionRate: 1.0,
      submittedAt: new Date('2024-04-07T14:15:00Z')
    },
    {
      surveyId: survey2.id,
      respondentName: 'Mike Chen',
      respondentEmail: 'mike@startupxyz.com',
      responseData: {
        satisfaction: 8,
        recommendation: 'Definitely',
        timeline: 'Good',
        strengths: 'Great progress so far. The app is looking fantastic and the team is very responsive.',
        improvements: 'Would like to see more frequent demo sessions to track progress.',
        additional_comments: 'Excited to see the final product. Keep up the great work!'
      },
      completionRate: 1.0,
      submittedAt: new Date('2024-04-12T09:45:00Z')
    }
  ]

  for (const responseData of responses) {
    const response = await prisma.response.create({
      data: responseData
    })

    // Create AI analysis for each response
    const textContent = Object.values(responseData.responseData)
      .filter(val => typeof val === 'string')
      .join(' ')

    const sentiment = responseData.responseData.satisfaction >= 8 ? 0.8 : 
                     responseData.responseData.satisfaction >= 6 ? 0.6 : 0.3

    await prisma.aIAnalysis.create({
      data: {
        responseId: response.id,
        sentimentScore: sentiment,
        sentimentLabel: sentiment >= 0.7 ? 'POSITIVE' : 
                       sentiment >= 0.4 ? 'NEUTRAL' : 'NEGATIVE',
        confidence: 0.85,
        categories: [
          { name: 'Communication', score: 0.7 },
          { name: 'Quality', score: 0.9 },
          { name: 'Timeline', score: 0.8 }
        ],
        keyPhrases: ['professional', 'user-friendly', 'technical execution'],
        topics: {
          primary: 'Project Quality',
          secondary: 'Communication'
        },
        priority: sentiment < 0.4 ? 'HIGH' : 'MEDIUM',
        suggestedActions: [
          'Follow up on communication feedback',
          'Continue quality focus'
        ],
        modelUsed: 'multi-model-ensemble',
        processingTime: 250
      }
    })
  }

  // Create survey analytics
  await prisma.surveyAnalytics.create({
    data: {
      surveyId: survey1.id,
      totalResponses: 2,
      completedResponses: 2,
      avgCompletionRate: 1.0,
      avgResponseTime: 180,
      avgSentiment: 0.7,
      sentimentDistribution: {
        positive: 50,
        neutral: 50,
        negative: 0
      },
      npsScore: 75,
      satisfactionScore: 8.0,
      topCategories: [
        { name: 'Quality', count: 2 },
        { name: 'Communication', count: 2 }
      ],
      keyThemes: ['Professional service', 'Good design', 'Communication improvements needed'],
      trends: ['Consistent quality ratings', 'Communication feedback trend'],
      recommendations: [
        'Implement more frequent progress updates',
        'Maintain current quality standards'
      ]
    }
  })

  // Create notifications
  await prisma.notification.create({
    data: {
      type: 'NEW_RESPONSE',
      title: 'New Feedback Received',
      message: 'TechCorp Website Redesign survey received a new response',
      data: { surveyId: survey1.id, responseId: 'response_1' },
      isRead: false
    }
  })

  await prisma.notification.create({
    data: {
      type: 'ANALYSIS_READY',
      title: 'AI Analysis Complete',
      message: 'Sentiment analysis completed for recent responses',
      data: { surveyId: survey1.id },
      isRead: false
    }
  })

  console.log('✅ Seed data created successfully!')
  console.log(`📊 Created:`)
  console.log(`   - 3 projects`)
  console.log(`   - 2 events`)
  console.log(`   - 2 survey templates`)
  console.log(`   - 3 surveys`)
  console.log(`   - 3 responses with AI analysis`)
  console.log(`   - 1 survey analytics record`)
  console.log(`   - 2 notifications`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
