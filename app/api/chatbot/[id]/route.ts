import { ConnectToDB } from "@/config/db";
import chatbot from "@/schemas/chatbot";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import training from "@/schemas/training";
import { deleteFileFromS3 } from "@/config/awsS3Config";
import { getVectorStore } from "@/config/pinecone";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import websites from "@/schemas/websites";
import { createErrorResponse } from "@/utils/errorHandler";

/* Get Chatbot Data such as instructions, conversation starters. */

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; }> }) {
  try {
    await ConnectToDB();

    const searchedParams = await params;
    const chatbotId = searchedParams.id;
    
    const { searchParams } = new URL(req.url);
    const websiteId = searchParams.get("websiteId") as string;
    let setting = false;
    if (searchParams.get("setting") == "1") {
      setting = true
    } 
    
    if (!mongoose.Types.ObjectId.isValid(chatbotId)) {
      return createErrorResponse( "Invalid chatbot ID.", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(websiteId)) {
      return createErrorResponse( `Invalid website ID ${websiteId}`, 400);
    }

    const bot = await chatbot.findById(chatbotId);

    if (!bot) {
      return createErrorResponse( "Chatbot not found", 404);
    }
    
    const website = await websites.findById(websiteId);

    if (!website) {
      return createErrorResponse( "Incorrect Website ID", 404); 
    }
    
    let data;
    if (setting) {
      data = {
        id: bot._id.toString(),
        chatbotPic: bot.chatbotPic,
        chatbotName: bot.chatbotName,
        instructions: bot.instructions,
        conversationStarters: bot.conversationStarters,
        description: bot.description,
        temperature: bot.temperature,
        publishedStatus: bot.publishedStatus,
        publishAt: bot.publishAt,
        llm: website.llm,
      }
    } else {
      data = {
        id: bot._id.toString(),
        chatbotPic: bot.chatbotPic,
        chatbotName: website.chatbotName,
        
        temperature: website.temperature,
        instructions: website.instructions,
        conversationStarters: website.conversationStarters,
        description: website.description,
        publishedStatus: website.publishedStatus,
        publishAt: bot.publishAt,
        llm: website.llm,
      }
    }
    const isConnected = bot.connectedWebsites.includes(websiteId);

    if (!isConnected) {
      return createErrorResponse( "Website instance is not connected to this chatbot", 400); 
    }

    return NextResponse.json(
      {
        data
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching chatbot:", error);
    return createErrorResponse( "", 500);
  }
}

/* Toggle Publish Status */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return createErrorResponse( "", 401);
    }
    await ConnectToDB();
    const searchedParams = await params;
    const chatbotId = searchedParams.id;

    const { publishedStatus } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(chatbotId)) {
      return createErrorResponse( "Invalid chatbot ID format", 400);
    }

    let publishAt = undefined;

    if (!publishedStatus) {
      publishAt = Date.now();
    }

    const updatedBot = await chatbot.findByIdAndUpdate(
      chatbotId,
      {
        publishedStatus: !publishedStatus,
        ...(publishAt && { publishAt }), // Only include `publishAt` if it has a value
      },
      { new: true }
    );

    if (!updatedBot) {
      return createErrorResponse( "Chatbot not found", 404); 
    }

    return NextResponse.json(
      {
        data: { id: updatedBot._id.toString(), publishStatus: updatedBot.publishStatus },
        message: `Chatbot publish status updated successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating chatbot publish status:", error);
    return createErrorResponse( "", 500); 
  }
}

interface Training {
  _id: string;
  files: {
    s3Link: string;
    documentIds: string[];
  }[];
}

/* delete chatbot Route */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return createErrorResponse( "", 401); 
    }
  if (req.method !== "DELETE") {
    return createErrorResponse( "", 405); 
  }

  const searchedParams = await params;
  const chatbotId = searchedParams.id;

  if (!mongoose.Types.ObjectId.isValid(chatbotId)) {
   return createErrorResponse( "Invalid chatbot ID format", 400); 
  }

  try {
    const deletedChatbot = await chatbot.findByIdAndDelete(chatbotId);

    if (!deletedChatbot) {
      return createErrorResponse( "Chatbot not found", 404); 
    }

    const trainings = await training.find({ chatbotId });
    if (trainings) {
      const resD = trainings.map((train) => ({
        id: train._id.toString(),
        files: train.files,
      }));
      const deletePromises = resD.map(({ files }) => {
        return files.map(({ s3Link }: { s3Link: string }) => deleteFileFromS3(s3Link));
      });
      const allDocumentIds = trainings.flatMap((train: Training) =>
        train.files.flatMap((file) => file.documentIds)
      );
      await Promise.all(deletePromises);
      if (allDocumentIds.length > 0) {
        try {
          const vectorStoreChatbot = await getVectorStore(process.env.PINECONE_chatbot_INDEX!);
          await vectorStoreChatbot.delete({ ids: allDocumentIds });
        } catch(error) {
          console.log(error, ' :deleting chatbot vectors')
        }
      }

      await training.deleteMany({ chatbotId });
    }


    if (deletedChatbot.chatbotPic) {
      await deleteFileFromS3(deletedChatbot.chatbotPic);
    }

    try {
      const vectorStore = await getVectorStore(process.env.PINECONE_WP_POST_INDEX!);

      await vectorStore.delete({ deleteAll: true, namespace: chatbotId });
    } catch (error) {
      console.log(error);
    }

    return NextResponse.json(
      { message: "Chatbot and associated training records deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting chatbot:", error);
    return createErrorResponse( "", 500); 
  }
}
