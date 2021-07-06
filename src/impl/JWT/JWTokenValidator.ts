import TokenValidator from "../../auth/TokenValidator";
import Id from "../../domain/Id";
import jwt from "jsonwebtoken";
import IdConverter from "../../dataAccess/IdConverter";
import AuthError from "../../auth/AuthError";

export default class JWTokenValidator implements TokenValidator {
  constructor(private privateKey: string, private idConverter: IdConverter) {}
  async validate(token: string): Promise<Id> {
    try {
      const payload = jwt.verify(token, this.privateKey) as any;
      return this.idConverter.convert(payload.userId);
    } catch {
      throw new AuthError();
    }
  }
}
