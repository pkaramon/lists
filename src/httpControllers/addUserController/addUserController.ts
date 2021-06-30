import Id from "../../domain/Id";
import ServerError from "../../usecases/ServerError";
import DataResponse from "../DataResponse";
import ErrorResponse from "../ErrorResponse";

interface UseCaseClass<Input, Result> {
  new (data: Input): {
    execute(): Promise<Result>;
  };
}

export default function buildAddUserController(
  AddUser: UseCaseClass<
    { name: string; email: string; password: string; birthDate: Date },
    { userId: Id }
  >
) {
  return async function addUserController(request: { body: any }) {
    const res = validateRequestBody(request.body);
    if (res) return res;

    try {
      const { userId } = await getResultFromAddUser(request.body);
      return new DataResponse(201, { userId: userId.toPrimitive() });
    } catch (e) {
      return e instanceof ServerError
        ? new ErrorResponse(500, e.message)
        : new ErrorResponse(400, e.message);
    }
  };

  async function getResultFromAddUser(body: any) {
    return await new AddUser({
      name: body.name,
      password: body.password,
      email: body.email,
      birthDate: new Date(body.birthDate),
    }).execute();
  }

  function validateRequestBody(body: any) {
    const requiredAttrs = ["name", "email", "password", "birthDate"];
    const invalidAttrs = requiredAttrs.filter(
      (attr) => body[attr] === undefined || body[attr] === null
    );
    if (invalidAttrs.length > 0)
      return new ErrorResponse(
        400,
        `${invalidAttrs.length} attributes missing: ${invalidAttrs.join(", ")}`
      );
  }
}
