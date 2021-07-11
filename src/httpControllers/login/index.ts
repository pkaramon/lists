import InvalidLoginDataError from "../../usecases/login/InvalidLoginDataError";
import DataResponse from "../DataResponse";
import { errorToResponse } from "../defaultResponsesToErrors";
import ErrorResponse from "../ErrorResponse";
import HttpRequest from "../HttpRequest";
import StatusCode from "../StatusCode";
import UseCaseClass from "../UseCaseClass";
import FromShape from "../validation/FromShape";

type LoginUseCase = UseCaseClass<
  { email: string; password: string },
  { token: string }
>;

type ControllerRequest = HttpRequest<
  FromShape<typeof LoginController.requestBodyShape>
>;

export default class LoginController {
  static requestBodyShape = {
    email: String,
    password: String,
  };

  constructor(private Login: LoginUseCase) {}

  async handle(req: ControllerRequest) {
    try {
      const token = await this.tryToLogUserIn(req);
      return new DataResponse(StatusCode.Ok, { token });
    } catch (e) {
      return this.handleErrors(e);
    }
  }

  private async tryToLogUserIn(req: ControllerRequest) {
    const { email, password } = req.body;
    const { token } = await new this.Login({ email, password }).execute();
    return token;
  }

  private handleErrors(error: any) {
    if (error instanceof InvalidLoginDataError)
      return new ErrorResponse(
        StatusCode.BadRequest,
        "email or password is invalid"
      );
    else return errorToResponse(error);
  }
}
