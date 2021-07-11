import IdConverter from "../../dataAccess/IdConverter";
import Id from "../../domain/Id";
import InvalidListItemIndexError from "../../usecases/InvalidListItemIndexError";
import DataResponse from "../DataResponse";
import { errorToResponse } from "../defaultResponsesToErrors";
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
      if (e instanceof InvalidListItemIndexError)
        return new ErrorResponse(
          StatusCode.BadRequest,
          `invalid list item index: ${req.body.listItemIndex}`
        );
      return errorToResponse(e);
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
}
