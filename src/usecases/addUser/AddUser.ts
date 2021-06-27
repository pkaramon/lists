import DatabaseError from "../../dataAccess/DatabaseError";
import NotFoundError from "../../dataAccess/NotFoundError";
import UserDb from "../../dataAccess/UserDb";
import Id from "../../domain/Id";
import User from "../../domain/User";
import Hasher from "../Hasher";
import ServerError from "../ServerError";

export interface IdCreator {
  create(): Id;
}

export default function buildAddUser({
  idCreator,
  userDb,
  hasher,
}: {
  idCreator: IdCreator;
  userDb: UserDb;
  hasher: Hasher;
}) {
  return class AddUser {
    constructor(
      private data: {
        name: string;
        email: string;
        password: string;
        birthDate: Date;
      }
    ) {}

    async execute() {
      if (await this.isEmailAlreadyTaken())
        throw new Error("email is already taken");
      const user = await this.createUser();
      await this.saveUser(user);
      return { userId: user.id };
    }

    private async createUser() {
      return new User({
        id: idCreator.create(),
        name: this.data.name,
        email: this.data.email,
        birthDate: this.data.birthDate,
        password: await hasher.hash(this.data.password),
      });
    }

    private async saveUser(user: User) {
      try {
        await userDb.save(user);
      } catch (e) {
        if (e instanceof DatabaseError) this.throwServerError();
      }
    }

    private async isEmailAlreadyTaken() {
      try {
        await userDb.getByEmail(this.data.email);
        return true;
      } catch (e) {
        if (e instanceof NotFoundError) return false;
        else if (e instanceof DatabaseError) this.throwServerError();
      }
    }

    private throwServerError(): never {
      throw new ServerError("server error");
    }
  };
}
