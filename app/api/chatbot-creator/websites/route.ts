import { ConnectToDB } from "@/config/db";
import websites from "@/schemas/websites";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import chatbot from "@/schemas/chatbot";
import { createErrorResponse } from "@/utils/errorHandler";

// Create WebsiteId
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id
    const body = await req.json();
    const { chatbotId, domainName } = body;
    if (!ObjectId.isValid(chatbotId)) {
      return NextResponse.json({ error: "Invalid chatbot ID format" }, { status: 400 });
    }
    const website = await websites.create({
      chatbotId: new mongoose.Types.ObjectId(chatbotId),
      createdBy: userId,
      domainName,
    });
    await chatbot.findOneAndUpdate(
      { _id: chatbotId },
      { $push: { connectedWebsites: website._id } }, 
      { new: true } 
    );
    return NextResponse.json(
      {
        data: {
          _id: website._id.toString(),
          domainName: website.domainName,
          chatbotId,
          createdAt: Date.now()
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching chatbot:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



// Get paginated websites by chatbotId
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const chatbotId = searchParams.get("chatbotId") || '';
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || '';

    if (!ObjectId.isValid(chatbotId)) {
      return createErrorResponse( "Invalid chatbot ID format", 400); 
    }

    if (page < 1 || limit < 1) {
      return createErrorResponse( "Invalid pagination parameters", 400);  
    }

    await ConnectToDB();

    // Create search query
    const searchQuery = search 
      ? { 
          chatbotId, 
          $or: [
            { domainName: { $regex: search, $options: 'i' } }
          ]
        }
      : { chatbotId };

    // Fetch paginated websites
    const websitesList = await websites
      .find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit);

    // Count total documents for pagination info
    const totalWebsites = await websites.countDocuments(searchQuery);

    if (!websitesList || websitesList.length === 0) {
      return NextResponse.json({ 
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          hasNextPage: false,
        },
      }, { status: 200 });
    }
    return NextResponse.json(
      {
        data: websitesList,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalWebsites / limit),
          totalItems: totalWebsites,
          hasNextPage: page * limit < totalWebsites,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching websites:", error);
    return createErrorResponse( "", 500);   
  }
}
