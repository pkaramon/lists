import Id from "../model/Id";
import User from "../model/User";

export interface IdCreator {
  create(): Id;
}

export interface UserDb {
  save(u: User): Promise<void>;
  getById(id: Id): Promise<User>;
  getByEmail(email: string): Promise<User>;
}

export interface Hasher {
  hash(str: string): Promise<string>;
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
      if (await this.isEmailAlreadyTaken()) {
        throw new Error("email is already taken");
      }
      const user = await this.createUser();
      await userDb.save(user);
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

    private async isEmailAlreadyTaken() {
      try {
        await userDb.getByEmail(this.data.email);
        return true;
      } catch {
        return false;
      }
    }
  };
}
