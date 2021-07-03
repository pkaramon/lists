import buildUserAuthDecorator from ".";
import Id from "../../domain/Id";
import {FakeTokenValidator} from "../../fakes";
import DataResponse from "../DataResponse";
import ErrorResponse from "../ErrorResponse";
import HttpRequest from "../HttpRequest";
import {
  expectDataToMatch,
  expectErrorMessageToBe,
  expectStatusCodeToBe,
} from "../__test__/fixtures";

const UserAuthDecorator = buildUserAuthDecorator(new FakeTokenValidator());

@UserAuthDecorator
class Controller {
  async handle(
    req: HttpRequest<{ token: string; n: number }>
  ): Promise<DataResponse | ErrorResponse> {
    const userId = req.auth.userId as Id;
    return new DataResponse(200, {
      result: req.body.n ** 2,
      userId: userId.toPrimitive(),
    });
  }
}

test("token is invalid", async () => {
  const ctrl = new Controller();
  const response = await ctrl.handle({ body: { token: "#@13@1", n: 3 } });
  expectStatusCodeToBe(response, 400);
  expectErrorMessageToBe(response, "user token is invalid");
});

test("token is valid", async () => {
  const ctrl = new Controller();
  const response = await ctrl.handle({ body: { token: "###1###", n: 3 } });
  expectStatusCodeToBe(response, 200);
  expectDataToMatch(response, { result: 9, userId: 1 });
});
