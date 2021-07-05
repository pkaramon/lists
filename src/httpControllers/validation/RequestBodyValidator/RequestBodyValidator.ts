import DataResponse from "../../DataResponse";
import ErrorResponse from "../../ErrorResponse";
import HttpRequest from "../../HttpRequest";
import StatusCode from "../../StatusCode";
import ObjectValidator, { InvalidDataFormatError } from "../ObjectValidator";
import Shape from "../Shape";

interface Controller {
  handle(req: HttpRequest<{}>): Promise<any>;
}

interface ControllerClass {
  new (...args: any[]): Controller;
  requestBodyShape: Shape;
}

interface ObjectValidatorConstructor {
  new (shape: Shape): ObjectValidator<any>;
}

export default function buildRequestBodyValidator(
  ObjectVaildator: ObjectValidatorConstructor
) {
  return function RequestBodyValidator<Class extends ControllerClass>(
    target: Class
  ) {
    return class extends target {
      private requestBodyValidator = new ObjectVaildator(
        target.requestBodyShape
      );

      async handle(req: HttpRequest<any>) {
        try {
          req.body = await this.requestBodyValidator.validate(req.body);
        } catch (e) {
          return this.handleRequestBodyValidatorErrors(e);
        }
        return super.handle(req);
      }

      private handleRequestBodyValidatorErrors(error: any) {
        if (error instanceof InvalidDataFormatError) {
          return new ErrorResponse(
            StatusCode.BadRequest,
            "invalid data format"
          );
        } else {
          return new DataResponse(StatusCode.BadRequest, {
            error: "invalid data",
            invalidKeys: error.invalidKeys,
          });
        }
      }
    };
  };
}
