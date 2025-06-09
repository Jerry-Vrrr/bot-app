// models/Task.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IwpPost extends Document {
  title: string;
  wpId: string,
  documentIds: string[];
  chatbotId: string;
  websiteId: string;
  createdAt: Date;
  publishAt: Date;
  UpdatedAt: Date;
}

const wpPostSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    wpId: { type: String, required: true },
    documentIds: { type: [String], default: [] },
    chatbotId: { type: Schema.Types.ObjectId, ref: "Chatbot", required: true },
    websiteId: { type: Schema.Types.ObjectId, ref: "Website", required: true },
    createdAt: { type: Date, default: Date.now },
    publishAt: { type: Date },
    UpdatedAt: { type: Date },
  },
  { timestamps: true }
);

// Prevent model overwrite in development (Next.js hot reloading)
export default mongoose.models.WpPost || mongoose.model<IwpPost>("WpPost", wpPostSchema);
