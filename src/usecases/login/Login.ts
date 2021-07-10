import TokenCreator from "../../auth/TokenCreator";
import NotFoundError from "../../dataAccess/NotFoundError";
import UserDb from "../../dataAccess/UserDb";
import User from "../../domain/User";
import Hasher from "../Hasher";
import ServerError from "../ServerError";
import InvalidLoginDataError from "./InvalidLoginDataError";

export default function buildLogin({
  userDb,
  hasher,
  tokenCreator,
}: {
  userDb: UserDb;
  hasher: Hasher;
  tokenCreator: TokenCreator;
}) {
  return class Login {
    constructor(private data: { email: string; password: string }) {}

    async execute() {
      const user = await this.getUser();
      if (await this.doPasswordsMatch(user)) {
        return { token: await tokenCreator.create(user.id) };
      } else {
        throw new InvalidLoginDataError();
      }
    }

    private async getUser() {
      try {
        return await userDb.getByEmail(this.data.email);
      } catch (e) {
        this.handleError(e);
      }
    }

    private async doPasswordsMatch(user: User) {
      return await hasher.compare(this.data.password, user.password);
    }

    private handleError(e: Error): never {
      if (e instanceof NotFoundError) throw new InvalidLoginDataError();
      else throw new ServerError();
    }
  };
}
