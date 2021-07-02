import TokenValidator from "../../auth/TokenValidator";
import Id from "../../domain/Id";
import InvalidListDataError from "../../usecases/addList/InvalidListDataError";
import UserNotFoundError from "../../usecases/addList/UserNotFoundError";
import DataResponse from "../DataResponse";
import ErrorResponse from "../ErrorResponse";
import UseCaseClass from "../UseCaseClass";
import FromSchema from "../validation/FromSchema";

type AddListUseCase = UseCaseClass<
  { userId: Id; list: { title: string; description: string } },
  { listId: Id }
>;

export default function buildAddListController({
  AddList,
  tokenValidator,
}: {
  AddList: AddListUseCase;
  tokenValidator: TokenValidator;
}) {
  return class AddListController {
    static requestBodySchema = {
      token: String,
      title: String,
      description: String,
    };

    async handle(req: {
      body: FromSchema<typeof AddListController.requestBodySchema>;
    }) {
      try {
        var userId = await tokenValidator.validate(req.body.token);
      } catch (e) {
        return this.getAuthFailedResponse();
      }

      try {
        const { listId } = await this.tryToAddList(userId, req.body);
        return new DataResponse(201, { listId: listId.toPrimitive() });
      } catch (e) {
        if (e instanceof InvalidListDataError)
          return this.getListEmptyResponse();
        else if (e instanceof UserNotFoundError)
          return this.getUserNotExistResponse();
        else throw e;
      }
    }

    private getAuthFailedResponse() {
      return new ErrorResponse(400, "auth error");
    }

    private async tryToAddList(
      userId: Id,
      body: FromSchema<typeof AddListController.requestBodySchema>
    ) {
      const { title, description } = body;
      return await new AddList({
        userId: userId,
        list: { title, description },
      }).execute();
    }

    private getListEmptyResponse() {
      return new ErrorResponse(400, "list title is empty");
    }

    private getUserNotExistResponse() {
      return new ErrorResponse(404, "user does not exist");
    }
  };
}
