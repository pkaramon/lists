import TokenValidator from "../../auth/TokenValidator";
import ErrorResponse from "../ErrorResponse";
import HttpRequest from "../HttpRequest";

interface Controller {
  handle(req: { body: { token: string } }): Promise<any>;
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
        const token = req.body.token;
        try {
          req.auth = {};
          req.auth.userId = await tokenValidator.validate(token);
        } catch (e) {
          return new ErrorResponse(400, "user token is invalid");
        }
        return super.handle(req);
      }
    };
  };
}
