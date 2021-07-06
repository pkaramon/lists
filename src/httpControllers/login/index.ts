import InvalidLoginDataError from "../../usecases/login/InvalidLoginDataError";
import DataResponse from "../DataResponse";
import ErrorResponse from "../ErrorResponse";
import HttpRequest from "../HttpRequest";
import StatusCode from "../StatusCode";
import UseCaseClass from "../UseCaseClass";
import FromShape from "../validation/FromShape";

type LoginUseCase = UseCaseClass<
  { email: string; password: string },
  { userToken: string }
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
    const { email, password } = req.body;
    try {
      const { userToken } = await new this.Login({
        email,
        password,
      }).execute();
      return new DataResponse(StatusCode.Ok, { token: userToken });
    } catch (e) {
      if (e instanceof InvalidLoginDataError)
        return new ErrorResponse(
          StatusCode.BadRequest,
          "email or password is invalid"
        );
      else throw e;
    }
  }
}
