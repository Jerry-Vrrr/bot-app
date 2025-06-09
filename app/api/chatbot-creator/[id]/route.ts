import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb"; 
import { ConnectToDB } from "@/config/db";
import chatbot from "@/schemas/chatbot";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { createErrorResponse } from "@/utils/errorHandler";

/* Get selected chatbot. */

export async function GET(req: NextRequest, params: { params: Promise<{ id: string }> }) {
  console.log('running')
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return createErrorResponse("", 401) ;
    }
    const userId = session.user.id
    const context = await params.params;
    const chatbotId = context.id;
    if (!ObjectId.isValid(chatbotId)) {
      return createErrorResponse("Invalid chatbot ID format" ,400)
    }

    await ConnectToDB();

    const bot = await chatbot.findOne({ _id: chatbotId, createdBy: userId });
    if (!bot) {
      return createErrorResponse("Invalid chatbot ID format" ,400)
    }

    return NextResponse.json(
      {
        data: {
          id: bot._id.toString(),
          chatbotPic: bot.chatbotPic,
          chatbotName: bot.chatbotName,
          description: bot.description,
          temperature: bot.temperature,
          publishedStatus: bot.publishedStatus,
          instructions: bot.instructions,
          conversationStarters: bot.conversationStarters,
          llm: bot.llm,
          createdAt: bot.createdAt,
          UpdatedAt: bot.UpdatedAt,
          publishAt: bot.publishAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching chatbot:", error);
    return createErrorResponse('', 500)
  }
}

