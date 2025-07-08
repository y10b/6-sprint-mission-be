export interface UploadResponse {
  imageUrl: string;
  message?: string;
}

export interface UploadConfig {
  uploadDir: string;
  allowedExtensions: string[];
  maxFileSize: number; // bytes
}
