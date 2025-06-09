// models/Task.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IWebsites extends Document {
  chatbotName: string;
  description?: string;
  chatbotId: string;
  conversationStarters: string[];
  instructions: string;
  domainName: string;
  temperature: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  llm: { provider: string; modelName: string }; 
}

const websiteSchema: Schema = new Schema(
  {
    chatbotName: { type: String },
    domainName: {type: String},
    description: { type: String },
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
    temperature: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    chatbotId: { type: Schema.Types.ObjectId, ref: "Chatbot", required: true },
    conversationStarters: { type: [String], default: [] },
    instructions: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
  },
  { timestamps: true }
);

// Prevent model overwrite in development (Next.js hot reloading)
export default mongoose.models.Website || mongoose.model<IWebsites>("Website", websiteSchema);
