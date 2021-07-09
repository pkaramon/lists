import IdConverter from "../../dataAccess/IdConverter";
import Id from "../../domain/Id";
import InvalidListItemIndexError from "../../usecases/InvalidListItemIndexError";
import ListNotFoundError from "../../usecases/ListNotFoundError";
import UserNoAccessError from "../../usecases/UserNoAccessError";
import DataResponse from "../DataResponse";
import ErrorResponse from "../ErrorResponse";
import AuthHttpRequest from "../HttpRequest";
import StatusCode from "../StatusCode";
import UseCaseClass from "../UseCaseClass";
import FromShape from "../validation/FromShape";

type ChangeListItemTitle = UseCaseClass<{
  userId: Id;
  listId: Id;
  listItemIndex: number;
  title: string;
}>;

type ControllerRequest = AuthHttpRequest<
  FromShape<typeof ChangeListItemTitleController.requestBodyShape>
>;

export default class ChangeListItemTitleController {
  static requestBodyShape = {
    listId: String,
    listItemIndex: Number,
    title: String,
  };

  constructor(
    private ChangeListItemTitle: ChangeListItemTitle,
    private idConverter: IdConverter
  ) {}

  async handle(req: ControllerRequest) {
    try {
      await this.tryToChangeListItemTitle(req);
      return this.generateSuccessfulResponse();
    } catch (e) {
      return this.handleErrors(e, req);
    }
  }

  async tryToChangeListItemTitle(req: ControllerRequest) {
    const listId = this.idConverter.convert(req.body.listId);
    await new this.ChangeListItemTitle({
      listId,
      listItemIndex: req.body.listItemIndex,
      title: req.body.title,
      userId: req.auth.userId,
    }).execute();
  }

  private generateSuccessfulResponse() {
    return new DataResponse(StatusCode.Ok, {
      message: "successfully changed the title",
    });
  }

  private handleErrors(error: any, req: ControllerRequest) {
    switch (error.constructor) {
      case ListNotFoundError:
        return new ErrorResponse(StatusCode.NotFound, "list not found");
      case InvalidListItemIndexError:
        return new ErrorResponse(
          StatusCode.BadRequest,
          `invalid list item index: ${req.body.listItemIndex}`
        );
      case UserNoAccessError:
        return new ErrorResponse(
          StatusCode.Unauthorized,
          `you do not have access to this list`
        );
      default:
        throw error;
    }
  }
}
