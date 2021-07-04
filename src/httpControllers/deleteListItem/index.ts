import IdConverter from "../../dataAccess/IdConverter";
import Id from "../../domain/Id";
import InvalidListItemIndexError from "../../usecases/InvalidListItemIndexError";
import ListNotFoundError from "../../usecases/ListNotFoundError";
import UserNoAccessError from "../../usecases/UserNoAccessError";
import AuthHttpRequest from "../AuthHttpRequest";
import DataResponse from "../DataResponse";
import ErrorResponse from "../ErrorResponse";
import StatusCode from "../StatusCode";
import UseCaseClass from "../UseCaseClass";

type DeleteListItemUseCase = UseCaseClass<{
  userId: Id;
  listId: Id;
  listItemIndex: number;
}>;

type ControllerRequest = AuthHttpRequest<{
  listId: string | number;
  listItemIndex: number;
}>;

export default class DeleteListItemController {
  constructor(
    private DeleteListItem: DeleteListItemUseCase,
    private idConverter: IdConverter
  ) {}
  async handle(req: ControllerRequest) {
    try {
      await new this.DeleteListItem({
        userId: req.auth.userId,
        listId: this.idConverter.convert(req.body.listId),
        listItemIndex: req.body.listItemIndex,
      }).execute();
      return new DataResponse(StatusCode.Ok, {
        message: `successfully deleted list item at index: ${req.body.listItemIndex}`,
      });
    } catch (e) {
      return this.handleErrors(e, req);
    }
  }

  private handleErrors(error: any, req: ControllerRequest) {
    switch (error.constructor) {
      case ListNotFoundError:
        return new ErrorResponse(StatusCode.NotFound, "list not found");
      case UserNoAccessError:
        return new ErrorResponse(
          StatusCode.Unauthorized,
          "you do not have access to this list"
        );
      case InvalidListItemIndexError:
        return new ErrorResponse(
          StatusCode.BadRequest,
          `invalid list item index: ${req.body.listItemIndex}`
        );
      default:
        throw error;
    }
  }
}
