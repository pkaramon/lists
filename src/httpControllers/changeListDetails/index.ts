import IdConverter from "../../dataAccess/IdConverter";
import Id from "../../domain/Id";
import { NumberId } from "../../fakes";
import InvalidListDataError from "../../usecases/InvalidListDataError";
import AuthHttpRequest from "../AuthHttpRequest";
import DataResponse from "../DataResponse";
import { errorToResponse } from "../defaultResponsesToErrors";
import ErrorResponse from "../ErrorResponse";
import StatusCode from "../StatusCode";
import UseCaseClass from "../UseCaseClass";
import T, { FromTypes } from "../validation/types";

type ChangeListDetailsUseCase = UseCaseClass<{
  userId: Id;
  listId: Id;
  listDetails: { title?: string; description?: string };
}>;

type ControllerRequest = AuthHttpRequest<
  FromTypes<typeof ChangeListDetailsController.requestBodyShape>
>;

export default class ChangeListDetailsController {
  static requestBodyShape = {
    listId: T.string(),
    listDetails: T.object({
      title: T.string().optional(),
      description: T.string().optional(),
    }),
  };

  constructor(
    private ChangeListDetails: ChangeListDetailsUseCase,
    private idConverter: IdConverter
  ) {}

  async handle(req: ControllerRequest) {
    try {
      await new this.ChangeListDetails({
        listId: this.idConverter.convert(req.body.listId),
        userId: req.auth.userId,
        listDetails: {
          title: req.body.listDetails.title ?? undefined,
          description: req.body.listDetails.description ?? undefined,
        },
      }).execute();
      return new DataResponse(StatusCode.Ok, {
        message: "successfully updated the details",
      });
    } catch (e) {
      if (e instanceof InvalidListDataError)
        return new ErrorResponse(StatusCode.BadRequest, "invalid list data");
      else return errorToResponse(e);
    }
  }
}
