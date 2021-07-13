import ObjectValidatorYup from ".";
import { InvalidDataError, InvalidDataFormatError } from "../ObjectValidator";
import T from "../types";

test("body is not an object", async () => {
  const validator = new ObjectValidatorYup({
    name: T.string(),
    age: T.number(),
  });

  await expect(() => validator.validate("")).rejects.toThrowError(
    InvalidDataFormatError
  );

  for (const value of ["", 12, 3.14, false, []])
    await expect(() => validator.validate(value)).rejects.toThrowError(
      InvalidDataFormatError
    );
});

async function expectToFailValidation(
  validator: ObjectValidatorYup<any>,
  data: any,
  expectedInvalidKeys: string[]
) {
  try {
    await validator.validate(data);
    throw "should have thrown";
  } catch (e) {
    expect(e).toBeInstanceOf(InvalidDataError);
    expect(e.invalidKeys).toMatchObject(
      expect.arrayContaining(expectedInvalidKeys)
    );
  }
}

test("simple validation", async () => {
  const validator = new ObjectValidatorYup({
    name: T.string(),
    age: T.number(),
  });

  await validator.validate({ name: "bob", age: 42 });
  await expectToFailValidation(validator, { name: 42, age: 42 }, ["name"]);
  await expectToFailValidation(validator, { name: 42, age: "42" }, [
    "name",
    "age",
  ]);
  await expectToFailValidation(validator, { name: 42, age: "42" }, [
    "name",
    "age",
  ]);

  await expectToFailValidation(validator, { name: undefined, age: null }, [
    "name",
    "age",
  ]);

  await expectToFailValidation(validator, {}, ["name", "age"]);
});

describe("nested properties", () => {
  const validator = new ObjectValidatorYup({
    name: T.string(),
    address: T.object({
      street: T.string(),
      houseNumber: T.number(),
    }),
  });

  test("valid data", async () => {
    await validator.validate({
      name: "bob",
      address: { street: "bobs st.", houseNumber: 10 },
    });
  });

  test("property with nested properties is not an object", async () => {
    await expectToFailValidation(validator, { name: 42, address: "aklfdjas" }, [
      "name",
      "address",
    ]);
  });

  test("nested properties are not valid", async () => {
    await expectToFailValidation(
      validator,
      { name: 42, address: { street: 2, houseNumber: "abc" } },
      ["name", "address.street", "address.houseNumber"]
    );
  });
});

test("booleans", async () => {
  const validator = new ObjectValidatorYup({ premium: T.boolean() });
  await validator.validate({ premium: true });
  await validator.validate({ premium: false });
  for (const value of ["asdfa", 0, 1, "yes", "no", "t", "f"]) {
    await expectToFailValidation(validator, { premium: value }, ["premium"]);
  }
});

test("dates", async () => {
  const validator = new ObjectValidatorYup({ birthDate: T.date() });
  await validator.validate({ birthDate: new Date("2003-01-02").toISOString() });

  for (const value of ["as", false, true]) {
    await expectToFailValidation(validator, { birthDate: value }, [
      "birthDate",
    ]);
  }
});

test("casting", async () => {
  const validator = new ObjectValidatorYup({ birthDate: T.date() });
  const result = await validator.validate({
    birthDate: new Date("2020-01-01").toISOString(),
  });

  expect(result.birthDate).toEqual(new Date("2020-01-01"));
});

test("optional attributes", async () => {
  const validator = new ObjectValidatorYup({
    name: T.string(),
    age: T.number().optional(),
  });

  await validator.validate({ name: "bob" });
  await validator.validate({ name: "bob", age: undefined });
  await validator.validate({ name: "bob", age: null });
  await validator.validate({ name: "bob", age: 42 });

  await expectToFailValidation(validator, { name: undefined, age: undefined }, [
    "name",
  ]);
});

test("optional attributes with objects", async () => {
  const validator = new ObjectValidatorYup({
    details: T.object({
      name: T.string(),
      age: T.number().optional(),
    }).optional(),
  });

  await validator.validate({ details: null });
  await validator.validate({});
  await validator.validate({ details: { name: "joe", age: 42 } });
  await validator.validate({ details: { name: "joe" } });
  await expectToFailValidation(validator, { details: { age: null } }, [
    "details.name",
  ]);
});
