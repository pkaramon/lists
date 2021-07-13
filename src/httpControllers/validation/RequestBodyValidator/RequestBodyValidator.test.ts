import DataResponse from "../../DataResponse";
import HttpRequest from "../../HttpRequest";
import StatusCode from "../../StatusCode";
import {
  expectDataToMatch,
  expectErrorMessageToBe,
  expectStatusCodeToBe,
} from "../../__test__/fixtures";
import ObjectValidatorYup from "../ObjectValidatorYup";
import T from "../types";
import buildRequestBodyValidator from "./RequestBodyValidator";

const RequestBodyValidator = buildRequestBodyValidator(ObjectValidatorYup);

@RequestBodyValidator
class Controller {
  static requestBodyShape = {
    name: T.string(),
    age: T.number(),
    birthDate: T.date(),
  };

  async handle(
    req: HttpRequest<{ name: string; age: number; birthDate: Date }>
  ) {
    return new DataResponse(StatusCode.Ok, {
      message: `${req.body.name} ${
        req.body.age
      } ${req.body.birthDate.getMonth()}`,
    });
  }
}
const ctrl = new Controller();
test("request body is in invalid format", async () => {
  const res = await ctrl.handle({ body: "abc" as any });
  expectStatusCodeToBe(res, StatusCode.BadRequest);
  expectErrorMessageToBe(res, "invalid data format");
});

test("request body does not pass the validation", async () => {
  const res = await ctrl.handle({
    body: { name: 42, age: false, birthDate: "" } as any,
  });
  expectStatusCodeToBe(res, StatusCode.BadRequest);
  expect(res.data).toMatchObject({
    error: "invalid data",
    invalidKeys: ["name", "age", "birthDate"],
  });
});

test("request body passes the validation", async () => {
  const res = await ctrl.handle({
    body: {
      name: "bob",
      age: 42,
      birthDate: new Date("2020-01-03").toISOString(),
    } as any,
  });
  expectStatusCodeToBe(res, StatusCode.Ok);
  expectDataToMatch(res, { message: "bob 42 0" });
});
