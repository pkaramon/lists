import Id from "../../domain/Id";
import EmailAlreadyTakenError from "../../usecases/addUser/EmailAlreadyTakenError";
import InvalidUserDataError from "../../usecases/addUser/InvalidUserDataError";
import DataResponse from "../DataResponse";
import { errorToResponse } from "../defaultResponsesToErrors";
import ErrorResponse from "../ErrorResponse";
import HttpRequest from "../HttpRequest";
import StatusCode from "../StatusCode";
import UseCaseClass from "../UseCaseClass";
import T, {FromTypes} from "../validation/types";

type AddUserUseCase = UseCaseClass<
  { name: string; email: string; password: string; birthDate: Date },
  { userId: Id }
>;

type ControllerRequest = HttpRequest<
  FromTypes<typeof AddUserController.requestBodyShape>
>;

export default class AddUserController {
  static requestBodyShape = {
    name: T.string(),
    password: T.string(),
    email: T.string(),
    birthDate: T.date(),
  };

  constructor(private AddUser: AddUserUseCase) {}

  async handle(req: ControllerRequest) {
    try {
      const { userId } = await this.getResultFromAddUser(req.body);
      return new DataResponse(StatusCode.Created, {
        userId: userId.toString(),
      });
    } catch (e) {
      return this.handleErrors(e);
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

  private handleErrors(e: any) {
    switch (e.constructor) {
      case EmailAlreadyTakenError:
        return new ErrorResponse(
          StatusCode.BadRequest,
          "email is already taken"
        );
      case InvalidUserDataError:
        return new ErrorResponse(StatusCode.BadRequest, e.message);
      default:
        return errorToResponse(e);
    }
  }
}
