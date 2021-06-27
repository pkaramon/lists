import Id from "../../model/Id";
import User from "../../model/User";
import Hasher from "../Hasher";
import ServerError from "../ServerError";
import UserDb, { NotFoundError } from "../UserDb";

export interface TokenCreator {
  create(userId: Id): Promise<string>;
}

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
      if (await this.doPasswordsMatch(user)) this.throwInavlidDataError();
      return { userToken: await tokenCreator.create(user.id) };
    }

    private async getUser() {
      try {
        const user = await userDb.getByEmail(this.data.email);
        return user;
      } catch (e) {
        this.handleError(e);
      }
    }

    private handleError(e: Error): never {
      if (e instanceof NotFoundError) this.throwInavlidDataError();
      else throw new ServerError("server error");
    }

    private async doPasswordsMatch(user: User) {
      return user.password !== (await hasher.hash(this.data.password));
    }

    private throwInavlidDataError(): never {
      throw new Error("email or password is invalid");
    }
  };
}
