import IdConverter from "../../dataAccess/IdConverter";
import Id from "../../domain/Id";
import { UnknownListItemTypeError } from "../../usecases/addListItem/ListItemFactory";
import ListNotFoundError from "../../usecases/ListNotFoundError";
import UserNoAccessError from "../../usecases/UserNoAccessError";
import DataResponse from "../DataResponse";
import ErrorResponse from "../ErrorResponse";
import HttpRequest from "../HttpRequest";
import StatusCode from "../StatusCode";
import UseCaseClass from "../UseCaseClass";

type AddListItemUseCase = UseCaseClass<{
  userId: Id;
  listId: Id;
  listItem: any;
}>;

export default function buildAddListItemController({
  AddListItem,
  idConverter,
}: {
  AddListItem: AddListItemUseCase;
  idConverter: IdConverter;
}) {
  type Request = HttpRequest<{
    token: string;
    listId: string | number;
    listItem: any;
  }>;

  return class AddListController {
    async handle(req: Request) {
      try {
        await this.tryToAddListItem(req);
        return this.generateSuccessfulResponse();
      } catch (e) {
        return this.handleAddListItemErrors(e);
      }
    }

    private async tryToAddListItem(req: Request) {
      await new AddListItem({
        userId: req["auth"]["userId"],
        listId: idConverter.convert(req.body.listId),
        listItem: req.body.listItem,
      }).execute();
    }

    private generateSuccessfulResponse() {
      return new DataResponse(StatusCode.Created, { message: "created a new list item" });
    }

    private handleAddListItemErrors(error: any) {
      switch (error.constructor) {
        case ListNotFoundError:
          return new ErrorResponse(StatusCode.NotFound, "list not found");
        case UnknownListItemTypeError:
          return new ErrorResponse(StatusCode.BadRequest, "invalid listItem type");
        case UserNoAccessError:
          return new ErrorResponse(StatusCode.BadRequest, "you have no access to this list");
        default:
          throw error;
      }
    }
  };
}
