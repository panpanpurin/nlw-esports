import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../errors/http-error';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof HttpError) {
    return response.status(error.statusCode).json({ message: error.message });
  }

  if (error instanceof ZodError) {
    return response.status(400).json({
      message: 'Invalid request body',
      issues: error.flatten().fieldErrors,
    });
  }

  if (error?.type === 'entity.parse.failed') {
    return response.status(400).json({ message: 'Malformed JSON body' });
  }

  console.error(error);

  return response.status(500).json({ message: 'Internal server error' });
};
