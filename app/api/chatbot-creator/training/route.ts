import { ConnectToDB } from "@/config/db";
import { extractCSVContent, extractDOCXContent, extractPDFContent } from "@/lib/dataExtractor";
import training from "@/schemas/training";
import { NextRequest, NextResponse } from "next/server";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { getVectorStore } from "@/config/pinecone";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid"; 
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { createErrorResponse } from "@/utils/errorHandler";

export const runtime = "nodejs";
interface TrainingFileData {
  s3Link: string;
  documentIds: string[];
}

interface TrainingDocument {
  id: string;
  pageContent: string;
  metadata: {
    source: string;
    chatbotId: string;
    trainingId: string;
  };
}

const textSplitter = new CharacterTextSplitter({
  chunkSize: 1000, 
  chunkOverlap: 50, 
});

/* Create Training Route. */
export async function POST(req: NextRequest) {

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return createErrorResponse("", 401);
    }

    await ConnectToDB();

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const chatbotId = formData.get("chatbotId") as string;
    const s3Urls = formData.getAll("s3Urls") as string[];
    
    const userId = session.user.id;
    const filesData: TrainingFileData[] = [];
    const documentsToUpload: TrainingDocument[] = [];

    const fileProcessingPromises = s3Urls.map(async (url) => {
      const response = await fetch(url);
      const buffer = Buffer.from(await response.arrayBuffer());

      let extractedContent = null;
      if (url.endsWith(".pdf")) {
        extractedContent = await extractPDFContent(buffer);
      } else if (url.endsWith(".docx")) {
        extractedContent = await extractDOCXContent(buffer);
      } else if (url.endsWith(".csv")) {
        extractedContent = await extractCSVContent(buffer);
      }
      if (!extractedContent) return;

      const chunks = await textSplitter.splitText(extractedContent.text);
      const documentIds = chunks.map(() => uuidv4());
      const documents = chunks.map((chunk, index) => ({
        id: documentIds[index],
        pageContent: chunk,
        metadata: {
          source: url,
          chatbotId,
          trainingId: "",
        },
      }));
      filesData.push({ s3Link: url, documentIds });
      documentsToUpload.push(...documents);
    });

    await Promise.all(fileProcessingPromises);

    const train = await training.create({
      trainingName: name,
      description,
      createdBy: userId,
      chatbotId: new mongoose.Types.ObjectId(chatbotId),
      files: filesData,
    });

    documentsToUpload.forEach((doc) => (doc.metadata.trainingId = train._id.toString()));

    if (documentsToUpload.length > 0) {
      const vectorStore = await getVectorStore(process.env.PINECONE_chatbot_INDEX!);
      await vectorStore.addDocuments(documentsToUpload, {
        ids: documentsToUpload.map((doc) => doc.id),
        namespace: chatbotId,
      });
    }
    return NextResponse.json(
      { data: { id: train._id.toString(), description: train.description } },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);
    createErrorResponse( "", 500);
    return 
  }
}
