import DataResponse from "../../DataResponse";
import ErrorResponse from "../../ErrorResponse";
import { HttpControllerConstructor } from "../../HttpController";
import HttpRequest from "../../HttpRequest";
import StatusCode from "../../StatusCode";
import ObjectValidator, {
  InvalidDataError,
  InvalidDataFormatError,
} from "../ObjectValidator";
import Shape from "../Shape";

interface ControllerClass extends HttpControllerConstructor {
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
      private objectValidator = new ObjectVaildator(target.requestBodyShape);

      async handle(req: HttpRequest<any>) {
        try {
          req.body = await this.objectValidator.validate(req.body);
        } catch (e) {
          return this.handleObjectValidatorError(e);
        }
        return super.handle(req);
      }

      private handleObjectValidatorError(error: any) {
        if (error instanceof InvalidDataFormatError)
          return this.generateResponseForDataInvalidFormat();
        else return this.generateResonseForInvalidData(error);
      }

      private generateResponseForDataInvalidFormat() {
        return new ErrorResponse(StatusCode.BadRequest, "invalid data format");
      }

      private generateResonseForInvalidData(error: InvalidDataError) {
        return new DataResponse(StatusCode.BadRequest, {
          error: "invalid data",
          invalidKeys: error.invalidKeys,
        });
      }
    };
  };
}
