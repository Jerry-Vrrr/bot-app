import { ConnectToDB } from "@/config/db";
import chatbot from "@/schemas/chatbot";
import training from "@/schemas/training";
import { NextRequest, NextResponse } from "next/server";
import { getVectorStore } from "@/config/pinecone";
import { downloadFileFromS3, uploadFileToS3 } from "@/config/awsS3Config";
import { v4 as uuidv4 } from 'uuid';
import { extractCSVContent, extractDOCXContent, extractPDFContent } from "@/lib/dataExtractor";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { createErrorResponse } from "@/utils/errorHandler";

const textSplitter = new CharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 50,
});

/* Create a chatbot from existing chatbot. */

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return createErrorResponse("", 401) ;
    }

    const { chatbotId } = await req.json();

    if (!chatbotId) {
      return createErrorResponse("Missing chatbotId in request body", 400 );
    }
    await ConnectToDB();

    const originalBot = await chatbot.findById(chatbotId);
    if (!originalBot) {
      return createErrorResponse("Chatbot not found", 404 );
    }

    const newBot = await chatbot.create({
      chatbotName: `${originalBot.chatbotName} (Copy)`,
      description: originalBot.description,
      temperature: originalBot.temperature,
      instructions: originalBot.instructions,
      createdBy: originalBot.createdBy,
      conversationStarters: originalBot.conversationStarters,
    });

    const originalTrainings = await training.find({ chatbotId: chatbotId });


    const newTrainings = await Promise.all(
      originalTrainings.map(async (originalTraining) => {
        const newTraining = await training.create({
          name: originalTraining.name,
          description: originalTraining.description,
          chatbotId: newBot._id,
          createdBy: originalTraining.createdBy,
          files: [], 
        });

        const newFiles = await Promise.all(
          originalTraining.files.map(async (file: { s3Link: string, documentIds: string[] }) => {
            const fileBuffer = await downloadFileFromS3(file.s3Link);
            
            const newS3Link = await uploadFileToS3(
              fileBuffer,
              `copy_${file.s3Link.split('/').pop()}`
            );


            let extractedContent = null;
            if (file.s3Link.endsWith(".pdf")) {
              extractedContent = await extractPDFContent(fileBuffer);
            } else if (file.s3Link.endsWith(".docx")) {
              extractedContent = await extractDOCXContent(fileBuffer);
            } else if (file.s3Link.endsWith(".csv")) {
              extractedContent = await extractCSVContent(fileBuffer);
            }
            if (!extractedContent) return;

            
            const chunks = await textSplitter.splitText(extractedContent.text);

            const newDocuments = chunks.map(chunk => {
              const documentId = uuidv4();
              return {
                id: documentId,
                pageContent: chunk,
                metadata: {
                  source: `copy_${file.s3Link.split('/').pop()}`,
                  chatbotId: newBot._id.toString(),
                  trainingId: newTraining._id.toString(), 
                },
              };
            });

            const vectorStore = await getVectorStore(process.env.PINECONE_chatbot_INDEX!)

            await vectorStore.addDocuments(newDocuments, { ids: newDocuments.map(doc => doc.id),namespace: chatbotId, });

            return {
              s3Link: newS3Link,
              documentIds: newDocuments.map(doc => doc.id)
            };
          })
        );

        newTraining.files = newFiles;
        await newTraining.save(); 

        return newTraining;
      })
    );

    return NextResponse.json(
      {
        data: {
          id: newBot._id.toString(),
          description: newBot.description,
          trainingsCount: newTrainings.length
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error copying chatbot:', error);
    createErrorResponse("", 500 );
    return
  }
}