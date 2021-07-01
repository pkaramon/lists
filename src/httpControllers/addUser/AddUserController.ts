import Id from "../../domain/Id";
import ServerError from "../../usecases/ServerError";
import DataResponse from "../DataResponse";
import ErrorResponse from "../ErrorResponse";
import UseCaseClass from "../UseCaseClass";
import FromSchema from "../validation/FromSchema";

export default function buildAddUserController(
  AddUser: UseCaseClass<
    { name: string; email: string; password: string; birthDate: Date },
    { userId: Id }
  >
) {
  return class AddUserController<
    RequestBody extends FromSchema<
      typeof AddUserController["requestBodySchema"]
    >
  > {
    static requestBodySchema = {
      name: String,
      password: String,
      email: String,
      birthDate: Date,
    };

    async handle(req: { body: RequestBody }) {
      try {
        const { userId } = await this.getResultFromAddUser(req.body);
        return new DataResponse(201, { userId: userId.toPrimitive() });
      } catch (e) {
        return e instanceof ServerError
          ? new ErrorResponse(500, e.message)
          : new ErrorResponse(400, e.message);
      }
    }

    private async getResultFromAddUser(body: RequestBody) {
      return await new AddUser({
        name: body.name,
        password: body.password,
        email: body.email,
        birthDate: body.birthDate,
      }).execute();
    }
  };
}
