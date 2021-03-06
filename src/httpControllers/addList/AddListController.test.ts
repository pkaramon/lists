import Clock from "../../domain/Clock";
import { FakeClock, NumberId } from "../../fakes";
import StatusCode from "../StatusCode";
import {
  expectStatusCodeToBe,
  expectErrorMessageToBe,
  expectDataToMatch,
  MockUseCase,
} from "../__test__/fixtures";
import AddListController from ".";
import InvalidListDataError from "../../usecases/InvalidListDataError";

Clock.inst = new FakeClock({ currentTime: new Date("2020-01-01") });
let addListCtrl: AddListController;
const userId = new NumberId(1);
beforeEach(async () => {
  addListCtrl = new AddListController(MockUseCase);
});

test("invalid list data", async () => {
  MockUseCase.mockError(new InvalidListDataError());
  const res = await addListCtrl.handle({
    body: { title: "", description: "" },
    auth: { userId },
  });
  expectStatusCodeToBe(res, StatusCode.BadRequest);
  expectErrorMessageToBe(res, "list title is empty");
});

test("list data is valid and user exists and it authenticated", async () => {
  MockUseCase.mockResult({ listId: new NumberId(1) });
  const res = await addListCtrl.handle({
    body: { title: "abc", description: "" },
    auth: { userId },
  });
  expectStatusCodeToBe(res, StatusCode.Created);
  expectDataToMatch(res, { listId: "1" });
});
