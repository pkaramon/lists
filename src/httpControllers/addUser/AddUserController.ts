import Id from "../../domain/Id";
import EmailAlreadyTakenError from "../../usecases/addUser/EmailAlreadyTakenError";
import InvalidUserDataError from "../../usecases/addUser/InvalidUserDataError";
import DataResponse from "../DataResponse";
import ErrorResponse from "../ErrorResponse";
import StatusCode from "../StatusCode";
import UseCaseClass from "../UseCaseClass";

export default function buildAddUserController(
  AddUser: UseCaseClass<
    { name: string; email: string; password: string; birthDate: Date },
    { userId: Id }
  >
) {
  type Request = {
    body: { name: string; password: string; email: string; birthDate: Date };
  };
  return class AddUserController {
    static requestBodySchema = {
      name: String,
      password: String,
      email: String,
      birthDate: Date,
    };

    async handle(req: Request) {
      try {
        const { userId } = await this.getResultFromAddUser(req.body);
        return new DataResponse(StatusCode.Created, { userId: userId.toPrimitive() });
      } catch (e) {
        if (e instanceof EmailAlreadyTakenError)
          return new ErrorResponse(StatusCode.BadRequest, "email is already taken");
        if (e instanceof InvalidUserDataError)
          return new ErrorResponse(StatusCode.BadRequest, e.message);
        else throw e;
      }
    }

    private async getResultFromAddUser(body: Request["body"]) {
      return await new AddUser({
        name: body.name,
        password: body.password,
        email: body.email,
        birthDate: body.birthDate,
      }).execute();
    }
  };
}
