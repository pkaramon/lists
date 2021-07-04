import DataResponse from "../DataResponse";
import ErrorResponse from "../ErrorResponse";
import StatusCode from "../StatusCode";
import UseCaseClass from "../UseCaseClass";
import FromSchema from "../validation/FromSchema";
import InvalidLoginDataError from "./InvalidLoginDataError";

export default function buildLoginController(
  Login: UseCaseClass<
    { email: string; password: string },
    { userToken: string }
  >
) {
  return class LoginController {
    static requestBodySchema = {
      email: String,
      password: String,
    };

    async handle(req: {
      body: FromSchema<typeof LoginController.requestBodySchema>;
    }) {
      const { email, password } = req.body;
      try {
        const { userToken } = await new Login({ email, password }).execute();
        return new DataResponse(StatusCode.Ok, { token: userToken });
      } catch (e) {
        if (e instanceof InvalidLoginDataError)
          return new ErrorResponse(StatusCode.BadRequest, "email or password is invalid");
        else throw e;
      }
    }
  };
}
