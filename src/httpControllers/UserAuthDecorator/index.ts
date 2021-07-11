import TokenValidator from "../../auth/TokenValidator";
import ErrorResponse from "../ErrorResponse";
import { HttpControllerConstructor } from "../HttpController";
import HttpRequest from "../HttpRequest";
import StatusCode from "../StatusCode";

export default function buildUserAuthDecorator(tokenValidator: TokenValidator) {
  return function UserAuthDecorator<Class extends HttpControllerConstructor>(
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
