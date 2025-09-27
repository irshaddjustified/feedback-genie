# Chat Feature Setup Guide

## Overview
The chat feature allows users to interact with their survey data using a RAG (Retrieval-Augmented Generation) system powered by Google's Gemini API and Firebase Firestore for vector storage.

## Required API Keys

### 1. Gemini API Key
- Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- Add to your environment variables:
```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Free Tier Limitations
- **Free Tier Quotas**: Very limited requests per day (typically 15 requests/day)
- **Fallback System**: When quota is exceeded, the system uses simplified analysis methods
- **Upgrade Options**: Consider upgrading to paid tier for unlimited usage

### 3. Firebase Configuration
Make sure your Firebase configuration is properly set up in your environment variables:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Features

### 1. Vector Store Initialization
- Converts existing survey responses into vector embeddings
- Stores embeddings in Firebase Firestore collection `vector_embeddings`
- Uses Gemini's `embedding-001` model for generating embeddings

### 2. RAG System
- Retrieves relevant survey data based on user queries
- Uses cosine similarity to find most relevant responses
- Provides context to Gemini for generating accurate responses

### 3. Chat Interface
- Real-time chat with survey data
- Shows sources for each response
- Quick question suggestions
- Chat history management

## Usage

1. **Initialize Vector Store**: Click "Initialize RAG" button on the chat page
2. **Ask Questions**: Type questions about your survey data
3. **Get Insights**: Receive AI-powered analysis with source references

## Example Questions

- "What are the main themes in the feedback?"
- "Which surveys have the highest satisfaction scores?"
- "What improvements do customers suggest most often?"
- "Show me sentiment trends over time"
- "Compare feedback between different surveys"

## Technical Details

### Vector Storage
- Collection: `vector_embeddings`
- Each document contains:
  - `content`: Text content for embedding
  - `embedding`: Vector representation (768 dimensions)
  - `metadata`: Survey info, question details, sentiment, timestamp

### Models Used
- **Embedding Model**: `embedding-001` (768 dimensions)
- **Chat Model**: `gemini-1.5-flash`
- **Similarity**: Cosine similarity for document retrieval

### Performance Considerations
- Conservative rate limiting with exponential backoff
- 2-second delay between each embedding request
- 5-second break after every 5 documents (batch processing)
- Retry logic with up to 3 attempts for failed requests
- Top 5 most relevant documents used for context

### Error Handling
The system includes robust error handling:
- **Retry Logic**: Automatic retries with exponential backoff for rate limits
- **Clear Error Messages**: Informative error messages for troubleshooting
- **Graceful Degradation**: Proper error handling without breaking the UI

## Troubleshooting

### Common Issues
1. **API Key Errors**: Ensure Gemini API key is correctly set
2. **No Data**: Make sure you have survey responses in Firebase
3. **Quota Exceeded**: Wait for daily reset (midnight PT) or upgrade to paid tier
4. **Rate Limits (429 errors)**: The system handles this automatically with retry logic and exponential backoff
5. **Vector Store Empty**: Click "Initialize RAG" to populate the vector store
6. **Slow Initialization**: This is normal - the system processes documents slowly to avoid rate limits

### Error Messages
- "Failed to initialize vector store": Check API keys and Firebase connection
- "No survey data found": Ensure you have responses in the `responses` collection
- "Failed to process your question": Check Gemini API key and try again
