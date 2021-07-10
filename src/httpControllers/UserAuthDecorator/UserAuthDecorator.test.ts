import buildUserAuthDecorator from ".";
import Id from "../../domain/Id";
import { FakeTokenValidator } from "../../fakes";
import AuthHttpRequest from "../AuthHttpRequest";
import DataResponse from "../DataResponse";
import ErrorResponse from "../ErrorResponse";
import StatusCode from "../StatusCode";
import {
  expectDataToMatch,
  expectErrorMessageToBe,
  expectStatusCodeToBe,
} from "../__test__/fixtures";

const UserAuthDecorator = buildUserAuthDecorator(new FakeTokenValidator());

class Controller {
  async handle(
    req: AuthHttpRequest<{ n: number }>
  ): Promise<DataResponse | ErrorResponse> {
    const userId = req.auth.userId as Id;
    return new DataResponse(StatusCode.Ok, {
      result: req.body.n ** 2,
      userId: userId.toString(),
    });
  }
}

const ctrl = new (UserAuthDecorator(Controller))();

test("token is not present", async () => {
  const req = { body: { n: 3 }, headers: {} } as any;
  const response = await ctrl.handle(req);
  expectStatusCodeToBe(response, StatusCode.Unauthorized);
  expectErrorMessageToBe(response, "user token is invalid");
});

test("token is invalid", async () => {
  const req = {
    body: { n: 3 },
    headers: { authorization: "#*#3.14*@" },
  } as any;
  const response = await ctrl.handle(req);
  expectStatusCodeToBe(response, StatusCode.Unauthorized);
  expectErrorMessageToBe(response, "user token is invalid");
});

test("token is valid", async () => {
  const req = { body: { n: 3 }, headers: { authorization: "###1###" } } as any;
  const response = await ctrl.handle(req);
  expectStatusCodeToBe(response, StatusCode.Ok);
  expectDataToMatch(response, { result: 9, userId: "1" });
});
