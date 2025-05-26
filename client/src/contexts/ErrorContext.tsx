/* eslint-disable @typescript-eslint/no-explicit-any */
// src/contexts/ErrorContext.tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { AxiosError } from "axios";

type ErrorType = {
  message: string;
  code?: string;
  status?: number;
  details?: any;
};

type ErrorContextType = {
  error: ErrorType | null;
  setError: (error: unknown) => void;
  clearError: () => void;
  handleApiError: (error: unknown) => void;
};

const ErrorContext = createContext<ErrorContextType>({
  error: null,
  setError: () => {},
  clearError: () => {},
  handleApiError: () => {},
});

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [error, setError] = useState<ErrorType | null>(null);

  const handleSetError = useCallback((error: unknown) => {
    console.log(error);
    if (typeof error === "string") {
      setError({ message: error });
    } else if (error instanceof AxiosError) {
      setError({ message: error.response?.data.message });
    } else if (error instanceof Error) {
      setError({ message: error.message });
    } else {
      setError({ message: "An unexpected error occurred" });
    }
  }, []);

  const handleApiError = useCallback((error: unknown) => {
    console.log(error);
    if ((error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError;
      const response = axiosError.response;

      if (response) {
        const errorData = response.data as any;
        setError({
          message: errorData?.message || axiosError.message,
          code: errorData?.code || `HTTP_${response.status}`,
          status: response.status,
          details: errorData?.details,
        });
        return;
      }
    }

    // Handle non-Axios errors
    if (error instanceof Error) {
      setError({ message: error.message });
    } else {
      setError({ message: "An unexpected error occurred" });
    }
  }, []);

  const handleClearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <ErrorContext.Provider
      value={{
        error,
        setError: handleSetError,
        clearError: handleClearError,
        handleApiError,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => useContext(ErrorContext);
