import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatOpenAI } from "@langchain/openai";
import { DynamicStructuredTool } from "langchain/tools";
import { NextRequest } from "next/server";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { getVectorStore } from "@/config/pinecone";
import mongoose from "mongoose";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";

function formatChatHistory(rawHistory: Array<{ role: string; content: string }>): BaseMessage[] {
  return rawHistory.map((msg) => {
    if (msg.role === "human") {
      return new HumanMessage(msg.content);
    } else if (msg.role === "assistant") {
      return new AIMessage(msg.content);
    }
    throw new Error(`Unknown role: ${msg.role}`);
  });
}

/* Talk with Chatbot Route */

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const {
      message,
      chatbotId,
      llm: llmDetails,
      chatbotName,
      instructions,
      conversationStarters,
      websiteId,
      connect_website,
      chatHistory,
      temperature, 
      
    } = data;
    console.log(chatHistory , ' ::: chatHistory')
    
    console.log(chatHistory?.length , ' ::: chatHistory')
    if (!mongoose.Types.ObjectId.isValid(chatbotId)) {
      return new Response("Incorrect chatbotId", { status: 400 });
    }
  
    if (!process.env.OPENAI_API_KEY) {
      return new Response("OpenAI API key not configured", { status: 400 });
    }
    let initialQuestions = "";
    if (conversationStarters) {
      initialQuestions = conversationStarters.join(" ");
    }
    let chatbotInstructions = null;
    if (instructions) {
      chatbotInstructions = `You are a chatbot named "${chatbotName}". Follow these instructions when interacting with users:
      Instructions:
      ${instructions}
  
      \n ${
        initialQuestions.length > 0
          ? `Begin the conversation by asking the following question(s), **one at a time**. 
            Wait for the user's response before moving to the next question:
            ${initialQuestions}`
          : ""
      }`;
    } else {
      chatbotInstructions = "You work at AION and you answer QA related to Law...";
    }
    const llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      temperature: temperature,
      modelName: llmDetails.modelName,
      streaming: true,
    });
  
    const tools = [
      new DynamicStructuredTool({
        name: "SearchKnowledgeBase",
        schema: z.object({
          query: z.string().describe("Search query for relevant information"),
        }),
        description: "Searches knowledge base whenever user asks a question related to knowledge",
        func: async ({ query }: { query: string }) => {
          try {
            const vectorStore = await getVectorStore(process.env.PINECONE_chatbot_INDEX!);
            const retriever = vectorStore.asRetriever({
              k: 5,
              filter: { chatbotId, namespace: chatbotId },
            });
            const result = await retriever.invoke(query);
            return result.map((doc) => doc.pageContent).join("\n\n") || "No relevant info found.";
          } catch (error) {
            console.error("Knowledge Base Error:", error);
            return "Error searching knowledge base.";
          }
        },
      }),
    ];
  
    if (connect_website) {
      tools.push(
        new DynamicStructuredTool({
          name: "SearchWebsiteSpecificKnowledge",
          schema: z.object({
            query: z.string().describe("Search query for relevant information"),
          }),
          description: "Searches website content",
          func: async ({ query }: { query: string }) => {
            try {
              const vectorStore = await getVectorStore(process.env.PINECONE_WP_POST_INDEX!);
              const retriever = vectorStore.asRetriever({
                k: 5,
                filter: { websiteId, namespace: chatbotId },
              });
              const result = await retriever.invoke(query);
              return result.map((doc) => doc.pageContent).join("\n\n") || "No relevant info found.";
            } catch (error) {
              console.error("Knowledge Base Error:", error);
              return "Error searching knowledge base.";
            }
          },
        })
      );
    }
  
    const formatedChatHistory = formatChatHistory(chatHistory);
  
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", chatbotInstructions],
      ["placeholder", "{chatHistory}"],
      ["human", "{prompt}"],
      ["placeholder", "{agent_scratchpad}"],
    ]);
  
    const agent = createToolCallingAgent({ llm, tools, prompt });
    const agentExecutor = new AgentExecutor({ agent, tools });
  
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const streamingEvents = agentExecutor.streamEvents(
            { prompt: message, chatHistory: formatedChatHistory },
            { version: "v2" }
          );
  
          for await (const event of streamingEvents) {
            if (event.event == "on_chat_model_stream") {
              if (event.data) {
                let content = event.data.chunk.content;
                if (content.includes(" ")) {
                  content = content.replace(/ /g, "<space_token>");
                }
  
                const chunk = encoder.encode(JSON.stringify(content) + "\n");
  
                controller.enqueue(chunk);
              }
            }
          }
  
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });
  
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch(error) {
    console.log(error, ' :error while talking with chatbot')
    return new Response("Internal Server Error!", { status: 500 });
  }
}
