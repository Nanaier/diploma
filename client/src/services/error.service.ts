// src/services/error.service.ts
export class ErrorService {
  private static errorMessages: Record<string, string> = {
    DEFAULT: "Something went wrong. Please try again.",
    NETWORK_ERROR: "Network error. Please check your connection.",
    UNAUTHORIZED: "Please log in to access this feature.",
    FORBIDDEN: "You don't have permission to perform this action.",
    NOT_FOUND: "The requested resource was not found.",
    VALIDATION_ERROR: "Please check your input and try again.",
    EVENT_TIME_PAST: "Cannot create events in the past.",
    EVENT_TIME_CONFLICT: "The selected time conflicts with an existing event.",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static getReadableError(error: any): string {
    if (error?.response?.data?.message) {
      return (
        this.errorMessages[error.response.data.message] ||
        error.response.data.message ||
        this.errorMessages.DEFAULT
      );
    }

    if (error?.message) {
      return this.errorMessages[error.message] || error.message;
    }

    return this.errorMessages.DEFAULT;
  }
}
