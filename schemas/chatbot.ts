// models/Task.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IChatbot extends Document {
  chatbotPic: string;
  chatbotName: string;
  description?: string;
  publishedStatus: boolean;
  conversationStarters: string[];
  connectedWebsites: string[];
  instructions: string;
  createdAt: Date;
  temperature: number;
  publishAt: Date;
  updatedAt: Date;
  createdBy: string;
  llm: { provider: string; modelName: string }; 
}

const ChatbotSchema: Schema = new Schema(
  {
    chatbotPic: { type: String },
    chatbotName: { type: String, required: true },
    description: { type: String },
    temperature: { type: Number, default: 0 },
    connectedWebsites: { type: [String] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    llm: { 
      type: { 
        provider: String, 
        modelName: String 
      }, 
      default: {
        provider: "OpenAI",
        modelName: "gpt-4o-mini"
      }
    },
    conversationStarters: { type: [String], default: [] },
    instructions: { type: String },
    publishedStatus: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    publishAt: { type: Date },
    updatedAt: { type: Date },
  },
  { timestamps: true }
);


// Prevent model overwrite in development (Next.js hot reloading)
export default mongoose.models.Chatbot || mongoose.model<IChatbot>("Chatbot", ChatbotSchema);
