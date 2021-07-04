import IdConverter from "../../dataAccess/IdConverter";
import Id from "../../domain/Id";
import ListNotFoundError from "../../usecases/ListNotFoundError";
import UserNoAccessError from "../../usecases/UserNoAccessError";
import DataResponse from "../DataResponse";
import ErrorResponse from "../ErrorResponse";
import HttpRequest from "../HttpRequest";
import StatusCode from "../StatusCode";
import UseCaseClass from "../UseCaseClass";

type ViewListUseCase = UseCaseClass<
  {
    userId: Id;
    listId: Id;
  },
  { title: string; description: string; length: number; listItems: any[] }
>;

type ControllerRequest = HttpRequest<{
  token: string;
  listId: string | number;
}>;

export default class ViewListController {
  constructor(
    private ViewList: ViewListUseCase,
    private idConverter: IdConverter
  ) {}

  async handle(req: ControllerRequest) {
    try {
      const result = await this.tryToGetListView(req);
      return new DataResponse(StatusCode.Ok, result);
    } catch (e) {
      return this.handleErrors(e);
    }
  }

  private tryToGetListView(req: ControllerRequest) {
    return new this.ViewList({
      listId: this.idConverter.convert(req.body.listId),
      userId: req.auth.userId,
    }).execute();
  }

  private handleErrors(error: any) {
    switch (error.constructor) {
      case UserNoAccessError:
        return new ErrorResponse(
          StatusCode.Unauthorized,
          "you do not have access to this list"
        );
      case ListNotFoundError:
        return new ErrorResponse(StatusCode.NotFound, "list not found");
      default:
        throw error;
    }
  }
}
