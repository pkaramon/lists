import IdConverter from "../../dataAccess/IdConverter";
import Id from "../../domain/Id";
import AuthHttpRequest from "../AuthHttpRequest";
import DataResponse from "../DataResponse";
import { errorToResponse } from "../defaultResponsesToErrors";
import StatusCode from "../StatusCode";
import UseCaseClass from "../UseCaseClass";
import T, {FromTypes} from "../validation/types";

type ViewListUseCase = UseCaseClass<
  { userId: Id; listId: Id },
  { title: string; description: string; length: number; listItems: any[] }
>;

type ControllerRequest = AuthHttpRequest<
  FromTypes<typeof ViewListController.requestBodyShape>
>;

export default class ViewListController {
  static requestBodyShape = { listId: T.string() };

  constructor(
    private ViewList: ViewListUseCase,
    private idConverter: IdConverter
  ) {}

  async handle(req: ControllerRequest) {
    try {
      const result = await this.tryToGetListView(req);
      return new DataResponse(StatusCode.Ok, result);
    } catch (e) {
      return errorToResponse(e);
    }
  }

  private tryToGetListView(req: ControllerRequest) {
    return new this.ViewList({
      listId: this.idConverter.convert(req.body.listId),
      userId: req.auth.userId,
    }).execute();
  }
}
