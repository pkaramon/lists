import Id from "../../domain/Id";
import EmailAlreadyTakenError from "../../usecases/addUser/EmailAlreadyTakenError";
import InvalidUserDataError from "../../usecases/addUser/InvalidUserDataError";
import DataResponse from "../DataResponse";
import ErrorResponse from "../ErrorResponse";
import HttpRequest from "../HttpRequest";
import StatusCode from "../StatusCode";
import UseCaseClass from "../UseCaseClass";

type AddUserUseCase = UseCaseClass<
  { name: string; email: string; password: string; birthDate: Date },
  { userId: Id }
>;

type ControllerRequest = HttpRequest<{
  name: string;
  password: string;
  email: string;
  birthDate: Date;
}>;

export default class AddUserController {
  static requestBodySchema = {
    name: String,
    password: String,
    email: String,
    birthDate: Date,
  };

  constructor(private AddUser: AddUserUseCase) {}

  async handle(req: ControllerRequest) {
    try {
      const { userId } = await this.getResultFromAddUser(req.body);
      return new DataResponse(StatusCode.Created, {
        userId: userId.toPrimitive(),
      });
    } catch (e) {
      if (e instanceof EmailAlreadyTakenError)
        return new ErrorResponse(
          StatusCode.BadRequest,
          "email is already taken"
        );
      if (e instanceof InvalidUserDataError)
        return new ErrorResponse(StatusCode.BadRequest, e.message);
      else throw e;
    }
  }

  private async getResultFromAddUser(body: ControllerRequest["body"]) {
    return await new this.AddUser({
      name: body.name,
      password: body.password,
      email: body.email,
      birthDate: body.birthDate,
    }).execute();
  }
}
