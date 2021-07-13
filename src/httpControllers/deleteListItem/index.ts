import IdConverter from "../../dataAccess/IdConverter";
import Id from "../../domain/Id";
import InvalidListItemIndexError from "../../usecases/InvalidListItemIndexError";
import AuthHttpRequest from "../AuthHttpRequest";
import DataResponse from "../DataResponse";
import { errorToResponse } from "../defaultResponsesToErrors";
import ErrorResponse from "../ErrorResponse";
import StatusCode from "../StatusCode";
import UseCaseClass from "../UseCaseClass";
import T, {FromTypes} from "../validation/types";

type DeleteListItemUseCase = UseCaseClass<{
  userId: Id;
  listId: Id;
  listItemIndex: number;
}>;

type ControllerRequest = AuthHttpRequest<
  FromTypes<typeof DeleteListItemController.requestBodyShape>
>;

export default class DeleteListItemController {
  static requestBodyShape = {
    listId: T.string(),
    listItemIndex: T.number(),
  };

  constructor(
    private DeleteListItem: DeleteListItemUseCase,
    private idConverter: IdConverter
  ) {}

  async handle(req: ControllerRequest) {
    try {
      await this.tryToDeleteListItem(req);
      return this.generateSuccessfulResponse(req);
    } catch (e) {
      return this.handleErrors(e, req);
    }
  }

  private tryToDeleteListItem(req: ControllerRequest) {
    return new this.DeleteListItem({
      userId: req.auth.userId,
      listId: this.idConverter.convert(req.body.listId),
      listItemIndex: req.body.listItemIndex,
    }).execute();
  }

  private generateSuccessfulResponse(req: ControllerRequest) {
    return new DataResponse(StatusCode.Ok, {
      message: `successfully deleted list item at index: ${req.body.listItemIndex}`,
    });
  }

  private handleErrors(error: any, req: ControllerRequest) {
    if (error instanceof InvalidListItemIndexError)
      return new ErrorResponse(
        StatusCode.BadRequest,
        `invalid list item index: ${req.body.listItemIndex}`
      );
    return errorToResponse(error);
  }
}
