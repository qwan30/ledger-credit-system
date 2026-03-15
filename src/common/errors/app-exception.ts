export interface AppExceptionDetail {
  field?: string;
  message: string;
}

export class AppException extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: AppExceptionDetail[]
  ) {
    super(message);
  }
}
