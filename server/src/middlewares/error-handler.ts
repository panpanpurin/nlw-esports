import { ErrorRequestHandler } from "express";
import { HttpError } from "../errors/http-error";

export const errorHandler: ErrorRequestHandler = (error, request, response, next) => {
    if (error instanceof HttpError) {
        return response.status(error.statusCode).json({ message: error.message });
    }

    if (error?.type === "entity.parse.failed") {
        return response.status(400).json({ message: "Malformed JSON body" });
    }

    console.error(error);

    return response.status(500).json({ message: "Internal server error" });
};
