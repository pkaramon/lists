import UserDb from "../../dataAccess/UserDb";
import Id from "../../domain/Id";
import User from "../../domain/User";
import mongo from "mongodb";
import IdConverter from "../../dataAccess/IdConverter";
import NotFoundError from "../../dataAccess/NotFoundError";
import MongoDb, { mongoDbErrorsGuard } from "./MongoDb";

interface UserData {
  _id: string;
  name: string;
  password: string;
  email: string;
  birthDate: Date;
}

export default class MongoUserDb extends MongoDb<UserData> implements UserDb {
  constructor(
    data: { uri: string; databaseName: string; collectionName: string },
    private utils: { idConverter: IdConverter }
  ) {
    super(data);
  }

  @mongoDbErrorsGuard
  async save(u: User): Promise<void> {
    const collection = await this.getCollection();
    const data = this.createUserDataFromUser(u);
    await collection.insertOne(data, { forceServerObjectId: true });
  }

  @mongoDbErrorsGuard
  async getById(id: Id): Promise<User> {
    return await this.findUser({ _id: id.toPrimitive().toString() });
  }

  @mongoDbErrorsGuard
  async getByEmail(email: string): Promise<User> {
    return await this.findUser({ email });
  }

  @mongoDbErrorsGuard
  async deleteById(id: Id): Promise<void> {
    const collection = await this.getCollection();
    const { result } = await collection.deleteOne({ _id: this.idToString(id) });
    const numberOfDeleted = result.n ?? 0;
    if (numberOfDeleted === 0) throw new NotFoundError();
  }

  private async findUser(filter: mongo.FilterQuery<UserData>) {
    const userData = await this.findOne(filter);
    return this.constructUserFromUserData(userData);
  }

  private constructUserFromUserData(userData: UserData) {
    return new User({
      id: this.utils.idConverter.convert(userData._id),
      name: userData.name,
      password: userData.password,
      email: userData.email,
      birthDate: userData.birthDate,
    });
  }

  private createUserDataFromUser(u: User): UserData {
    return {
      _id: u.id.toPrimitive().toString(),
      name: u.name,
      password: u.password,
      email: u.email,
      birthDate: u.birthDate,
    };
  }

  private idToString(id: Id) {
    return id.toPrimitive().toString();
  }
}
