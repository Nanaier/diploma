// src/common/exceptions/app.exception.ts
export class AppException extends Error {
  public readonly isOperational: boolean;

  constructor(
    public readonly message: string,
    public readonly statusCode: number = 400,
    public readonly code: string = 'APP_ERROR',
    public readonly details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundException extends AppException {
  constructor(entity: string) {
    super(`${entity} not found`, 404, 'NOT_FOUND');
  }
}

export class ValidationException extends AppException {
  constructor(errors: Record<string, string[]>) {
    super('Validation failed', 400, 'VALIDATION_ERROR', { errors });
  }
}

export class UnauthorizedException extends AppException {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenException extends AppException {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}