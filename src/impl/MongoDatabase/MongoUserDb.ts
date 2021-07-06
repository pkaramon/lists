import UserDb from "../../dataAccess/UserDb";
import Id from "../../domain/Id";
import User from "../../domain/User";
import mongo from "mongodb";
import IdConverter from "../../dataAccess/IdConverter";
import NotFoundError from "../../dataAccess/NotFoundError";
import DatabaseError from "../../dataAccess/DatabaseError";

interface UserData {
  _id: string;
  name: string;
  password: string;
  email: string;
  birthDate: Date;
}

function mongoDbErrorsGuard(
  _: any,
  __: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value! as Function;
  descriptor.value = async function () {
    try {
      return await originalMethod.apply(this, arguments);
    } catch (e) {
      if (e instanceof NotFoundError) throw e;
      else throw new DatabaseError();
    }
  };
}

export default class MongoUserDb implements UserDb {
  private client?: mongo.MongoClient;

  constructor(
    private data: { uri: string; databaseName: string; collectionName: string },
    private utils: { idConverter: IdConverter }
  ) {}

  @mongoDbErrorsGuard
  async save(u: User): Promise<void> {
    const collection = await this.getUsersCollection();
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
    const collection = await this.getUsersCollection();
    const { result } = await collection.deleteOne({ _id: this.idToString(id) });
    const numberOfDeleted = result.n ?? 0;
    if (numberOfDeleted === 0) throw new NotFoundError();
  }

  private async findUser(filter: mongo.FilterQuery<UserData>) {
    const collection = await this.getUsersCollection();
    const userData = await collection.findOne(filter);
    if (userData === null) throw new NotFoundError();
    return this.constructUserFromUserData(userData);
  }

  private async getUsersCollection() {
    const client = await this.getClient();
    const db = client.db(this.data.databaseName);
    return db.collection<UserData>(this.data.collectionName);
  }

  private async getClient() {
    if (this.client === undefined) {
      return mongo.connect(this.data.uri, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      });
    } else {
      return this.client;
    }
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

  @mongoDbErrorsGuard
  public async TESTS_ONLY_clear() {
    const client = await this.getClient();
    await client.db(this.data.databaseName).dropDatabase();
  }
}
