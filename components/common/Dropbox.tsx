"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DropboxProps {
    files: File[];
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  }

  
export default function Dropbox({files, setFiles}: DropboxProps) {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    setFiles((prevFiles) => [...prevFiles, ...Array.from(e.dataTransfer.files)]);
};

const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return; // Ensure files exist
  setFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
  };
  
  return (
    <div className="w-full max-w-md">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Upload Files</h3>
        <p className="text-muted-foreground">Drag and drop files here or click to browse.</p>
      </div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mt-4 flex h-48 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors focus-within:border-primary focus-within:bg-primary/10 ${
          isDragOver ? "border-primary bg-primary/10" : "border-muted hover:border-primary"
        }`}
      >
        <div className="space-y-2 text-center">
          <CloudUploadIcon className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            Drag and drop files here or {" "}
            <label
              htmlFor="file-upload"
              className="font-medium text-primary hover:underline focus:text-primary-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              click to browse
            </label>
          </p>
          <input id="file-upload" type="file" multiple onChange={handleFileSelect} className="sr-only" />
        </div>
      </div>
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-2 focus-within:bg-primary/10 focus-within:outline-none focus-within:ring-1 focus-within:ring-primary"
            >
              <div className="flex items-center gap-2">
                <FileIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:outline-none focus:ring-1 focus:ring-destructive"
              >
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CloudUploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M12 12v9" />
      <path d="m16 16-4-4-4 4" />
    </svg>
  );
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}