import ObjectValidatorYup from ".";
import { InvalidDataError, InvalidDataFormatError } from "../ObjectValidator";

test("body is not an object", async () => {
  const validator = new ObjectValidatorYup({
    name: String,
    age: Number,
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
  const validator = new ObjectValidatorYup({ name: String, age: Number });

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
    name: String,
    address: {
      street: String,
      houseNumber: Number,
    },
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
  const validator = new ObjectValidatorYup({ premium: Boolean });
  await validator.validate({ premium: true });
  await validator.validate({ premium: false });
  for (const value of ["asdfa", 0, 1, "yes", "no", "t", "f"]) {
    await expectToFailValidation(validator, { premium: value }, ["premium"]);
  }
});

test("dates", async () => {
  const validator = new ObjectValidatorYup({ birthDate: Date });
  await validator.validate({ birthDate: new Date("2003-01-02").toISOString() });

  for (const value of ["as", false, true]) {
    await expectToFailValidation(validator, { birthDate: value }, [
      "birthDate",
    ]);
  }
});

test("casting", async () => {
  const validator = new ObjectValidatorYup({ birthDate: Date });
  const result = await validator.validate({
    birthDate: new Date("2020-01-01").toISOString(),
  });

  expect(result.birthDate).toEqual(new Date("2020-01-01"));
});
