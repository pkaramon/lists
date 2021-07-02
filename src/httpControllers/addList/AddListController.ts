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

export default function buildAddListController(AddList: AddListUseCase) {
  return class AddListController {
    static requestBodySchema = {
      userId: Id,
      title: String,
      description: String,
    };

    async handle(req: {
      body: FromSchema<typeof AddListController.requestBodySchema>;
    }) {
      try {
        const { listId } = await this.tryToAddList(req.body);
        return new DataResponse(201, { listId: listId.toPrimitive() });
      } catch (e) {
        if (e instanceof InvalidListDataError)
          return this.getListEmptyResponse();
        else if (e instanceof UserNotFoundError)
          return this.getUserNotExistResponse();
        else throw e;
      }
    }

    private async tryToAddList(
      body: FromSchema<typeof AddListController.requestBodySchema>
    ) {
      const { userId, title, description } = body;
      return await new AddList({
        userId: userId,
        list: { title, description },
      }).execute();
    }

    private getListEmptyResponse() {
      return new ErrorResponse(400, "list title is empty");
    }

    private getUserNotExistResponse() {
      return new ErrorResponse(404, "user with passed userId does not exist");
    }
  };
}
