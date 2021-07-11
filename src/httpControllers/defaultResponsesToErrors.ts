import ListNotFoundError from "../usecases/ListNotFoundError";
import ServerError from "../usecases/ServerError";
import UserNoAccessError from "../usecases/UserNoAccessError";
import ErrorResponse from "./ErrorResponse";
import HttpResponse from "./HttpResponse";
import StatusCode from "./StatusCode";

export function errorToResponse(error: Error): HttpResponse {
  return DefaultResponsesToErrors.getResponseFor(error);
}

type HandlerOrResponse = ((e: Error) => HttpResponse) | HttpResponse;

class DefaultResponsesToErrors {
  static map = new Map();

  static add(errorConstructor: Function, handler: HandlerOrResponse) {
    this.map.set(errorConstructor, handler);
  }

  static getResponseFor(error: Error) {
    const handlerOrResponse = this.map.get(error.constructor);
    if (typeof handlerOrResponse === "function")
      return handlerOrResponse(error);
    else return handlerOrResponse;
  }
}

DefaultResponsesToErrors.add(
  UserNoAccessError,
  new ErrorResponse(StatusCode.Unauthorized, "you have no access to this list")
);

DefaultResponsesToErrors.add(
  ListNotFoundError,
  new ErrorResponse(StatusCode.NotFound, "list not found")
);

DefaultResponsesToErrors.add(
  ServerError,
  new ErrorResponse(500, "server error")
);
