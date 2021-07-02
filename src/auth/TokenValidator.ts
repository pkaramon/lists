import Id from "../domain/Id";

type UserId = Id;
export default interface TokenValidator {
  validate(token: string): Promise<UserId>;
}
