import Id from "../../domain/Id";
import AuthHttpRequest from "../AuthHttpRequest";
import UseCaseClass from "../UseCaseClass";

type ChangeListDetailsUseCase = UseCaseClass<{
  userId: Id;
  listId: Id;
  listDetails: { title?: string; description?: string };
}>;

type ControllerRequest = AuthHttpRequest<{
  listId: string, 
  listDetails:  {
    title: string, 
    description: string
  }


}>;

export default class ChangeListDetailsController {
  constructor(private ChangeListDetails: ChangeListDetailsUseCase) {}

  handle(req: ControllerRequest) {

  }
}
