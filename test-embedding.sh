#!/bin/bash

# Simple test script for Gemini API embedding functionality
# This script tests if your API key is working and can generate embeddings

echo "🚀 Gemini API Embedding Test Script"
echo "===================================="
echo ""

# Check if API key is provided
if [ -z "$GEMINI_API_KEY" ] && [ -z "$NEXT_PUBLIC_GEMINI_API_KEY" ]; then
    echo "❌ No API key found!"
    echo ""
    echo "Please provide your Gemini API key in one of these ways:"
    echo ""
    echo "Option 1 - Set environment variable:"
    echo "  export GEMINI_API_KEY=\"your_api_key_here\""
    echo "  ./test-embedding.sh"
    echo ""
    echo "Option 2 - Run with inline key:"
    echo "  GEMINI_API_KEY=\"your_key\" ./test-embedding.sh"
    echo ""
    echo "Option 3 - Use your existing .env key:"
    echo "  source .env"
    echo "  ./test-embedding.sh"
    echo ""
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js first: https://nodejs.org/"
    exit 1
fi

# Check if the required package is installed
if [ ! -d "node_modules/@google/generative-ai" ]; then
    echo "📦 Installing required package..."
    npm install @google/generative-ai
fi

echo "🔑 API Key found: ${GEMINI_API_KEY:-$NEXT_PUBLIC_GEMINI_API_KEY:0:10}..."
echo ""

# Run the test
node test-embedding.js

echo ""
echo "📋 Test Results Summary:"
echo "- If you see ✅: Your API key is working!"
echo "- If you see ❌: Check the error messages above"
echo "- If you see quota errors: Wait for daily reset or upgrade your plan"
