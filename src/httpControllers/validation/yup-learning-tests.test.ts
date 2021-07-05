import * as yup from "yup";

test("testing request body", async () => {
  const schema = yup.object().shape({
    name: yup.string().required(),
    age: yup.number().required(),
  });

  expect(await schema.isValid({ name: "peter", age: 42 })).toBe(true);
  expect(await schema.isValid({ name: "peter", age: false })).toBe(false);
  expect(await schema.isValid({ name: 1, age: 42 })).toBe(true); // performs cast from numbers to strings

  const value = await schema.validate({ name: "peter", age: 42 });
  expect(value).toEqual({ name: "peter", age: 42 });

  try {
    await schema.validate({ name: "", age: false }, { abortEarly: false });
    fail("should have thrown ");
  } catch (e) {
    expect(e.errors).toHaveLength(2);
    const errors = e.inner;
    expect(errors).toHaveLength(2);

    expect(errors[0].path).toBe("name");
    expect(errors[1].path).toBe("age");
  }
});

const schema = yup.object().shape({
  name: yup.string().required(),
  age: yup.number().required(),
  address: yup.object().shape({
    street: yup.string().required(),
    city: yup.string().required(),
  }),
});

test("getting invalid properties", async () => {
  try {
    await schema.validate(
      {
        name: "",
        age: 42,
        address: { street: "", city: "" },
      },
      { abortEarly: false }
    );
    fail("should have failed");
  } catch (e) {
    expect(e.path).toBeUndefined();
    const errors = e.inner as yup.ValidationError[];
    const invalidProperties = errors.map((e) => e.path!);
    expect(invalidProperties).toEqual([
      "name",
      "address.street",
      "address.city",
    ]);
    expect(errors).toHaveLength(3);
  }
});

test("data is not an object", async () => {
  try {
    await schema.validate("asdf");
    fail("should have failed");
  } catch (e) {
    expect(e.path).toBe("");
  }
});

test("nested object is not an object", async () => {
  try {
    await schema.validate(
      {
        name: "",
        age: 42,
        address: "asdf",
      },
      { abortEarly: false }
    );
    fail("should have failed");
  } catch (e) {
    expect(e.path).toBeUndefined();
    const errors = e.inner as yup.ValidationError[];
    const invalidProperties = errors.map((e) => e.path!);
    expect(invalidProperties).toEqual(["name", "address"]);
  }
});

test("casts", async () => {
  const value = await schema.validate(
    {
      name: 2,
      age: "42",
      address: { street: false, city: 3.14 },
    },
    { abortEarly: false }
  );
  expect(value.name).toBe("2");
  expect(value.age).toBe(42);
  expect(value.address.street).toBe("false");
  expect(value.address.city).toBe("3.14");
});

test("strict", async () => {
  const schema = yup.object().shape({
    name: yup.string().strict().required(),
    age: yup.number().strict().required(),
  });
  expect(await schema.isValid({ name: "bob", age: 42 })).toBe(true);
  expect(await schema.isValid({ name: 42, age: 42 })).toBe(false);
  expect(await schema.isValid({ name: "bob", age: "42" })).toBe(false);
});

test('dates', ()=> {
})
