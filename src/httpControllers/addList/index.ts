import Id from "../../domain/Id";
import InvalidListDataError from "../../usecases/addList/InvalidListDataError";
import UserNotFoundError from "../../usecases/addList/UserNotFoundError";
import AuthHttpRequest from "../AuthHttpRequest";
import DataResponse from "../DataResponse";
import ErrorResponse from "../ErrorResponse";
import StatusCode from "../StatusCode";
import UseCaseClass from "../UseCaseClass";
import FromShape from "../validation/FromShape";

type AddListUseCase = UseCaseClass<
  { userId: Id; list: { title: string; description: string } },
  { listId: Id }
>;

type ControllerRequest = AuthHttpRequest<
  FromShape<typeof AddListController.requestBodyShape>
>;

export default class AddListController {
  static requestBodyShape = {
    title: String,
    description: String,
  };

  constructor(private AddList: AddListUseCase) {}

  async handle(req: ControllerRequest) {
    try {
      const { listId } = await this.tryToAddList(req);
      return new DataResponse(StatusCode.Created, {
        listId: listId.toString(),
      });
    } catch (e) {
      return this.handleErrors(e);
    }
  }

  private async tryToAddList(req: ControllerRequest) {
    const { title, description } = req.body;
    const userId = req.auth.userId;
    return await new this.AddList({
      userId,
      list: { title, description },
    }).execute();
  }

  private handleErrors(error: any) {
    if (error instanceof InvalidListDataError)
      return this.getListEmptyResponse();
    else if (error instanceof UserNotFoundError)
      return this.getUserNotExistResponse();
    else throw error;
  }

  private getListEmptyResponse() {
    return new ErrorResponse(StatusCode.BadRequest, "list title is empty");
  }

  private getUserNotExistResponse() {
    return new ErrorResponse(StatusCode.NotFound, "user does not exist");
  }
}
