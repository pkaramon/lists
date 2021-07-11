import IdConverter from "../../dataAccess/IdConverter";
import Id from "../../domain/Id";
import { UnknownListItemTypeError } from "../../domain/ListItemGateway";
import ListNotFoundError from "../../usecases/ListNotFoundError";
import UserNoAccessError from "../../usecases/UserNoAccessError";
import AuthHttpRequest from "../AuthHttpRequest";
import DataResponse from "../DataResponse";
import { errorToResponse } from "../defaultResponsesToErrors";
import ErrorResponse from "../ErrorResponse";
import StatusCode from "../StatusCode";
import UseCaseClass from "../UseCaseClass";

type AddListItemUseCase = UseCaseClass<{
  userId: Id;
  listId: Id;
  listItem: any;
}>;

type Request = AuthHttpRequest<{
  listId: string;
  listItem: any;
}>;

export default class AddListItemController {
  static requestBodyShape = {
    listId: String,
    listItem: {
      title: String,
    },
  };

  constructor(
    private AddListItem: AddListItemUseCase,
    private idConverter: IdConverter
  ) {}

  async handle(req: Request) {
    try {
      await this.tryToAddListItem(req);
      return this.generateSuccessfulResponse();
    } catch (e) {
      return this.handleErrors(e);
    }
  }

  private async tryToAddListItem(req: Request) {
    await new this.AddListItem({
      userId: req.auth.userId,
      listId: this.idConverter.convert(req.body.listId),
      listItem: req.body.listItem,
    }).execute();
  }

  private generateSuccessfulResponse() {
    return new DataResponse(StatusCode.Created, {
      message: "created a new list item",
    });
  }

  private handleErrors(error: any) {
    if (error instanceof UnknownListItemTypeError)
      return new ErrorResponse(StatusCode.BadRequest, "invalid listItem type");
    return errorToResponse(error);
  }
}
