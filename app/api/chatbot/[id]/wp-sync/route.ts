import { ConnectToDB } from "@/config/db";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getVectorStore } from "@/config/pinecone";
import wpPost from "@/schemas/wpPost";
import * as cheerio from "cheerio";
import { v4 as uuidv4 } from "uuid";
import chatbot from "@/schemas/chatbot";
import websites from "@/schemas/websites";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { createErrorResponse } from "@/utils/errorHandler";

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 50,
  separators: [" ", ",", "\n", "|", "##", ">", "-", "\n"],
});

/* Get WP blog posts, CPTs. */

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ConnectToDB();
    const searchedParams = await params;
    const chatbotId = searchedParams.id;

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const contents = formData.get("contents") as string;
    const websiteId = formData.get("websiteId") as string;
    const wpId = formData.get("wpId") as string;

    const bot = await chatbot.findById(chatbotId);
    const website = await websites.findById(websiteId);

    if (!bot || !website) {
      return createErrorResponse("Incorrect chatbot or website ID.", 400);
    }
    console.log("getting vector store")
    const vectorStore = await getVectorStore(process.env.PINECONE_WP_POST_INDEX!);
    console.log('getting wpPost')
    const post = await wpPost.findOne({ websiteId, wpId });

    if (post) {
      if (post.documentIds.length > 0) {
        try {
          console.log("deleting vectors")
          await vectorStore.delete({
            ids: post.documentIds,
            namespace: chatbotId,
          });
          console.log("deleting posts")
          await wpPost.deleteOne({ wpId });
        } catch (error) {
          console.log(error, " Error while deleting wp");
        }
      }
    }
    console.log('cleaning')
    const $ = cheerio.load(contents); 
    const rawText = $.text().trim();
    const textContent = rawText
    .replace(/\r\n|\r/g, '\n')
    .replace(/\r\t|\r/g, '\n')    
    .replace(/[ \t]+\n/g, '\n')     
    .replace(/\n{2,}/g, '\n')      
    .trim();



    console.log(textContent, " :textContent");

    console.log(typeof textContent, " :typeof ");
    const chunks = await textSplitter.splitText(textContent);
    const ids: string[] = [];

    const uniqueChunks = new Set();
    console.log("tes123")
    const documents = chunks
      .filter((chunk) => {
        if (uniqueChunks.has(chunk)) return false;
        uniqueChunks.add(chunk);
        return true;
      })
      .map((chunk) => {
        const doc = {
          id: uuidv4(),
          pageContent: chunk,
          metadata: {
            source: title,
            chatbotId,
            websiteId,
            wpId,
          },
        };

        ids.push(doc.id);
        return doc;
      });
      console.log('WPPost creating')
    const train = await wpPost.create({
      title,
      websiteId: new mongoose.Types.ObjectId(websiteId),
      wpId,
      documentIds: ids,
      chatbotId: new mongoose.Types.ObjectId(chatbotId),
    });
    if (documents.length > 0) {
      console.log("getting vectorstore")
      const vectorStore = await getVectorStore(process.env.PINECONE_WP_POST_INDEX!);

      console.log("adding documents")
      await vectorStore.addDocuments(documents, {
        ids: documents.map((doc) => doc.id),
        namespace: chatbotId,
      });
    }
      console.log("response")

    return NextResponse.json(
      {
        data: {
          id: train._id.toString(),
          description: train.description,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);
    return createErrorResponse("", 500);
  }
}

// Delete Wordpress posts and website connection
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Ensure database connection is established
    const session = await getServerSession(authOptions);
    if (!session) {
      createErrorResponse("", 401);
      return;
    }
    await ConnectToDB();
    const { id: chatbotId } = await params;

    const { searchParams } = new URL(req.url);
    const websiteId = searchParams.get("websiteId");

    // Parse the request body expecting a JSON payload with the document IDs
    const posts = await wpPost.find({ websiteId }).select("documentIds");
    if (posts.length > 0) {
      // Flatten all documentIds into a single array
      const allDocumentIds = posts.flatMap((post) => post.documentIds);

      if (allDocumentIds.length > 0) {
        const vectorStore = await getVectorStore(process.env.PINECONE_WP_POST_INDEX!);
        await vectorStore.delete({ ids: allDocumentIds, namespace: chatbotId });
      }
    }

    await wpPost.deleteMany({ websiteId });
    await websites.findByIdAndDelete(websiteId);
    await chatbot.findByIdAndUpdate(
      chatbotId,
      { $pull: { connectedWebsites: websiteId } },
      { new: true }
    );

    return NextResponse.json(
      { message: "Website, WPPosts, and documents deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);
    createErrorResponse("", 500);
    return;
  }
}
