import DeleteUserController from ".";
import { NumberId } from "../../fakes";
import StatusCode from "../StatusCode";
import {
  expectDataToMatch,
  expectStatusCodeToBe,
  MockUseCase,
} from "../__test__/fixtures";

const ctrl = new DeleteUserController(MockUseCase);

test("delete user", async () => {
  MockUseCase.mockResult(Promise.resolve());

  const res = await ctrl.handle({
    body: {},
    auth: { userId: new NumberId(1) },
  });

  MockUseCase.expectPassedDataToMatch({
    userId: new NumberId(1),
  });

  expectStatusCodeToBe(res, StatusCode.Ok);
  expectDataToMatch(res, { message: "successfully deleted user" });
});
