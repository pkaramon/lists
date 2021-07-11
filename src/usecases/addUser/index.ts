import DatabaseError from "../../dataAccess/DatabaseError";
import IdCreator from "../../dataAccess/IdCreator";
import NotFoundError from "../../dataAccess/NotFoundError";
import UserDb from "../../dataAccess/UserDb";
import User from "../../domain/User";
import ValidationError from "../../domain/ValidationError";
import Hasher from "../Hasher";
import ServerError from "../ServerError";
import EmailAlreadyTakenError from "./EmailAlreadyTakenError";
import InvalidUserDataError from "./InvalidUserDataError";

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
      await this.checkIfEmailIsAlreadyTaken();
      this.validatePassword();
      const user = await this.createUser();
      await this.saveUser(user);
      return { userId: user.id };
    }

    private async checkIfEmailIsAlreadyTaken() {
      if (await this.isEmailAlreadyTaken()) throw new EmailAlreadyTakenError();
    }

    private async isEmailAlreadyTaken() {
      try {
        await userDb.getByEmail(this.data.email);
        return true;
      } catch (e) {
        if (e instanceof NotFoundError) return false;
        else this.throwServerError();
      }
    }

    private validatePassword() {
      const pass = this.data.password.trim();
      if (pass.length < 8)
        throw new ValidationError(
          "password must contain at least 8 characters"
        );
    }

    private async createUser() {
      try {
        return new User({
          id: idCreator.create(),
          name: this.data.name,
          email: this.data.email,
          birthDate: this.data.birthDate,
          password: await hasher.hash(this.data.password),
        });
      } catch (e) {
        const error = e as ValidationError;
        throw new InvalidUserDataError(error.message);
      }
    }

    private async saveUser(user: User) {
      try {
        await userDb.save(user);
      } catch (e) {
        if (e instanceof DatabaseError) this.throwServerError();
      }
    }

    private throwServerError(): never {
      throw new ServerError("server error");
    }
  };
}
