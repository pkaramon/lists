import User from ".";
import NumberId from "../../fakes/NumberId";
import Clock from "../Clock";
import ValidationError from "../ValidationError";

const validData = {
  id: new NumberId(1),
  email: "bob123@mail.com",
  name: "bob123",
  password: "pass@!123",
  birthDate: new Date("2003-03-03"),
};

beforeAll(() => {
  const fakeClock: Clock = {
    now() {
      return new Date("2020-03-12");
    },
  };
  Clock.inst = fakeClock;
});
function givenUserDataExpectErrorMsgToBe(
  userData: Partial<typeof validData>,
  errorMessage: string
) {
  try {
    new User({ ...validData, ...userData });
    fail("should have thrown");
  } catch (e) {
    expect(e instanceof ValidationError).toBe(true);
    expect(e.message).toBe(errorMessage);
  }
}

function givenUserDataExpectNotToThrow(userData: Partial<typeof validData>) {
  expect(() => new User({ ...validData, ...userData })).not.toThrow();
}

describe("validation", () => {
  it("must contain a name longer than 2 characters", () => {
    for (const invalidName of ["", "   a ", "a"])
      givenUserDataExpectErrorMsgToBe(
        { name: invalidName },
        "name must be at least 2 characters long"
      );
    givenUserDataExpectNotToThrow({ name: "au" });
  });

  it("must contain a valid email", () => {
    for (const email of ["", " a ", "user@a", "usergmail.com"])
      givenUserDataExpectErrorMsgToBe({ email }, "email must be a valid email");
    givenUserDataExpectNotToThrow({ email: "bob123@gmail.com" });
  });

  it("must contain a valid birthDate", () => {
    givenUserDataExpectErrorMsgToBe(
      { birthDate: new Date("2020-03-13") },
      "birthDate is invalid"
    );
    givenUserDataExpectNotToThrow({ birthDate: new Date("2008-03-29") });
  });
});

it("should create a user", () => {
  const u = new User(validData);
  expect(u.id.equals(new NumberId(1))).toBe(true);
  expect(u.name).toBe(validData.name);
  expect(u.email).toBe(validData.email);
  expect(u.password).toBe(validData.password);
  expect(u.birthDate).toEqual(validData.birthDate);
});
