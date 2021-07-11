import IdConverter from "../../dataAccess/IdConverter";
import Id from "../../domain/Id";
import AuthHttpRequest from "../AuthHttpRequest";
import DataResponse from "../DataResponse";
import { errorToResponse } from "../defaultResponsesToErrors";
import StatusCode from "../StatusCode";
import UseCaseClass from "../UseCaseClass";
import FromShape from "../validation/FromShape";

type DeleteListUseCase = UseCaseClass<{
  userId: Id;
  listId: Id;
}>;

type ControlerRequest = AuthHttpRequest<
  FromShape<typeof DeleteListController.requestBodyShape>
>;

export default class DeleteListController {
  static requestBodyShape = { listId: String };

  constructor(
    private DeleteList: DeleteListUseCase,
    private idConverter: IdConverter
  ) {}

  async handle(req: ControlerRequest) {
    try {
      await new this.DeleteList({
        listId: this.idConverter.convert(req.body.listId),
        userId: req.auth.userId,
      }).execute();
      return new DataResponse(StatusCode.Ok, {
        message: "successfully deleted the list",
      });
    } catch (e) {
      return errorToResponse(e);
    }
  }
}
