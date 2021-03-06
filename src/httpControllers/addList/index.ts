import Id from "../../domain/Id";
import InvalidListDataError from "../../usecases/InvalidListDataError";
import AuthHttpRequest from "../AuthHttpRequest";
import DataResponse from "../DataResponse";
import { errorToResponse } from "../defaultResponsesToErrors";
import ErrorResponse from "../ErrorResponse";
import StatusCode from "../StatusCode";
import UseCaseClass from "../UseCaseClass";
import T, { FromTypes } from "../validation/types";

type AddListUseCase = UseCaseClass<
  { userId: Id; list: { title: string; description: string } },
  { listId: Id }
>;

type ControllerRequest = AuthHttpRequest<
  FromTypes<typeof AddListController.requestBodyShape>
>;

export default class AddListController {
  static requestBodyShape = {
    title: T.string(),
    description: T.string(),
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
    else return errorToResponse(error);
  }

  private getListEmptyResponse() {
    return new ErrorResponse(StatusCode.BadRequest, "list title is empty");
  }
}
