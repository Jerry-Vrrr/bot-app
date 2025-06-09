import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { deleteFileFromS3 } from "@/config/awsS3Config";
import { ConnectToDB } from "@/config/db";
import { getVectorStore } from "@/config/pinecone";
import training, { ITraining } from "@/schemas/training";
import { createErrorResponse } from "@/utils/errorHandler";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

/* Delete training Route. */

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ trainingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return createErrorResponse("", 401 );
    }


    const searchedParams = await params;
    const trainingId = searchedParams.trainingId;
    if (!trainingId) {
      return NextResponse.json({ error: "trainingId is required" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(trainingId)) {
      return createErrorResponse( "Invalid trainingId", 400 );
    }
    await ConnectToDB();

    const train: ITraining | null = await training.findById(trainingId);

    if (!train) {
      return createErrorResponse( "Training not found", 404);
    }

    const allDocumentIds = train.files.flatMap((file) => file.documentIds);
    if (allDocumentIds.length > 0) {
      try {
        const vectorStore = await getVectorStore(process.env.PINECONE_chatbot_INDEX!);

      await vectorStore.delete({
        ids: allDocumentIds,
      });
      } catch(error) {
        console.log(error, ' :deleting training vectors')
      }
    }

    const deletePromises = train.files.map(({ s3Link }: { s3Link: string }) =>
      deleteFileFromS3(s3Link)
    );
    await Promise.all(deletePromises);

    await training.findByIdAndDelete(trainingId);

    return NextResponse.json({ message: "Training deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return createErrorResponse( "", 500);
  }
}
