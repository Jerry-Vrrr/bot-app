import { NextResponse } from "next/server";

type ErrorCode = 500 | 404 | 400 | 401 | 403 | 405 | 422; // Add more status codes here if needed

// Predefined error messages for each status code
export const errorMessages: Record<ErrorCode, { message: string; details: string }> = {
  500: {
    message: "Internal Server Error",
    details: "An unexpected error occurred on the server.",
  },
  404: {
    message: "Not Found",
    details: "The requested resource could not be found.",
  },
  400: {
    message: "Bad Request",
    details: "The request could not be processed due to invalid input.",
  },
  401: {
    message: "Unauthorized",
    details: "Authentication is required to access this resource.",
  },
  403: {
    message: "Forbidden",
    details: "You do not have permission to access this resource.",
  },
  422: {
    message: "Unprocessable Entity",
    details: "The request was well-formed but contains invalid data.",
  },
  405: {
    message: "Method Not Allowed",
    details: "The HTTP method used is not allowed for this resource.",
  },
  // Add more error codes and messages here as needed
};

export const createErrorResponse = (additionalMessage: string | null, statusCode: ErrorCode) => {
  const error = errorMessages[statusCode] || {
    message: "Something went wrong",
    details: "An error occurred, please try again later.",
  };

  const errorMessage = {
    error: error.message,
    details: additionalMessage ? `${error.details}: ${additionalMessage}` : error.details,
  };

  return NextResponse.json(errorMessage, {
    status: statusCode,
  });
};
