class ErrorHandler extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    // Capture stack trace (Node.js feature)
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;
