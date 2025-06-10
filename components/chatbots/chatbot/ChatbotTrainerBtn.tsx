import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import Popup from '@/components/common/Popup';
import LoadingScreen from '@/components/common/LoadingScreen';
import CustomAlert from '@/components/common/CustomAlert';
import useAutoResetError from '@/hooks/useAutoResetError';
import axios from "axios";
interface ChatbotData {
  name: string;
  description: string;
  files: File[];
}

interface FileUpload {
  file: File;
  progress: number;
  s3Url?: string;
}

const ChatbotTrainerBtn = ({ chatbotId, getTrainings, setFetchingTrainings }: { chatbotId: string, setFetchingTrainings: React.Dispatch<React.SetStateAction<boolean>>, getTrainings: () => Promise<void>; }) => {
  const [isTrainingStatus, setIsTrainingStatus] = useState<boolean>(false)
  const { error, setError } = useAutoResetError(3000);
  const [fileUploads, setFileUploads] = useState<FileUpload[]>([]);
  const [isFilesUploading, setIsFilesUploading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState<ChatbotData>({
    name: '',
    description: '',
    files: [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const allowedTypes = [
        "text/csv",
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ];

      const selectedFiles = Array.from(e.target.files);

      const invalidFiles = selectedFiles.filter(file => !allowedTypes.includes(file.type));

      if (invalidFiles.length > 0) {
        setError(`Invalid file type detected: ${invalidFiles.map(file => file.name).join(", ")}. Only CSV, DOCX, and PDF are allowed.`);
        return;
      }

      const existingFilesSize = formData.files.reduce((acc, file) => acc + file.size, 0);
      const newFilesSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);
      const totalSize = existingFilesSize + newFilesSize;
      const maxSize = 30 * 1024 * 1024;
      if (totalSize > maxSize) {
        setError(`Maximum upload limit reached. Total file size must not exceed 30MB.`);
        return;
      }

      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...selectedFiles]
      }));

      setFileUploads(prev => ([
        ...prev,
        ...selectedFiles.map(file => ({ file, progress: 0 }))
      ]));

    }
  };

  const handleRemoveFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
    setFileUploads((prev) => prev.filter((_, i) => i !== index));

  };

  const uploadFileToS3 = async (fileUpload: FileUpload, index: number): Promise<string> => {
    // Request pre-signed URL from server
    setIsFilesUploading(true)
    try {
      const response = await fetch("/api/chatbot-creator/training/generate-presigned-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: fileUpload.file.name, fileType: fileUpload.file.type })
    });
    const data = await response.json();
    console.log(data,' :::::::data')
    const url = data.data.url
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setFileUploads((prev) => {
            const newUploads = [...prev];
            newUploads[index].progress = progress;
            return newUploads;
          });
        }
      });
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            // Assuming you can compute the S3 URL from the pre-signed URL or store the file key separately
            // Here, we simply resolve with the pre-signed URL minus query params as the S3 file URL.
            const s3Url = url.split('?')[0];
            resolve(s3Url);
          } else {
            console.error("Upload failed with status:", xhr.status, xhr.statusText);
            console.error("Response:", xhr.responseText);
            setOpen(true)
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText} - ${xhr.responseText}`));
          }
        }
      };
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", fileUpload.file.type);
      xhr.send(fileUpload.file);
    });
    } catch(error) {
      console.log(error, ' preassigned')
      throw error
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.description.trim() || formData.files.length === 0) {
      setError("Please fill in all fields and upload at least one file.");
      return false;
    }
    setIsTrainingStatus(true);
    
    if (isTrainingStatus) {
      return false
    }
    setError(null);

    try {
      // Upload each file to S3
      const s3Urls: string[] = [];
      for (let i = 0; i < fileUploads.length; i++) {
        const s3Url = await uploadFileToS3(fileUploads[i], i);
        console.log(s3Url, ' ::::s3Url')
        s3Urls.push(s3Url);
      }
      setFetchingTrainings(true);
      
      setOpen(false)
      // Now, send the metadata (including s3Urls) to your training endpoint
      const trainingData = new FormData();
      trainingData.append("name", formData.name);
      trainingData.append("description", formData.description);
      trainingData.append("chatbotId", chatbotId);
      s3Urls.forEach((url) => trainingData.append("s3Urls", url));

      // The training endpoint should then download files from S3, extract text, and process as needed.
      const response = await axios.post("/api/chatbot-creator/training", trainingData);

      if (response.status === 200) {
        await getTrainings();
        setFormData({ name: '', description: '', files: [] });
        setFileUploads([])
        setIsTrainingStatus(false);
        setFetchingTrainings(false);
        setIsFilesUploading(false)
        return true;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      setIsTrainingStatus(false);
      setFetchingTrainings(false);
      setIsFilesUploading(false)
      setOpen(true)
      return false;
    }
  };

  return (
    <>

      {isTrainingStatus && <LoadingScreen message={"Training in progress...\n This may take a few moments."} />}
      <Popup open={open} setOpen={setOpen} title="Train chatbot" triggerLabel="Train Chatbot" onSubmit={handleSubmit} submitLabel="Train">
        {
          error && <CustomAlert type={"error"} title={"Error"} message={error} />
        }
        <div className="space-y-4">
          <div className="flex flex-col">
            <Label className="font-semibold">Name</Label>
            <Input
              className="mt-2 border-mintGreen"
              placeholder="Name your training for easy filtering"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col">
            <Label className="font-semibold">Description</Label>
            <Input
              className="mt-2 border-mintGreen"
              placeholder="Describe your training"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>


          <div className="flex flex-col">
            <Label className="font-semibold">Upload Files</Label>
            <Input
              className="mt-2 border-mintGreen"
              type="file"
              multiple
              onChange={handleFileChange}
            />
            <div className="mt-2">
              {fileUploads.map((upload, index) => (
                <div key={index} className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="border px-2 py-1 rounded">
                      {upload.file.name} (
                      {upload.file.size < 1024 * 1024
                        ? `${(upload.file.size / 1024).toFixed(2)} KB`
                        : `${(upload.file.size / (1024 * 1024)).toFixed(2)} MB`}
                      )
                    </span>
                    <Button variant="destructive" disabled={isFilesUploading} size="sm" onClick={() => handleRemoveFile(index)}>X</Button>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded">
                    <div
                      className="bg-blue-500 h-2 rounded"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </Popup>
    </>);
};

export default ChatbotTrainerBtn;