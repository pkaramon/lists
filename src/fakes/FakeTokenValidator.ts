import AuthError from "../auth/AuthError";
import TokenValidator from "../auth/TokenValidator";
import Id from "../domain/Id";
import NumberId from "./NumberId";

export default class FakeTokenValidator implements TokenValidator {
  async validate(token: string): Promise<Id> {
    // fake token format: ###<userID>###
    if (token.startsWith("###") && token.endsWith("###")) {
      const userId = token.slice(3, token.length - 3);
      return new NumberId(Number.parseInt(userId));
    } else {
      throw new AuthError();
    }
  }
}
