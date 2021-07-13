import IdConverter from "../../dataAccess/IdConverter";
import Id from "../../domain/Id";
import { UnknownListItemTypeError } from "../../domain/ListItemGateway";
import AuthHttpRequest from "../AuthHttpRequest";
import DataResponse from "../DataResponse";
import { errorToResponse } from "../defaultResponsesToErrors";
import ErrorResponse from "../ErrorResponse";
import StatusCode from "../StatusCode";
import UseCaseClass from "../UseCaseClass";
import T from "../validation/types";

type AddListItemUseCase = UseCaseClass<{
  userId: Id;
  listId: Id;
  listItem: any;
}>;

type ControllerRequest = AuthHttpRequest<{
  listId: string;
  listItem: any;
}>;

export default class AddListItemController {
  static requestBodyShape = {
    listId: T.string(),
    listItem: T.object({
      title: T.string(),
    }),
  };

  constructor(
    private AddListItem: AddListItemUseCase,
    private idConverter: IdConverter
  ) {}

  async handle(req: ControllerRequest) {
    try {
      await this.tryToAddListItem(req);
      return this.generateSuccessfulResponse();
    } catch (e) {
      return this.handleErrors(e);
    }
  }

  private async tryToAddListItem(req: ControllerRequest) {
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
