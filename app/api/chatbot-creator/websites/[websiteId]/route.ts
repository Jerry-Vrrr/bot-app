import { ConnectToDB } from "@/config/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import websites from "@/schemas/websites";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { createErrorResponse } from "@/utils/errorHandler";

// Get website chatbot data
export async function GET(req: NextRequest, params: { params: Promise<{ websiteId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
       return createErrorResponse( "", 401);
    }

    const context = await params.params;
    const websiteId = context.websiteId;
    if (!ObjectId.isValid(websiteId)) {
      return createErrorResponse( "Invalid chatbot ID format", 400);
    }

    await ConnectToDB();

    const website = await websites.findById(websiteId);

    if (!website) {
      return createErrorResponse( "Chatbot not found", 404); 
    }

    return NextResponse.json(
      {
        data: {
            website
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching chatbot:", error);
    return createErrorResponse( "", 500); 
  }
}

// Update the website specific chatbot data
export async function PATCH(req: NextRequest, params: { params: Promise<{ websiteId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return createErrorResponse( "", 401); 
    }
    const body = await req.json();
    const { chatbotName, description, conversationStarters, instructions, llm, temperature } = body;
    const context = await params.params;
    const websiteId = context.websiteId;
    console.log(temperature, ' ::temperature')
    console.log(typeof temperature, ' ::typeof temperature')
    
    if (!ObjectId.isValid(websiteId)) {
      return createErrorResponse( "Invalid Website ID format", 400); 
    }
    await ConnectToDB();

    const updatedWebsite = await websites.findByIdAndUpdate(
      websiteId,
      {
        chatbotName,
        description,
        conversationStarters,
        temperature,
        instructions,
        llm
      },
      { new: true } 
    );

    if (!updatedWebsite) {
      return createErrorResponse( "Website not found", 404); 
    }

    return NextResponse.json({ data: updatedWebsite }, { status: 200 });
  } catch (error) {
    console.error("Error updating website:", error);
    return createErrorResponse( "", 500); 
  }
}


  