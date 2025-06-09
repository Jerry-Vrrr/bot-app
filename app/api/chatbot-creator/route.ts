import { ConnectToDB } from "@/config/db";
import chatbot from "@/schemas/chatbot";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { deleteFileFromS3, uploadFileToS3 } from "@/config/awsS3Config";
import { createErrorResponse } from "@/utils/errorHandler";

/* Create a chatbot Route. */

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return createErrorResponse( "", 401);   
  }
  const userId = session.user.id;
  await ConnectToDB();

  const formData = await req.formData();
  const chatbotName = formData.get("chatbotName") as string;
  const description = formData.get("description") as string;
  const chatbotImageFile = formData.get("chatbotImage") as File | null;

  let imageUrl = "";

  if (chatbotImageFile) {
    const fileType = chatbotImageFile.type;
    if (fileType !== "image/jpeg" && fileType !== "image/png") {
      return createErrorResponse( "Invalid file type. Only JPEG and PNG are allowed", 400);   
      
    }
    const arrayBuffer = await chatbotImageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    imageUrl = await uploadFileToS3(buffer, chatbotImageFile.name, "bot_image");
  }

  const bot = await chatbot.create({
    chatbotPic: imageUrl,
    chatbotName,
    description,
    createdBy: userId,
  });

  return NextResponse.json(
    {
      data: {
        id: bot?._id.toString(),
        description: bot.description,
      },
    },
    { status: 200 }
  );
}

/* Update Chatbot info. */
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return createErrorResponse( "", 401); 
  }

  await ConnectToDB();
  const formData = await req.formData();

  const id = formData.get("id") as string;
  const chatbotName = formData.get("chatbotName") as string;
  const instructions = formData.get("instructions") as string;
  const description = formData.get("description") as string;
  const temperature = formData.get("temperature") as string;
  const conversationStarters = formData.getAll("conversationStarters") as string[];
  const chatbotImageFile = (formData.get("chatbotPic") as File) || null;
  const llmString = formData.get("llm");
  let llm;
  
  if (typeof llmString === "string") {
    llm = JSON.parse(llmString);
  }

  if (!id) {
    return createErrorResponse( "Missing chatbotId", 400); 
  }

  const bot = await chatbot.findById(id);
  if (bot && bot.chatbotPic && chatbotImageFile) {
    await deleteFileFromS3(bot.chatbotPic);
  }

  let imageUrl = "";

  if (chatbotImageFile) {
    const fileType = chatbotImageFile.type;
    if (fileType !== "image/jpeg" && fileType !== "image/png") {
      return createErrorResponse( "Invalid file type. Only JPEG and PNG are allowed.", 400);  
    }
    const arrayBuffer = await chatbotImageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    imageUrl = await uploadFileToS3(buffer, chatbotImageFile.name, "bot_image");
  }
  const updatedBot = await chatbot.findByIdAndUpdate(
    id,
    {
      chatbotName,
      description,
      temperature: parseFloat(temperature),
      instructions,
      conversationStarters,
      ...(imageUrl && { chatbotPic: imageUrl }),
      llm
    },
    { new: true }
  );

  if (!updatedBot) {
    return createErrorResponse( "Chatbot not found.", 404);   
  }

  return NextResponse.json(
    {
      data: {
        id: updatedBot._id.toString(),
        chatbotName: updatedBot.chatbotName,
        description: updatedBot.description,
      },
    },
    { status: 200 }
  );
}

// Get all chatbots
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return createErrorResponse( "", 401);  
    }

    const userId = session.user.id;
    await ConnectToDB();

    // Get pagination parameters from URL
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search") || "";

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    const searchFilter = search
      ? {
          $or: [
            { description: { $regex: search, $options: "i" } },
            { chatbotName: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Get total count of chatbots for this user
    const totalCount = await chatbot.countDocuments({ createdBy: userId });
    const totalPages = Math.ceil(totalCount / limit);

    const chatbots = await chatbot
      .find({ createdBy: userId, ...searchFilter })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json(
      {
        data: chatbots.map((bot) => ({
          id: bot._id.toString(),
          chatbotPic: bot.chatbotPic,
          chatbotName: bot.chatbotName,
          description: bot.description,
          publishedStatus: bot.publishedStatus,
          createdAt: bot.createdAt,
          updatedAt: bot.updatedAt,
          publishAt: bot.publishAt,
        })),
        pagination: {
          totalItems: totalCount,
          totalPages,
          currentPage: page,
          itemsPerPage: limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching chatbots:", error);
    return createErrorResponse( "", 500);   
  }
}
