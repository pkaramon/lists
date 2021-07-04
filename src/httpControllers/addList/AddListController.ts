import Id from "../../domain/Id";
import InvalidListDataError from "../../usecases/addList/InvalidListDataError";
import UserNotFoundError from "../../usecases/addList/UserNotFoundError";
import DataResponse from "../DataResponse";
import ErrorResponse from "../ErrorResponse";
import HttpRequest from "../HttpRequest";
import StatusCode from "../StatusCode";
import UseCaseClass from "../UseCaseClass";
import FromSchema from "../validation/FromSchema";

type AddListUseCase = UseCaseClass<
  { userId: Id; list: { title: string; description: string } },
  { listId: Id }
>;

type ControllerRequest = HttpRequest<
  FromSchema<typeof AddListController.requestBodySchema>
>;

export default class AddListController {
  static requestBodySchema = {
    token: String,
    title: String,
    description: String,
  };

  constructor(private AddList: AddListUseCase) {}

  async handle(req: ControllerRequest) {
    try {
      const { listId } = await this.tryToAddList(req);
      return new DataResponse(StatusCode.Created, {
        listId: listId.toPrimitive(),
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
