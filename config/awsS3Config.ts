// utils/s3.ts
import { S3 } from 'aws-sdk';

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/**
 * Upload a file to S3
 * @param buffer - The file content as a buffer.
 * @param fileName - The name to save the file as in S3.
 * @returns - The URL of the uploaded file.
 */
export const uploadFileToS3 = async (buffer: Buffer, fileName: string, contentType: string = "Knowledge_base"): Promise<string> => {
  let prefix = "others/"; 

  if (contentType === "bot_image") {
    prefix = "images/";
  } else if (contentType === "Knowledge_base") {
    prefix = "documents/";
  } 
  const params: {
    Bucket: string;
    Key: string;
    Body: Buffer;
    ContentType: string;
  } = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: `${prefix}${Date.now()}-${fileName}`,
    Body: buffer,
    ContentType: 'application/octet-stream',
  };

  try {
    const uploadResult = await s3.upload(params).promise();
    return uploadResult.Location;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

/**
 * Generates a pre-signed URL for direct client uploads.
 * @param fileName - The name of the file.
 * @param fileType - The MIME type of the file.
 * @returns A pre-signed URL that allows the client to upload directly to S3.
 */
export const generatePresignedUrl = async (
  fileName: string,
  fileType: string
): Promise<string> => {
  // Define prefix based on file type
  let prefix = "others/";
  if (fileType.startsWith("image/")) {
    prefix = "images/";
  } else if (
    fileType === "application/pdf" ||
    fileType === "text/csv" ||
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    prefix = "documents/";
  }

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: `${prefix}${Date.now()}-${fileName}`,
    Expires: 60,
    ContentType: fileType,
  };

  try {
    const url = await s3.getSignedUrlPromise('putObject', params);
    return url;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error("Failed to generate presigned URL");
  }
};

export const downloadFileFromS3 = async (fileUrl: string): Promise<Buffer> => {
  const url = new URL(fileUrl);
  const fileKey = decodeURIComponent(url.pathname.substring(1));
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: fileKey!,
  };

  try {
    const data = await s3.getObject(params).promise();
    return data.Body as Buffer;
  } catch (error) {
    console.error('S3 download error:', error);
    throw new Error('Failed to download file from S3');
  }
};

/**
 * Delete a file from S3
 * @param fileUrl - The URL of the file stored in S3.
 */
export const deleteFileFromS3 = async (fileUrl: string): Promise<void> => {
  if (!fileUrl) {
    throw new Error('File URL is required');
  }

  try {
    const url = new URL(fileUrl);
    const fileKey = decodeURIComponent(url.pathname.substring(1));
    
    const bucket = process.env.AWS_S3_BUCKET_NAME!;

    console.log('Deletion attempt details:', {
      originalUrl: fileUrl,
      fileKey,
      bucket
    });

    const deleteParams = {
      Bucket: bucket,
      Key: `${fileKey}`,
    };

    console.log('Attempting to delete with params:', deleteParams);
    
    const deleteResponse = await s3.deleteObject({ Bucket: bucket, Key: fileKey }).promise();
    console.log('Delete response:', deleteResponse);

    // Verify deletion
    try {
      const res=await s3.headObject({
        Bucket: bucket,
        Key: fileKey,
      }).promise();
      console.log(res,'Warning: File still exists after deletion attempt');
    } catch (verifyErr: unknown) {
      if (verifyErr instanceof Error && 'code' in verifyErr) {
        const errorCode = (verifyErr as { code: string }).code;
        if (errorCode === 'NotFound') {
          console.log('Success: File has been deleted');
          return;
        }
        console.log('Error during verification:', errorCode);
      } else {
        console.error('Unexpected error format:', verifyErr);
      }
    }

  } catch (error) {
    console.error('Deletion error:', error);
    throw error;
  }
};


export const s3Config = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
