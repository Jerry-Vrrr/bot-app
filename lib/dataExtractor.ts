'use server'
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";

interface PDFExtractResult {
  text: string;
  metadata: {
    source: string;
    pageCount: number;
    author?: string;
    creationDate?: string;
    title?: string;
  };
}

export async function extractPDFContent(
  file: File | Buffer | string
): Promise<PDFExtractResult> {
  try {
    // Create loader based on input type
    let loader: PDFLoader;
    
    if (typeof file === 'string') {
      // Handle filepath
      loader = new PDFLoader(file);
    } else if (file instanceof File) {
      // Handle File object
      const blob = new Blob([await file.arrayBuffer()], { type: 'application/pdf' });
      loader = new PDFLoader(blob);
    } else {
      // Handle Buffer
      const blob = new Blob([file], { type: 'application/pdf' });
      loader = new PDFLoader(blob);
    }

    // Load and extract the documents
    const docs = await loader.load();
    
    // Combine all page contents
    const fullText = docs.map(doc => doc.pageContent).join('\n\n');
    
    // Extract metadata from the first page
    const metadata = {
      source: docs[0]?.metadata?.source || 'unknown',
      pageCount: docs.length,
      author: docs[0]?.metadata?.pdf?.info?.Author,
      creationDate: docs[0]?.metadata?.pdf?.info?.CreationDate,
      title: docs[0]?.metadata?.pdf?.info?.Title
    };

    return {
      text: fullText,
      metadata
    };
  } catch (error) {
    throw new Error(`Failed to extract PDF content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function extractDOCXContent(file: File | Buffer | string): Promise<{ text: string }> {
  try {
    let loader: DocxLoader;

    if (typeof file === "string") {
      // Handle filepath
      loader = new DocxLoader(file);
    } else if (file instanceof File) {
      // Convert File to Blob
      const blob = new Blob([await file.arrayBuffer()], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      loader = new DocxLoader(blob);
    } else {
      // Handle Buffer
      const blob = new Blob([file], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      loader = new DocxLoader(blob);
    }

    // Load and extract text from the DOCX file
    const docs = await loader.load();

    // Combine all extracted text
    const fullText = docs.map(doc => doc.pageContent).join("\n\n");

    return { text: fullText };
  } catch (error) {
    throw new Error(`Failed to extract DOCX content: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}


export async function extractCSVContent(
  file: File | Buffer | string,
  column?: string, // Optional: Specify a column to extract specific data
  separator: string = "," // Default separator is a comma
) {
  try {
    let loader: CSVLoader;

    if (typeof file === "string") {
      // Handle file path
      loader = new CSVLoader(file, { column, separator });
    } else if (file instanceof File) {
      // Convert File to Blob
      const blob = new Blob([await file.arrayBuffer()], { type: "text/csv" });
      loader = new CSVLoader(blob, { column, separator });
    } else {
      // Handle Buffer
      const blob = new Blob([file], { type: "text/csv" });
      loader = new CSVLoader(blob, { column, separator });
    }

    // Load CSV data
    const docs = await loader.load();

    // Combine all extracted text
    const fullText = docs.map(doc => doc.pageContent).join("\n");

    // Extract metadata (e.g., source file and line number)
    const metadata = docs.map(doc => doc.metadata);

    return { text: fullText, metadata };
  } catch (error) {
    throw new Error(`Failed to extract CSV content: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
