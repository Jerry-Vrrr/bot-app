import mongoose, { Schema, Document } from "mongoose";

export interface ITraining extends Document {
  description: string;
  trainingType: string;
  chatbotId: string;
  trainingName: string;
  files: [{
    s3Link: string,
    documentIds: string[]
  }];
  createdBy: string
}

const TrainingSchema: Schema = new Schema(
  {
    trainingType: { type: String, default: "default" },
    trainingName: { type: String },
    description: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    files: [{
      s3Link: { type: String, default: "" },
      documentIds: { type: [String], default: [] }
    }],
    chatbotId: { type: Schema.Types.ObjectId, ref: "Chatbot", required: true },
  },
  { timestamps: true }
);

// Prevent model overwrite in development (Next.js hot reloading)
export default mongoose.models.Training || mongoose.model<ITraining>("Training", TrainingSchema);