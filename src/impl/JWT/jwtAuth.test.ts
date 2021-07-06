import AuthError from "../../auth/AuthError";
import { NumberId } from "../../fakes";
import NumberIdConverter from "../../fakes/NumberIdConverter";
import JWTokenCreator from "./JWTokenCreator";
import JWTokenValidator from "./JWTokenValidator";

const privateKey = "cf043e30-6cb4-4d43-8094-a53be0eac4d2";
const tokenCreator = new JWTokenCreator(privateKey);
const tokenValidator = new JWTokenValidator(
  privateKey,
  new NumberIdConverter()
);

test("successful authorization", async () => {
  const token = await tokenCreator.create(new NumberId(1));
  expect(typeof token).toBe("string");
  const userId = await tokenValidator.validate(token);
  expect(userId.equals(new NumberId(1))).toBe(true);
});

test("not equal private keys", async () => {
  const tokenCreator = new JWTokenCreator("DIFFERENT");
  const token = await tokenCreator.create(new NumberId(1));
  await expect(() => tokenValidator.validate(token)).rejects.toThrowError(
    AuthError
  );
});

test("invalid token", async () => {
  await expect(() => tokenValidator.validate("blablabla")).rejects.toThrowError(
    AuthError
  );
});
