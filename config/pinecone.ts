// config/pinecone.ts
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";

// Ensure environment variables are set
if (!process.env.PINECONE_API_KEY) {
  throw new Error("Missing Pinecone API key in environment variables");
}

// Check if index names are configured
if (!process.env.PINECONE_chatbot_INDEX || !process.env.PINECONE_WP_POST_INDEX) {
  throw new Error("Missing Pinecone index names in environment variables");
}

// Initialize Pinecone client
const pinecone = new PineconeClient();
// Initialize OpenAI embeddings
const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

// Function to get vector store for a specific index
async function getVectorStore(indexName: string) {
  // Get the specific Pinecone index
  const index = pinecone.Index(indexName);
  // Initialize Pinecone Vector Store for this index
  const store = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index as unknown as import("@langchain/pinecone").PineconeStoreParams["pineconeIndex"],
    maxConcurrency: 5,
  });
  return store;
}

// Pre-defined index names from environment variables
const indexes = {
  index1: process.env.PINECONE_chatbot_INDEX!,
  index2: process.env.PINECONE_WP_POST_INDEX!,
};

export { 
  pinecone, 
  embeddings, 
  getVectorStore, 
  indexes 
};