import type { Survey, Response, SurveyTemplate } from "./types"

export const surveyTemplates: SurveyTemplate[] = [
  {
    name: "Client Project Feedback",
    type: "client-project",
    description: "Collect feedback on completed client projects",
    questions: [
      {
        type: "rating",
        text: "How satisfied are you with the overall project outcome?",
        required: true,
        order: 1,
        options: ["1", "2", "3", "4", "5"],
      },
      {
        type: "textarea",
        text: "What aspects of the project exceeded your expectations?",
        required: false,
        order: 2,
      },
      {
        type: "textarea",
        text: "What could we have done better?",
        required: false,
        order: 3,
      },
      {
        type: "radio",
        text: "Would you recommend our services to others?",
        required: true,
        order: 4,
        options: ["Definitely", "Probably", "Not sure", "Probably not", "Definitely not"],
      },
      {
        type: "text",
        text: "What's the likelihood you'll work with us again? (1-10)",
        required: false,
        order: 5,
      },
    ],
  },
  {
    name: "Event Feedback",
    type: "event-feedback",
    description: "Gather insights from event attendees",
    questions: [
      {
        type: "rating",
        text: "How would you rate the overall event experience?",
        required: true,
        order: 1,
        options: ["1", "2", "3", "4", "5"],
      },
      {
        type: "checkbox",
        text: "Which sessions did you find most valuable?",
        required: false,
        order: 2,
        options: ["Keynote", "Technical Workshops", "Networking", "Panel Discussions", "Q&A Sessions"],
      },
      {
        type: "textarea",
        text: "What was the highlight of the event for you?",
        required: false,
        order: 3,
      },
      {
        type: "select",
        text: "How did you hear about this event?",
        required: false,
        order: 4,
        options: ["Social Media", "Email", "Website", "Word of Mouth", "Partner Organization"],
      },
      {
        type: "textarea",
        text: "Any suggestions for future events?",
        required: false,
        order: 5,
      },
    ],
  },
]

export const mockSurveys: Survey[] = [
  {
    id: "1",
    name: "Q4 Client Project Review",
    type: "client-project",
    description: "Feedback collection for Q4 client projects",
    questions: surveyTemplates[0].questions.map((q, i) => ({ ...q, id: `q${i + 1}` })),
    isActive: true,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Annual Tech Conference 2024",
    type: "event-feedback",
    description: "Post-event feedback for our annual conference",
    questions: surveyTemplates[1].questions.map((q, i) => ({ ...q, id: `q${i + 1}` })),
    isActive: true,
    createdAt: new Date("2024-01-20"),
  },
]

export const mockResponses: Response[] = [
  {
    id: "r1",
    surveyId: "1",
    surveyName: "Q4 Client Project Review",
    surveyType: "client-project",
    data: {
      q1: "5",
      q2: "The team's communication was excellent and the delivery was ahead of schedule.",
      q3: "Perhaps more frequent check-ins during the development phase.",
      q4: "Definitely",
      q5: "9",
    },
    sentiment: "positive",
    aiInsights:
      "Highly satisfied client with strong likelihood of repeat business. Communication and delivery timing were key strengths.",
    submittedAt: new Date("2024-01-16"),
  },
  {
    id: "r2",
    surveyId: "2",
    surveyName: "Annual Tech Conference 2024",
    surveyType: "event-feedback",
    data: {
      q1: "4",
      q2: ["Technical Workshops", "Networking"],
      q3: "The networking opportunities were fantastic - met several potential partners.",
      q4: "Social Media",
      q5: "More hands-on coding sessions would be great!",
    },
    sentiment: "positive",
    aiInsights: "Attendee valued networking and technical content. Suggests demand for more interactive sessions.",
    submittedAt: new Date("2024-01-21"),
  },
  {
    id: "r3",
    surveyId: "1",
    surveyName: "Q4 Client Project Review",
    surveyType: "client-project",
    data: {
      q1: "3",
      q2: "The final product met our requirements.",
      q3: "Better project timeline communication and more regular updates would help.",
      q4: "Not sure",
      q5: "6",
    },
    sentiment: "neutral",
    aiInsights: "Mixed feedback indicating room for improvement in communication and project management processes.",
    submittedAt: new Date("2024-01-17"),
  },
]
