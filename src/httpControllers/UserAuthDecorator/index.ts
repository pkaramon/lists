import TokenValidator from "../../auth/TokenValidator";
import ErrorResponse from "../ErrorResponse";
import HttpRequest from "../HttpRequest";
import StatusCode from "../StatusCode";

interface Controller {
  handle(req: HttpRequest<any>): Promise<any>;
}

interface ControllerConstructor {
  new (...args: any[]): Controller;
}

export default function buildUserAuthDecorator(tokenValidator: TokenValidator) {
  return function UserAuthDecorator<Class extends ControllerConstructor>(
    target: Class
  ) {
    return class extends target {
      async handle(req: HttpRequest<{ token: string }>) {
        try {
          const token = req.headers.authorization || "";
          req.auth = {};
          req.auth.userId = await tokenValidator.validate(token);
        } catch (e) {
          return this.getUnauthorizedResponse();
        }
        return super.handle(req);
      }

      private getUnauthorizedResponse() {
        return new ErrorResponse(
          StatusCode.Unauthorized,
          "user token is invalid"
        );
      }
    };
  };
}
