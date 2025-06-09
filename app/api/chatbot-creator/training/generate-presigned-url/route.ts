import { generatePresignedUrl } from "@/config/awsS3Config";
import { createErrorResponse } from "@/utils/errorHandler";
import { NextRequest, NextResponse } from "next/server";

// generate-presigned-url

export async function POST(req: NextRequest) {
    try {
      const { fileName, fileType } = await req.json();
      const url = await generatePresignedUrl(fileName, fileType);
      return NextResponse.json(
        {
          data: {
            url
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.log(error)
      createErrorResponse( "", 500);
      return 
    }
  }
  