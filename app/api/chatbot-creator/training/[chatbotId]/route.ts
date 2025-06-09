import { ConnectToDB } from "@/config/db";
import training from "@/schemas/training";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { createErrorResponse } from "@/utils/errorHandler";

/* Get all chatbot Trainings. */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return createErrorResponse( "", 401); 
    }

    const userId = session.user.id;
    await ConnectToDB();

    const url = new URL(request.url);
    const chatbotId = url.pathname.split('/').pop();
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const searchFilter = search
      ? {
          $or: [
            { trainingName: { $regex: search, $options: "i" } }, 
            { description: { $regex: search, $options: "i" } } 
          ]
        }
      : {};

    const totalCount = await training.countDocuments({ chatbotId, ...searchFilter });
    const totalPages = Math.ceil(totalCount / limit);

    const trainings = await training
      .find({ createdBy: userId, chatbotId, ...searchFilter })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return NextResponse.json(
      {
        data: trainings.map(item => ({
          id: item._id.toString(),
          name: item.trainingName,
          description: item.description,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
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
    console.error("Error fetching trainings:", error);
    return createErrorResponse( "", 500);
  }
}

