import ChangeListDetailsController from ".";
import { MockUseCase } from "../__test__/fixtures";

const ctrl = new ChangeListDetailsController(MockUseCase);
test("list does not exist", () => {
  // await ctrl.handle({
  //   auth: {userId: new NumberId(100)},
  //   body: {
  //     listId:
  //   }
  // })
});
