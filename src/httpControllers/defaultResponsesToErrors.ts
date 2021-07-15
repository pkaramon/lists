import ListNotFoundError from "../usecases/ListNotFoundError";
import ServerError from "../usecases/ServerError";
import UserNoAccessError from "../usecases/UserNoAccessError";
import ErrorResponse from "./ErrorResponse";
import HttpResponse from "./HttpResponse";
import StatusCode from "./StatusCode";

export function errorToResponse(error: Error): HttpResponse {
  return ErrorsToDefaultResponses.getResponseFor(error);
}

type HandlerOrResponse = ((e: Error) => HttpResponse) | HttpResponse;

class ErrorsToDefaultResponses {
  static map = new Map();

  static add(errorConstructor: Function, handler: HandlerOrResponse) {
    this.map.set(errorConstructor, handler);
  }

  static getResponseFor(error: Error): HttpResponse {
    const handlerOrResponse = this.getHandler(error) ?? this.defaultHandler;
    if (typeof handlerOrResponse === "function")
      return handlerOrResponse(error);
    else return handlerOrResponse;
  }

  private static getHandler(error: any) {
    return this.map.get(error.constructor);
  }

  private static get defaultHandler() {
    return this.map.get(ServerError);
  }
}

ErrorsToDefaultResponses.add(
  ServerError,
  new ErrorResponse(StatusCode.InternalServerError, "server error")
);

ErrorsToDefaultResponses.add(
  UserNoAccessError,
  new ErrorResponse(StatusCode.Unauthorized, "you have no access to this list")
);

ErrorsToDefaultResponses.add(
  ListNotFoundError,
  new ErrorResponse(StatusCode.NotFound, "list not found")
);
