import BodyIsNotAnObjectError from "./BodyIsNotAnObjectError";
import RequestBodyError from "./RequestBodyError";
import RequestBodyValidatorImp from "./RequestBodyValidatorImp";

test("body is not an object", () => {
  const validator = new RequestBodyValidatorImp({ name: String, age: Number });
  for (const invalid of [null, undefined, 1, "a", false]) {
    expect(() => validator.validate(invalid)).toThrow(BodyIsNotAnObjectError);
  }
});

function expectRequestBodyErrorToMatch(
  validator: RequestBodyValidatorImp<any>,
  body: any,
  expectedError: any
) {
  try {
    validator.validate(body);
    throw new Error("should have failed");
  } catch (e) {
    expect(e).toBeInstanceOf(RequestBodyError);
    expect(e).toMatchObject(expectedError);
  }
}

test("body is an object but contains invalid data", () => {
  const validator = new RequestBodyValidatorImp({ name: String, age: Number });
  expectRequestBodyErrorToMatch(
    validator,
    { name: "bob" },
    { missingProps: ["age"] }
  );
  expectRequestBodyErrorToMatch(
    validator,
    { age: 42 },
    { missingProps: ["name"] }
  );
  expectRequestBodyErrorToMatch(
    validator,
    {},
    { missingProps: ["name", "age"] }
  );
});

test("body contains a required property but it has wrong type", () => {
  const validator = new RequestBodyValidatorImp({ name: String, age: Number });
  expectRequestBodyErrorToMatch(
    validator,
    { name: 42, age: 42 },
    { propsWithInvalidTypes: [{ key: "name", wanted: String, got: Number }] }
  );
  expectRequestBodyErrorToMatch(
    validator,
    { name: "bob", age: "string" },
    { propsWithInvalidTypes: [{ key: "age", wanted: Number, got: String }] }
  );
  expectRequestBodyErrorToMatch(
    validator,
    { name: 42, age: "string" },
    {
      propsWithInvalidTypes: [
        { key: "name", wanted: String, got: Number },
        { key: "age", wanted: Number, got: String },
      ],
    }
  );
});

test("mixed missing properties with properties with invalid types", () => {
  const validator = new RequestBodyValidatorImp({
    name: String,
    email: String,
    age: Number,
  });
  expectRequestBodyErrorToMatch(
    validator,
    { email: 123 },
    {
      missingProps: ["name", "age"],
      propsWithInvalidTypes: [{ key: "email", wanted: String, got: Number }],
      invalidProps: ["name", "age", "email"],
    }
  );
  expectRequestBodyErrorToMatch(
    validator,
    { name: "bob", age: "12" },
    {
      missingProps: ["email"],
      propsWithInvalidTypes: [{ key: "age", wanted: Number, got: String }],
    }
  );
});

describe("additional types", () => {
  test("booleans ", () => {
    const validator = new RequestBodyValidatorImp({ adult: Boolean });
    expectRequestBodyErrorToMatch(
      validator,
      { adult: "" },
      {
        propsWithInvalidTypes: [{ key: "adult", wanted: Boolean, got: String }],
      }
    );
  });

  test("dates", () => {
    const validator = new RequestBodyValidatorImp({ birthDate: Date });
    expectRequestBodyErrorToMatch(
      validator,
      { birthDate: 123 },
      {
        propsWithInvalidTypes: [
          { key: "birthDate", wanted: Date, got: Number },
        ],
      }
    );
    const { birthDate } = validator.validate({
      birthDate: new Date("2003-03-12").toISOString(),
    });
    expect(birthDate).toEqual(new Date("2003-03-12"));
  });
});

test("all properties exist and have correct types", () => {
  const validator = new RequestBodyValidatorImp({
    name: String,
    age: Number,
    birthDate: Date,
    adult: Boolean,
  });

  const body = {
    name: "Bob",
    age: 20,
    adult: true,
    birthDate: new Date("2001-03-12").toJSON(),
  };
  const data = validator.validate(body);
  expect(data).toEqual({
    ...body,
    birthDate: new Date("2001-03-12"),
  });
});
