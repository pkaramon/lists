import Id from "../../domain/Id";
import AuthHttpRequest from "../AuthHttpRequest";
import DataResponse from "../DataResponse";
import { errorToResponse } from "../defaultResponsesToErrors";
import StatusCode from "../StatusCode";
import UseCaseClass from "../UseCaseClass";

type DeleteUserUseCase = UseCaseClass<{ userId: Id }>;
type ControlerRequest = AuthHttpRequest<{}>;

export default class DeleteUserController {
  constructor(private DeleteUser: DeleteUserUseCase) {}

  async handle(req: ControlerRequest) {
    try {
      await new this.DeleteUser({ userId: req.auth.userId }).execute();
      return new DataResponse(StatusCode.Ok, {
        message: "successfully deleted user",
      });
    } catch (e) {
      return errorToResponse(e);
    }
  }
}
