/**
 * 업로드 관련 타입 및 인터페이스 정의
 */

// 업로드 응답 인터페이스
export interface IUploadResponse {
  imageUrl: string;
  message?: string;
}

// 업로드 설정 인터페이스
export interface IUploadConfig {
  uploadDir: string;
  allowedExtensions: string[];
  maxFileSize: number; // bytes
}
