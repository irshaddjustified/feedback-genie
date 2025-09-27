#!/usr/bin/env node

/**
 * Simple test script to verify Gemini API key and embedding functionality
 * 
 * Usage:
 * 1. Set your API key: export GEMINI_API_KEY="your_api_key_here"
 * 2. Run: node test-embedding.js
 * 
 * Or run with inline key:
 * GEMINI_API_KEY="your_key" node test-embedding.js
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Get API key from environment variable
const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('❌ Error: No API key found!');
  console.log('Please set your Gemini API key:');
  console.log('export GEMINI_API_KEY="your_api_key_here"');
  console.log('Or run: GEMINI_API_KEY="your_key" node test-embedding.js');
  process.exit(1);
}

console.log('🔑 API Key found:', API_KEY.substring(0, 10) + '...');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });

async function testEmbedding() {
  try {
    console.log('\n🧪 Testing embedding generation...');
    
    const testText = "This is a test sentence for embedding generation.";
    console.log('📝 Test text:', testText);
    
    console.log('⏳ Generating embedding...');
    const result = await embeddingModel.embedContent(testText);
    
    const embedding = result.embedding.values;
    console.log('✅ Embedding generated successfully!');
    console.log('📊 Embedding dimensions:', embedding.length);
    console.log('🔢 First 5 values:', embedding.slice(0, 5));
    console.log('📈 Embedding magnitude:', Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0)).toFixed(4));
    
    return true;
  } catch (error) {
    console.error('❌ Error generating embedding:', error.message);
    
    if (error.message.includes('quota')) {
      console.log('\n💡 Quota exceeded! This means your API key is working but you\'ve hit the free tier limits.');
      console.log('   - Wait until midnight Pacific Time for daily reset');
      console.log('   - Or upgrade to a paid tier');
    } else if (error.message.includes('API_KEY')) {
      console.log('\n💡 Invalid API key! Please check your key and try again.');
    } else if (error.message.includes('permission')) {
      console.log('\n💡 Permission denied! Make sure your API key has the right permissions.');
    }
    
    return false;
  }
}

async function testMultipleEmbeddings() {
  try {
    console.log('\n🧪 Testing multiple embeddings...');
    
    const testTexts = [
      "Customer satisfaction is high",
      "The product needs improvement", 
      "Great service and support"
    ];
    
    const embeddings = [];
    
    for (let i = 0; i < testTexts.length; i++) {
      console.log(`⏳ Processing text ${i + 1}/${testTexts.length}: "${testTexts[i]}"`);
      
      const result = await embeddingModel.embedContent(testTexts[i]);
      embeddings.push(result.embedding.values);
      
      // Add delay to avoid rate limits
      if (i < testTexts.length - 1) {
        console.log('⏱️  Waiting 2 seconds to avoid rate limits...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('✅ All embeddings generated successfully!');
    
    // Test similarity between embeddings
    console.log('\n🔍 Testing similarity between embeddings...');
    const similarity1 = cosineSimilarity(embeddings[0], embeddings[1]);
    const similarity2 = cosineSimilarity(embeddings[0], embeddings[2]);
    
    console.log('📊 Similarity between text 1 and 2:', similarity1.toFixed(4));
    console.log('📊 Similarity between text 1 and 3:', similarity2.toFixed(4));
    
    return true;
  } catch (error) {
    console.error('❌ Error in multiple embeddings test:', error.message);
    return false;
  }
}

function cosineSimilarity(a, b) {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}

async function main() {
  console.log('🚀 Gemini API Embedding Test');
  console.log('============================');
  
  // Test 1: Single embedding
  const test1Success = await testEmbedding();
  
  if (test1Success) {
    // Test 2: Multiple embeddings (only if first test succeeds)
    await testMultipleEmbeddings();
  }
  
  console.log('\n🏁 Test completed!');
  
  if (test1Success) {
    console.log('✅ Your Gemini API key is working correctly!');
    console.log('💡 You can now use the chat feature in your application.');
  } else {
    console.log('❌ There are issues with your API key or quota.');
    console.log('💡 Check the error messages above for solutions.');
  }
}

// Run the test
main().catch(console.error);
